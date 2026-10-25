# 练习 01：把借阅规则变成可执行契约

适合已懂基本语法、准备补上边界处理与金额运算的学习者。建议先运行 `oop` 实验，再来修改本练习。

只修改 `LoanPolicyExercise.java`；检查器是验收契约。初始文件故意保留 TODO，能够编译但检查应失败；这不是安装失败。

## 规则

| 输入 | 预期 |
| --- | --- |
| `allowedDays(STUDENT)` | 14 |
| `allowedDays(TEACHER)` | 30 |
| `allowedDays(VISITOR)` | 7 |
| `allowedDays(null)` | 抛 `IllegalArgumentException` |
| `overdueFee(n)`，n ≥ 0 | 每日 0.50 元，返回 `BigDecimal`，小数位固定为 2 |
| `overdueFee(n)`，n < 0 | 抛 `IllegalArgumentException` |

没有封顶金额。0 天是 `0.00`；3 天是 `1.50`；最大 int 天数也必须正确计算。不要先用 int 做乘法或使用 double 构造金额。`BigDecimal.equals` 同时比较数值与小数位，这里固定两位是接口契约。

## 动手顺序

1. 先不改代码，运行检查，读懂每条失败信息。
2. 完成 TODO 1，运行检查；确认读者类型相关检查通过。
3. 完成 TODO 2，关注 0、负数、大数边界。
4. 写出 `equals` 与 `compareTo` 比较 BigDecimal 的区别。
5. 在不改行为的前提下重构；再检查一次，体会检查如何保护重构。

在项目根目录运行推荐脚本：

```powershell
.\scripts\check-exercise.ps1
```

也可以直接用 JDK 21 运行：

```powershell
New-Item -ItemType Directory -Force build/exercise-01 | Out-Null
javac -encoding UTF-8 --release 21 -d build/exercise-01 exercises/01-loan-policy/LoanPolicyExercise.java exercises/01-loan-policy/ExerciseCheck.java
java -cp build/exercise-01 ExerciseCheck
```

通过标准：11 项检查全部 PASS，退出码为 0；能口头解释输入验证、枚举 switch、BigDecimal 构造与边界检查。只有跑出 PASS 而无法解释，先不要跳过复盘。

参考答案位于 `solutions/LoanPolicyExercise.java`。先尝试至少一次再查看；参考答案与练习同名，**不要把两个同名文件一起编译**。单独验证参考答案：

```powershell
New-Item -ItemType Directory -Force build/exercise-01-solution | Out-Null
javac -encoding UTF-8 --release 21 -d build/exercise-01-solution exercises/01-loan-policy/solutions/LoanPolicyExercise.java exercises/01-loan-policy/ExerciseCheck.java
java -cp build/exercise-01-solution ExerciseCheck
```

拓展：引入 `LoanPolicy` 接口实现学生与教师策略，但保持上述公开方法签名与所有检查结果不变。再思考：哪些规则属于业务对象，哪些属于界面输入校验？
