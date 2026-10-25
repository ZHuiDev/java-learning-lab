package lab.examples;

import java.util.Locale;

/** 命令行与网页共用的实验入口；每个实验只返回自己的文本，不重定向全局输出。 */
public final class LabRunner {
    private LabRunner() {}

    public static String run(String id) throws Exception {
        if (id == null) throw new IllegalArgumentException("实验 ID 不能为空");
        return switch (id.trim().toLowerCase(Locale.ROOT)) {
            case "basics" -> BasicsLab.run();
            case "oop" -> OopLab.run();
            case "collections" -> CollectionsLab.run();
            case "streams" -> StreamsLab.run();
            case "io" -> IoLab.run();
            case "concurrency" -> ConcurrencyLab.run();
            case "modern" -> ModernLab.run();
            case "reflection" -> ReflectionLab.run();
            case "jvm" -> JvmLab.run();
            default -> throw new IllegalArgumentException("未知实验：" + id
                    + "；可选 basics, oop, collections, streams, io, concurrency, modern, reflection, jvm");
        };
    }

    public static void main(String[] args) throws Exception {
        if (args.length == 0) {
            System.out.println("Java 21 实验：basics, oop, collections, streams, io, concurrency, modern, reflection, jvm");
            System.out.println("运行方式：java -cp build/classes lab.examples.LabRunner collections");
            System.out.println("已有语法基础：建议从 oop、collections 开始，再完成 exercises 中的练习。");
            return;
        }
        if (args.length != 1) throw new IllegalArgumentException("请传入一个实验 ID");
        System.out.print(run(args[0]));
    }
}
