# Java 进阶工坊

用一个校园图书借阅系统，把 Java 知识从“会写语法”推进到“能独立设计、实现、验证和解释”。以你已经懂基本语法为起点，默认从第 06 课补全面向对象。

这是一个本地学习项目：40 节课程、9 个实验、4 组动手练习、一套真正可运行的 Java 业务和 HTTP API。Java 生态没有固定的“全部知识清单”；本项目把 Java SE 主干、工程基础和后端扩展连起来，并明确区分已经实现的能力与后续任务。

## 立即开始

需要 **JDK 21 或以上**，不用安装数据库、Node.js 或前端包。应用代码没有第三方依赖。

在 Windows 中双击项目根目录的 **启动学习.cmd**。或者在 PowerShell 中进入本目录执行：

```powershell
.\scripts\run.ps1
```

浏览器打开 **http://127.0.0.1:8787/**。保持启动终端运行；按 Ctrl+C 停止。若策略阻止本地脚本，使用不修改系统设置的单次启动方式：

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\run.ps1
```

也可用 `.\scripts\preview.ps1` 在后台启动，双击 **停止后台预览.cmd** 停止。后台运行日志位于 `build/preview.log` 与 `build/preview-error.log`。

端口占用时：`.\scripts\run.ps1 -Port 8788`，然后打开对应地址。`Main` 直接运行时默认端口为 8080；启动脚本明确使用 8787。

## 按你的基础使用

1. 在首页做 6 题基础自测，找出薄弱环节；它不会自动勾选课程。
2. 优先学习 **06—15**，把类、接口、相等性、异常、集合与泛型连起来；01—05 用于复习。
3. 每节先预测示例输出，再运行关联实验，然后在本地修改代码并按验收清单验证。
4. 做完第一个自动检查练习，再进入文件、并发、JVM、HTTP 和工程实践。
5. 提交自己的代码与失败案例，让我逐段评审、追问和补充讲解。课程勾选表示自评记录，不能代替代码验证。

每节页面包含学习目标、概念解释、示例代码、动手任务、验收标准、提示、参考思路、理解检查和官方资料。页面的“运行实验”只运行已编译的示例，不会执行你粘贴的代码，也不会自动给练习判分。

详细第一轮任务见 [从这里开始](docs/从这里开始.md)，完整主题覆盖与补充方向见 [知识地图](docs/知识地图.md)。

## 可以实际运行什么

| 能力 | 已实现的行为 |
| --- | --- |
| 项目实践 | 8 种图书，支持书名/作者查询、分类筛选、借阅与归还 |
| 业务约束 | 固定 30 天借期，拒绝缺货、重复归还、非法编号和空姓名 |
| 并发 | 服务以一个同步边界保护库存、记录和保存，防止单进程超卖 |
| 持久化 | Properties 快照；保存成功后发布内存状态，重启恢复；损坏数据拒绝静默重置 |
| Web | JDK HttpServer，仅监听 127.0.0.1；虚拟线程处理请求；JSON 与错误状态码 |
| 学习 | 40 节课程、测验、自评验收、当前浏览器进度保存与 JSON 导出 |
| 实验 | 基础、对象、集合、Stream、I/O、并发、现代 Java、反射、JVM，共 9 个 |
| 练习 | 借阅规则（11 项自动检查）、图书目录、库存并发、接口架构四组 |

数据保存在 `data/library.properties`。同一个数据目录只运行一个服务进程；当前文件仓储没有跨进程锁或数据库事务，也没有读者身份认证。它是可阅读的单机教学实现。JDBC、数据库、Spring、ORM、Redis、消息队列与分布式部署是明确标注的扩展课程，需要另建环境和实现。

练习 01 让你实现按身份变化的借阅期（学生 14 天、教师 30 天、访客 7 天）；它是独立规则练习，当前网站业务统一 30 天。接入身份策略是后续功能任务。

## 常用命令

在本目录执行：

```powershell
# 编译和打包：输出 build/java-learning-lab.jar
.\scripts\build.ps1

# 运行业务与 HTTP 验证（临时目录，不改真实借阅数据）
.\scripts\test.ps1

# 列出实验，或运行其中一个
.\scripts\lab.ps1
.\scripts\lab.ps1 collections

# 检查第一个练习：初始有 TODO，失败是预期状态
.\scripts\check-exercise.ps1

# 运行无界面业务演示，使用临时数据
java --add-modules jdk.httpserver -cp build/classes lab.Main --demo

# 使用打包后的程序：web/、docs/ 与源码仍需保留在项目目录
java --add-modules jdk.httpserver -jar build/java-learning-lab.jar --root . --port 8787
```

每次修改 Java 源码后，停止旧服务再重新运行 `run.ps1`。修改网页与课程文件后刷新页面即可。

也提供 Maven 工程，IDE 可以直接打开 `pom.xml`：

```powershell
mvn test
mvn package
java --add-modules jdk.httpserver -jar target/java-learning-lab.jar --root . --port 8787
```

Maven 首次需要联网下载构建插件。`exec-maven-plugin` 在 test 阶段运行 `lab.TestSuite`，不依赖 JUnit；Surefire 没有发现 JUnit 测试不代表没有执行项目检查。练习 TODO 不在 Maven 主源码目录，不影响正常项目测试。

## 目录与阅读入口

```text
src/main/java/lab/
  Main.java                  组装对象、启动程序、命令行演示
  domain/                    Book、Loan、业务异常
  service/LibraryService.java 借还事务边界、库存与 Clock
  repository/                仓储接口、快照、文件实现
  web/                       HTTP 路由、表单解析、JSON
  examples/                  9 个独立实验与 LabRunner
src/test/java/lab/TestSuite.java 业务与集成检查
exercises/                   留有 TODO 的分级练习和验收契约
web/                         无前端依赖的课程与实践界面
docs/                        学习计划、知识地图、实验手册
scripts/                     编译、启动、检查脚本
pom.xml                      可选 Maven 构建
```

先读 `Book` 和 `Loan`，再读 `LibraryService.borrow`，最后沿着 HTTP 请求往回找入口。不要一次读完所有文件。实验源码和页面示例有不同粒度：示例为了集中讲一个概念，实验为了展示主题，当前业务源码展示最终组合。

## API 速查

| 请求 | 用途 |
| --- | --- |
| GET /api/health | 服务状态与 Java 版本 |
| GET /api/books?q=Java&category=Java | 查询图书 |
| GET /api/loans | 借阅记录，按编号倒序 |
| POST /api/loans | 表单 `bookId=1&borrower=小林` |
| POST /api/loans/1/return | 归还，无正文 |
| GET /api/stats | 图书种类、可借库存、在借与累计次数 |
| GET /api/labs | 固定实验目录 |
| POST /api/labs/collections | 运行已有实验，无正文 |
| GET /api/source?path=src/main/java/lab/domain/Book.java | 读取白名单内教学源码 |

## 学习记录与资料

课程进度保存在浏览器 localStorage，切换浏览器、端口或清除站点数据后不会共享。侧栏下载按钮和页脚的“导出进度”可导出学习记录；业务借阅数据在 Java 服务的数据目录，两者相互独立。课程目前没有账号同步。

教学内容以 [dev.java](https://dev.java/learn/)、[Java 21 API](https://docs.oracle.com/en/java/javase/21/docs/api/) 和 [Java 21 语言变化](https://docs.oracle.com/en/java/javase/21/language/java-language-changes-release.html) 为一手资料入口。构建配置参考 [Maven Compiler Plugin](https://maven.apache.org/plugins/maven-compiler-plugin/examples/set-compiler-release.html) 与 [Exec Maven Plugin](https://www.mojohaus.org/exec-maven-plugin/java-mojo.html)。
