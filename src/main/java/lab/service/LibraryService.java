package lab.service;

import lab.domain.Book;
import lab.domain.LibraryException;
import lab.domain.Loan;
import lab.repository.FileLibraryRepository;
import lab.repository.LibraryRepository;
import lab.repository.LibraryRepository.Snapshot;

import java.io.IOException;
import java.nio.file.Path;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * 应用服务拥有事务边界：校验 → 在副本中修改 → 保存快照 → 发布新状态。
 * synchronized 使查询与修改看到同一个完整状态，并保证并发借阅不会超卖。
 */
public final class LibraryService {
    public record Stats(int books, int available, long activeLoans, int totalLoans) { }

    private final LibraryRepository repository;
    private final Clock clock;
    private Snapshot state;

    public LibraryService(Path dataDirectory) { this(dataDirectory, Clock.systemDefaultZone()); }

    public LibraryService(Path dataDirectory, Clock clock) {
        this(fileRepository(dataDirectory), clock);
    }

    /** 普通构造器注入：测试可传入内存替身，无需真实文件或额外框架。 */
    public LibraryService(LibraryRepository repository, Clock clock) {
        if (repository == null || clock == null) throw new IllegalArgumentException("仓储和时钟不能为空");
        this.repository = repository;
        this.clock = clock;
        try {
            var loaded = repository.load();
            state = loaded.orElseGet(() -> new Snapshot(seedBooks(), List.of(), 1));
            if (loaded.isEmpty()) repository.save(state);
        } catch (IOException e) {
            throw new LibraryException(500, "无法读取或创建图书数据；请检查数据目录和文件", e);
        }
    }

    private static LibraryRepository fileRepository(Path dataDirectory) {
        if (dataDirectory == null) throw new IllegalArgumentException("数据目录不能为空");
        return new FileLibraryRepository(dataDirectory);
    }

    public synchronized List<Book> books(String query, String category) {
        String q = normalizeFilter(query, 100, "关键词").toLowerCase(Locale.ROOT);
        String c = normalizeFilter(category, 80, "分类");
        return state.books().stream()
                .filter(b -> c.isEmpty() || b.category().equalsIgnoreCase(c))
                .filter(b -> q.isEmpty() || (b.title() + " " + b.author() + " " + b.category())
                        .toLowerCase(Locale.ROOT).contains(q))
                .sorted(Comparator.comparingLong(Book::id)).toList();
    }

    public synchronized List<Loan> loans() {
        return state.loans().stream().sorted(Comparator.comparingLong(Loan::id).reversed()).toList();
    }

    public synchronized Loan borrow(long bookId, String borrower) {
        requirePositiveId(bookId, "图书");
        String name = normalizeFilter(borrower, 40, "借阅人");
        if (name.isEmpty() || name.codePoints().anyMatch(Character::isISOControl)) {
            throw new LibraryException(400, "借阅人应为 1～40 个字符，且不能包含控制字符");
        }
        int index = findBookIndex(bookId);
        Book book = state.books().get(index);
        if (book.available() == 0) throw new LibraryException(409, "这本书已借完，请选择其他图书");
        if (state.nextLoanId() == Long.MAX_VALUE) throw new LibraryException(409, "借阅编号已用尽");
        LocalDate today = LocalDate.now(clock);
        Loan loan = new Loan(state.nextLoanId(), bookId, name, today, today.plusDays(30), false);
        List<Book> books = new ArrayList<>(state.books());
        books.set(index, book.withAvailable(book.available() - 1));
        List<Loan> loans = new ArrayList<>(state.loans());
        loans.add(loan);
        commit(new Snapshot(books, loans, state.nextLoanId() + 1));
        return loan;
    }

    public synchronized Loan returnLoan(long loanId) {
        requirePositiveId(loanId, "借阅");
        int loanIndex = -1;
        for (int i = 0; i < state.loans().size(); i++) {
            if (state.loans().get(i).id() == loanId) { loanIndex = i; break; }
        }
        if (loanIndex == -1) throw new LibraryException(404, "未找到这条借阅记录");
        Loan loan = state.loans().get(loanIndex);
        if (loan.returned()) throw new LibraryException(409, "这条借阅已经归还，不能重复归还");
        int bookIndex = findBookIndex(loan.bookId());
        Book book = state.books().get(bookIndex);
        Loan returned = loan.markReturned();
        List<Book> books = new ArrayList<>(state.books());
        books.set(bookIndex, book.withAvailable(book.available() + 1));
        List<Loan> loans = new ArrayList<>(state.loans());
        loans.set(loanIndex, returned);
        commit(new Snapshot(books, loans, state.nextLoanId()));
        return returned;
    }

    public synchronized Stats stats() {
        return new Stats(state.books().size(), state.books().stream().mapToInt(Book::available).sum(),
                state.loans().stream().filter(l -> !l.returned()).count(), state.loans().size());
    }

    private void commit(Snapshot next) {
        try {
            repository.save(next);
            state = next;
        } catch (IOException e) {
            // 保存失败时旧内存状态仍有效；调用者收到失败，不会出现“借阅成功但重启丢失”。
            throw new LibraryException(500, "保存失败，本次操作未完成；请检查数据目录是否可写", e);
        }
    }

    private int findBookIndex(long id) {
        for (int i = 0; i < state.books().size(); i++) if (state.books().get(i).id() == id) return i;
        throw new LibraryException(404, "未找到这本图书");
    }

    private static void requirePositiveId(long id, String label) {
        if (id <= 0) throw new LibraryException(400, label + "编号必须是正整数");
    }

    private static String normalizeFilter(String text, int max, String label) {
        if (text == null) return "";
        String trimmed = text.strip();
        if (trimmed.length() > max) throw new LibraryException(400, label + "最多 " + max + " 个字符");
        return trimmed;
    }

    private static List<Book> seedBooks() {
        return List.of(
                new Book(1, "Java 核心技术", "Cay S. Horstmann", "Java", 3, 3),
                new Book(2, "Effective Java", "Joshua Bloch", "Java", 2, 2),
                new Book(3, "Java 并发编程实战", "Brian Goetz 等", "并发", 2, 2),
                new Book(4, "深入理解 Java 虚拟机", "周志明", "JVM", 2, 2),
                new Book(5, "算法（第 4 版）", "Robert Sedgewick 等", "算法", 2, 2),
                new Book(6, "设计模式", "Erich Gamma 等", "设计", 2, 2),
                new Book(7, "数据库系统概念", "Abraham Silberschatz 等", "数据库", 2, 2),
                new Book(8, "计算机网络：自顶向下方法", "James F. Kurose 等", "网络", 1, 1));
    }
}
