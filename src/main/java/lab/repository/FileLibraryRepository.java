package lab.repository;

import lab.domain.Book;
import lab.domain.Loan;

import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.nio.channels.Channels;
import java.nio.channels.FileChannel;
import java.nio.charset.StandardCharsets;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.nio.file.StandardOpenOption;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Properties;
import java.util.Set;

/**
 * JDK Properties 自动处理换行、等号等转义。整份快照写入同目录临时文件，再原子替换。
 * 这里教授持久化边界，不模拟数据库的多进程事务；同一数据目录只运行一个应用实例。
 */
public final class FileLibraryRepository implements LibraryRepository {
    private final Path directory;
    private final Path file;

    public FileLibraryRepository(Path directory) {
        this.directory = directory.toAbsolutePath().normalize();
        this.file = this.directory.resolve("library.properties");
    }

    @Override
    public Optional<Snapshot> load() throws IOException {
        if (Files.notExists(file)) return Optional.empty();
        Properties p = new Properties();
        try (Reader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
            p.load(reader);
        } catch (IllegalArgumentException e) {
            throw new IOException("数据文件转义格式损坏", e);
        }
        try {
            if (!"1".equals(required(p, "version"))) throw new IllegalArgumentException("未知数据版本");
            int bookCount = count(p, "books.count");
            int loanCount = count(p, "loans.count");
            List<Book> books = new ArrayList<>();
            List<Loan> loans = new ArrayList<>();
            Set<Long> bookIds = new HashSet<>();
            Set<Long> loanIds = new HashSet<>();
            for (int i = 0; i < bookCount; i++) {
                String k = "books." + i + ".";
                Book b = new Book(number(p, k + "id"), required(p, k + "title"), required(p, k + "author"),
                        required(p, k + "category"), integer(p, k + "total"), integer(p, k + "available"));
                if (!bookIds.add(b.id())) throw new IllegalArgumentException("重复图书编号");
                books.add(b);
            }
            long largestLoanId = 0;
            for (int i = 0; i < loanCount; i++) {
                String k = "loans." + i + ".";
                String returned = required(p, k + "returned");
                if (!returned.equals("true") && !returned.equals("false")) {
                    throw new IllegalArgumentException("归还标志无效");
                }
                Loan loan = new Loan(number(p, k + "id"), number(p, k + "bookId"), required(p, k + "borrower"),
                        LocalDate.parse(required(p, k + "borrowedAt")), LocalDate.parse(required(p, k + "dueAt")),
                        Boolean.parseBoolean(returned));
                if (!loanIds.add(loan.id()) || !bookIds.contains(loan.bookId())) {
                    throw new IllegalArgumentException("借阅引用无效");
                }
                largestLoanId = Math.max(largestLoanId, loan.id());
                loans.add(loan);
            }
            long nextId = number(p, "nextLoanId");
            if (nextId <= largestLoanId || nextId <= 0) throw new IllegalArgumentException("下一个借阅编号无效");
            for (Book b : books) {
                long active = loans.stream().filter(l -> l.bookId() == b.id() && !l.returned()).count();
                if ((long) b.total() - active != b.available()) throw new IllegalArgumentException("库存与借阅不一致");
            }
            return Optional.of(new Snapshot(books, loans, nextId));
        } catch (RuntimeException e) {
            throw new IOException("数据文件内容损坏；请保留原文件后检查或恢复备份", e);
        }
    }

    @Override
    public void save(Snapshot snapshot) throws IOException {
        Files.createDirectories(directory);
        Properties p = new Properties();
        p.setProperty("version", "1");
        p.setProperty("nextLoanId", Long.toString(snapshot.nextLoanId()));
        p.setProperty("books.count", Integer.toString(snapshot.books().size()));
        p.setProperty("loans.count", Integer.toString(snapshot.loans().size()));
        for (int i = 0; i < snapshot.books().size(); i++) {
            Book b = snapshot.books().get(i);
            String k = "books." + i + ".";
            p.setProperty(k + "id", Long.toString(b.id()));
            p.setProperty(k + "title", b.title());
            p.setProperty(k + "author", b.author());
            p.setProperty(k + "category", b.category());
            p.setProperty(k + "total", Integer.toString(b.total()));
            p.setProperty(k + "available", Integer.toString(b.available()));
        }
        for (int i = 0; i < snapshot.loans().size(); i++) {
            Loan l = snapshot.loans().get(i);
            String k = "loans." + i + ".";
            p.setProperty(k + "id", Long.toString(l.id()));
            p.setProperty(k + "bookId", Long.toString(l.bookId()));
            p.setProperty(k + "borrower", l.borrower());
            p.setProperty(k + "borrowedAt", l.borrowedAt().toString());
            p.setProperty(k + "dueAt", l.dueAt().toString());
            p.setProperty(k + "returned", Boolean.toString(l.returned()));
        }
        Path temp = Files.createTempFile(directory, ".library-", ".tmp");
        try {
            try (FileChannel channel = FileChannel.open(temp, StandardOpenOption.WRITE);
                 Writer writer = Channels.newWriter(channel, StandardCharsets.UTF_8)) {
                p.store(writer, "Java Learning Lab / version 1");
                writer.flush();
                channel.force(true);
            }
            try {
                Files.move(temp, file, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
            } catch (AtomicMoveNotSupportedException e) {
                throw new IOException("当前文件系统不支持原子保存，请换用本地数据目录", e);
            }
        } finally {
            Files.deleteIfExists(temp);
        }
    }

    private static String required(Properties p, String key) {
        String value = p.getProperty(key);
        if (value == null) throw new IllegalArgumentException("缺少字段：" + key);
        return value;
    }
    private static long number(Properties p, String key) { return Long.parseLong(required(p, key)); }
    private static int integer(Properties p, String key) { return Integer.parseInt(required(p, key)); }
    private static int count(Properties p, String key) {
        int count = integer(p, key);
        if (count < 0 || count > 1_000_000) throw new IllegalArgumentException("记录数量无效");
        return count;
    }
}
