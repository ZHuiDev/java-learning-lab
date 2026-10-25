package lab;

import lab.domain.Book;
import lab.domain.LibraryException;
import lab.service.LibraryService;
import lab.web.AppServer;
import lab.web.Json;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

/** 无 JUnit 依赖；抛出 AssertionError 即测试失败，脚本可直接根据退出码判断。 */
public final class TestSuite {
    private static int assertions;
    private static final Clock FIXED = Clock.fixed(Instant.parse("2026-10-24T08:00:00Z"), ZoneOffset.UTC);

    public static void main(String[] args) throws Exception {
        Path temp = Files.createTempDirectory("java-learning-tests-");
        try {
            borrowReturnAndRestart(temp.resolve("borrow"));
            invalidInputs(temp.resolve("invalid"));
            concurrentBorrow(temp.resolve("concurrent"));
            failedSavePreservesState(temp.resolve("failed"));
            corruptDataDoesNotReset(temp.resolve("corrupt"));
            httpIntegration(temp.resolve("http"));
            System.out.println("全部通过：" + assertions + " 项断言（业务、并发、持久化、HTTP、安全边界）。");
        } finally {
            // temp 由本测试直接创建；只清理该目录，不触碰项目真实 data。
            try (var paths = Files.walk(temp)) {
                for (Path path : paths.sorted(Comparator.reverseOrder()).toList()) Files.deleteIfExists(path);
            }
        }
    }

    private static void borrowReturnAndRestart(Path dir) {
        LibraryService library = new LibraryService(dir, FIXED);
        check(library.books("", "").size() == 8, "种子图书数量");
        check(library.stats().available() == 16, "种子库存");
        check(library.books("effective", "Java").size() == 1, "关键词和分类同时过滤");
        var loan = library.borrow(1, "  A\"\\张三  ");
        check(loan.borrower().equals("A\"\\张三"), "借阅人去除两端空白");
        check(loan.borrowedAt().equals(LocalDate.of(2026, 10, 24)), "注入 Clock 固定日期");
        check(loan.dueAt().equals(LocalDate.of(2026, 11, 23)), "借期 30 天");
        check(library.books("", "").getFirst().available() == 2, "借阅减少库存");
        check(library.stats().activeLoans() == 1 && library.stats().totalLoans() == 1, "借阅统计");
        LibraryService restarted = new LibraryService(dir, FIXED);
        check(restarted.loans().getFirst().equals(loan), "重启恢复借阅与特殊字符");
        check(restarted.stats().available() == 15, "重启恢复库存");
        check(restarted.returnLoan(loan.id()).returned(), "归还标志");
        expect(409, () -> restarted.returnLoan(loan.id()), "重复归还拒绝且库存不增加");
        check(restarted.stats().available() == 16 && restarted.stats().activeLoans() == 0, "归还恢复库存");
        LibraryService again = new LibraryService(dir, FIXED);
        check(again.loans().getFirst().returned(), "重启恢复归还状态");
        check(again.borrow(1, "李四").id() == loan.id() + 1, "重启后编号继续递增");
        try { again.books("", "").add(new Book(9, "x", "x", "x", 1, 1)); throw new AssertionError("列表应不可变"); }
        catch (UnsupportedOperationException expected) { assertions++; }
        check(Json.quote("\"\\\n\t\u0001").equals("\"\\\"\\\\\\n\\t\\u0001\""), "JSON 转义");
    }

    private static void invalidInputs(Path dir) {
        LibraryService library = new LibraryService(dir, FIXED);
        expect(400, () -> library.borrow(0, "小明"), "图书编号必须为正");
        expect(404, () -> library.borrow(999, "小明"), "图书不存在");
        expect(400, () -> library.borrow(1, null), "借阅人必填");
        expect(400, () -> library.borrow(1, " \t "), "借阅人不能只有空白");
        expect(400, () -> library.borrow(1, "张\n三"), "拒绝借阅人控制字符");
        expect(400, () -> library.borrow(1, "张".repeat(41)), "借阅人长度上限");
        expect(400, () -> library.books("x".repeat(101), ""), "查询长度上限");
        expect(400, () -> library.returnLoan(-1), "归还编号必须为正");
        expect(404, () -> library.returnLoan(999), "借阅记录不存在");
        library.borrow(8, "小明");
        expect(409, () -> library.borrow(8, "小红"), "无库存拒绝借阅");
        check(library.stats().totalLoans() == 1, "失败操作没有新增记录");
    }

    private static void concurrentBorrow(Path dir) throws Exception {
        LibraryService library = new LibraryService(dir, FIXED);
        AtomicInteger succeeded = new AtomicInteger();
        AtomicInteger conflicts = new AtomicInteger();
        CountDownLatch start = new CountDownLatch(1);
        try (var pool = Executors.newVirtualThreadPerTaskExecutor()) {
            var futures = new java.util.ArrayList<java.util.concurrent.Future<?>>();
            for (int i = 0; i < 40; i++) {
                final int person = i;
                futures.add(pool.submit(() -> {
                    try {
                        start.await();
                        library.borrow(8, "同学" + person);
                        succeeded.incrementAndGet();
                    } catch (LibraryException e) {
                        if (e.status() != 409) throw e;
                        conflicts.incrementAndGet();
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException(e);
                    }
                }));
            }
            start.countDown();
            for (var future : futures) future.get();
        }
        check(succeeded.get() == 1 && conflicts.get() == 39, "40 个并发请求只有 1 个借到最后一本");
        check(library.stats().available() == 15 && library.stats().totalLoans() == 1, "并发库存不超卖");
        check(new LibraryService(dir, FIXED).stats().activeLoans() == 1, "并发最终结果已持久化");
    }

    private static void failedSavePreservesState(Path parent) throws IOException {
        Path dir = parent.resolve("data");
        LibraryService library = new LibraryService(dir, FIXED);
        Files.move(dir, parent.resolve("saved-data"));
        Files.writeString(dir, "用文件占据目录路径，稳定模拟不可写目录");
        expect(500, () -> library.borrow(1, "小明"), "保存失败明确返回失败");
        check(library.stats().totalLoans() == 0 && library.stats().available() == 16, "保存失败内存不提交");
        Files.delete(dir);
        Files.move(parent.resolve("saved-data"), dir);
        check(new LibraryService(dir, FIXED).stats().totalLoans() == 0, "保存失败磁盘保留旧状态");
    }

    private static void corruptDataDoesNotReset(Path dir) throws IOException {
        new LibraryService(dir, FIXED);
        Path file = dir.resolve("library.properties");
        String damaged = "version=1\nbooks.count=invalid\n";
        Files.writeString(file, damaged);
        expect(500, () -> new LibraryService(dir, FIXED), "损坏数据拒绝启动");
        check(Files.readString(file).equals(damaged), "损坏数据不被种子静默覆盖");
    }

    private static void httpIntegration(Path root) throws Exception {
        Files.createDirectories(root.resolve("web"));
        Files.createDirectories(root.resolve("src/main/java/lab"));
        Files.createDirectories(root.resolve("docs"));
        Files.writeString(root.resolve("web/index.html"), "<!doctype html><title>学习</title>");
        Files.writeString(root.resolve("src/main/java/lab/Read.java"), "// 只读教学源码");
        Files.writeString(root.resolve("docs/guide.md"), "# 学习路线");
        LibraryService library = new LibraryService(root.resolve("data"), FIXED);
        try (AppServer server = new AppServer(root, 0, library); HttpClient client = HttpClient.newHttpClient()) {
            server.start();
            String base = "http://127.0.0.1:" + server.port();
            check(get(client, base, "/api/health").body().contains("\"status\":\"ok\""), "HTTP 健康检查");
            check(get(client, base, "/").headers().firstValue("content-type").orElse("").contains("text/html"), "静态 HTML MIME");
            var books = get(client, base, "/api/books?q=Effective&category=Java");
            check(books.statusCode() == 200 && books.body().contains("Effective Java") && !books.body().contains("核心技术"), "HTTP 过滤图书");
            var borrow = post(client, base, "/api/loans", "bookId=1&borrower=" + URLEncoder.encode("王\"五", StandardCharsets.UTF_8), null);
            check(borrow.statusCode() == 201 && borrow.body().contains("王\\\"五"), "HTTP 借阅与 JSON 转义");
            check(post(client, base, "/api/loans/1/return", "", base).statusCode() == 200, "同源归还");
            check(post(client, base, "/api/loans/1/return", "", null).statusCode() == 409, "HTTP 重复归还冲突");
            check(post(client, base, "/api/loans", "bookId=1&borrower=evil", "https://example.com").statusCode() == 403, "拒绝跨站写入");
            check(library.stats().totalLoans() == 1, "跨站请求未修改数据");
            check(post(client, base, "/api/loans", "bookId=-1&borrower=a", null).statusCode() == 400, "HTTP 错误编号");
            check(post(client, base, "/api/loans", "bookId=1&bookId=2&borrower=a", null).statusCode() == 400, "HTTP 拒绝重复参数");
            check(post(client, base, "/api/loans", "bookId=1&borrower=" + "a".repeat(9000), null).statusCode() == 413, "HTTP 请求体上限");
            check(get(client, base, "/api/labs").body().contains("reflection"), "HTTP 实验目录");
            check(post(client, base, "/api/labs/basics", "", base).body().contains("\"output\":"), "HTTP 固定实验可运行");
            check(post(client, base, "/api/labs/arbitrary", "", base).statusCode() == 404, "拒绝任意实验名");
            check(get(client, base, "/api/source?path=src/main/java/lab/Read.java").body().contains("只读教学源码"), "源码白名单可读");
            check(get(client, base, "/api/source?path=docs/guide.md").statusCode() == 200, "教材白名单可读");
            check(get(client, base, "/api/source?path=../data/library.properties").statusCode() == 403, "拒绝路径穿越");
            check(get(client, base, "/api/source?path=data/library.properties").statusCode() == 403, "拒绝读取业务数据");
            check(get(client, base, "/api/source?path=src/main/java/lab/Missing.java").statusCode() == 404, "不存在源码返回 404");
            check(get(client, base, "/api/missing").statusCode() == 404, "不存在接口返回 404");
            check(post(client, base, "/api/books", "", null).statusCode() == 405, "错误方法返回 405");
        }
    }

    private static HttpResponse<String> get(HttpClient client, String base, String path) throws Exception {
        return client.send(HttpRequest.newBuilder(URI.create(base + path)).GET().build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private static HttpResponse<String> post(HttpClient client, String base, String path, String body, String origin) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create(base + path)).header("Content-Type", "application/x-www-form-urlencoded");
        if (origin != null) builder.header("Origin", origin);
        return client.send(builder.POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8)).build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private static void expect(int status, Runnable action, String message) {
        try { action.run(); throw new AssertionError(message + "：未抛出异常"); }
        catch (LibraryException e) { check(e.status() == status, message + "：状态应为 " + status + "，实际 " + e.status()); }
    }

    private static void check(boolean condition, String message) {
        assertions++;
        if (!condition) throw new AssertionError(message);
    }
}
