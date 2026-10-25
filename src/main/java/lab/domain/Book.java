package lab.domain;

/** record 表达不可变的数据快照；修改库存时创建新对象，避免共享可变状态泄漏。 */
public record Book(long id, String title, String author, String category, int total, int available) {
    public Book {
        if (id <= 0 || title == null || title.isBlank() || author == null || author.isBlank()
                || category == null || category.isBlank() || total < 1 || available < 0 || available > total) {
            throw new IllegalArgumentException("图书数据无效");
        }
    }

    public Book withAvailable(int amount) {
        return new Book(id, title, author, category, total, amount);
    }
}
