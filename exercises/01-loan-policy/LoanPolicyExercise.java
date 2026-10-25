import java.math.BigDecimal;

/** 请先阅读同目录 README.md。此文件初始能够编译，但还不能通过检查。 */
public final class LoanPolicyExercise {
    public enum ReaderType { STUDENT, TEACHER, VISITOR }

    private LoanPolicyExercise() {}

    public static int allowedDays(ReaderType readerType) {
        // TODO 1：拒绝 null，然后根据读者类型返回 14 / 30 / 7。
        // 可以先用 switch 表达式，再思考如何提取为策略接口。
        return 0;
    }

    public static BigDecimal overdueFee(int overdueDays) {
        // TODO 2：拒绝负数；每日 0.50 元；结果保留两位小数。
        // 提示：new BigDecimal("0.50")、BigDecimal.valueOf(...)。
        return BigDecimal.ZERO;
    }
}
