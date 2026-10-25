import java.math.BigDecimal;
import java.util.Objects;

/** 普通 Java 自动检查器，无第三方库，也不依赖 -ea。请修改练习而不是此检查器。 */
public final class ExerciseCheck {
    private static int passed;
    private static int failed;

    public static void main(String[] args) {
        check("学生可借14天", () -> equal(14, LoanPolicyExercise.allowedDays(LoanPolicyExercise.ReaderType.STUDENT)));
        check("教师可借30天", () -> equal(30, LoanPolicyExercise.allowedDays(LoanPolicyExercise.ReaderType.TEACHER)));
        check("访客可借7天", () -> equal(7, LoanPolicyExercise.allowedDays(LoanPolicyExercise.ReaderType.VISITOR)));
        check("null读者被拒绝", () -> illegal(() -> LoanPolicyExercise.allowedDays(null)));
        check("0天返回0.00", () -> equal(new BigDecimal("0.00"), LoanPolicyExercise.overdueFee(0)));
        check("1天返回0.50", () -> equal(new BigDecimal("0.50"), LoanPolicyExercise.overdueFee(1)));
        check("3天返回1.50", () -> equal(new BigDecimal("1.50"), LoanPolicyExercise.overdueFee(3)));
        check("14天返回7.00", () -> equal(new BigDecimal("7.00"), LoanPolicyExercise.overdueFee(14)));
        check("大数不经int乘法溢出", () -> equal(new BigDecimal("1073741823.50"),
                LoanPolicyExercise.overdueFee(Integer.MAX_VALUE)));
        check("负数被拒绝", () -> illegal(() -> LoanPolicyExercise.overdueFee(-1)));
        check("最小int被拒绝", () -> illegal(() -> LoanPolicyExercise.overdueFee(Integer.MIN_VALUE)));
        System.out.println("通过 " + passed + " 项，失败 " + failed + " 项。");
        if (failed > 0) {
            System.err.println("练习尚未完成。请补全 LoanPolicyExercise.java 中的 TODO 后重新运行。");
            System.exit(1);
        }
        System.out.println("练习 01 全部通过。下一步：解释为什么金额从字符串创建，并为自己的变体补一项检查。");
    }

    private static void check(String description, Runnable test) {
        try {
            test.run();
            passed++;
            System.out.println("PASS " + description);
        } catch (RuntimeException | AssertionError problem) {
            failed++;
            System.out.println("FAIL " + description + "：" + problem.getMessage());
        }
    }

    private static void equal(Object expected, Object actual) {
        if (!Objects.equals(expected, actual)) {
            throw new AssertionError("预期 " + expected + "，实际 " + actual);
        }
    }

    private static void illegal(Runnable operation) {
        try {
            operation.run();
        } catch (IllegalArgumentException expected) {
            return;
        }
        throw new AssertionError("预期 IllegalArgumentException，但未抛出");
    }
}
