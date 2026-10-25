package lab.repository;

import lab.domain.Book;
import lab.domain.Loan;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * 完整图书状态的存储契约。业务服务只依赖此接口，启动入口选择文件实现或测试替身。
 * 实现负责数据格式与存储细节，不在此处决定借阅规则。
 */
public interface LibraryRepository {
    /** 不可修改的状态快照；Book、Loan 本身也是不可变数据载体。 */
    record Snapshot(List<Book> books, List<Loan> loans, long nextLoanId) {
        public Snapshot {
            books = List.copyOf(books);
            loans = List.copyOf(loans);
        }
    }

    /**
     * 未建立存储时返回 Optional.empty()；返回值本身不得为 null。
     * 无法读取或发现数据损坏时抛 IOException，不能把损坏当作空存储覆盖。
     */
    Optional<Snapshot> load() throws IOException;

    /**
     * 成功返回表示完整快照已保存；失败时抛 IOException，保留上次已保存的完整状态。
     * 服务仅在此方法成功后发布新内存状态。
     */
    void save(Snapshot snapshot) throws IOException;
}
