package lab.examples;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** 泛型保证元素类型；哈希容器使用 equals/hashCode，而不是书名比较。 */
final class CollectionsLab {
    private CollectionsLab() {}

    static final class Book {
        private final String isbn;
        private final String title;
        Book(String isbn, String title) { this.isbn = Objects.requireNonNull(isbn); this.title = title; }
        String title() { return title; }
        @Override public boolean equals(Object other) {
            return other instanceof Book book && isbn.equals(book.isbn);
        }
        @Override public int hashCode() { return isbn.hashCode(); }
        @Override public String toString() { return title + "(" + isbn + ")"; }
    }

    static String run() {
        List<Book> list = new ArrayList<>(List.of(
                new Book("B-02", "Streams"), new Book("B-01", "Collections"),
                new Book("B-01", "同 ISBN 的另一个对象")));
        // LinkedHashSet/LinkedHashMap 保留插入顺序，便于观察确定的实验输出。
        Set<Book> set = new LinkedHashSet<>(list);
        List<Book> sorted = new ArrayList<>(set);
        sorted.sort(Comparator.comparing(Book::title));
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (Book book : list) counts.merge(book.isbn, 1, Integer::sum);
        return "[collections] 图书目录\n"
                + "List 保留重复，size=" + list.size() + "\n"
                + "Set 按 ISBN 去重，size=" + set.size() + "；内容=" + set + "\n"
                + "Comparator 按书名排序=" + sorted + "\n"
                + "Map<String, Integer> 按 ISBN 计数=" + counts + "\n"
                + "观察：相等对象必须有相同 hashCode；作为键的身份字段应保持不变。\n";
    }
}
