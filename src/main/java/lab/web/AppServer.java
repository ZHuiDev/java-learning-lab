package lab.web;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import lab.domain.LibraryException;
import lab.examples.LabRunner;
import lab.service.LibraryService;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URLDecoder;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** JDK HttpServer + 虚拟线程：HTTP 路由、输入校验和业务事务分别承担不同职责。 */
public final class AppServer implements AutoCloseable {
    private static final int MAX_BODY = 8192;
    private static final Map<String, String[]> LABS = new LinkedHashMap<>();
    static {
        LABS.put("basics", new String[]{"语言基础", "类型、控制流、字符串与异常"});
        LABS.put("oop", new String[]{"面向对象", "封装、接口、多态与泛型"});
        LABS.put("collections", new String[]{"集合与泛型", "List、Set、Map 与相等性"});
        LABS.put("streams", new String[]{"函数式与 Stream", "Lambda、筛选、分组与归约"});
        LABS.put("io", new String[]{"文件与 I/O", "NIO、字符编码与资源关闭"});
        LABS.put("concurrency", new String[]{"并发编程", "原子性、线程池与虚拟线程"});
        LABS.put("modern", new String[]{"现代 Java", "record、密封类型与模式匹配"});
        LABS.put("reflection", new String[]{"反射与注解", "运行时类型信息与元数据"});
        LABS.put("jvm", new String[]{"JVM 与运行时", "类加载、内存与运行时诊断"});
    }

    private final HttpServer server;
    private final ExecutorService executor;
    private final Path projectRoot;
    private final LibraryService library;

    /** port=0 由操作系统分配可用端口，供集成测试使用。 */
    public AppServer(Path projectRoot, int port, LibraryService library) throws IOException {
        if (port < 0 || port > 65535) throw new IllegalArgumentException("端口必须在 0～65535 之间");
        this.projectRoot = projectRoot.toAbsolutePath().normalize().toRealPath();
        this.library = library;
        server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        executor = Executors.newVirtualThreadPerTaskExecutor();
        server.setExecutor(executor);
        server.createContext("/", this::handle);
    }

    public void start() { server.start(); }
    public int port() { return server.getAddress().getPort(); }

    @Override public void close() {
        server.stop(0);
        executor.close();
    }

    private void handle(HttpExchange exchange) throws IOException {
        try (exchange) {
            try {
                String path = exchange.getRequestURI().getPath();
                if (path.length() > 2048) throw new LibraryException(400, "请求路径过长");
                if (exchange.getRequestMethod().equals("POST")) checkOrigin(exchange);
                if (path.startsWith("/api/")) api(exchange, path);
                else staticFile(exchange, path);
            } catch (LibraryException e) {
                json(exchange, e.status(), "{\"error\":" + Json.quote(e.getMessage()) + "}");
            } catch (Exception e) {
                System.err.println("请求失败：" + e.getClass().getSimpleName() + ": " + e.getMessage());
                json(exchange, 500, "{\"error\":\"服务暂时无法完成请求，请查看终端日志\"}");
            }
        }
    }

    private void api(HttpExchange exchange, String path) throws Exception {
        switch (path) {
            case "/api/health" -> {
                method(exchange, "GET");
                json(exchange, 200, "{\"status\":\"ok\",\"javaVersion\":" + Json.quote(System.getProperty("java.version")) + "}");
            }
            case "/api/books" -> {
                method(exchange, "GET");
                Map<String, String> query = parameters(exchange.getRequestURI().getRawQuery(), 2048);
                json(exchange, 200, Json.books(library.books(query.get("q"), query.get("category"))));
            }
            case "/api/loans" -> {
                if (exchange.getRequestMethod().equals("GET")) json(exchange, 200, Json.loans(library.loans()));
                else {
                    method(exchange, "POST");
                    Map<String, String> form = form(exchange);
                    var loan = library.borrow(positiveNumber(form.get("bookId"), "图书编号"), form.get("borrower"));
                    exchange.getResponseHeaders().set("Location", "/api/loans/" + loan.id());
                    json(exchange, 201, Json.loan(loan));
                }
            }
            case "/api/stats" -> {
                method(exchange, "GET");
                json(exchange, 200, Json.stats(library.stats()));
            }
            case "/api/labs" -> {
                method(exchange, "GET");
                String body = LABS.entrySet().stream().map(e -> "{\"id\":" + Json.quote(e.getKey())
                        + ",\"title\":" + Json.quote(e.getValue()[0]) + ",\"description\":" + Json.quote(e.getValue()[1]) + "}")
                        .collect(java.util.stream.Collectors.joining(",", "[", "]"));
                json(exchange, 200, body);
            }
            case "/api/source" -> {
                method(exchange, "GET");
                String relative = parameters(exchange.getRequestURI().getRawQuery(), 2048).get("path");
                source(exchange, relative);
            }
            default -> {
                if (path.startsWith("/api/labs/") && path.indexOf('/', 10) == -1) {
                    method(exchange, "POST");
                    String id = path.substring("/api/labs/".length());
                    if (!LABS.containsKey(id)) throw new LibraryException(404, "未找到这个实验");
                    // 请求数据绝不作为 Java 代码或命令执行，只能选择九个编译好的实验。
                    rejectUnexpectedBody(exchange);
                    json(exchange, 200, "{\"id\":" + Json.quote(id) + ",\"output\":" + Json.quote(LabRunner.run(id)) + "}");
                } else if (path.matches("/api/loans/[^/]+/return")) {
                    method(exchange, "POST");
                    rejectUnexpectedBody(exchange);
                    String id = path.substring("/api/loans/".length(), path.length() - "/return".length());
                    json(exchange, 200, Json.loan(library.returnLoan(positiveNumber(id, "借阅编号"))));
                } else throw new LibraryException(404, "未找到这个接口");
            }
        }
    }

    private void staticFile(HttpExchange exchange, String path) throws IOException {
        method(exchange, "GET");
        if (path.startsWith("/src/") || path.startsWith("/docs/")) {
            source(exchange, path.substring(1));
            return;
        }
        Path webRoot = projectRoot.resolve("web");
        if (!Files.isDirectory(webRoot)) throw new LibraryException(404, "前端目录尚未生成");
        Path webReal = webRoot.toRealPath();
        if (!webReal.startsWith(projectRoot)) throw new LibraryException(403, "禁止访问该路径");
        String relative = path.equals("/") ? "index.html" : path.substring(1);
        Path requested = resolveSafe(webReal, relative);
        if (!Files.isRegularFile(requested)) throw new LibraryException(404, "未找到这个文件");
        Path real = requested.toRealPath();
        if (!real.startsWith(webReal)) throw new LibraryException(403, "禁止访问该路径");
        send(exchange, 200, mime(real), Files.readAllBytes(real));
    }

    private void source(HttpExchange exchange, String relative) throws IOException {
        if (relative == null || relative.isBlank() || relative.length() > 1024) {
            throw new LibraryException(400, "请提供有效的项目源码相对路径");
        }
        Path requested = resolveSafe(projectRoot, relative);
        Path javaRoot = projectRoot.resolve("src/main/java");
        Path docsRoot = projectRoot.resolve("docs");
        boolean java = requested.startsWith(javaRoot) && requested.toString().endsWith(".java");
        boolean doc = requested.startsWith(docsRoot) && requested.toString().endsWith(".md");
        if (!java && !doc) throw new LibraryException(403, "仅开放 Java 源码与 Markdown 教材");
        if (!Files.isRegularFile(requested)) throw new LibraryException(404, "未找到这个源码文件");
        Path allowed = (java ? javaRoot : docsRoot).toRealPath();
        if (!allowed.startsWith(projectRoot)) throw new LibraryException(403, "禁止访问该路径");
        Path real = requested.toRealPath();
        if (!real.startsWith(allowed)) throw new LibraryException(403, "禁止访问该路径");
        send(exchange, 200, "text/plain; charset=utf-8", Files.readAllBytes(real));
    }

    private static Path resolveSafe(Path root, String relative) {
        if (relative.indexOf('\0') >= 0 || relative.indexOf('\\') >= 0 || relative.indexOf(':') >= 0) {
            throw new LibraryException(403, "禁止访问该路径");
        }
        try {
            Path input = Path.of(relative);
            if (input.isAbsolute()) throw new LibraryException(403, "禁止访问绝对路径");
            for (Path part : input) {
                if (part.toString().equals("..") || part.toString().startsWith(".")) {
                    throw new LibraryException(403, "禁止访问该路径");
                }
            }
            Path result = root.resolve(input).normalize();
            if (!result.startsWith(root)) throw new LibraryException(403, "禁止访问该路径");
            return result;
        } catch (java.nio.file.InvalidPathException e) {
            throw new LibraryException(400, "路径格式无效");
        }
    }

    private void checkOrigin(HttpExchange exchange) {
        List<String> origins = exchange.getRequestHeaders().get("Origin");
        if (origins == null) return; // 命令行客户端通常不发送 Origin。
        if (origins.size() != 1) throw new LibraryException(403, "请求来源无效");
        try {
            URI origin = new URI(origins.getFirst());
            String host = origin.getHost();
            int port = origin.getPort() == -1 ? 80 : origin.getPort();
            if (!"http".equals(origin.getScheme()) || !Set.of("localhost", "127.0.0.1").contains(host == null ? "" : host)
                    || port != port() || origin.getRawUserInfo() != null || origin.getRawQuery() != null
                    || origin.getRawFragment() != null || origin.getRawPath() != null && !origin.getRawPath().isEmpty()) {
                throw new LibraryException(403, "请从当前本机学习页面发起操作");
            }
        } catch (URISyntaxException e) {
            throw new LibraryException(403, "请求来源无效");
        }
    }

    private static Map<String, String> form(HttpExchange exchange) throws IOException {
        String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
        if (contentType == null || !contentType.split(";", 2)[0].strip().equalsIgnoreCase("application/x-www-form-urlencoded")) {
            throw new LibraryException(400, "请求应使用 application/x-www-form-urlencoded 表单");
        }
        byte[] bytes = exchange.getRequestBody().readNBytes(MAX_BODY + 1);
        if (bytes.length > MAX_BODY) throw new LibraryException(413, "表单内容过大");
        try {
            String body = StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(bytes)).toString();
            return parameters(body, MAX_BODY);
        } catch (CharacterCodingException e) {
            throw new LibraryException(400, "表单必须使用 UTF-8 编码");
        }
    }

    private static void rejectUnexpectedBody(HttpExchange exchange) throws IOException {
        if (exchange.getRequestBody().readNBytes(1).length != 0) {
            throw new LibraryException(400, "这个操作无需请求正文");
        }
    }

    private static Map<String, String> parameters(String raw, int limit) {
        Map<String, String> result = new LinkedHashMap<>();
        if (raw == null || raw.isEmpty()) return result;
        if (raw.length() > limit) throw new LibraryException(400, "请求参数过长");
        String[] fields = raw.split("&", -1);
        if (fields.length > 20) throw new LibraryException(400, "请求参数过多");
        try {
            for (String field : fields) {
                String[] pair = field.split("=", 2);
                String key = URLDecoder.decode(pair[0], StandardCharsets.UTF_8);
                String value = URLDecoder.decode(pair.length == 2 ? pair[1] : "", StandardCharsets.UTF_8);
                if (key.isEmpty() || key.length() > 80 || value.length() > 1024) throw new LibraryException(400, "请求参数无效或过长");
                if (result.putIfAbsent(key, value) != null) throw new LibraryException(400, "不能重复提供参数：" + key);
            }
            return result;
        } catch (IllegalArgumentException e) {
            throw new LibraryException(400, "URL 参数编码无效");
        }
    }

    private static long positiveNumber(String value, String label) {
        if (value == null || !value.matches("[1-9][0-9]{0,18}")) throw new LibraryException(400, label + "必须是正整数");
        try { return Long.parseLong(value); }
        catch (NumberFormatException e) { throw new LibraryException(400, label + "超出范围"); }
    }

    private static void method(HttpExchange exchange, String expected) {
        if (!exchange.getRequestMethod().equals(expected)) {
            exchange.getResponseHeaders().set("Allow", expected);
            throw new LibraryException(405, "此接口仅接受 " + expected + " 请求");
        }
    }

    private static String mime(Path path) {
        String name = path.getFileName().toString();
        if (name.endsWith(".html")) return "text/html; charset=utf-8";
        if (name.endsWith(".css")) return "text/css; charset=utf-8";
        if (name.endsWith(".js")) return "text/javascript; charset=utf-8";
        if (name.endsWith(".json")) return "application/json; charset=utf-8";
        if (name.endsWith(".svg")) return "image/svg+xml";
        if (name.endsWith(".png")) return "image/png";
        if (name.endsWith(".ico")) return "image/x-icon";
        return "application/octet-stream";
    }

    private static void json(HttpExchange exchange, int status, String body) throws IOException {
        send(exchange, status, "application/json; charset=utf-8", body.getBytes(StandardCharsets.UTF_8));
    }

    private static void send(HttpExchange exchange, int status, String contentType, byte[] bytes) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", contentType);
        exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        exchange.getResponseHeaders().set("Cache-Control", "no-store");
        exchange.sendResponseHeaders(status, bytes.length);
        exchange.getResponseBody().write(bytes);
    }
}
