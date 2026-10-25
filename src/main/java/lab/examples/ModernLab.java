package lab.examples;

/** Java 21 正式特性：record、sealed、switch 模式与记录模式，不需要预览开关。 */
final class ModernLab {
    private ModernLab() {}
    sealed interface BorrowResult permits Allowed, Rejected {}
    record Allowed(String title, int days) implements BorrowResult {}
    record Rejected(String reason) implements BorrowResult {}

    static String describe(BorrowResult result) {
        // sealed 限定候选子类型，编译器可检查 switch 是否覆盖完整。
        return switch (result) {
            case Allowed(String title, int days) -> title + "：允许借阅 " + days + " 天";
            case Rejected(String reason) -> "借阅失败：" + reason;
        };
    }

    static String run() {
        Allowed first = new Allowed("Java 21", 14);
        return "[modern] 用类型表达借阅结果\n"
                + describe(first) + "\n"
                + describe(new Rejected("库存不足")) + "\n"
                + "record 自动生成值相等比较=" + first.equals(new Allowed("Java 21", 14)) + "\n"
                + "观察：record 提供数据载体，不代表其中可变对象会被深度冻结。\n"
                + "sealed + switch 让新增结果类型时遗漏的处理分支暴露为编译错误。\n";
    }
}
