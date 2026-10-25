import java.math.BigDecimal;
import java.math.RoundingMode;

/** 参考答案：请先完成自己的版本，再逐行比较决策。 */
public final class LoanPolicyExercise {
    public enum ReaderType { STUDENT, TEACHER, VISITOR }
    private static final BigDecimal DAILY_FEE = new BigDecimal("0.50");

    private LoanPolicyExercise() {}

    public static int allowedDays(ReaderType readerType) {
        if (readerType == null) throw new IllegalArgumentException("读者类型不能为空");
        return switch (readerType) {
            case STUDENT -> 14;
            case TEACHER -> 30;
            case VISITOR -> 7;
        };
    }

    public static BigDecimal overdueFee(int overdueDays) {
        if (overdueDays < 0) throw new IllegalArgumentException("逾期天数不能为负数");
        return DAILY_FEE.multiply(BigDecimal.valueOf(overdueDays)).setScale(2, RoundingMode.HALF_UP);
    }
}
