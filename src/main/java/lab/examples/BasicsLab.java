package lab.examples;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** 类型、分支、循环、方法与十进制金额。 */
final class BasicsLab {
    private BasicsLab() {}

    static String run() {
        int loanDays = 14;
        long totalLoans = 3_000_000_000L;
        boolean overdue = loanDays > 7;
        int sum = 0;
        for (int day = 1; day <= 3; day++) sum += day;
        String status = overdue ? "已逾期" : "借阅中";
        // 金额从字符串构造，避免先引入二进制浮点数的舍入误差。
        BigDecimal fee = lateFee(3, new BigDecimal("0.50"));
        return "[basics] 借阅费用计算\n"
                + "int 借阅天数=" + loanDays + "；long 总借阅次数=" + totalLoans + "\n"
                + "boolean 条件=" + overdue + "；分支结果=" + status + "\n"
                + "for 循环 1+2+3=" + sum + "；int 除法 5/2=" + (5 / 2) + "\n"
                + "方法 lateFee(3, 0.50)=" + fee.toPlainString() + " 元\n"
                + "观察：整数除法截断；金额用 BigDecimal，边界与舍入规则应写清楚。\n";
    }

    private static BigDecimal lateFee(int overdueDays, BigDecimal dailyFee) {
        if (overdueDays < 0) throw new IllegalArgumentException("逾期天数不能为负数");
        return dailyFee.multiply(BigDecimal.valueOf(overdueDays)).setScale(2, RoundingMode.HALF_UP);
    }
}
