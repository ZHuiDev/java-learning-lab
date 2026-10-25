package lab;

import lab.domain.LibraryException;
import lab.service.LibraryService;
import lab.web.AppServer;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.concurrent.CountDownLatch;

/** 程序入口只装配依赖；业务规则放在 LibraryService，方便独立测试。 */
public final class Main {
    private Main() { }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        Path root = null;
        Path data = null;
        boolean demo = false;
        try {
            for (int i = 0; i < args.length; i++) {
                switch (args[i]) {
                    case "--demo" -> demo = true;
                    case "--port" -> {
                        port = Integer.parseInt(argument(args, ++i, "--port"));
                        if (port < 1 || port > 65535) throw new IllegalArgumentException("端口必须在 1～65535 之间");
                    }
                    case "--root" -> root = Path.of(argument(args, ++i, "--root"));
                    case "--data" -> data = Path.of(argument(args, ++i, "--data"));
                    case "--help", "-h" -> {
                        System.out.println("用法：java lab.Main [--port 8080] [--root 项目目录] [--data 数据目录] [--demo]");
                        return;
                    }
                    default -> throw new IllegalArgumentException("未知参数：" + args[i]);
                }
            }
            if (demo) { demo(); return; }
            if (root == null) root = findRoot();
            root = root.toAbsolutePath().normalize();
            if (!Files.isDirectory(root.resolve("web"))) throw new IllegalArgumentException("项目目录中缺少 web；请使用 --root 指定项目根目录");
            Path dataDirectory = data == null ? root.resolve("data") : data.toAbsolutePath().normalize();
            LibraryService service = new LibraryService(dataDirectory);
            AppServer server = new AppServer(root, port, service);
            Runtime.getRuntime().addShutdownHook(new Thread(server::close, "library-shutdown"));
            server.start();
            System.out.println("Java 学习实验室已启动：http://127.0.0.1:" + server.port());
            System.out.println("数据目录：" + dataDirectory);
            System.out.println("按 Ctrl+C 退出。修改 Java 源码后需重新编译并启动。");
            new CountDownLatch(1).await();
        } catch (IllegalArgumentException | LibraryException e) {
            System.err.println("启动失败：" + e.getMessage());
            System.exit(1);
        } catch (java.net.BindException e) {
            System.err.println("端口不可用，请使用 --port 8081 换一个端口。");
            System.exit(1);
        }
    }

    private static String argument(String[] args, int index, String flag) {
        if (index >= args.length) throw new IllegalArgumentException(flag + " 缺少参数值");
        return args[index];
    }

    private static Path findRoot() throws Exception {
        Path cwd = Path.of("").toAbsolutePath();
        Path found = walkUp(cwd);
        if (found != null) return found;
        Path classes = Path.of(Main.class.getProtectionDomain().getCodeSource().getLocation().toURI());
        found = walkUp(classes);
        if (found != null) return found;
        throw new IllegalArgumentException("无法定位项目根目录，请使用 --root 指定");
    }

    private static Path walkUp(Path start) {
        for (Path current = start; current != null; current = current.getParent()) {
            if (Files.isDirectory(current.resolve("web")) && Files.isDirectory(current.resolve("src/main/java"))) return current;
        }
        return null;
    }

    private static void demo() throws Exception {
        Path temp = Files.createTempDirectory("java-learning-demo-");
        try {
            LibraryService library = new LibraryService(temp);
            var book = library.books("Java", "").getFirst();
            System.out.println("1. 查询图书：" + book);
            var loan = library.borrow(book.id(), "学习者");
            System.out.println("2. 借阅成功：" + loan);
            System.out.println("3. 当前统计：" + library.stats());
            System.out.println("4. 归还成功：" + library.returnLoan(loan.id()));
            System.out.println("5. 最终统计：" + library.stats());
            System.out.println("演示使用临时数据目录，不影响学习页面的借阅记录。");
        } finally {
            try (var paths = Files.walk(temp)) {
                for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.deleteIfExists(path);
            }
        }
    }
}
