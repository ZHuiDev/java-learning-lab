package lab.domain;

/** 业务异常由 Web 层转换为明确的 HTTP 状态；领域层不依赖 HttpExchange。 */
public final class LibraryException extends RuntimeException {
    private final int status;

    public LibraryException(int status, String message) {
        super(message);
        this.status = status;
    }

    public LibraryException(int status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public int status() { return status; }
}
