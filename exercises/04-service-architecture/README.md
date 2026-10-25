# 练习 04：可替换存储的借阅服务（设计与测试）

前置：已完成前三个练习；在项目应用中阅读一次“请求 → 服务 → 存储”的调用路径。本练习自己创建代码文件，先用标准库完成，不要求 Spring 或数据库。

在本目录建立包 `exercise.architecture`，创建下列类型：

```java
record Book(String isbn, String title) {}
record Loan(String readerId, String isbn) {}
interface BookRepository {
    java.util.Optional<Book> findByIsbn(String isbn);
}
interface LoanRepository {
    boolean hasActiveLoan(String readerId, String isbn);
    void save(Loan loan);
}
// LoanService 通过构造器接收以上两个接口。
// public Loan borrow(String readerId, String isbn)
```

先把每个 public 类型放入同名文件。`LoanService.borrow` 按顺序验证：readerId / isbn 不能为空白；书存在；该读者没有同一本书的有效借阅。成功才写入并返回 Loan。分别用 `IllegalArgumentException`、`NoSuchElementException`、`IllegalStateException` 表达三类失败；输入用 strip 归一化。

实现两种 BookRepository：基于 Map 的内存实现；只返回固定数据的测试替身。LoanRepository 先使用内存实现。通过构造器替换实现，LoanService 不应改动。暂不实现库存、归还和并发事务，把规则规模控制在可解释范围内。

自己创建 `ArchitectureCheck.main`，依次验收：

| 场景 | 断言 |
| --- | --- |
| 存在的书、首次借阅 | 返回值正确且只 save 一次 |
| 同一读者再次借同一本书 | 抛 IllegalStateException，不新增记录 |
| 不存在的 ISBN | 抛 NoSuchElementException，不 save |
| null / 空白读者或 ISBN | 抛 IllegalArgumentException，不访问存储 |
| 换成固定测试替身 | 同一 LoanService 能运行 |

编译命令（需先完成自己的源码与检查器）：

```powershell
New-Item -ItemType Directory -Force build/exercise-04 | Out-Null
$sources = Get-ChildItem exercises/04-service-architecture -Filter *.java -Recurse | ForEach-Object FullName
javac -encoding UTF-8 --release 21 -d build/exercise-04 @sources
java -cp build/exercise-04 exercise.architecture.ArchitectureCheck
```

完成后画出依赖箭头：服务只依赖接口，内存实现实现接口。复盘：为什么构造器注入能改善测试？这里检查再保存是否足以面对并发？如果迁移到关系数据库，唯一约束与事务应保护什么？这些问题留到课程中的数据库与事务阶段解决。
