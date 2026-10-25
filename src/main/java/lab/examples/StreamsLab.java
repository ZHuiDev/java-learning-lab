package lab.examples;

import java.util.List;
import java.util.Optional;
import java.util.TreeMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/** Stream 描述处理管线；终止操作触发求值，Optional 表示可能没有结果。 */
final class StreamsLab {
    private StreamsLab() {}
    record Loan(String category, String title, int overdueDays) {}

    static String run() {
        List<Loan> loans = List.of(new Loan("技术", "Java", 3), new Loan("文学", "诗选", 0),
                new Loan("技术", "数据库", 1));
        AtomicInteger visited = new AtomicInteger();
        // 此处计数只用于观察惰性；业务代码尽量使用无副作用的中间操作。
        var pipeline = loans.stream().filter(loan -> {
            visited.incrementAndGet();
            return loan.overdueDays() > 0;
        });
        int before = visited.get();
        List<String> overdueTitles = pipeline.map(Loan::title).sorted().toList();
        var byCategory = loans.stream().collect(Collectors.groupingBy(
                Loan::category, TreeMap::new, Collectors.counting()));
        Optional<Loan> missing = loans.stream().filter(loan -> loan.title().equals("不存在")).findFirst();
        return "[streams] 借阅统计\n"
                + "创建管线后访问元素数=" + before + "\n"
                + "toList 终止操作后访问元素数=" + visited.get() + "；逾期书名=" + overdueTitles + "\n"
                + "groupingBy + counting=" + byCategory + "\n"
                + "Optional 查询结果=" + missing.map(Loan::title).orElse("未找到") + "\n"
                + "观察：Stream 只能消费一次；Optional 先处理缺失情况，不要直接 get()。\n";
    }
}
