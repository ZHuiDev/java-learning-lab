package lab.web;

import lab.domain.Book;
import lab.domain.Loan;
import lab.service.LibraryService.Stats;

import java.util.List;
import java.util.stream.Collectors;

/** 小型教学 JSON 编码器：只序列化已知类型，不拼接未经转义的用户输入。 */
public final class Json {
    private Json() { }

    public static String quote(String value) {
        StringBuilder out = new StringBuilder("\"");
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            switch (c) {
                case '"' -> out.append("\\\"");
                case '\\' -> out.append("\\\\");
                case '\b' -> out.append("\\b");
                case '\f' -> out.append("\\f");
                case '\n' -> out.append("\\n");
                case '\r' -> out.append("\\r");
                case '\t' -> out.append("\\t");
                default -> {
                    if (c < 0x20 || Character.isSurrogate(c)
                            && !(Character.isHighSurrogate(c) && i + 1 < value.length()
                            && Character.isLowSurrogate(value.charAt(i + 1)))
                            && !(Character.isLowSurrogate(c) && i > 0 && Character.isHighSurrogate(value.charAt(i - 1)))) {
                        out.append(String.format("\\u%04x", (int) c));
                    } else out.append(c);
                }
            }
        }
        return out.append('"').toString();
    }

    public static String book(Book b) {
        return "{\"id\":" + b.id() + ",\"title\":" + quote(b.title()) + ",\"author\":" + quote(b.author())
                + ",\"category\":" + quote(b.category()) + ",\"total\":" + b.total() + ",\"available\":" + b.available() + "}";
    }

    public static String loan(Loan l) {
        return "{\"id\":" + l.id() + ",\"bookId\":" + l.bookId() + ",\"borrower\":" + quote(l.borrower())
                + ",\"borrowedAt\":" + quote(l.borrowedAt().toString()) + ",\"dueAt\":" + quote(l.dueAt().toString())
                + ",\"returned\":" + l.returned() + "}";
    }

    public static String books(List<Book> books) { return books.stream().map(Json::book).collect(Collectors.joining(",", "[", "]")); }
    public static String loans(List<Loan> loans) { return loans.stream().map(Json::loan).collect(Collectors.joining(",", "[", "]")); }
    public static String stats(Stats s) {
        return "{\"books\":" + s.books() + ",\"available\":" + s.available() + ",\"activeLoans\":" + s.activeLoans()
                + ",\"totalLoans\":" + s.totalLoans() + "}";
    }
}
