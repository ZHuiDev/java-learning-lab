# 练习 03：不会超借的库存（并发）

前置实验：`concurrency`；掌握集合、异常和资源管理后再做。修改 `InventoryExercise.java`，自己新增 `InventoryCheck.java`，不需要联网安装库。

契约：初始库存非负；`borrowOne()` 在有库存时扣减 1 并返回 true，无库存时返回 false；库存永远非负；一次成功恰好对应一次扣减。所有方法对多线程安全。

实现步骤：

1. 用 `synchronized` 保护“判断与扣减”，给读取方法相同的同步协议。
2. 写单线程检查：初始 1，本次成功、下次失败、剩余 0；负初始值抛异常；初始 0 始终失败。
3. 写并发检查：初始 20，使用 `Executors.newVirtualThreadPerTaskExecutor()` 提交 200 次借阅；用 `Future<Boolean>` 收集全部结果，并确保资源关闭。统计成功数恰为 20，失败数 180，余量 0。
4. 自己增加一组初始 0、提交 200 次的检查。多次重复运行可发现部分问题，但不能代替正确的同步推理。
5. 进阶：改用 `AtomicInteger` + CAS 循环重写；说明为什么 `get() > 0` 后单独 `decrementAndGet()` 仍有竞争窗口。

验收：自己的检查器不用 `Thread.sleep` 作为任务完成信号；必须等待 Future；异常导致非零退出码；不能捕获异常后当作通过。启动检查器的命令：

```powershell
New-Item -ItemType Directory -Force build/exercise-03 | Out-Null
javac -encoding UTF-8 --release 21 -d build/exercise-03 exercises/03-concurrent-inventory/InventoryExercise.java exercises/03-concurrent-inventory/InventoryCheck.java
java -cp build/exercise-03 InventoryCheck
```

当前只提供待完成模板，尚无自动评分器；上面的 `InventoryCheck.java` 需要你创建。不要只观察 main 输出就声称线程安全。复盘：原子性、可见性和有序性分别解决什么问题？在同一锁内为何三个要求能协调成立？
