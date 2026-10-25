package lab.examples;

import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.util.Comparator;

/** 展示 JVM 当前观测值；这些数字随机器和运行时变化，不能用于比较性能。 */
final class JvmLab {
    private JvmLab() {}

    static String run() {
        Runtime runtime = Runtime.getRuntime();
        long committed = runtime.totalMemory();
        long used = committed - runtime.freeMemory();
        StringBuilder out = new StringBuilder("[jvm] 当前进程快照（不是性能基准）\n");
        out.append("Java 版本=").append(Runtime.version().feature()).append('\n');
        out.append("String 类加载器=").append(loaderName(String.class.getClassLoader())).append('\n');
        out.append("实验类加载器=").append(loaderName(JvmLab.class.getClassLoader())).append('\n');
        out.append("堆估算已用=").append(used).append("；已提交=").append(committed)
                .append("；最大=").append(runtime.maxMemory()).append(" 字节\n");
        ManagementFactory.getGarbageCollectorMXBeans().stream()
                .sorted(Comparator.comparing(GarbageCollectorMXBean::getName))
                .forEach(gc -> out.append("GC ").append(gc.getName()).append("：次数=")
                        .append(gc.getCollectionCount()).append("；累计毫秒=")
                        .append(gc.getCollectionTime()).append('\n'));
        return out.append("观察：null 表示引导类加载器；GC 的 -1 表示该项不可用。\n")
                .append("堆数值和 GC 统计随进程变化；未主动触发 GC，结果不是对象精确占用或性能测量。\n")
                .append("下一步：使用 jcmd/JFR 分析真实负载，微基准学习 JMH，避免手写计时得出结论。\n").toString();
    }

    private static String loaderName(ClassLoader loader) {
        return loader == null ? "bootstrap (null)" : loader.getClass().getName();
    }
}
