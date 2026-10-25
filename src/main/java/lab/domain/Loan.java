package lab.domain;

import java.time.LocalDate;

/** 日期使用 LocalDate 表达借阅日，不混用日期、时刻和时区。 */
public record Loan(long id, long bookId, String borrower, LocalDate borrowedAt,
                   LocalDate dueAt, boolean returned) {
    public Loan {
        if (id <= 0 || bookId <= 0 || borrower == null || borrower.isBlank()
                || borrowedAt == null || dueAt == null || dueAt.isBefore(borrowedAt)) {
            throw new IllegalArgumentException("借阅数据无效");
        }
    }

    public Loan markReturned() {
        return new Loan(id, bookId, borrower, borrowedAt, dueAt, true);
    }
}
