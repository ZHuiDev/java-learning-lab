package lab.examples;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

/** 虚拟线程执行任务；锁保护复合操作；原子类承担独立计数。 */
final class ConcurrencyLab {
    private ConcurrencyLab() {}

    static final class Inventory {
        private int available;
        Inventory(int available) { this.available = available; }
        // 检查与扣减必须处于同一临界区，不能仅把 available 改成 volatile。
        synchronized boolean borrowOne() {
            if (available == 0) return false;
            available--;
            return true;
        }
        synchronized int available() { return available; }
    }

    static String run() throws Exception {
        Inventory inventory = new Inventory(3);
        AtomicInteger attempts = new AtomicInteger();
        List<Future<Boolean>> futures = new ArrayList<>();
        boolean allVirtual = true;
        int success = 0;
        // Java 21 的 ExecutorService 可自动关闭；关闭时等待已提交任务结束。
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            Future<Boolean> virtual = executor.submit(() -> Thread.currentThread().isVirtual());
            allVirtual = virtual.get();
            for (int i = 0; i < 8; i++) {
                futures.add(executor.submit(() -> {
                    attempts.incrementAndGet();
                    return inventory.borrowOne();
                }));
            }
            for (Future<Boolean> result : futures) if (result.get()) success++;
        }
        return "[concurrency] 并发借阅 3 本库存\n"
                + "任务运行于虚拟线程=" + allVirtual + "\n"
                + "AtomicInteger 尝试次数=" + attempts.get() + "\n"
                + "Future 汇总成功=" + success + "；剩余库存=" + inventory.available() + "\n"
                + "观察：synchronized 保护检查与扣减；成功者身份由调度决定，成功总数恒为 3。\n"
                + "虚拟线程主要适合大量等待型任务，不会让 CPU 密集计算自动加速。\n";
    }
}
