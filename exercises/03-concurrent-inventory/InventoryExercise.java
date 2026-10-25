/** 每个实例独立持有库存；请按 README.md 补全。 */
public final class InventoryExercise {
    private int available;

    public InventoryExercise(int initialStock) {
        if (initialStock < 0) throw new IllegalArgumentException("库存不能为负数");
        available = initialStock;
    }

    public boolean borrowOne() {
        // TODO：把“库存检查”和“扣减”作为一个原子操作；不要只加 volatile。
        return false;
    }

    public int available() {
        // TODO：读取也应遵守你选择的同步协议。
        return available;
    }
}
