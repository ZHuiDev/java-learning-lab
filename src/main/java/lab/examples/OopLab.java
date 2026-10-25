package lab.examples;

import java.util.List;

/** 用封装保护状态，用接口表达变化点，由同一调用展示多态。 */
final class OopLab {
    private OopLab() {}

    interface LoanPolicy {
        int allowedDays();
        String name();
    }

    record StudentPolicy() implements LoanPolicy {
        public int allowedDays() { return 14; }
        public String name() { return "学生"; }
    }

    record TeacherPolicy() implements LoanPolicy {
        public int allowedDays() { return 30; }
        public String name() { return "教师"; }
    }

    static final class Book {
        private final String title;
        private boolean borrowed;

        Book(String title) {
            if (title == null || title.isBlank()) throw new IllegalArgumentException("书名不能为空");
            this.title = title;
        }

        String borrow(LoanPolicy policy) {
            if (borrowed) throw new IllegalStateException("这本书已借出");
            borrowed = true;
            return title + " → " + policy.name() + "可借 " + policy.allowedDays() + " 天";
        }

        boolean isBorrowed() { return borrowed; }
    }

    static String run() {
        StringBuilder out = new StringBuilder("[oop] 图书与借阅策略\n");
        // 变量类型是接口；实际行为取决于运行时的具体策略对象。
        for (LoanPolicy policy : List.of(new StudentPolicy(), new TeacherPolicy())) {
            Book book = new Book("Java 实战");
            out.append(book.borrow(policy)).append("；借出状态=").append(book.isBorrowed()).append('\n');
            try {
                book.borrow(policy);
            } catch (IllegalStateException expected) {
                out.append("重复借阅被领域对象拒绝：").append(expected.getMessage()).append('\n');
            }
        }
        return out.append("观察：private 状态只能通过受约束的方法改变；新增策略无需改 Book。\n").toString();
    }
}
