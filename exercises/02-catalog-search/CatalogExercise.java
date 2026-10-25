import java.util.List;

/** 任务与验收数据见同目录 README.md。 */
public final class CatalogExercise {
    public record Book(String isbn, String title, String category) {}

    public static List<Book> search(List<Book> books, String keyword) {
        // TODO：校验参数，去掉关键词首尾空白，忽略大小写匹配书名。
        // TODO：按 ISBN 去重，保留首次出现的对象；按书名、ISBN 升序返回不可修改列表。
        return List.of();
    }

    public static void main(String[] args) {
        List<Book> books = List.of(new Book("02", "Java Streams", "技术"),
                new Book("01", "Java Basics", "技术"), new Book("01", "Java Basics second", "技术"),
                new Book("03", "SQL", "技术"));
        System.out.println("TODO 初始结果为空；完成后应返回 ISBN 01、02：" + search(books, " java "));
    }
}
