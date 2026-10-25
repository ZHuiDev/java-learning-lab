# 练习 02：搜索与去重（集合 → Stream）

前置实验：`collections`、`streams`。修改 `CatalogExercise.search`，先写 for 循环版本，再写 Stream 版本并对比可读性。目标不是把所有循环改成 Stream。

契约：

1. 列表、关键词、列表元素及其字段均不允许 null，否则抛 `IllegalArgumentException`。
2. 关键词先 `strip()`，再用 `Locale.ROOT` 转为小写；对书名做相同大小写标准化，以 `contains` 匹配。空关键词匹配全部。
3. 先在整个输入中按 ISBN 去重，保留首次出现的对象，再筛选；重复记录不能覆盖首次记录。
4. 按原书名自然顺序，再按 ISBN 自然顺序排序；不修改输入，返回不可修改的列表。

验收案例（需要自己写检查；当前目录不提供自动评分）：

| 输入/操作 | 预期 |
| --- | --- |
| 模板 main 的数据，关键词 ` java ` | 返回 ISBN 01、02，顺序为 Java Basics、Java Streams |
| 模板数据，关键词 `SQL` | 只返回 ISBN 03 |
| 模板数据，关键词为空 | 返回 3 本，Java Basics、Java Streams、SQL |
| ISBN X 第一次书名为 SQL，第二次为 Java；查询 Java | 不返回 X（先去重后筛选） |
| 空列表 | 空结果 |
| null 参数/元素/字段 | `IllegalArgumentException` |
| 尝试 `result.add(...)` | `UnsupportedOperationException` |
| 调用前后比较原始列表 | 顺序、内容不变 |

```powershell
New-Item -ItemType Directory -Force build/exercise-02 | Out-Null
javac -encoding UTF-8 --release 21 -d build/exercise-02 exercises/02-catalog-search/CatalogExercise.java
java -cp build/exercise-02 CatalogExercise
```

自评：为什么不使用可变书名作为哈希键？先去重再过滤，与先过滤再去重有什么业务差别？`toList()` 与 `Collectors.toList()` 的可修改性契约相同吗？
