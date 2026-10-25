package lab.examples;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** 使用临时目录演示 UTF-8 文件读写，结束时清理，不触碰用户已有文件。 */
final class IoLab {
    private IoLab() {}

    static String run() throws IOException {
        Path directory = Files.createTempDirectory("java-learning-lab-");
        Path file = directory.resolve("books.txt");
        try {
            Files.write(file, List.of("Java 入门", "并发编程"), StandardCharsets.UTF_8);
            int lines = 0;
            String first;
            // 无论正常结束还是抛出异常，reader 都会自动关闭。
            try (BufferedReader reader = Files.newBufferedReader(file, StandardCharsets.UTF_8)) {
                first = reader.readLine();
                if (first != null) lines++;
                while (reader.readLine() != null) lines++;
            }
            return "[io] UTF-8 图书清单\n"
                    + "Path.resolve 文件名=" + file.getFileName() + "\n"
                    + "读取行数=" + lines + "；第一行=" + first + "\n"
                    + "编码明确为 UTF-8；读取器通过 try-with-resources 关闭。\n"
                    + "观察：本次临时文件与目录会在返回前清理；IOException 交由调用方处理。\n";
        } finally {
            // 删除顺序先文件后目录；此处只操作本实验刚创建的路径。
            try { Files.deleteIfExists(file); } finally { Files.deleteIfExists(directory); }
        }
    }
}
