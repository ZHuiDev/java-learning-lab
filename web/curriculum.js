/* Java 项目学习课程：JDK 21，所有示例均不依赖预览特性。 */
(() => {
  const API = 'https://docs.oracle.com/en/java/javase/21/docs/api/';
  const DEV = 'https://dev.java/learn/';
  const refs = (...items) => items.map(([title, url]) => ({ title, url }));
  const sec = (heading, body) => ({ heading, body });
  const ex = (title, steps, acceptance, hint, solution) => ({ title, steps, acceptance, hint, solution });
  const q = (question, options, correct, explanation) => ({ question, options, correct, explanation });
  const l = (id, title, data) => ({
    id, title, minutes: 35, level: '核心', source: '', tags: [], resources: refs(['Java 官方学习入口', DEV]),
    codeNote: '代码是学习示例。先预测结果，再在自己的实验分支修改、编译并核对；阅读示例或运行自检不等于完成本课练习。',
    ...data,
  });
  const stages = [
    {
      id: "foundation", title: "查漏补缺：语言基础", subtitle: "把代码编译、运行，并解释每个值从哪里来", color: "#16a085", lessons: [
        l("01", "让第一段 Java 程序真正运行", {
          minutes: 25,
          level: "入门",
          tags: ["JDK","编译","main","命令行"],
          resources: refs(["运行第一个 Java 程序","https://dev.java/learn/getting-started/"], ["JDK 21 工具规范","https://docs.oracle.com/en/java/javase/21/docs/specs/man/index.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "建立 JDK、源码、字节码与 JVM 的关系，运行学习项目并读懂入口。",
          goals: ["区分 JDK、JVM、源码和 class 文件","使用 javac 与 java 完成一次编译运行","解释 main 参数与标准输出"],
          sections: [
            sec("一段程序经历了什么", "JDK 提供 javac、java 和诊断工具。javac 把 .java 源码编译成 .class 字节码；java 启动 JVM，加载类并执行入口方法。跨平台依赖兼容的字节码版本和对应平台的 JVM，并不意味着依赖本地库的应用也天然跨平台。本项目以 JDK 21 为基线，先用 java -version 和 javac -version 确认工具一致。"),
            sec("从入口观察程序", "public static void main(String[] args) 是此处使用的标准入口：static 允许不创建对象就调用，args 接收命令行字符串。文件名应与 public 顶层类名一致。终端的当前目录影响相对文件路径；找不到类、找不到源码和编译错误是不同问题，应先看报错第一处与文件行号。")
          ],
          code: `// 文件：Hello.java；终端：javac Hello.java，然后 java Hello 小林
public class Hello {
    public static void main(String[] args) {
        String name = args.length == 0 ? "同学" : args[0];
        System.out.println("你好，" + name + "！");
        System.out.println("今天开始构建校园图书借阅系统。");
    }
}`,
          lab: "basics",
          exercise: ex("给阅读助手增加自我介绍", ["运行项目的 basics 实验并找到入口。","新建 Hello.java，读取第一个参数为姓名，第二个参数为每天阅读分钟数；参数缺省时分别使用“同学”和“30”。","让输出说明将构建校园图书借阅系统；分别执行无参数与“小林 45”的版本。"], ["两次编译均成功。","无参数显示“同学”和“30”；两个参数显示“小林”和“45”。","能用自己的话解释 .java 与 .class 的区别。"], "先把分钟数当作字符串显示，数值校验留到第 05 课。", "先判断 args.length，再访问 args[0] 或 args[1]；String minutes = args.length > 1 ? args[1] : \"30\"。编译 javac Hello.java，运行 java Hello 小林 45。"),
          quiz: q("哪一项最准确地描述 javac 的职责？", ["把 Java 源码编译为字节码","把 HTTP 请求发送给服务器","为每个对象执行垃圾回收","保证所有操作系统上的文件路径相同"], 0, "javac 是编译器。JVM 负责执行字节码及运行时管理，文件与网络行为仍受环境影响。")
        }),
        l("02", "变量、类型与数值边界", {
          minutes: 35,
          level: "入门",
          tags: ["基本类型","包装类","溢出","BigDecimal"],
          resources: refs(["语言基础","https://dev.java/learn/language-basics/"], ["BigDecimal API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "为图书编号、阅读时长与价格选择合适的类型，理解整数与浮点数的边界。",
          goals: ["区分基本类型与引用类型","识别整数除法、溢出和强制转换","理解包装类、拆箱与 BigDecimal 的用途"],
          sections: [
            sec("类型决定能表达什么", "byte、short、int、long、float、double、char、boolean 是基本类型；String、数组和你定义的类是引用类型。局部变量在读取前必须赋值；var 让编译器从初始化表达式推断局部变量类型，并不是动态类型。long 字面量用 L 后缀。char 表示一个 UTF-16 代码单元，某些字符需要两个 char，不能把 char 总数直接等同于用户看到的字符数。"),
            sec("计算正确比能运行更重要", "int 相除先执行整数除法，因此 5 / 2 是 2；要保留小数可写 5 / 2.0。普通整数溢出不会自动抛异常，可用 Math.addExact 检查。Integer 等包装类可用于泛型，但 null 自动拆箱会抛 NullPointerException，数值比较应避免依赖对象缓存。金额用 BigDecimal 从十进制字符串构造，除法需要明确精度与舍入规则。")
          ],
          code: `import java.math.BigDecimal;
import java.math.RoundingMode;

public class Numbers {
    public static void main(String[] args) {
        int borrowedCopies = 5, totalCopies = 8;
        double borrowedPercent = borrowedCopies * 100.0 / totalCopies;
        long seconds = 90L * 60;
        BigDecimal price = new BigDecimal("19.90");
        BigDecimal average = price.divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP);
        System.out.println(borrowedPercent + "% / " + seconds + " 秒 / " + average);
    }
}`,
          lab: "basics",
          exercise: ex("计算借出比例与阅读预算", ["7 本馆藏中借出 3 本，计算借出百分比，保留一位小数。","将一本 19.90 元图书的价格均摊到 3 次阅读，使用 BigDecimal 保留两位小数并选择 HALF_UP；这是数值练习，主系统不收取此费用。","用 Math.addExact(Integer.MAX_VALUE, 1) 观察并解释异常。"], ["借出比例显示约 42.9%，没有整数除法产生的 0%。","均摊值为 6.63。","能指出普通 int 加法与 addExact 在溢出时的区别。"], "先乘 100.0；格式化改变显示，BigDecimal 的舍入需另行指定。", "比例为 3 * 100.0 / 7，用 System.out.printf(\"%.1f%%%n\", borrowedPercent)。金额用 new BigDecimal(\"19.90\").divide(new BigDecimal(\"3\"), 2, RoundingMode.HALF_UP)。addExact 超范围时抛 ArithmeticException。"),
          quiz: q("Integer count = null; int n = count; 会发生什么？", ["n 自动变成 0","编译失败，因为 Integer 不能转换成 int","运行时抛 NullPointerException","n 变成 Integer.MIN_VALUE"], 2, "自动拆箱需要调用包装对象的数值方法，null 没有可调用的对象；可在边界先判断或提供默认值。")
        }),
        l("03", "流程控制、数组与边界", {
          minutes: 35,
          level: "入门",
          tags: ["分支","循环","数组","边界"],
          resources: refs(["数组","https://dev.java/learn/language-basics/arrays/"], ["控制流","https://dev.java/learn/language-basics/control-flow/"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "扫描一组阅读时长，使用分支、循环和数组解决真实统计问题。",
          goals: ["用 if、switch 与循环表达规则","掌握数组长度、索引与多维数组","识别越界、空数组和循环边界问题"],
          sections: [
            sec("把业务规则变成控制流", "if 适合条件判断，switch 适合按离散值选择分支。箭头形式的 switch 不会自然贯穿后续分支；作为表达式时每条路径必须产出值。for 常用于已知遍历范围，while 用于条件驱动的重复操作，break 退出循环而 continue 跳过本轮剩余部分。先写出正常、为空和刚好在边界三种输入，再设计循环。"),
            sec("数组保存固定数量的元素", "数组也是对象，长度创建后固定，索引从 0 到 length - 1。new int[3] 的元素默认是 0，但未赋值的局部数组变量仍不能读取。增强 for 便于读元素，修改基本类型的循环变量不会修改原数组。二维数组实际是数组的数组，各行长度可以不同；复制引用会共享同一个数组，需要独立数据时明确使用复制方法。")
          ],
          code: `public class WeeklyMinutes {
    public static void main(String[] args) {
        int[] minutes = {20, 45, 0, 60, 30, 50, 40};
        int total = 0, activeDays = 0;
        for (int value : minutes) {
            if (value < 0) throw new IllegalArgumentException("时长不能为负");
            total += value;
            if (value > 0) activeDays++;
        }
        String grade = total >= 240 ? "目标达成" : "继续积累";
        System.out.println(total + " 分钟，" + activeDays + " 天，" + grade);
    }
}`,
          lab: "basics",
          exercise: ex("统计一周的阅读记录", ["写方法 summarize(int[] minutes)，输出总时长、活跃天数和最大值。","用正常数据、空数组、只有一个元素的数据分别运行。","发现负数时拒绝输入，并指出该元素索引。"], ["示例数据总时长 245，活跃天数 6，最大值 60。","空数组不越界，总时长与最大值按本练习约定均为 0。","负数错误消息含索引；for 循环从不访问 length 位置。"], "最大值从 0 开始适用于本题的非负时长约束。用普通 for 才方便报告索引。", "遍历 i < minutes.length，先校验 minutes[i] >= 0，再累加 total、更新 max = Math.max(max, minutes[i])；正数时 active++。在方法边界拒绝 null，空数组与 null 是不同输入。"),
          quiz: q("int[] a = {1, 2}; int[] b = a; b[0] = 9; 此时 a[0] 是多少？", ["1","2","9","编译失败"], 2, "a 与 b 引用同一个数组。若需要独立数组，可用 a.clone() 或 Arrays.copyOf。")
        }),
        l("04", "字符串、文本块与正则表达式", {
          minutes: 35,
          level: "入门",
          tags: ["String","Unicode","正则","文本块"],
          resources: refs(["String API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/String.html"], ["Pattern API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/regex/Pattern.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "清洗书名并解析图书编号，理解字符串不可变与文字匹配的界限。",
          goals: ["正确比较、拼接和清洗 String","使用文本块与 StringBuilder","编写带边界约束的简单正则"],
          sections: [
            sec("文本是值，不是可修改的字符容器", "String 不可变，strip、replace 等方法返回新字符串。== 比较引用身份，equals 比较内容；常量池可能让错误的 == 用法偶尔看似有效。isBlank 能识别空白输入，strip 按 Unicode 空白规则清理首尾。循环中累积文本可用 StringBuilder。文本块提高多行内容的可读性，但仍要留意换行和缩进处理。"),
            sec("正则只表达你实际需要的规则", "Pattern 描述匹配规则，Matcher 执行匹配。matches 要求整段匹配，find 寻找局部匹配。Java 字符串本身和正则都使用反斜线，因此正则的反斜线在 Java 字符串源码中需要用两个反斜线转义。正则适合简单格式校验，无法代替日期语义检查，也不应使用自己编写的正则来解析任意 JSON 或 HTML。对外部输入限定长度，避免复杂回溯模式耗费大量时间。")
          ],
          code: `import java.util.regex.Pattern;

public class Titles {
    private static final Pattern ID = Pattern.compile("BOOK-[0-9]{3}");
    public static void main(String[] args) {
        String title = "  Java 核心技术  ".strip();
        System.out.println(title.equals("Java 核心技术"));
        System.out.println(ID.matcher("BOOK-042").matches());
        StringBuilder report = new StringBuilder("图书目录\\n");
        report.append("- ").append(title).append('\\n');
        System.out.print(report);
    }
}`,
          lab: "basics",
          exercise: ex("实现书名与图书编号校验", ["书名去除首尾空白，拒绝空白书名和超过 40 个 Unicode 代码点的书名。","独立格式练习只接受 BOOK- 后跟 3 位 ASCII 数字；主系统仍用正整数 id，不要替换其协议。","用 StringBuilder 输出三本图书的清单。"], ["“  Java 核心技术  ”被清洗成“Java 核心技术”。","BOOK-007 合法；BOOK-7、xBOOK-007、BOOK-００７ 不合法。","用 equals 比较内容，说明代码点的长度口径。"], "title.codePointCount(0, title.length()) 计数代码点；编号用 matches 与 [0-9]。", "strip 后检查 isBlank，再计数 codePointCount。Pattern.compile(\"BOOK-[0-9]{3}\").matcher(id).matches() 要求整段匹配；代码点仍不等于所有情况下的用户感知字符。"),
          quiz: q("调用 title.strip() 后为什么原 title 的空格可能还在？", ["strip 只能处理英文","String 不可变，需要接收返回值","必须先调用 System.gc()","strip 会随机修改其他 String"], 1, "应写 title = title.strip() 或将结果存入新变量。不可变对象的方法不会就地修改原内容。")
        }),
        l("05", "方法、异常与调试思路", {
          minutes: 40,
          level: "入门",
          tags: ["方法","异常","调试","按值传递"],
          resources: refs(["异常处理","https://dev.java/learn/exceptions/"], ["方法","https://dev.java/learn/classes-objects/defining-methods/"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "把规则拆成小方法，处理无效输入，并从堆栈定位错误。",
          goals: ["定义参数、返回值、重载与作用域","理解按值传递和异常传播","使用断点或最小复现定位故障"],
          sections: [
            sec("方法形成可复用的边界", "方法名说明行为，参数说明输入，返回值说明结果。Java 一律按值传递：传基本值时复制数值，传对象时复制引用值；方法可通过这份引用修改对象，却不能通过给参数重新赋值来替换调用者的变量。重载依靠参数列表区分，不能仅靠返回类型。让校验逻辑与打印逻辑分开，才方便后续写测试与接入网页。"),
            sec("异常是需要设计的失败路径", "受检异常需要捕获或在 throws 中声明；RuntimeException 及其子类通常用于编程错误、非法参数等。try/catch 只捕获当前层能够处理的错误，避免空 catch 或把异常一律转换成成功。阅读堆栈时找到自己的第一处调用位置，并查看根因链。调试可先固定输入、缩小范围、逐步检查变量；不要把关闭所有异常当成修复。")
          ],
          code: `public class Durations {
    static int parseMinutes(String input) {
        int minutes = Integer.parseInt(input.strip());
        if (minutes < 1 || minutes > 240) {
            throw new IllegalArgumentException("阅读时长必须在 1 到 240 之间");
        }
        return minutes;
    }
    public static void main(String[] args) {
        try {
            System.out.println(parseMinutes(args.length == 0 ? "30" : args[0]));
        } catch (IllegalArgumentException e) {
            System.err.println("输入失败：" + e.getMessage());
        }
    }
}`,
          lab: "basics",
          exercise: ex("把输入错误变成可理解的反馈", ["提取 parseMinutes(String) 方法，约束范围为 1 到 240。","分别输入 30、0、241、abc 和首尾带空格的 45。","在 Integer.parseInt 处打断点，说明数值格式错误与范围错误走过的不同路径。"], ["30 与带空格的 45 得到对应整数。","0、241 和 abc 均失败，不被默认为成功。","异常发生位置可以通过调试器或完整堆栈定位。"], "NumberFormatException 继承 IllegalArgumentException，可先分别捕获产生更精确的用户提示。", "解析前 strip；解析失败提示“请输入整数”，解析成功后校验范围。业务方法抛异常，入口负责把异常转成提示。对空值是否允许应在方法契约中说明。"),
          quiz: q("Java 把一个对象传入方法时，参数收到的是什么？", ["对象的深拷贝","调用者变量本身","引用值的副本","一段序列化字节"], 2, "引用值也是按值传递。对象可能被修改，但给方法参数赋一个新引用不会重绑调用者的变量。")
        })
      ]
    },
    {
      id: "objects", title: "用对象表达业务", subtitle: "从零散字段演进为可维护的图书与借阅模型", color: "#2980b9", lessons: [
        l("06", "类、构造器与封装", {
          minutes: 35,
          level: "核心",
          tags: ["类","封装","构造器","static"],
          resources: refs(["类与对象","https://dev.java/learn/classes-objects/"], ["包","https://dev.java/learn/packages/"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "让图书对象维护书名与库存，使用受约束的借还方法保护不变量。",
          goals: ["定义字段、构造器和实例方法","理解 this、static 与访问权限","用封装保护对象不变量"],
          sections: [
            sec("对象同时拥有状态与行为", "类定义对象的结构与能力，构造器建立有效初态，实例方法表达状态变化。this 指向当前实例，static 成员属于类，不能把每本书的库存放入共享 static 字段。本课用一个可变 Book 小类观察封装；主工程 lab.domain.Book 是不可变 record，通过 withAvailable 创建新快照，借还用例由 LibraryService 组织。"),
            sec("封装不是给每个字段生成 setter", "private 限制外部直接改字段，public 暴露行为契约。书名校验集中在 rename，借阅时先检查库存再扣减，归还时禁止超过馆藏总量。主系统还必须检查 Loan 是否已经归还，不能只靠图书库存判断重复归还。返回可变集合会泄露状态，应明确返回只读视图还是独立快照。")
          ],
          code: `public class Book {
    private final long id;
    private final int total;
    private String title;
    private int available;
    public Book(long id, String title, int total) {
        if (id <= 0 || total < 1) throw new IllegalArgumentException("编号和馆藏总量必须为正");
        this.id = id;
        this.total = total;
        this.available = total;
        rename(title);
    }
    public void rename(String title) {
        if (title == null || title.isBlank()) throw new IllegalArgumentException("书名不能为空");
        this.title = title.strip();
    }
    public void borrowCopy() {
        if (available == 0) throw new IllegalStateException("库存不足");
        available--;
    }
    public void returnCopy() {
        if (available == total) throw new IllegalStateException("没有已借出的馆藏");
        available++;
    }
    public String description() { return id + ": " + title + " / 可借 " + available + "/" + total; }
}`,
          lab: "oop",
          exercise: ex("为图书库存设计行为与边界", ["建立两本不同图书，馆藏总量分别为 1 和 2。","对第一本借阅一次再借一次，随后归还一次再归还一次。","验证第二本库存不受影响；解释主系统为何还需要 Loan 标识每笔借阅。"], ["借完后继续借阅被拒绝。","库存永远在 0 到 total 之间，构造和改名都拒绝空白书名。","两个对象拥有独立库存；能指出单个 Book 不足以追踪读者和重复归还。"], "每个状态变化都经过方法，校验和修改相邻；此单对象示例未声明多线程安全。", "borrowCopy 检查 available > 0 后递减；returnCopy 检查 available < total 后递增。主工程 LibraryService 还会校验借阅记录，生成新 Book/Loan 快照并保存成功后发布。"),
          quiz: q("为什么 borrowCopy() 比 setAvailable(available - 1) 更适合表达借阅？", ["因为 setter 在 Java 中不能编译","它能集中维护库存检查与扣减规则","因为方法名自动提供数据库事务","因为它一定运行更快"], 1, "行为方法把校验和状态变化集中，但线程安全、完整借阅记录与持久化事务仍须另外设计。")
        }),
        l("07", "接口、继承与多态", {
          minutes: 35,
          level: "核心",
          tags: ["接口","继承","多态","组合"],
          resources: refs(["接口","https://dev.java/learn/interfaces/"], ["继承","https://dev.java/learn/inheritance/"]),
          codeNote: "独立通知接口示例，不会执行真实借阅。主工程当前固定借期 30 天；OopLab 的学生 14 天/教师 30 天策略是多态演示，尚未接入主系统。",
          summary: "为借阅通知设计接口，让同一通知流程使用不同实现。",
          goals: ["区分接口、抽象类与具体类","解释重写和运行时方法分派","优先使用组合实现可替换的行为"],
          sections: [
            sec("面向契约写代码", "接口描述调用者依赖的能力，具体类提供实现。变量类型可以是接口，运行时会根据实际对象选择重写的实例方法。@Override 让编译器验证你确实在重写。重载则主要由编译期参数类型决定，不要把二者混淆。Java 类只有一个直接父类，但可以实现多个接口；接口可有 default 和 static 方法。"),
            sec("继承要求可以替换", "继承表达可替换的类型关系，不只是复制代码的捷径。父类型承诺的规则不应在子类中突然收紧或破坏；例如声称是可修改列表却拒绝所有添加操作，会给调用者带来意外。组合通过持有其他对象完成工作，通常更便于替换策略和单元测试。抽象类适合共享受保护的状态或模板流程，但同样要控制继承耦合。")
          ],
          code: `public class Notifications {
    interface Notifier { void send(String message); }
    static class ConsoleNotifier implements Notifier {
        @Override public void send(String message) { System.out.println(message); }
    }
    static class LoanNotice {
        private final Notifier notifier;
        LoanNotice(Notifier notifier) { this.notifier = notifier; }
        void borrowed(String title) { notifier.send("借阅成功：" + title); }
    }
    public static void main(String[] args) {
        new LoanNotice(new ConsoleNotifier()).borrowed("Java 核心技术");
    }
}`,
          lab: "oop",
          exercise: ex("添加可替换的借阅提醒器", ["定义 Notifier 接口与 ConsoleNotifier 实现。","新增 RecordingNotifier，把收到的消息保存在内存中。","给 LoanNotice 注入不同实现，验证 borrowed 操作只发送一次提醒。"], ["LoanNotice 不用 new 创建具体提醒器。","更换提醒器不用修改 borrowed 的代码。","RecordingNotifier 消息数量为 1，内容包含书名；不会把通知示例误认为库存已扣减。"], "构造器接受 Notifier；使用 ArrayList<String> 记录消息。", "字段使用接口类型。RecordingNotifier.send 只追加消息，读取时返回 List.copyOf(messages)。接入真实借阅时，应明确保存成功后的通知策略和通知失败边界。"),
          quiz: q("Notifier n = new ConsoleNotifier(); n.send(\"hi\"); 实际调用谁的实例方法？", ["只看变量名 n","只调用 Object 的方法","运行时对象 ConsoleNotifier 的重写方法","接口自动生成的方法"], 2, "实例方法的多态分派由运行时对象决定；接口让调用者只依赖行为契约。")
        }),
        l("08", "对象相等、哈希与契约", {
          minutes: 35,
          level: "核心",
          tags: ["equals","hashCode","值对象"],
          resources: refs(["Object API 契约","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html"], ["HashMap API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "防止同一个图书编号重复进入集合，建立 equals 与 hashCode 的一致规则。",
          goals: ["区分身份相同与值相等","遵守 equals/hashCode 契约","避免使用可变字段作为哈希键"],
          sections: [
            sec("先定义业务上的相等", "== 比较引用是否指向同一对象；Object 的默认 equals 通常也是身份比较。值对象需要根据字段定义相等，而实体可能根据稳定身份标识定义相等。equals 应满足自反、对称、传递、一致和对 null 返回 false。toString 应帮助诊断，不能把密码、令牌等秘密顺手写入日志。"),
            sec("相等对象必须有相同哈希码", "HashMap 与 HashSet 先利用 hashCode 定位，再利用 equals 判断键是否相等。相等对象必须具有相同 hashCode，但相同哈希码不保证相等。参与相等和哈希计算的字段若在放入集合后变化，查找可能失败。避免把可变标题等字段作为键；使用不可变编号或值对象，并让 equals 与 hashCode 使用一致字段。")
          ],
          code: `import java.util.HashSet;

public class IdentityDemo {
    record BookId(long value) {
        BookId { if (value <= 0) throw new IllegalArgumentException("id 必须为正"); }
    }
    public static void main(String[] args) {
        BookId first = new BookId(7);
        BookId second = new BookId(7);
        var ids = new HashSet<BookId>();
        ids.add(first);
        ids.add(second);
        System.out.println(first.equals(second)); // true
        System.out.println(ids.size());           // 1
    }
}`,
          lab: "collections",
          exercise: ex("实现图书编号值对象", ["手写普通 final 类 BookId，存储 final long value。","实现 equals、hashCode 与 toString，不使用 record。","将两个值为 7 的实例与一个值为 8 的实例放进 HashSet。"], ["集合大小为 2，contains(new BookId(7)) 为 true。","对 null 和其他类型的 equals 返回 false。","加入集合后无法修改编号。"], "equals 先判断同一引用，再用 instanceof 判断类型；Long.hashCode(value) 可直接用于哈希。", "equals 使用 obj instanceof BookId other && value == other.value；hashCode 返回 Long.hashCode(value)。声明 final，避免子类策略破坏对称性。CollectionsLab 按 ISBN 去重是另一个身份口径；本课与主工程用稳定图书 id。"),
          quiz: q("两个对象的 hashCode 相等，能得出什么结论？", ["它们一定 equals","它们一定是同一引用","它们可能相等，也可能只是哈希冲突","HashSet 一定会保留两个"], 2, "哈希空间有限，不同对象可以冲突。集合最终还需要 equals 判断相等。")
        }),
        l("09", "不可变设计、record 与 enum", {
          minutes: 35,
          level: "核心",
          tags: ["record","enum","不可变","防御性复制"],
          resources: refs(["Record 类","https://dev.java/learn/records/"], ["List.copyOf","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/List.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "用状态枚举和快照记录表达数据，认清不可变设计的边界。",
          goals: ["用 enum 表达有限状态","用 record 定义数据载体并验证构造参数","区分引用不可改、浅不可变与深不可变"],
          sections: [
            sec("有限状态与数据快照", "enum 把状态限制在已定义的集合中，可以拥有字段、构造器和方法。record 自动提供组件访问器、构造器与基于组件的 equals/hashCode/toString，适合表达一次查询的快照和小型值载体。紧凑构造器可校验或规范化输入；record 不能任意增加实例字段，且隐式为 final。"),
            sec("final 不保证整个对象图不变", "final 引用禁止重新赋值，却不禁止修改所引用的 List。record 的组件字段为 final，因此只有浅层的不可变特征。需要稳定快照时，应复制外部集合并阻止结构修改；若集合元素自身可变，还要考虑元素的复制或不可变建模。List.copyOf 创建不可修改的集合快照并拒绝 null 元素，但不会递归复制每个元素。")
          ],
          code: `import java.util.ArrayList;
import java.util.List;

public class Snapshots {
    enum Availability { AVAILABLE, OUT_OF_STOCK }
    record BookView(long id, String title, Availability availability, List<String> tags) {
        BookView {
            if (title == null || title.isBlank()) throw new IllegalArgumentException("标题为空");
            tags = List.copyOf(tags);
        }
    }
    public static void main(String[] args) {
        var tags = new ArrayList<>(List.of("Java"));
        var view = new BookView(1, "Java 核心技术", Availability.AVAILABLE, tags);
        tags.add("技术");
        System.out.println(view.tags()); // [Java]
    }
}`,
          lab: "modern",
          exercise: ex("生成不受外部列表影响的图书快照", ["定义 Availability 枚举与 BookView record，状态仅表示“有可借库存/库存为零”。","用 List.copyOf 保存标签列表；标签是本课新增的练习字段。","构造后修改原列表，并尝试修改 view.tags()。"], ["原列表新增标签不影响快照。","修改 view.tags() 抛 UnsupportedOperationException。","能解释可变元素仍不保证深不可变；借阅是否归还属于 Loan，不是图书状态。"], "不要只给 List 字段加 final；构造时复制，读取时不暴露可变结构。", "紧凑构造器中执行 tags = List.copyOf(tags)。String 不可变，所以本题标签元素安全；若用 List<MutableTag> 还要处理元素可变性。主系统库存保存在 available/total，Availability 只是查询快照的派生表示。"),
          quiz: q("record Box(List<String> items) {} 的 items 默认具有哪种保证？", ["列表内容永远不能变","组件引用为 final，但传入列表可能可变","列表自动递归深拷贝","所有方法都自动线程安全"], 1, "record 不会自动防御性复制可变组件；不变量和共享安全仍需设计。")
        }),
        l("10", "分层、依赖注入与领域规则", {
          minutes: 45,
          level: "核心",
          tags: ["分层","依赖注入","设计模式","仓储"],
          resources: refs(["Java 接口","https://dev.java/learn/interfaces/"]),
          codeNote: "这是展示依赖方向的独立简化类。主工程真实类型位于 lab.domain、lab.repository、lab.service；完整借还校验与失败保存规则请阅读对应源码。",
          summary: "把 HTTP 入口、借还规则与存储分开，理解 LibraryRepository 与 Clock 的构造器注入。",
          goals: ["识别表示层、业务层与持久化边界","用构造器注入依赖","为后续文件与数据库实现保留接口"],
          sections: [
            sec("变化应该停留在自己的边界", "本项目 AppServer 负责 HTTP 输入输出，LibraryService 负责借阅、归还、库存及重复归还校验，LibraryRepository 负责完整状态的读写。一次借阅需要同时更新 Book.available 和新增 Loan；不能只保存其中一半。服务先建立新快照，仓储保存成功后再替换内存状态，避免文件写入失败却显示成功。"),
            sec("依赖注入是普通对象组装", "主工程 LibraryService(LibraryRepository, Clock) 就是普通构造器注入，无需框架。入口选择 FileLibraryRepository，测试可以提供内存仓储或抛 IOException 的失败替身。实际仓储契约是 load/save 整体 Snapshot，load 的缺失代表未建立存储，损坏文件必须报错；不要把本课简化模型当成全部实现。")
          ],
          code: `import java.io.IOException;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public class Layering {
    record Book(long id, String title) {}
    record Loan(long id, long bookId) {}
    record Snapshot(List<Book> books, List<Loan> loans, long nextLoanId) {
        Snapshot { books = List.copyOf(books); loans = List.copyOf(loans); }
    }
    interface LibraryRepository {
        Optional<Snapshot> load() throws IOException;
        void save(Snapshot snapshot) throws IOException;
    }
    static class MemoryRepository implements LibraryRepository {
        private Snapshot stored;
        public Optional<Snapshot> load() { return Optional.ofNullable(stored); }
        public void save(Snapshot snapshot) { stored = snapshot; }
    }
    static class LibraryService {
        private final LibraryRepository repository;
        private final Clock clock;
        LibraryService(LibraryRepository repository, Clock clock) {
            this.repository = repository;
            this.clock = clock;
        }
        void saveEmptyIfAbsent() throws IOException {
            if (repository.load().isEmpty()) repository.save(new Snapshot(List.of(), List.of(), 1));
        }
        LocalDate today() { return LocalDate.now(clock); }
    }
}`,
          lab: "oop",
          exercise: ex("用仓储替身验证借阅保存失败", ["阅读主工程 LibraryRepository 与 LibraryService 的构造器。","写内存实现，先用固定 Clock 运行一次借还，验证完整快照。","再写允许首次保存、随后抛 IOException 的失败替身；借阅失败后核对库存与借阅记录。"], ["服务只依赖接口，测试无需真实文件。","保存失败时服务报告错误，旧库存和旧借阅列表保持一致。","固定时钟决定 borrowedAt，应还日为借阅日加 30 天。"], "先允许服务创建初始馆藏，再让下一次 save 失败，才是在验证借阅提交失败。", "替身 load 返回 Optional.empty 或已有快照；save 使用显式开关控制 IOException。构造 new LibraryService(fakeRepository, fixedClock)，记录 borrow 前状态，失败后核对 books、loans 与 stats 均未发布部分修改。"),
          quiz: q("构造器注入的直接收益是什么？", ["自动生成所有 SQL","调用者可以显式替换依赖，测试更容易","不再需要处理异常","所有对象自动变成单例"], 1, "注入使对象依赖清晰，并允许提供假仓储、记录器等实现；它不会自动产生事务、SQL 或生命周期规则。")
        })
      ]
    },
    {
      id: "collections", title: "集合、泛型与数据建模", subtitle: "为查找、去重、排序和统计选择合适的数据结构", color: "#8e6bbd", lessons: [
        l("11", "List、迭代器与集合选择", {
          minutes: 35,
          level: "核心",
          tags: ["List","ArrayList","Iterator","集合视图"],
          resources: refs(["集合框架","https://dev.java/learn/api/collections-framework/"], ["List API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/List.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "用借阅记录列表练习遍历与删除，区分快照筛选与持久历史。",
          goals: ["理解 Collection、List 与实现类的关系","正确使用迭代器和 removeIf","区分可修改列表、视图与快照"],
          sections: [
            sec("接口表达能力，实现决定成本", "List 保留元素顺序并允许重复。ArrayList 适合按索引访问与尾部追加；中间插入删除通常需要移动元素。LinkedList 的按索引访问需要遍历，并不因为插入操作名称相同就总是更快。声明变量时通常依赖 List 接口，选择实现时考虑实际访问模式、规模与内存成本。"),
            sec("遍历时修改必须遵守契约", "增强 for 底层通常依赖迭代器，在遍历中直接调用列表删除可能触发 ConcurrentModificationException。该异常是尽力检测错误，不是并发安全机制。可用 Iterator.remove 或 removeIf 完成受支持的删除。List.of 与 List.copyOf 返回不可修改列表；Arrays.asList 是数组支持的固定大小列表，支持 set 但不支持增删。")
          ],
          code: `import java.util.ArrayList;
import java.util.List;

public class Lists {
    record Loan(long id, String title, boolean returned) {}
    public static void main(String[] args) {
        List<Loan> active = new ArrayList<>(List.of(
            new Loan(1, "Java 核心技术", true), new Loan(2, "数据库系统概念", false)));
        active.removeIf(Loan::returned);
        List<Loan> snapshot = List.copyOf(active);
        active.add(new Loan(3, "计算机网络", false));
        System.out.println(snapshot.size()); // 1
        System.out.println(active.size());   // 2
    }
}`,
          lab: "collections",
          exercise: ex("生成当前未归还借阅列表", ["复制 4 条借阅记录到 ArrayList，其中 2 条已归还。","在副本用 removeIf 删除已归还记录，再生成 List.copyOf 快照。","向副本新增一条借阅，对比副本、快照与原始历史。"], ["筛选后剩 2 条未归还记录，顺序不变。","后来新增记录不影响快照结构，原始历史仍保留 4 条。","解释 Arrays.asList、List.of、ArrayList 的增删差异。"], "不要在增强 for 中调用 active.remove(loan)；主系统必须保留归还历史，不应在仓储中直接删除。", "List<Loan> active = new ArrayList<>(history)；active.removeIf(Loan::returned)；List<Loan> snapshot = List.copyOf(active)。结构不可修改不保证可变元素本身不可变。"),
          quiz: q("Arrays.asList(\"a\", \"b\") 返回的列表通常支持哪种操作？", ["add(\"c\")","remove(0)","set(0, \"x\")","clear()"], 2, "该列表大小固定并由原数组支持，set 可替换元素，改变大小的操作会抛 UnsupportedOperationException。")
        }),
        l("12", "Set、Map 与哈希索引", {
          minutes: 35,
          level: "核心",
          tags: ["Set","Map","哈希","索引"],
          resources: refs(["Map API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Map.html"], ["集合框架","https://dev.java/learn/api/collections-framework/"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "实现图书编号查找、分类去重与计数，理解有序与无序集合。",
          goals: ["按语义选择 Set 和 Map","使用 merge、computeIfAbsent 构建索引","理解哈希顺序、比较顺序与键的不变性"],
          sections: [
            sec("三种“顺序”不能混为一谈", "HashMap 和 HashSet 不保证迭代顺序；一次运行恰好有序不是契约。LinkedHashMap 和 LinkedHashSet 适合保留插入顺序，TreeMap 和 TreeSet 按比较规则排序。TreeSet 判断重复时依赖比较结果为 0，所以比较器若只比较标题长度，不同标题也可能被视为同一元素。选择结构时先说清楚是否允许重复和需要哪种顺序。"),
            sec("用键查找和用值累计", "Map 的键唯一，put 可能覆盖同键旧值；是否允许覆盖应由仓储契约决定。get 返回 null 时可能表示缺失，也可能是允许的 null 值，需要时用 containsKey 区分。merge 简化计数，computeIfAbsent 适合初始化分组。HashMap 的常见操作在哈希分布良好时具有预期常数级成本，但不是所有输入与实现下都固定 O(1)。")
          ],
          code: `import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;

public class Tags {
    public static void main(String[] args) {
        var tags = List.of("Java", "SQL", "Java", "测试");
        var unique = new LinkedHashSet<>(tags);
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (String tag : tags) counts.merge(tag, 1, Integer::sum);
        System.out.println(unique); // [Java, SQL, 测试]
        System.out.println(counts); // {Java=2, SQL=1, 测试=1}
    }
}`,
          lab: "collections",
          exercise: ex("建立图书分类索引", ["输入 Java、SQL、Java、测试 四个图书分类，保留首次出现顺序去重。","用 Map 统计分类出现次数。","增加从分类映射到图书编号列表的索引。"], ["去重顺序为 Java、SQL、测试。","Java 计数为 2，其余为 1。","同分类的多个图书编号进入同一列表，没有覆盖旧列表。"], "保序用 LinkedHashSet；分组列表用 computeIfAbsent。", "counts.merge(category, 1, Integer::sum)；index.computeIfAbsent(category, ignored -> new ArrayList<>()).add(bookId)。若分类内编号不能重复，可用 Set。此处统计馆藏记录，借阅次数需从 Loan 汇总。"),
          quiz: q("需要按照首次插入顺序遍历且键唯一，应优先考虑什么？", ["HashMap 并假定整数键总有序","LinkedHashMap","TreeMap，但不要比较键","随机数组"], 1, "LinkedHashMap 的常见插入顺序模式为此需求提供契约；TreeMap 提供的是排序顺序。")
        }),
        l("13", "泛型、通配符与类型擦除", {
          minutes: 45,
          level: "核心",
          tags: ["泛型","通配符","类型擦除","PECS"],
          resources: refs(["泛型","https://dev.java/learn/generics/"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "设计可复用的容器与方法，在编译期阻止不合类型的数据流。",
          goals: ["编写泛型类与泛型方法","解释 extends、super 和不变性","识别类型擦除与堆污染风险"],
          sections: [
            sec("泛型把类型规则交给编译器", "List<String> 使添加整数成为编译错误，读取时也无需手工强制转换。泛型参数不能使用 int 等基本类型，需要 Integer 等包装类型。List<Integer> 并不是 List<Number> 的子类型，否则别人就能往整数列表塞入 Double。原始类型 List 跳过部分检查，产生未经检查警告，应尽量消除而非随手压制。"),
            sec("用通配符描述读写方向", "? extends T 适合把容器视为 T 的生产者，能读取 T，但不能任意添加 T；? super T 适合作为 T 的消费者，可以写入 T，但读取通常只有 Object 保证。类型擦除意味着运行时通常不保留具体泛型参数，不能写 new T() 或 instanceof List<String>。泛型可变参数与不安全转换可能造成堆污染，边界处应保持类型一致。")
          ],
          code: `import java.util.ArrayList;
import java.util.List;

public class Generics {
    static <T> void copy(List<? extends T> source, List<? super T> target) {
        for (T item : source) target.add(item);
    }
    public static void main(String[] args) {
        List<Integer> minutes = List.of(20, 30);
        List<Number> report = new ArrayList<>();
        copy(minutes, report);
        report.add(2.5);
        System.out.println(report);
    }
}`,
          lab: "collections",
          exercise: ex("实现可复用分页结果", ["定义 record Page<T>(List<T> items, int page, int total)。","防御性复制列表并校验 page >= 1 与 total >= items.size()。","分别创建 Page<String> 与 Page<Integer>，尝试把整数加入字符串页并观察编译错误。"], ["两种元素类型共享同一 Page 定义。","调用方不能修改 items 的列表结构。","未使用原始类型、unchecked 强制转换或 Object 列表绕开检查。"], "record 的类型参数写在名称后；构造器中用 List.copyOf。", "record Page<T>(List<T> items, int page, int total) { Page { items = List.copyOf(items); if (page < 1 || total < items.size()) throw new IllegalArgumentException(); } }。这只是分页数据载体，total 与真实数据库的一致性还需要查询层保证。"),
          quiz: q("List<? extends Number> 中为什么不能直接 add(1)？", ["因为 Integer 不是 Number","因为实际列表可能是 List<Double>，写入 Integer 不安全","因为泛型列表都不可修改","因为 1 必须写成 1L"], 1, "通配符表示某个未知的 Number 子类型。可安全读取为 Number，却不能确定写入 Integer 符合其真实元素类型。")
        }),
        l("14", "比较器、排序与复杂度", {
          minutes: 35,
          level: "核心",
          tags: ["Comparator","排序","复杂度","二分"],
          resources: refs(["Comparator API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Comparator.html"], ["Collections API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Collections.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "为借阅应还日期建立稳定排序，比较不同查找策略的成本。",
          goals: ["组合 Comparator 与 Comparable","识别比较器契约和溢出错误","用复杂度分析常见查找与排序方案"],
          sections: [
            sec("排序先确定业务规则", "Comparable 表示类型的自然顺序，Comparator 表示外部指定的顺序。按应还日期排序后若日期相同，可以再按编号排序，获得确定结果。比较器必须满足反对称与传递等契约；用 a - b 返回比较结果会有溢出风险，应使用 Integer.compare、Long.compare 或 comparing 方法。null 值是否允许与放在哪里也要明确。"),
            sec("复杂度帮助判断规模变化", "线性扫描 n 项约为 O(n)，按每项重复扫描另一组可能变成 O(n²)。先排序再二分查询常见为 O(n log n) 预处理加 O(log n) 查询，但二分前提是数据按同一比较规则有序。大 O 描述增长趋势，不等于测得的毫秒数；对小数据，代码清晰和正确性通常比微优化更重要。")
          ],
          code: `import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class Sorting {
    record Loan(long id, long bookId, LocalDate dueAt) {}
    public static void main(String[] args) {
        var loans = new ArrayList<>(List.of(
            new Loan(2, 7, LocalDate.of(2026, 11, 1)),
            new Loan(1, 3, LocalDate.of(2026, 11, 1))));
        loans.sort(Comparator.comparing(Loan::dueAt).thenComparingLong(Loan::id));
        System.out.println(loans); // 同一天应还时，id=1 在前
    }
}`,
          lab: "collections",
          exercise: ex("实现可重复的应还借阅排序", ["按“应还日期升序、借阅编号升序”排序，加入同日应还的两条记录。","拓展增加借阅次数快照，按“次数降序、应还日期升序、编号升序”排序。","比较对 1000 条图书逐项扫描与预建 Map 查找的工作量。"], ["日期相同时按借阅编号顺序；扩展排序中次数越多越靠前。","比较器不通过相减比较 long/int。","说明预建索引的额外空间成本及多次查询的用途。"], "扩展先为独立 LoanRank record 增加 int borrowCount、LocalDate dueAt、long id；只对次数比较器 reversed。", "基础用 Comparator.comparing(Loan::dueAt).thenComparingLong(Loan::id)。扩展用 Comparator.comparingInt(LoanRank::borrowCount).reversed().thenComparing(LoanRank::dueAt).thenComparingLong(LoanRank::id)。HashMap 额外 O(n) 空间，常见查找预期 O(1)，小规模单次查询也可直接扫描。"),
          quiz: q("为什么比较两个 int 时不建议直接 return a - b？", ["Java 不支持整数减法","差值可能溢出，导致比较顺序错误","Comparator 只允许返回 boolean","减法一定比 compare 慢"], 1, "Integer.compare(a, b) 可表达完整 int 范围的比较，避免用溢出的差值判断顺序。")
        }),
        l("15", "Optional、空值与输入边界", {
          minutes: 35,
          level: "核心",
          tags: ["Optional","null","契约","校验"],
          resources: refs(["Optional API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Optional.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "把“没有找到”与“输入非法”分开，让服务契约更清楚。",
          goals: ["使用 Optional 表达可能缺失的结果","在边界校验输入并提供一致错误","避免 get 与默认值隐藏业务故障"],
          sections: [
            sec("缺失不一定是异常", "仓储按编号查询可能正常地没有结果，Optional 适合表达这种返回值。map、flatMap 和 orElseThrow 可组合后续处理，调用 get 前不检查则会把显式缺失重新变成运行时错误。Optional 本身不应为 null，也不宜机械替代每个字段、每个参数或集合元素；集合为空通常直接返回空集合。"),
            sec("默认值也会改变语义", "orElse 的参数先求值，即使已有结果，也会执行其表达式；orElseGet 接收延迟计算的 Supplier。缺失图书被悄悄替换为“默认图书”可能掩盖错误，是否允许默认值由业务决定。输入校验包括结构、范围和跨字段规则；越靠近外部输入边界，越应给出清晰错误，但持久化层约束仍然有独立价值。")
          ],
          code: `import java.util.Map;
import java.util.Optional;

public class MissingValues {
    record Book(long id, String title) {}
    static Optional<Book> find(Map<Long, Book> books, long id) {
        return Optional.ofNullable(books.get(id));
    }
    public static void main(String[] args) {
        var books = Map.of(1L, new Book(1, "Java 核心技术"));
        String title = find(books, 2).map(Book::title).orElse("未找到图书");
        System.out.println(title);
    }
}`,
          lab: "streams",
          exercise: ex("设计图书查询的三种结果", ["查询已有图书并返回书名。","查询不存在图书，由入口展示“未找到”。","给借阅用例设计缺失处理：图书不存在时明确报错，禁止创建一条假图书记录。"], ["正常查询不调用 Optional.get。","查无结果与无效负编号有不同反馈。","返回 Optional 的方法从不返回 null。"], "仓储/查询层表示缺失，服务根据用例决定缺失是否是错误。", "独立 find 返回 Optional<Book>；显示用 map(Book::title).orElse(\"未找到\")，借阅用 orElseThrow(() -> new IllegalArgumentException(\"图书不存在\"))。负编号在服务入口拒绝。主工程使用整体快照仓储，按编号查找在服务内部执行。"),
          quiz: q("已有值时，orElse(expensive()) 与 orElseGet(() -> expensive()) 有何区别？", ["没有区别，两者都不会执行 expensive","orElse 仍会先计算参数，orElseGet 不执行供应器","orElseGet 一定新建线程","orElse 会修改 Optional 中的值"], 1, "Java 会先求值方法实参。orElseGet 只在 Optional 为空时调用 Supplier，适合延迟计算默认值。")
        })
      ]
    },
    {
      id: "data", title: "处理数据与文件", subtitle: "用函数式表达统计，把图书与借阅可靠地保存下来", color: "#d08b32", lessons: [
        l("16", "Lambda、函数式接口与方法引用", {
          minutes: 35,
          level: "核心",
          tags: ["Lambda","函数式接口","方法引用"],
          resources: refs(["Lambda 表达式","https://dev.java/learn/lambdas/"], ["函数式接口 API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/function/package-summary.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "把筛选与处理行为作为参数传递，减少重复循环。",
          goals: ["识别函数式接口与 Lambda 的目标类型","使用 Predicate、Function、Consumer 与 Supplier","理解捕获变量和副作用边界"],
          sections: [
            sec("把行为当作参数", "函数式接口有一个抽象方法，Lambda 提供这个方法的实现；接口中存在 default 或 static 方法不影响这一点。Predicate<T> 产生真假，Function<T,R> 做转换，Consumer<T> 消费值，Supplier<T> 产生值。方法引用如 Loan::title 是特定场景下 Lambda 的简写，是否能编译取决于目标接口的参数和返回类型。"),
            sec("闭包捕获的限制", "Lambda 捕获的局部变量必须是 final 或事实上不再赋值。对象引用不再赋值，并不表示对象内容不可修改，因此捕获 ArrayList 后继续追加仍是副作用。让筛选函数尽量只依赖输入并返回结果，可以更方便地复用与测试。Lambda 的 this 指向外部实例，不会像匿名类一样创建新的 this 语义。")
          ],
          code: `import java.util.List;
import java.util.function.Predicate;

public class Behaviors {
    record Loan(String title, int borrowedDays, boolean returned) {}
    static void printMatching(List<Loan> loans, Predicate<Loan> condition) {
        for (Loan loan : loans) if (condition.test(loan)) System.out.println(loan.title());
    }
    public static void main(String[] args) {
        int limit = 30;
        var loans = List.of(new Loan("Java 核心技术", 20, false), new Loan("数据库系统概念", 35, false));
        printMatching(loans, loan -> !loan.returned() && loan.borrowedDays() > limit);
    }
}`,
          lab: "streams",
          exercise: ex("组合借阅筛选条件", ["定义“未归还且已借超过 30 天”与“书名含 Java”的 Predicate<Loan>。","用 and、or、negate 组合并核对真值表。","尝试在 Lambda 后重新给捕获的 limit 赋值，阅读编译错误后恢复。"], ["and 只保留两条件同时成立的借阅。","or/negate 符合预写真值表。","解释 effectively final，且不误将局部变量改为 static 共享字段。"], "borrowedDays 是本课统计快照字段，主工程应根据 borrowedAt、dueAt、Clock 计算，不靠固定存储的天数判断未来逾期。", "Predicate<Loan> overdue = l -> !l.returned() && l.borrowedDays() > 30；Predicate<Loan> javaBook = l -> l.title().contains(\"Java\")；overdue.and(javaBook)。捕获限制针对局部变量绑定，不保证对象线程安全。"),
          quiz: q("哪个接口最适合表示“给一条 Loan，判断是否已归还”？", ["Supplier<Loan>","Consumer<Loan>","Predicate<Loan>","Runnable"], 2, "Predicate<T>.test(T) 返回 boolean，适合判断；Supplier 无输入，Consumer 无返回值。")
        }),
        l("17", "Stream 管道与分组统计", {
          minutes: 45,
          level: "核心",
          tags: ["Stream","Collector","分组","惰性计算"],
          resources: refs(["Stream API","https://dev.java/learn/api/streams/"], ["Stream.toList","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/stream/Stream.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "从借阅集合统计次数、借阅天数与逾期天数，生成分类报告。",
          goals: ["区分中间操作、终结操作与惰性求值","使用 map、flatMap、reduce 和 Collector","理解单次消费、顺序和并行流成本"],
          sections: [
            sec("流是计算管道，不是容器", "Stream 关注如何从数据源计算结果，通常不保存元素。filter 和 map 等中间操作是惰性的，遇到 count、toList、collect 等终结操作才触发计算。流使用一次后不能重新消费；需要再次计算就创建新流。map 把一项转成一项，flatMap 把每项产生的流展开；mapToInt 等原始类型流可减少不必要装箱。"),
            sec("保持数据处理可推理", "不要依靠 peek、filter 或并行 forEach 修改外部 ArrayList 来收集结果，应使用 collector 或 toList。Stream.toList 返回不可修改列表，Collectors.toList 不承诺具体实现或可修改性；需要可修改结果可显式 toCollection(ArrayList::new)。并行流不必然更快，数据量、分割成本、共享线程池与副作用都会影响表现。")
          ],
          code: `import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Reports {
    // 独立统计快照：borrowedDays 为已借日数，overdueDays 为查询日的非负逾期日数。
    record Loan(String category, String title, int borrowedDays, int overdueDays, boolean returned) {}
    public static void main(String[] args) {
        var loans = List.of(new Loan("Java", "Java 核心技术", 33, 3, false),
                            new Loan("Java", "Effective Java", 10, 0, true),
                            new Loan("SQL", "数据库系统概念", 31, 1, false));
        Map<String, Long> counts = loans.stream()
            .collect(Collectors.groupingBy(Loan::category, Collectors.counting()));
        Map<String, Integer> borrowedDays = loans.stream()
            .collect(Collectors.groupingBy(Loan::category, Collectors.summingInt(Loan::borrowedDays)));
        int overdueDays = loans.stream().filter(loan -> !loan.returned())
            .mapToInt(Loan::overdueDays).sum();
        System.out.println(counts + " / 已借天数 " + borrowedDays + " / 当前逾期天数 " + overdueDays);
    }
}`,
          lab: "streams",
          exercise: ex("生成分类借阅报告", ["按类别统计全部借阅次数与已借天数，另外只统计未归还记录的逾期次数和逾期天数。","在独立统计快照增加 List<String> tags，用 flatMap 提取所有标签，去重并排序。","用 for 循环重算总逾期天数，核对 Stream；说明归还日期缺失的限制。"], ["示例借阅次数 Java=2、SQL=1；已借天数 Java=43、SQL=31；当前逾期 2 次、共 4 天。","已归还记录不进入当前逾期报告；空集合得到空报告与 0。","过程不修改源集合；不声称主工程已能计算历史实际借阅时长。"], "按类别 groupingBy + counting/summingInt；借阅天数必须说明截至查询日还是截至归还日。", "统计全部次数用 groupingBy(Loan::category, counting())；当前逾期先 filter(l -> !l.returned() && l.overdueDays() > 0)。标签管道 flatMap(l -> l.tags().stream()).distinct().sorted().toList()。主工程 Loan 仅有 returned 标志，历史真实时长需要新增 returnedAt 并迁移文件格式，这是拓展。"),
          quiz: q("执行 loans.stream().filter(predicate); 但没有终结操作，通常会怎样？", ["立即筛选并修改 loans","只构造惰性管道，尚未遍历筛选","自动启动新线程","所有借阅被删除"], 1, "中间操作通常是惰性的，终结操作才触发遍历；流不是修改源容器的命令。")
        }),
        l("18", "文件、NIO 与资源关闭", {
          minutes: 45,
          level: "核心",
          tags: ["NIO","Path","UTF-8","try-with-resources"],
          resources: refs(["Java I/O","https://dev.java/learn/java-io/"], ["Files API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/nio/file/Files.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "将图书目录导出为 UTF-8 并读回，理解路径、失败与资源生命周期。",
          goals: ["使用 Path、Files 与字符编码","用 try-with-resources 管理可关闭资源","解释路径安全、覆盖和写入失败"],
          sections: [
            sec("路径不是文件内容", "Path 表示路径，Files 提供读写与遍历方法。相对路径基于进程当前目录解析，部署时可能与源码目录不同。文本必须明确编码，本课使用 UTF-8。readAllLines 适合小文件，大文件应流式处理以避免一次占用大量内存。Files.lines、Files.list 等返回的流关联资源，需要关闭。"),
            sec("可靠保存需要考虑中途失败", "try-with-resources 会按创建的相反顺序关闭 AutoCloseable 资源，且保留受抑制异常信息。不要吞掉 IOException 后声称保存成功。更稳妥的更新方案是同目录写临时文件、关闭成功后再移动替换；原子移动受文件系统支持限制，要处理 AtomicMoveNotSupportedException。对用户提供的文件名应限制到允许目录，防止路径穿越。")
          ],
          code: `import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public class BookFiles {
    public static void main(String[] args) throws IOException {
        Path directory = Path.of("work", "library-data");
        Files.createDirectories(directory);
        Path file = directory.resolve("books.txt");
        Files.writeString(file, "1\\tJava 核心技术\\n2\\t数据库系统概念\\n", StandardCharsets.UTF_8);
        try (var lines = Files.lines(file, StandardCharsets.UTF_8)) {
            lines.forEach(System.out::println);
        }
    }
}`,
          lab: "io",
          exercise: ex("完成图书目录导出与回读", ["将三本含中文书名的图书导出到工作目录，指定 UTF-8。","回读并校验数量与书名；本练习约定制表符和换行不得出现在书名中。","将输出目录改为现有普通文件路径，观察并反馈保存失败。"], ["回读三本且中文无乱码。","流式读取后关闭资源。","非法字段被拒绝，写入失败不会显示成功。"], "本课仅实现 id + 书名的教学导出，不可拿它覆盖主工程的完整借阅状态文件。", "校验书名不含 \\t、\\r、\\n，写出 id + \"\\t\" + title；读时 split(\"\\t\", -1) 并检查字段数，传播 IOException。主工程 FileLibraryRepository 已保存 Book/Loan 完整快照；临时文件与原子移动实现请对照其源码。"),
          quiz: q("为什么 Files.lines(path) 通常要放入 try-with-resources？", ["因为 Stream 绝不能手动关闭","因为该流可能持有打开的文件资源","因为它总会创建数据库连接","因为 UTF-8 只在 try 内可用"], 1, "文件流背后有资源生命周期。普通集合的 stream 通常无外部资源，但 Files.lines 返回的流应显式关闭。")
        }),
        l("19", "日期、时区与精确计算", {
          minutes: 35,
          level: "核心",
          tags: ["java.time","时区","Clock","精确小数"],
          resources: refs(["日期时间 API","https://dev.java/learn/date-time/"], ["BigDecimal API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/math/BigDecimal.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "正确表示借阅日、应还日与事件时刻，通过固定 Clock 验证逾期边界。",
          goals: ["区分 LocalDate、Instant 与 ZonedDateTime","使用 Clock 让时间相关逻辑可测","处理 Duration、Period 与 BigDecimal 比较"],
          sections: [
            sec("先问要表达哪一种时间", "应还日“2026-11-01”适合 LocalDate；全球事件发生的时刻适合 Instant；用户所在地区的日历时间需要 ZoneId 与 ZonedDateTime。LocalDateTime 没有时区或偏移，不能单独代表唯一时刻，夏令时可能导致某些本地时间不存在或出现两次。Duration 表示秒与纳秒的时长，Period 表示年、月、日的日历跨度。"),
            sec("时间与数值规则必须显式", "业务代码直接读取系统当前时间会使测试随日期变化；注入 Clock 后可以使用固定时钟复现边界。格式化用 DateTimeFormatter，解析错误应显式反馈。BigDecimal 的 equals 还比较 scale，所以 2.0 与 2.00 的 equals 为 false，而 compareTo 为 0；金额舍入应由业务规则决定，并说明在哪个环节舍入。")
          ],
          code: `import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;

public class Deadlines {
    static boolean overdue(LocalDate dueAt, Clock clock) {
        return dueAt.isBefore(LocalDate.now(clock));
    }
    public static void main(String[] args) {
        Clock fixed = Clock.fixed(Instant.parse("2026-11-01T00:00:00Z"), ZoneOffset.UTC);
        System.out.println(overdue(LocalDate.of(2026, 10, 31), fixed));
        System.out.println(Instant.now(fixed).atZone(ZoneId.of("Asia/Singapore")));
    }
}`,
          lab: "io",
          exercise: ex("判断逾期并换算显示时间", ["写 overdue(dueAt, clock)，约定应还当天不逾期；在服务用例中同时排除已归还记录。","固定时钟验证昨天、今天、明天；验证 borrowedAt.plusDays(30) 的跨月结果。","将同一个 Instant 按 UTC 和 Asia/Singapore 显示，并比较 BigDecimal(\"2.0\") 与 BigDecimal(\"2.00\")。"], ["昨天 true，今天/明天 false；已归还借阅不进入当前逾期列表。","主系统应还日期始终是借阅日加 30 天；两个时区显示不同但 toInstant 相同。","解释 equals 与 compareTo 的精度口径差异。"], "不要用毫秒差除以 24 小时推算所有地区的日历天数。", "dueAt.isBefore(LocalDate.now(clock))；主系统完整规则为 !loan.returned() && loan.dueAt().isBefore(today)。借阅日数用 ChronoUnit.DAYS.between(borrowedAt, today)，逾期天数用 Math.max(0, ChronoUnit.DAYS.between(dueAt, today))。展示时用 instant.atZone(zone)。"),
          quiz: q("未来扩展“图书归还事件的精确发生时刻”，通常首选哪个存储值？", ["LocalDate","无时区说明的字符串","Instant","只存当前小时"], 2, "Instant 表示唯一时刻，展示时结合 ZoneId。当前主工程只用 LocalDate 表示借阅/应还日且未保存归还时刻；新增字段需要独立设计与迁移。")
        }),
        l("20", "字节、协议格式与序列化风险", {
          minutes: 40,
          level: "核心",
          tags: ["字节流","格式版本","序列化","安全"],
          resources: refs(["DataInput API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/DataInput.html"], ["序列化过滤","https://docs.oracle.com/en/java/javase/21/core/serialization-filtering1.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "区分字节与字符，设计带版本的数据格式，理解反序列化安全边界。",
          goals: ["区分 InputStream 与 Reader","用 DataInputStream/DataOutputStream 处理二进制值","理解格式版本、完整性与 Java 原生反序列化风险"],
          sections: [
            sec("编码是字节与文本之间的协议", "InputStream/OutputStream 处理字节，Reader/Writer 处理字符，桥接时需要编码。把任意二进制数据当 UTF-8 解码可能产生损坏，图片、压缩包等应按字节读写。DataOutputStream 与 DataInputStream 可按约定顺序写读基本值，但读者必须知道字段顺序、长度和版本。文件扩展名不会自动说明真实格式或可信程度。"),
            sec("持久化格式需要长期维护", "保存格式应有版本、长度限制、字段校验和失败策略。Java 原生 ObjectInputStream 可恢复复杂对象图，处理不可信数据可能触发危险行为；不要把它当作外部输入的默认解析器。必要时研究序列化过滤与严格允许列表，但过滤也不能替代整体威胁建模。跨服务交换通常选择显式数据模型的 JSON 等格式，并使用成熟解析库、大小限制和安全配置。")
          ],
          code: `import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataInputStream;
import java.io.DataOutputStream;

public class BinaryFormat {
    public static void main(String[] args) throws Exception {
        var bytes = new ByteArrayOutputStream();
        try (var out = new DataOutputStream(bytes)) {
            out.writeInt(1); // 格式版本
            out.writeLong(42L);
            out.writeUTF("Java 核心技术"); // 使用 DataOutput 规定的 modified UTF-8
        }
        try (var in = new DataInputStream(new ByteArrayInputStream(bytes.toByteArray()))) {
            if (in.readInt() != 1) throw new IllegalArgumentException("不支持的版本");
            System.out.println(in.readLong() + ": " + in.readUTF());
        }
    }
}`,
          lab: "io",
          exercise: ex("定义最小版本化图书导出格式", ["按序写入格式版本、图书数量、每本图书编号与书名。","读取时限制图书数量为 0 到 1000，拒绝未知版本。","截断最后几个字节，验证整体读取失败；此独立二进制练习不要覆盖主系统状态文件。"], ["正常导出与导入得到相同图书目录。","未知版本和过大数量被明确拒绝。","截断有失败反馈，不用 ObjectInputStream 读取外部输入。"], "先用内存缓冲验证协议，再接文件；writeUTF 有 modified UTF-8 编码与长度限制。", "按固定顺序写读，检查 version/count 后建立临时列表，所有记录读取和校验成功后才返回。EOFException 使导入整体失败。主系统完整状态还包含库存、Loan 与 nextLoanId，需版本迁移时一并处理。"),
          quiz: q("对来自网络的不可信字节直接调用 ObjectInputStream.readObject()，主要问题是什么？", ["它只能读取英文","反序列化可能触发不安全对象行为和资源消耗","它会自动验证所有业务规则","它永远比 JSON 更安全"], 1, "原生反序列化有显著攻击面。应优先采用显式、受限的数据格式，并限制类型、体积、深度与资源使用。")
        })
      ]
    },
    {
      id: "concurrency", title: "并发与工作执行", subtitle: "让多个工作线程协作，并对正确性负责", color: "#dc7652", lessons: [
        l("21", "线程生命周期与 Java 内存模型", {
          minutes: 45,
          level: "进阶",
          tags: ["Thread","JMM","happens-before","中断"],
          resources: refs(["线程 API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html"], ["JLS 17：线程与锁","https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "理解 start、join、可见性与 happens-before，避免凭运行结果猜测线程安全。",
          goals: ["区分并发、并行与线程生命周期","解释可见性、有序性和原子性","使用 join 和中断协作完成任务"],
          sections: [
            sec("启动线程改变了执行顺序", "调用 start 请求 JVM 调度新线程执行 run，直接调用 run 只是当前线程的一次普通方法调用。线程调度顺序不可依赖，打印出来先后不同不等于发生业务错误。join 让当前线程等待目标线程终止；sleep 只是暂停一段时间，不提供“另一个线程肯定完成”的保证。并发可以交错执行，并行需要多个执行资源。"),
            sec("共享内存需要同步关系", "Java 内存模型定义线程间读写的允许行为。没有同步时，另一个线程的更新可能不可见，多个步骤也可能交错。happens-before 用于证明可见性与顺序：start 之前的操作对新线程可见，成功 join 之后可以观察目标线程已完成的操作。中断是协作信号，并不强行杀死线程；捕获 InterruptedException 后若不能向上抛出，通常应恢复中断标记并退出当前工作。")
          ],
          code: `public class Worker {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            try {
                for (int i = 0; i < 3; i++) {
                    if (Thread.currentThread().isInterrupted()) return;
                    System.out.println("处理任务 " + i);
                    Thread.sleep(20);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, "library-worker");
        worker.start();
        worker.join();
        System.out.println("工作线程已经结束");
    }
}`,
          lab: "concurrency",
          exercise: ex("正确等待与取消工作线程", ["启动线程处理一批任务，每处理一项后检查中断状态。","在主线程发出 interrupt，再 join 等待结束。","把 start 暂时换成 run，观察线程名与行为变化后恢复。"], ["主线程只在工作线程退出后报告结束。","取消后不会继续无限处理；没有使用 Thread.stop。","能说明 sleep 不等于同步，且单次运行无法证明没有数据竞争。"], "线程的 name 可以打印当前执行位置；被 sleep 中断时会抛 InterruptedException。", "循环中检查 isInterrupted，阻塞方法捕获中断后恢复标记并结束。main 可 throws InterruptedException 把自身中断交给上层，而不是吞掉。"),
          quiz: q("为了等待一个线程确实结束，应优先使用哪种方式？", ["sleep(1000) 并假设足够","Thread.yield()","join() 或等价完成协调机制","反复打印等待中"], 2, "join 等待终止并建立相应 happens-before 关系；sleep 不保证目标线程完成，也不是可见性屏障。")
        }),
        l("22", "synchronized、volatile 与锁", {
          minutes: 50,
          level: "进阶",
          tags: ["synchronized","volatile","锁","死锁"],
          resources: refs(["JLS 17 内存模型","https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html"], ["Lock API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/locks/Lock.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "以库存检查与扣减理解复合原子性，区分锁与 volatile 的保证。",
          goals: ["用同一把锁保护共享不变量","解释 volatile 的保证与限制","识别死锁、锁粒度和错误发布"],
          sections: [
            sec("原子性来自完整的临界区", "count++ 包含读取、计算和写回，不是一个不可分割操作。synchronized 对同一监视器提供互斥，并通过解锁和后续加锁建立可见性。不同实例上的 synchronized 方法使用不同锁，不能保护同一个 static 共享值。应把需要一起成立的多字段规则放进同一临界区，并避免在锁里执行不可控的慢网络请求。"),
            sec("可见并不等于完整业务动作安全", "volatile 使对该变量的写入与后续读取建立可见性/顺序关系，但不把 count++、先检查再更新等复合动作变成原子操作。ReentrantLock 提供可中断获取、超时与多个条件等能力，必须在 finally 解锁。多个锁获取顺序不一致可能死锁；使用固定顺序、缩小共享状态与减少嵌套锁比事后重试更容易推理。")
          ],
          code: `public class SafeCounter {
    private int count;
    public synchronized void increment() { count++; }
    public synchronized int value() { return count; }
    public static void main(String[] args) throws InterruptedException {
        SafeCounter counter = new SafeCounter();
        Runnable add = () -> { for (int i = 0; i < 10_000; i++) counter.increment(); };
        Thread a = new Thread(add);
        Thread b = new Thread(add);
        a.start(); b.start();
        a.join(); b.join();
        System.out.println(counter.value()); // 20000
    }
}`,
          lab: "concurrency",
          exercise: ex("保护最后一本图书的并发借阅", ["创建 available=1 的库存对象，两个线程同时尝试借阅。","把检查 available > 0 与 available-- 放在同一临界区，返回是否成功。","用 join/Future 等待两个结果，核对成功数与最终库存。"], ["恰有一次借阅成功，库存为 0，从不变负数。","读取库存也遵守相同同步契约。","解释只加 volatile 为何无法保护检查再扣减。"], "先用单一锁保护一个不变量；完整借阅还需要新增 Loan 和可靠保存，库存小类仅示范锁。", "synchronized boolean borrow() { if (available == 0) return false; available--; return true; }。主工程 LibraryService 的同步用例覆盖库存与借阅记录；文件保存成功后才发布状态。若多实例运行，还需数据库等跨进程协调。"),
          quiz: q("volatile int count; 多线程执行 count++，能保证精确计数吗？", ["能，volatile 使所有语句都原子","不能，复合读改写仍可能丢失更新","能，只要循环次数少","不能，因为 volatile 永远不可见"], 1, "volatile 提供规定的可见性与顺序保证；复合更新需锁、AtomicInteger 等适当协调机制。")
        }),
        l("23", "线程池、Future 与异步组合", {
          minutes: 50,
          level: "进阶",
          tags: ["ExecutorService","Future","CompletableFuture","超时"],
          resources: refs(["ExecutorService API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ExecutorService.html"], ["CompletableFuture API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/CompletableFuture.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "提交批量工作、收集结果和错误，明确执行器的生命周期。",
          goals: ["使用 ExecutorService、Callable 与 Future","组合 CompletableFuture 并处理异常","理解队列容量、超时和资源关闭"],
          sections: [
            sec("把执行策略从业务任务分离", "Callable 产生结果并可抛异常，ExecutorService 负责安排执行。Future.get 等待完成并可能抛 ExecutionException，其 cause 才是任务原始失败。线程池需要明确线程数、排队、拒绝与关闭策略；newFixedThreadPool 默认使用无界队列，高负载可能积累大量任务。本地练习可使用简单工厂，生产场景要按资源预算设置边界。"),
            sec("异步组合仍然需要失败策略", "CompletableFuture 用 thenApply 转换值、thenCompose 展开下一异步阶段、thenCombine 合并独立结果。非 Async 方法可能在完成前一步的线程执行；Async 重载若未指定执行器，通常使用默认异步执行设施。阻塞 I/O 不应随意挤占共享池。get(timeout) 超时只是停止本次等待，不保证后台任务已取消；取消还依赖任务合作和底层 API 支持。")
          ],
          code: `import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class BatchWork {
    public static void main(String[] args) throws Exception {
        try (var pool = Executors.newFixedThreadPool(2)) {
            Callable<Integer> count = () -> 6 * 7;
            var result = pool.submit(count);
            System.out.println(result.get(1, TimeUnit.SECONDS));
        } // JDK 21：close 等待已提交任务结束；不会替你给任务施加完成期限
    }
}`,
          lab: "concurrency",
          exercise: ex("并发生成两份借阅统计", ["用两个 Callable 分别计算借阅次数与当前逾期天数，输入采用同一份不可变快照。","收集 Future 并处理其中一项主动抛出的异常。","将一项改为有限时模拟阻塞，说明等待超时、取消与执行器关闭的区别。"], ["正常数据得到正确统计；两份结果来自同一状态口径。","失败不会被误报为 0 或成功，其原因可定位。","执行器关闭，无无限等待的任务。"], "超时演示必须响应中断；close 可能等待，不要提交永不结束的工作。", "对同一 List.copyOf(loans) 提交两个计算，带超时 get；捕获 ExecutionException.getCause；超时时按用例 future.cancel(true)。finally/try-with-resources 关闭执行器，任务正确响应 InterruptedException。"),
          quiz: q("Future.get(100, MILLISECONDS) 抛 TimeoutException 后，哪项说法准确？", ["后台任务必然已终止","只说明这次等待超时，任务可能仍在运行","线程池已自动永久关闭","结果一定等于 null"], 1, "等待超时不是任务完成期限控制；需要独立设计取消、底层超时与资源释放策略。")
        }),
        l("24", "原子类、并发集合与协调器", {
          minutes: 45,
          level: "进阶",
          tags: ["AtomicInteger","ConcurrentHashMap","CountDownLatch","背压"],
          resources: refs(["并发包 API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html"], ["原子类 API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/atomic/package-summary.html"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "用成熟并发工具处理计数、索引与协作，避免错误组合。",
          goals: ["使用 AtomicInteger 与 ConcurrentHashMap","识别单操作安全不代表多操作原子","使用 CountDownLatch 或 BlockingQueue 协调任务"],
          sections: [
            sec("选择与不变量相匹配的工具", "AtomicInteger 的 incrementAndGet 可原子更新一个整数；LongAdder 在高争用统计中有用，但 sum 不提供与 AtomicLong 相同的线性化读取语义。ConcurrentHashMap 提供并发访问以及 compute、merge 等原子键更新操作，不允许 null 键值。把 containsKey 和 put 拼在一起仍可能竞争，应使用 putIfAbsent 或适合的计算方法。"),
            sec("协调比忙等更清晰", "CountDownLatch 等待计数降为零后开放，不能重置；BlockingQueue 让生产者和消费者在队列边界协调，并可通过有界容量限制积压。线程安全集合只保护容器自身，不会自动保护其中可变对象或多个键之间的规则。计算回调应尽量短小，避免在 ConcurrentHashMap.compute 中做慢 I/O 或更新产生复杂依赖。")
          ],
          code: `import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;

public class ConcurrentCounts {
    public static void main(String[] args) throws InterruptedException {
        var counts = new ConcurrentHashMap<String, Integer>();
        var done = new CountDownLatch(2);
        Runnable add = () -> {
            try { for (int i = 0; i < 1000; i++) counts.merge("Java", 1, Integer::sum); }
            finally { done.countDown(); }
        };
        new Thread(add).start(); new Thread(add).start();
        done.await();
        System.out.println(counts.get("Java")); // 2000
    }
}`,
          lab: "concurrency",
          exercise: ex("实现并发分类计数", ["4 个工作线程各给“Java”累计 1000 次。","用 ConcurrentHashMap.merge 或 AtomicInteger 更新计数。","用 CountDownLatch 等待完成，并确保异常时也会 countDown。"], ["最终计数是 4000。","没有使用 get 后 put 的非原子组合。","能说明此结果不自动保证多个分类间的总量转移原子性。"], "把 countDown 放在 finally，保证线程失败也不会让等待永久挂起。", "每次 counts.merge(\"Java\", 1, Integer::sum)，finally done.countDown()，主线程 await。若任务可能失败，还要单独收集异常，不能仅凭 latch 归零宣称全部成功。"),
          quiz: q("ConcurrentHashMap 的 containsKey(k) 后再 put(k,v) 能原子地保证“只首次插入”吗？", ["能，所有方法会合并成一个事务","不能，应使用 putIfAbsent 等原子操作","能，只要键是 String","不能，因为该集合禁止并发访问"], 1, "单个方法安全不意味着多个方法的组合原子；两个线程可能同时观察到缺失。")
        }),
        l("25", "虚拟线程与资源预算", {
          minutes: 45,
          level: "进阶",
          tags: ["虚拟线程","JDK21","Semaphore","资源上限"],
          resources: refs(["虚拟线程","https://dev.java/learn/new-features/virtual-threads/"], ["JEP 444","https://openjdk.org/jeps/444"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "在 JDK 21 使用虚拟线程处理阻塞任务，同时控制外部资源。",
          goals: ["区分虚拟线程与平台线程","使用每任务一个虚拟线程的执行器","为外部连接和请求设计并发上限"],
          sections: [
            sec("虚拟线程主要改善阻塞并发的扩展性", "JDK 21 正式支持虚拟线程，可用较低的线程表示成本承载大量主要在等待 I/O 的任务。它们不会让 CPU 密集计算自动变快，也不会扩大 CPU 核心、数据库连接或服务配额。常见用法是每个任务一个虚拟线程，不应为复用目的再建立一个少量虚拟线程池。阻塞代码仍需超时、错误处理与取消。"),
            sec("线程便宜，其他资源仍有限", "数据库连接池、文件句柄、内存与对方服务容量都有上限。可以用 Semaphore 控制进入外部调用的数量，或者使用服务本身的连接池。JDK 21 中，某些在 synchronized 区域或本地调用内发生的阻塞可能固定载体线程，需要通过诊断确认热点。ThreadLocal 在海量线程下也可能放大内存占用，不能无界缓存昂贵资源。")
          ],
          code: `import java.util.concurrent.Executors;
import java.util.concurrent.Semaphore;

public class VirtualWork {
    public static void main(String[] args) throws Exception {
        var permits = new Semaphore(2);
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            var future = executor.submit(() -> {
                permits.acquire();
                try {
                    Thread.sleep(50); // 模拟阻塞等待，不代表真实网络性能
                    return Thread.currentThread().isVirtual();
                } finally { permits.release(); }
            });
            System.out.println(future.get()); // true
        }
    }
}`,
          lab: "concurrency",
          exercise: ex("限制虚拟线程的外部资源并发", ["提交 20 个模拟阻塞任务，使用虚拟线程执行器。","用 Semaphore(3) 限制同时进入模拟外部服务的任务。","用原子计数记录当前与最大并发，并确保异常时释放许可。"], ["所有任务的结果或失败都有记录。","最大进入服务数量不超过 3，任务结束后当前数量为 0。","报告中不将 sleep 演示的时间结论推广到 CPU 性能。"], "只有 acquire 成功后才能在 finally 中 release；计数的增减也要在许可范围内。", "acquire；try 中 incrementAndGet 并更新 max，嵌套 finally decrementAndGet；外层 finally release。模拟任务耗时仅验证资源约束，性能比较应采用真实负载与基准方法。"),
          quiz: q("虚拟线程最可能直接改善哪类负载的扩展性？", ["只有一个核心且一直计算质数的程序","许多并发任务大部分时间等待阻塞 I/O","需要无限数据库连接的程序","所有任务都在同一把锁内长时间计算"], 1, "虚拟线程减少等待型并发对平台线程的占用成本；CPU、锁和外部资源限制仍然存在。")
        })
      ]
    },
    {
      id: "runtime", title: "理解运行时与现代 Java", subtitle: "从语言特性走进 JVM、模块和诊断工具", color: "#5975d6", lessons: [
        l("26", "JVM、类加载与垃圾回收", {
          minutes: 50,
          level: "进阶",
          tags: ["JVM","类加载","GC","内存泄漏"],
          resources: refs(["JVM 规范 21","https://docs.oracle.com/javase/specs/jvms/se21/html/index.html"], ["JDK 21 垃圾回收指南","https://docs.oracle.com/en/java/javase/21/gctuning/"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "建立内存和执行模型，用证据排查泄漏而不是背诵参数。",
          goals: ["区分类加载、链接、初始化与 JIT","解释栈、堆、可达性与 GC Roots","识别堆内存泄漏和不必要的 GC 假设"],
          sections: [
            sec("执行不是逐行解释的简单模型", "类会经历加载、验证、准备、解析与初始化等阶段，其中某些步骤允许延迟。JVM 可以解释执行并把热点代码即时编译，具体优化由实现决定。线程栈保存调用帧与局部信息，堆管理大量对象；不能把“所有局部值一定在栈、所有对象物理上一定在堆”当作优化后布局的绝对结论。递归过深与堆内存不足也对应不同问题。"),
            sec("GC 解决回收，不保证业务不泄漏", "垃圾回收根据可达性识别可回收对象，仍被缓存、监听器、静态集合等引用的无用对象不会自动消失。System.gc 是请求，不是即时回收承诺。回收器的吞吐、停顿和内存开销有取舍，应先测量应用需要，再选择参数。资源如文件、锁和数据库连接不能等待 GC 释放，应使用明确生命周期。不要依赖 finalize 完成关键工作。")
          ],
          code: `import java.util.ArrayList;
import java.util.List;

public class RetentionDemo {
    private static final List<byte[]> CACHE = new ArrayList<>();
    public static void main(String[] args) {
        // 刻意保持在小规模，观察引用关系，不制造内存耗尽。
        for (int i = 0; i < 4; i++) CACHE.add(new byte[256 * 1024]);
        System.out.println("仍被缓存引用的块：" + CACHE.size());
        CACHE.clear();
        System.out.println("清除引用不等于立即完成垃圾回收");
    }
}`,
          lab: "jvm",
          exercise: ex("解释一个缓存保留问题", ["运行小规模缓存示例并画出静态字段到数组的引用路径。","清空缓存后说明哪些引用已断开，不猜测具体回收时间。","在学习项目上启用 -Xlog:gc，观察日志并记录运行环境。"], ["能指出数组在 clear 前仍可达的原因。","不使用大量分配主动制造系统卡顿。","能区分 Java 堆大小、进程总内存和垃圾回收停顿。"], "GC 日志参数放在 java 命令的主类或 -jar 之前；先阅读项目运行方式。", "CACHE 是类静态字段，可从根路径保留数组；clear 移除列表元素引用后，这些数组若无其他引用便可回收。GC 是否立刻发生由运行时决定。日志观察只反映当前小负载。"),
          quiz: q("静态 Map 永久持有已无业务用途的对象，为什么 GC 不能自动回收它们？", ["因为静态字段禁止 GC 运行","因为对象仍然可从 GC Roots 路径到达","因为所有 Map 都在栈上","因为必须调用 finalize 才能回收"], 1, "GC 依据可达性而非“业务是否需要”。需要限制缓存、移除监听器或释放引用，处理根本的保留问题。")
        }),
        l("27", "反射、注解与框架原理", {
          minutes: 45,
          level: "进阶",
          tags: ["反射","注解","元数据","强封装"],
          resources: refs(["反射","https://dev.java/learn/reflection/"], ["注解","https://dev.java/learn/annotations/"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "用运行时元数据观察模型，理解框架的能力和封装边界。",
          goals: ["读取 Class、方法与记录组件信息","定义运行时注解并读取元数据","理解强封装、反射异常与受控调用"],
          sections: [
            sec("反射让程序观察类型结构", "普通代码在编译时确定调用的类型与方法，反射允许运行时查看 Class 的构造器、字段、方法或 record 组件。getMethods 包含可见的 public 继承方法，getDeclaredMethods 聚焦当前类声明的方法。反射调用可能包装目标异常，调用者需要区分查找失败、访问失败与业务代码失败。反射会弱化编译期检查，因此不应替代普通直接调用。"),
            sec("注解是元数据，不会自己执行", "@Retention(RUNTIME) 才能让注解在运行时被反射读取；@Target 限制可标注的位置。注解的真正效果取决于编译器、处理器或运行时框架如何解释它。setAccessible 并不能任意突破 JPMS 模块强封装，跨模块深反射可能需要 opens。不要让用户提供的任意类名或方法名直接成为反射入口，应保持允许列表与访问控制。")
          ],
          code: `import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

public class Metadata {
    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.TYPE)
    @interface Label { String value(); }
    @Label("图书视图")
    record BookView(long id, String title) {}
    public static void main(String[] args) {
        Class<BookView> type = BookView.class;
        System.out.println(type.getAnnotation(Label.class).value());
        for (var component : type.getRecordComponents()) {
            System.out.println(component.getName() + ": " + component.getType().getSimpleName());
        }
    }
}`,
          lab: "reflection",
          exercise: ex("为模型生成受控字段说明", ["创建运行时 @Label 注解，为一个 record 添加说明。","遍历 record components 输出名称与类型。","只处理程序中明确列出的模型类，拒绝把外部任意类名作为入口。"], ["打印注解中的中文说明。","字段信息来自元数据，不是手写重复列表。","没有为了读取公开组件而绕过私有访问权限。"], "RecordComponent[] 可通过 getRecordComponents 获得；只在 isRecord() 为 true 时处理。", "先验证 type.isRecord()，再读取注解和组件。对没有注解的类提供“未标注”说明，避免 getAnnotation 返回 null 后直接调用 value。"),
          quiz: q("自定义注解想在运行时通过反射读取，需要哪种保留策略？", ["SOURCE","RUNTIME","NONE","PRIVATE"], 1, "RUNTIME 保留到运行时。SOURCE 只在源码阶段存在，CLASS 默认保留到 class 文件但不提供同样的运行时可见性。")
        }),
        l("28", "sealed、模式匹配与现代建模", {
          minutes: 45,
          level: "进阶",
          tags: ["sealed","record pattern","switch","JDK21"],
          resources: refs(["JEP 441：switch 模式匹配","https://openjdk.org/jeps/441"], ["JEP 440：Record Patterns","https://openjdk.org/jeps/440"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "用封闭类型层次和模式匹配清楚处理成功与失败。",
          goals: ["用 sealed 限制允许的子类型","使用 record pattern 与模式匹配 switch","明确 JDK 21 正式特性和 null 处理"],
          sections: [
            sec("显式列出一组可能的结果", "sealed 类型通过 permits 限制直接子类型，子类型需要是 final、sealed 或 non-sealed 等合适形式。封闭层次适合建模有限的业务结果，例如成功、未找到和输入错误。record 提供数据载体，模式匹配将类型检查和解构结合，减少重复强制转换。需要开放插件扩展的层次则未必适合 sealed。"),
            sec("穷尽性帮助发现缺失分支", "JDK 21 的模式匹配 switch 和 record patterns 都已正式提供，本项目不启用预览。对 sealed 层次穷尽处理可以让编译器提醒遗漏的子类型；随意加 default 可能掩盖新增类型。null 不是每个类型模式自动覆盖的普通值，需明确 case null 或在边界拒绝 null。模式顺序还必须避免前面的宽泛模式支配后面的分支。")
          ],
          code: `public class Outcomes {
    sealed interface Result permits Found, Missing {}
    record Found(long id, String title) implements Result {}
    record Missing(long id) implements Result {}
    static String describe(Result result) {
        return switch (result) {
            case Found(long id, String title) -> id + ": " + title;
            case Missing(long id) -> "未找到图书 " + id;
        };
    }
    public static void main(String[] args) {
        System.out.println(describe(new Found(1, "Java 核心技术")));
    }
}`,
          lab: "modern",
          exercise: ex("给结果模型增加输入错误", ["在 sealed Result 中新增 InvalidInput(String reason)。","先不修改 switch，观察编译器对穷尽性的提醒。","补充分支并明确 describe(null) 是拒绝还是有单独结果。"], ["三种结果各有明确文案。","无需 --enable-preview 即可在 JDK 21 编译。","能说明新增类型如何触发调用者更新，而不是用 default 悄悄兜底。"], "新增子类型同时更新 permits；null 可在 switch 前用 Objects.requireNonNull 拒绝。", "record InvalidInput(String reason) implements Result {}；补 case InvalidInput(String reason) -> \"输入错误：\" + reason。方法契约若禁止 null，就在入口 requireNonNull，并记录该约定。"),
          quiz: q("在 JDK 21 中，哪项描述正确？", ["所有模式匹配语法都必须启用预览","record 会自动递归冻结所有集合","sealed 限定直接子类型，switch 可检查穷尽性","default 会自动处理所有 null 输入"], 2, "JDK 21 中使用的 record patterns 与 switch 模式匹配为正式特性；null 处理与深不可变仍需显式设计。")
        }),
        l("29", "包、模块与可分发运行时", {
          minutes: 45,
          level: "拓展",
          tags: ["JPMS","ServiceLoader","jdeps","jlink"],
          resources: refs(["模块","https://dev.java/learn/modules/"], ["JDK 21 jlink","https://docs.oracle.com/en/java/javase/21/docs/specs/man/jlink.html"]),
          codeNote: "此独立类可直接在 JDK 21 编译运行，观察 classpath 下的未命名模块。真正的 module-info.java、多模块目录与 jlink 镜像由本课练习独立建立，当前项目仍采用 classpath。",
          summary: "理解 classpath、JPMS、ServiceLoader 和 jlink，规划模块化扩展。",
          goals: ["区分包访问控制、classpath 和 module-path","解释 requires、exports 与 opens","了解 ServiceLoader、jdeps 与 jlink 的职责"],
          sections: [
            sec("模块提供依赖与封装声明", "包组织类并影响访问权限，JPMS 模块则显式声明依赖和对外导出包。requires 建立模块读取关系，exports 暴露包中的公开 API，opens 允许特定运行时深反射。这些词不能互换：导出公开类型不代表任意私有字段可被反射访问。传统 classpath 应用通常位于未命名模块，迁移需要检查自动模块、拆分包和第三方依赖。"),
            sec("模块化也是部署议题", "ServiceLoader 可根据服务接口发现实现，模块描述符用 uses 和 provides 声明关系。jdeps 分析依赖，jlink 用于组合指定模块的运行时镜像，不能把任意未模块化依赖不加分析直接变成完整应用安装包。本课为拓展：项目主线仍采用简单运行方式；创建多模块目录、编译配置与平台运行时镜像需独立动手配置。")
          ],
          code: `import java.net.http.HttpClient;

public class ModuleObservation {
    public static void main(String[] args) {
        Module current = ModuleObservation.class.getModule();
        System.out.println("当前代码属于命名模块：" + current.isNamed());
        System.out.println("HTTP 客户端模块：" + HttpClient.class.getModule().getName());
        System.out.println("可读取 java.base：" + current.canRead(String.class.getModule()));
        // 只打印独立拓展工程的描述符草案，不会自动把本项目模块化。
        String descriptor = """
            module library.app {
                requires java.net.http;
                exports demo.api;
            }
            """;
        System.out.println(descriptor);
    }
}`,
          lab: null,
          exercise: ex("创建独立的图书模块练习", ["在 modules/library.app/module-info.java 写入代码块打印的模块描述符；在 modules/library.app/demo/api/Launcher.java 声明 package demo.api 并定义 public class Launcher。","Launcher 的 main 打印“模块化图书借阅系统”，用 --module-source-path 编译、--module-path 启动。","解释为什么框架深反射私有字段时 exports 不够，阅读 jdeps/jlink 工具帮助。"], ["独立模块能运行并打印文案；原学习项目仍采用 classpath。","描述符只声明实际依赖和导出，不混用 exports/opens。","说明自行建立的源码结构、命令和目标平台，不宣称已交付 jlink 镜像。"], "模块目录名必须匹配 library.app；Launcher 的包目录和 package demo.api 一致。", "执行 javac -d mods --module-source-path modules -m library.app，再 java --module-path mods -m library.app/demo.api.Launcher。jlink 前用 jdeps 核对模块依赖；该镜像的操作系统/架构需要与目标平台一致。"),
          quiz: q("JPMS 中 exports 与 opens 的核心区别是什么？", ["二者完全等价","exports 导出公开 API，opens 允许约定范围的深反射访问","opens 只用于打开文件","exports 会自动生成依赖包"], 1, "模块 API 可见性与运行时反射开放是不同边界；应只按需要开放给指定模块。")
        }),
        l("30", "JFR、线程转储与性能证据", {
          minutes: 45,
          level: "进阶",
          tags: ["JFR","jcmd","性能","JMH"],
          resources: refs(["JDK 21 jcmd","https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html"], ["JFR API","https://docs.oracle.com/en/java/javase/21/docs/api/jdk.jfr/jdk/jfr/package-summary.html"], ["OpenJDK JMH","https://openjdk.org/projects/code-tools/jmh/"]),
          codeNote: "独立诊断示例，使用 JDK 21 自带 jdk.jfr。它生成小型自定义事件记录，不能证明项目性能；项目 JVM 实验与完整 JFR 分析是两项不同操作。",
          summary: "用诊断记录定位慢与卡，避免把一次计时当成基准结论。",
          goals: ["使用 JFR 或 jcmd 采集诊断信息","区分 CPU、锁等待、分配和 I/O 问题","理解预热、环境与 JMH 的必要性"],
          sections: [
            sec("先明确症状，再选择证据", "高 CPU、低吞吐、长响应和进程内存增长是不同症状。线程转储可观察等待链与死锁线索，JFR 可记录运行事件供后续分析，GC 日志解释回收行为。jcmd <pid> help 查看目标 JVM 支持的诊断命令，部分操作有权限要求或成本；只对自己有权诊断的本地进程采集，记录中也可能包含路径和业务信息。"),
            sec("计时结果需要上下文", "JIT 预热、死代码消除、GC、数据规模与机器负载会影响微小代码的耗时。单次 System.nanoTime 差值不能自动证明某种数据结构更快。JMH 能帮助控制基准方法，但仍需设计代表性数据与分析结果。本项目提供 JVM 观察入口；完整性能分析、JMH 依赖与可视化工具作为本课独立练习，不把演示结果当成生产容量承诺。")
          ],
          code: `import java.nio.file.Files;
import java.nio.file.Path;
import jdk.jfr.Event;
import jdk.jfr.Label;
import jdk.jfr.Name;
import jdk.jfr.Recording;

public class FlightNote {
    @Name("lab.LoanOperation") @Label("借阅操作")
    static class LoanEvent extends Event { int loanCount; }
    public static void main(String[] args) throws Exception {
        Files.createDirectories(Path.of("work"));
        try (var recording = new Recording()) {
            recording.enable(LoanEvent.class);
            recording.start();
            var event = new LoanEvent();
            event.begin();
            event.loanCount = 3;
            event.commit();
            recording.stop();
            recording.dump(Path.of("work", "library-learning.jfr"));
        }
    }
}`,
          lab: "jvm",
          exercise: ex("提交一份可复核的借阅服务诊断", ["对自己启动的图书项目执行 jcmd <pid> Thread.print 或建立 JFR 记录。","标注命令、JDK、借阅/查询输入、采样时长与线程状态。","提出可验证的瓶颈假设，并说明还需哪些证据。"], ["记录来自自己运行的进程。","结论包含样本范围与限制。","不将一次计时或一条线程栈当作根因证明。"], "先 jcmd -l 找到进程；短命示例可增加可控等待或使用启动时 JFR 参数。", "记录命令与输出，WAITING 可能来自正常队列、锁或外部 I/O；只改变一个因素再采集对照。示例 LoanEvent 只记录演示次数，尚未把真实 borrow 调用接入自定义事件。"),
          quiz: q("一次运行中 ArrayList 耗时比 LinkedList 少，最合理的结论是什么？", ["ArrayList 在所有场景永远更快","该次特定环境与负载下测得更短，需进一步验证代表性","LinkedList 不能用于 Java","JIT 一定已经完全稳定"], 1, "性能结论必须限定输入、环境与测量方法。微基准还要处理预热和优化影响，真实场景需要端到端观察。")
        })
      ]
    },
    {
      id: "backend", title: "迈向后端开发", subtitle: "理解 HTTP、数据库、事务与安全的真实边界", color: "#b35a8e", lessons: [
        l("31", "HTTP、Socket 与网络边界", {
          minutes: 45,
          level: "拓展",
          tags: ["HTTP","Socket","HttpClient","超时"],
          resources: refs(["HttpClient API","https://docs.oracle.com/en/java/javase/21/docs/api/java.net.http/java/net/http/HttpClient.html"], ["Socket API","https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/net/Socket.html"], ["HTTP 语义 RFC 9110","https://www.rfc-editor.org/rfc/rfc9110"]),
          codeNote: "先启动当前项目，默认端口 8787。此客户端读取已有 /api/books；主系统使用 JDK HttpServer 与手写受控 JSON 输出，不自带通用 JSON 绑定库、TLS 或身份系统。",
          summary: "用已实现的本地图书 API 观察 HTTP，再拓展 Socket、JSON 与 TLS。",
          goals: ["区分 TCP 连接与 HTTP 应用语义","使用 HttpClient 并检查状态码和超时","理解 JSON、TLS、消息边界与重试限制"],
          sections: [
            sec("网络不是远程方法直接调用", "TCP 提供字节流，不保留应用消息边界；一次 read 不保证得到完整消息，需要长度、分隔符或更高层协议。HTTP 规定方法、路径、头、状态码与消息体语义；GET 通常应无业务修改副作用，POST 常用于创建。JSON 是数据格式而不是 Java 内置对象，JDK 不自带通用 JSON 绑定器，应选择成熟库，避免手工拼接不可信字符串。"),
            sec("调用必须处理不确定性", "连接超时与单次请求超时是不同限制；收到 404 或 500 不等于请求在传输层失败，调用者仍要检查状态码。请求超时后服务端可能已经完成修改，重试非幂等动作可能重复创建。HTTPS 提供传输保护，但不能代替身份认证与权限校验。本项目已有本地 HTTP 服务：默认 8787，GET /api/books 查询、GET/POST /api/loans 列出/创建借阅、POST /api/loans/{id}/return 归还。通用 JSON 解析、底层 Socket 服务与 TLS 是独立拓展。")
          ],
          code: `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class FetchBooks {
    public static void main(String[] args) throws Exception {
        String url = args.length == 0 ? "http://127.0.0.1:8787/api/books" : args[0];
        var client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build();
        var request = HttpRequest.newBuilder(URI.create(url))
            .timeout(Duration.ofSeconds(5)).GET().build();
        var response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("状态：" + response.statusCode());
        if (response.statusCode() / 100 != 2) throw new IllegalStateException("图书服务返回失败");
        System.out.println(response.body());
    }
}`,
          lab: null,
          exercise: ex("观察真实图书 API 往返", ["按 README 启动本地服务，向 http://127.0.0.1:8787/api/books 发送 GET 并记录 JSON。","向 /api/not-found 发送 GET，记录真实 404；再观察 POST /api/loans 的表单字段 bookId、borrower 与 201 响应。","为连接与请求设超时，说明借阅 POST 自动重试为何可能产生两笔借阅。"], ["保留实际的 200、404 与借阅 201 证据。","非 2xx 不视为成功；当前 POST 请求体是 application/x-www-form-urlencoded。","区分 TCP 字节流、HTTP 消息、JSON 响应和表单输入。"], "先用浏览器开发者工具观察页面实际请求，再用 Java 复现；指定了自定义端口则同步修改 URL。", "GET 用示例 HttpClient；借阅用 URLEncoder 编码 borrower，正文 bookId=1&borrower=...，设表单 Content-Type。查看 /api/loans 核对结果；超时不证明服务端未成功。未来幂等键需持久存储，目前未内置。"),
          quiz: q("借阅 POST 请求在客户端超时后，能断言服务器没有新增 Loan 吗？", ["能，超时会自动回滚服务端","不能，服务端可能已完成但响应未及时到达","能，只要响应是 JSON","不能，因为所有 GET 都会创建借阅"], 1, "超时只表示本端没有及时获得结果。借阅修改重试需要幂等或查询确认等协议；当前项目未实现请求幂等键。")
        }),
        l("32", "关系模型、SQL 与索引", {
          minutes: 50,
          level: "拓展",
          tags: ["SQL","关系模型","索引","外部环境"],
          resources: refs(["H2 官方 SQL 语法","https://h2database.com/html/grammar.html"], ["H2 官方命令","https://h2database.com/html/commands.html"]),
          codeNote: "SQL 以 H2 练习模型为例，MySQL/SQLite 等语法、外键开关与执行计划需另行核对。图书 author/category 为聚焦约束暂省；映射完整主系统时应补齐。此程序仅打印草案。",
          summary: "为图书库存与借阅记录建表，理解约束、查询和索引；需要外部数据库。",
          goals: ["设计主键、外键和唯一约束","编写参数化查询所需的 SQL","用查询计划判断索引价值"],
          sections: [
            sec("关系模型保存可约束的事实", "books 表保存书名、馆藏总数与可借库存，loans 表通过 book_id 外键关联图书，记录借阅人、借阅日、应还日与归还标志。这是一本图书对应多笔历史借阅的一对多关系。主键、外键、NOT NULL 与 CHECK 维护基本完整性；当前库存与全部未归还借阅的一致性还需要业务事务。SQL 的 NULL 使用 IS NULL 判断，不能用 = NULL。"),
            sec("索引加速查询但也有代价", "索引通常加速合适的查找、连接和排序，同时增加写入成本与存储占用。复合索引的列顺序和查询谓词有关，不能只看“建了索引”就假设会使用。应通过数据库的 EXPLAIN 与代表性数据验证。本课是外部环境拓展：安装或配置一个练习数据库（例如 H2），执行建表并保存 SQL；主项目内存/文件仓储不等于已经实现 SQL 数据库。")
          ],
          code: `public class SchemaDraft {
    public static void main(String[] args) {
        // 仅打印 SQL；在独立 H2 练习库执行，JDK 不自带数据库。
        String schema = """
            CREATE TABLE books (
                id BIGINT PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                total INTEGER NOT NULL CHECK (total > 0),
                available INTEGER NOT NULL CHECK (available >= 0 AND available <= total),
                version BIGINT DEFAULT 0 NOT NULL CHECK (version >= 0)
            );
            CREATE TABLE loans (
                id BIGINT PRIMARY KEY,
                book_id BIGINT NOT NULL REFERENCES books(id),
                borrower VARCHAR(40) NOT NULL,
                borrowed_at DATE NOT NULL,
                due_at DATE NOT NULL,
                returned BOOLEAN DEFAULT FALSE NOT NULL,
                CHECK (due_at >= borrowed_at)
            );
            CREATE INDEX idx_loans_active_due ON loans(returned, due_at);
            SELECT l.id, b.title, l.borrower, l.due_at
            FROM loans l JOIN books b ON b.id = l.book_id
            WHERE l.returned = FALSE AND l.due_at < CURRENT_DATE;
            """;
        System.out.println(schema);
    }
}`,
          lab: null,
          exercise: ex("在练习数据库建立图书借阅模型", ["配置独立数据库，执行 books/loans schema，插入三本图书与几笔借阅。","用 JOIN 查询书名、借阅人和未归还逾期记录；按 book_id 聚合借阅次数。","违反主键、外键、负库存与应还日期约束，观察错误；查看查询计划。"], ["重复主键、孤立借阅、负库存和倒置日期均被拒绝。","关联/统计结果与手工核对一致。","提交数据库版本、SQL 与计划，不把示意索引当作已经验证的优化。"], "同一本书可以有多笔历史 Loan，不要把 book_id 设为 loans 唯一键；库存变化需第 34 课事务。", "用 JOIN loans.book_id = books.id，COUNT(*) GROUP BY book_id 统计借阅次数。日期逾期是 returned=FALSE AND due_at < 查询日。用 EXPLAIN 对比索引，布尔列低选择性时复合索引是否有益需测量。"),
          quiz: q("应用已经校验图书编号唯一，为什么数据库还应有唯一或主键约束？", ["数据库约束只用于美观","并发请求可能同时通过应用检查，存储层必须最终拒绝重复","SQL 无法查询重复行","主键会自动完成所有身份认证"], 1, "先查再插入存在竞争窗口，数据库约束在并发下维护完整性；应用也要处理约束冲突。")
        }),
        l("33", "JDBC、参数绑定与连接生命周期", {
          minutes: 50,
          level: "拓展",
          tags: ["JDBC","PreparedStatement","资源关闭","外部环境"],
          resources: refs(["JDBC API","https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/package-summary.html"], ["H2 官方快速入门","https://h2database.com/html/quickstart.html"]),
          codeNote: "独立 JDBC 拓展示例；空密码仅用于隔离的本地一次性练习库。需自行添加驱动并建表，不应照搬为部署凭据。",
          summary: "实现可替换的数据库仓储；需 JDBC 驱动、练习库和建表脚本。",
          goals: ["管理 Connection、PreparedStatement 与 ResultSet","用参数绑定避免把值拼入 SQL","区分 JDBC 标准、驱动和连接池"],
          sections: [
            sec("JDBC 是接口，数据库驱动负责实现", "java.sql 定义连接、语句与结果集 API，具体数据库驱动一般需要额外依赖，JDK 本身不是数据库。Connection 表示数据库会话，PreparedStatement 对 SQL 参数绑定，ResultSet 逐行读取结果。资源通常按结果集、语句、连接的顺序释放，try-with-resources 可以保证异常时也关闭。生产连接池归还的是逻辑连接，不代表每次真实断开网络。"),
            sec("参数绑定只解决值的位置", "WHERE id = ? 然后 setLong 使值不成为 SQL 语法，避免常见注入。表名、列名和排序方向通常不能用 ? 绑定，应从固定允许列表选择。SQLException 需要记录足够诊断信息，但不把密码和完整敏感数据暴露给用户。把行映射到领域对象时检查 null、范围与类型。本课代码需额外 JDBC 驱动、外部数据库及第 32 课 schema，当前项目不自带此实现。")
          ],
          code: `import java.sql.DriverManager;

public class JdbcQuery {
    public static void main(String[] args) throws Exception {
        // 前置：classpath 已加入所选 H2 驱动，books 表已创建。
        try (var connection = DriverManager.getConnection("jdbc:h2:./work/library", "sa", "");
             var statement = connection.prepareStatement("SELECT id, title FROM books WHERE id = ?")) {
            statement.setLong(1, 42L);
            try (var result = statement.executeQuery()) {
                while (result.next()) {
                    System.out.println(result.getLong("id") + ": " + result.getString("title"));
                }
            }
        }
    }
}`,
          lab: null,
          exercise: ex("新增独立 JdbcLibraryRepository 拓展", ["在练习副本补齐 books 的 author/category 映射，建立独立 JDBC 仓储。","先写按 id 查询图书的参数化 helper，再按实际 LibraryRepository.load/save 快照契约设计完整适配。","测试中文、单引号、缺失编号与重新连接；下一课将多表保存放入同一事务。"], ["单引号只是数据，不改变 SQL。","缺失图书与 SQL 异常被清楚区分。","连接、语句、结果集关闭，驱动/数据库/映射版本有记录；不把一个 find 方法冒充完整仓储。"], "当前接口保存的是 books、loans 与 nextLoanId 的整体 Snapshot，JDBC 版本需保留相同持久化语义，不能仅实现 save(Book)。", "固定 SQL 后用 setXxx 绑定值，executeQuery/result.next 映射 Book；完整 save 必须考虑 Loan、编号生成与失败回滚。连接配置外置，多个 DAO 共用用例事务连接，不要每个方法独立提交。"),
          quiz: q("PreparedStatement 中的 ? 通常适合绑定什么？", ["用户输入的值，例如书名","任意表名与 SQL 关键字","整个 ORDER BY 语法片段","任意 WHERE 条件代码"], 0, "参数绑定用于数据值，不是 SQL 结构替换。动态列名等必须使用严格允许列表生成。")
        }),
        l("34", "事务、隔离与并发更新", {
          minutes: 55,
          level: "拓展",
          tags: ["事务","ACID","隔离","乐观锁","外部环境"],
          resources: refs(["Connection API","https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/Connection.html"], ["H2 事务与隔离","https://h2database.com/html/advanced.html"]),
          codeNote: "这是独立 JDBC 辅助类，需要第 32 课数据库、驱动和外层连接管理。loanId 由练习调用方保证唯一，生产需数据库生成/序列；expectedVersion 应来自先前查询。主工程目前用文件快照提交，不包含 JDBC。",
          summary: "让多步数据库修改一起成功或失败，并理解隔离级别的实际作用。",
          goals: ["解释 ACID 与自动提交边界","使用 commit、rollback 并处理失败","识别丢失更新、乐观锁和事务重试风险"],
          sections: [
            sec("事务保护一组数据库动作", "JDBC 连接默认常处于自动提交模式，每条语句独立提交。多步业务要在同一连接显式关闭自动提交，并在成功后 commit、失败时 rollback。原子性与持久性还依赖数据库和存储配置；事务不能自动回滚已经发出的邮件或远程 HTTP 修改。事务边界应覆盖一个业务用例，同时避免把用户交互或慢外部调用放入长期事务。"),
            sec("隔离不是“开事务就没有竞争”", "隔离级别对脏读、不可重复读、幻读与序列化异常等影响依数据库而异，应阅读选用数据库的定义。乐观锁可通过 version 条件更新并检查影响行数，冲突时重新读取或拒绝，不能默默覆盖。可序列化事务也可能要求重试，且重试整个业务必须考虑外部副作用的幂等。本课需外部数据库、两条连接和明确的事务测试环境。")
          ],
          code: `import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;

public class BorrowTransaction {
    // 独立 JDBC 拓展；使用第 32 课 schema，专用连接由调用方关闭。
    static void borrow(Connection c, long loanId, long bookId, long expectedVersion,
                       String borrower, LocalDate borrowedAt) throws SQLException {
        if (!c.getAutoCommit()) throw new SQLException("需要没有既有事务的专用连接");
        if (loanId <= 0 || bookId <= 0 || expectedVersion < 0 || borrowedAt == null
                || borrower == null || borrower.isBlank() || borrower.strip().length() > 40) {
            throw new IllegalArgumentException("借阅参数无效");
        }
        c.setAutoCommit(false);
        try {
            try (var update = c.prepareStatement(
                    "UPDATE books SET available = available - 1, version = version + 1 "
                    + "WHERE id = ? AND version = ? AND available > 0")) {
                update.setLong(1, bookId);
                update.setLong(2, expectedVersion);
                if (update.executeUpdate() != 1) throw new SQLException("库存不足、版本冲突或图书不存在");
            }
            try (var insert = c.prepareStatement(
                    "INSERT INTO loans(id, book_id, borrower, borrowed_at, due_at, returned) "
                    + "VALUES (?, ?, ?, ?, ?, ?)")) {
                insert.setLong(1, loanId);
                insert.setLong(2, bookId);
                insert.setString(3, borrower.strip());
                insert.setObject(4, borrowedAt);
                insert.setObject(5, borrowedAt.plusDays(30));
                insert.setBoolean(6, false);
                if (insert.executeUpdate() != 1) throw new SQLException("借阅记录未保存");
            }
            c.commit();
        } catch (SQLException | RuntimeException e) {
            try { c.rollback(); } catch (SQLException rollbackError) { e.addSuppressed(rollbackError); }
            throw e;
        }
        // 专用连接应在外层 try-with-resources 关闭；失败连接不直接归还连接池。
    }
}`,
          lab: null,
          exercise: ex("验证库存与借阅记录一起回滚", ["准备 total=1、available=1、version=0 的图书，正常调用 borrow 后查库存与新借阅。","重置练习数据，使用已存在的 loanId 故意让 INSERT 违反主键，确认前一步扣库存和增版本一起回滚。","两条连接读取同一 version，分别调用；只允许一条成功，另一条报告冲突或无库存。"], ["成功时 available=0，version 加 1，新增 returned=false 且 due_at=borrowed_at+30 天的记录。","第二步失败时库存、version 与借阅记录都无部分提交。","提供数据库版本/隔离级别、受影响行数与真实结果；不盲目重试借阅。"], "准备失败记录与测试图书分开核对；每次测试使用新连接并由调用方 try-with-resources 关闭。", "在同一 Connection 关闭自动提交，条件 UPDATE 绑定 bookId/expectedVersion，INSERT 绑定 loanId/bookId/borrower/日期/returned；全部成功 commit，否则 rollback 并保留原错误。UPDATE 影响 0 行必须明确失败，若需细分原因再做受控查询。"),
          quiz: q("同一数据库事务失败回滚，通常能自动撤销什么？", ["事务中受数据库管理且未提交的写入","已发送到用户邮箱的邮件","所有其他服务器上的 HTTP 动作","任何已经提交的独立连接操作"], 0, "本地数据库事务只覆盖其管理边界内的操作；外部副作用需要另行设计可靠消息、补偿或幂等协议。")
        }),
        l("35", "认证、授权与安全输入", {
          minutes: 50,
          level: "拓展",
          tags: ["认证","授权","OWASP","外部环境"],
          resources: refs(["OWASP Cheat Sheet 系列","https://cheatsheetseries.owasp.org/"], ["OWASP 授权指南","https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html"], ["OWASP 密码存储指南","https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html"]),
          codeNote: "仅演示对象归属授权，不提供真实认证。Principal 必须来自可信认证结果，不能直接采信请求参数。",
          summary: "让“是谁”和“能做什么”成为明确规则；完整登录需额外安全组件。",
          goals: ["区分认证、授权与对象级权限","识别注入、XSS、CSRF 与秘密泄露","了解密码存储、TLS 和依赖安全的职责"],
          sections: [
            sec("知道用户身份仍要检查对象权限", "认证说明请求代表谁，授权决定身份能做什么。借阅记录可能含个人信息，查询 /api/loans 或归还某笔借阅都需要对象权限，不能仅确认已登录。读者只能操作自己的借阅，管理员按策略管理。主系统目前只有 borrower 文本，没有可信用户身份，不能把同名当授权依据；本课通过扩展 borrowerId 演示规则。"),
            sec("安全能力需要成熟实现与配置", "密码不可明文存储，也不应用普通 SHA-256 加一次就声称安全，应采用当前推荐的密码哈希方案与成熟库、合理工作因子。令牌、会话、密钥轮换、TLS 与审计都需要完整生命周期。错误消息和日志不得泄露密码或访问令牌。本课只给出授权规则片段；登录、加密传输、安全框架与攻防验证需额外依赖和隔离环境，项目没有实现完整身份系统。")
          ],
          code: `import java.util.Objects;

public class Ownership {
    record Principal(String userId) {
        Principal { if (userId == null || userId.isBlank()) throw new IllegalArgumentException("缺少可信身份"); }
    }
    // 独立安全拓展；主系统 borrower 姓名字段不能代替可信 borrowerId。
    record Loan(long id, String borrowerId, long bookId) {
        Loan { Objects.requireNonNull(borrowerId); }
    }
    static void requireBorrower(Principal principal, Loan loan) {
        Objects.requireNonNull(principal, "必须先认证");
        Objects.requireNonNull(loan);
        if (!Objects.equals(principal.userId(), loan.borrowerId())) {
            throw new SecurityException("无权访问该借阅记录");
        }
    }
    public static void main(String[] args) {
        requireBorrower(new Principal("user-1"), new Loan(1, "user-1", 7));
        System.out.println("当前规则允许访问");
    }
}`,
          lab: null,
          exercise: ex("补上借阅对象级权限验收", ["列出匿名用户、借阅本人、其他读者与管理员的读取/归还权限。","用可信假身份编写授权规则测试；图书目录公开查询与私人借阅信息分开设计。","检查日志/配置未包含真实秘密，为网页输出说明编码策略。"], ["其他用户不能改 loanId 查看或归还别人的借阅。","权限在服务端验证，不能只隐藏按钮。","明确当前主项目没有真实身份系统，borrower 字符串不提供认证。"], "borrowerId 来自持久借阅记录，身份来自认证上下文，不能接受请求方覆盖归属字段。", "先查 Loan，requireBorrower 或执行管理员规则，再执行查询/归还。外部错误按策略避免泄漏存在性，内部审计保留必要原因且不记录秘密。完整登录、会话、密码哈希与 TLS 是外部拓展。"),
          quiz: q("用户成功登录，是否能查看任意编号的借阅记录？", ["是，登录包含全部权限","否，还应验证其对目标借阅的权限","是，只要请求是 GET","否，任何用户都应被拒绝"], 1, "认证与授权不同。借阅记录应按身份、对象和操作验证；当前项目尚未实现这套身份授权系统。")
        })
      ]
    },
    {
      id: "engineering", title: "工程实践与毕业作品", subtitle: "让项目可验证、可维护，并有边界地接触框架与分布式", color: "#4a9489", lessons: [
        l("36", "自动化测试与可靠重构", {
          minutes: 50,
          level: "核心",
          tags: ["测试","重构","测试替身","验收"],
          resources: refs(["JUnit 官方文档","https://docs.junit.org/current/user-guide/"], ["Java assert 语言规则","https://docs.oracle.com/javase/specs/jls/se21/html/jls-14.html#jls-14.10"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "从验收标准写测试，用失败证据保护自己的功能修改。",
          goals: ["区分单元、集成与端到端测试","覆盖正常、边界和失败路径","使用测试替身验证业务而非复制实现"],
          sections: [
            sec("测试验证行为契约", "单元测试聚焦小范围规则，集成测试验证组件协作，端到端测试检查用户流程。测试应描述输入和外部可见结果，不把实现细节逐行抄一遍。先选有价值的风险：非法输入、重复编号、状态转换、文件失败与并发边界。一个测试失败应该能指出行为偏差，而不是只输出 false。"),
            sec("自动检查和学习掌握是不同证据", "本项目的自检确认示例工程在既定场景下运行，但不等于你已经完成每课练习。需要你自己修改、写断言、解释失败，再提交结果。Java 的 assert 默认可关闭，因此不能把它当作始终生效的业务校验；项目可使用显式检查或测试框架。JUnit 拓展需要额外依赖与构建配置，快照测试也不能替代业务不变量断言。")
          ],
          code: `public class RuleTest {
    static int validateMinutes(int value) {
        if (value < 1 || value > 240) throw new IllegalArgumentException("范围错误");
        return value;
    }
    static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
    public static void main(String[] args) {
        check(validateMinutes(1) == 1, "最小合法值应通过");
        check(validateMinutes(240) == 240, "最大合法值应通过");
        boolean rejected = false;
        try { validateMinutes(0); } catch (IllegalArgumentException e) { rejected = true; }
        check(rejected, "0 必须被拒绝");
        System.out.println("示例规则检查通过；仍需完成你自己的练习");
    }
}`,
          lab: null,
          exercise: ex("为新增借阅功能先写行为测试", ["选择尚未实现的功能，例如未归还借阅的应还日期区间筛选。","先写正常命中、空结果、起始日期晚于结束日期三项测试，观察实现前失败。","完成最小实现并重构，继续运行同一组测试。"], ["有一次明确失败的证据。","断言公开行为，不依赖私有字段名。","提交实现、测试、命令与简短修复说明。"], "用内存仓储和固定 Clock 隔离变化，先确认页面已有功能，避免重复实现现成筛选。", "建立两笔不同 dueAt 的未归还借阅和一笔已归还借阅，断言仅返回符合区间且未归还的记录；空区间结果为空，倒置日期参数被拒绝。主系统已有基础借还，新增功能需贯穿服务、入口和相关文档。"),
          quiz: q("项目自检显示全部通过，能证明什么？", ["用户已经掌握所有 Java 知识","被执行的检查在当前环境与样例下通过","所有潜在 bug 都不存在","数据库和 Spring 功能已自动实现"], 1, "检查覆盖有限行为，不能证明所有输入、所有并发交错、外部环境或学习掌握程度。")
        }),
        l("37", "Maven、依赖、Git 与持续集成", {
          minutes: 50,
          level: "拓展",
          tags: ["Maven","Git","CI","依赖","外部环境"],
          resources: refs(["Maven 入门","https://maven.apache.org/guides/getting-started/"], ["Maven 依赖机制","https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html"], ["Git 官方书","https://git-scm.com/book/zh/v2"]),
          codeNote: "项目已有 pom.xml，可执行 mvn test 与 mvn package。test 阶段由 exec-maven-plugin 运行 lab.TestSuite；当前不依赖 JUnit。Maven 首次需联网下载构建插件，远程 CI 与 JUnit 迁移留作练习。",
          summary: "阅读已有 Maven 构建，理解插件、测试阶段和可复现协作；Git/CI 需独立配置。",
          goals: ["解释 Maven 坐标、生命周期和依赖作用域","用 Git 记录可回退的功能修改","为编译与测试设计 CI 工作流"],
          sections: [
            sec("构建要能在另一台机器重现", "Maven 通过 groupId、artifactId、version 标识产物，pom 声明编译目标、依赖与插件。当前工程已指定 release 21 并固定插件版本；mvn test 执行已有自检，mvn package 还会生成 JAR。compile、test、provided 等依赖作用域影响编译/测试/运行可见性，构建插件也会首次下载。应用源码当前只使用 JDK，不等于构建过程完全不联网。"),
            sec("版本控制保存决策与证据", "Git 的工作区、暂存区和提交不同。一次提交围绕可审查的变化，提交前检查 diff、构建产物与秘密。CI 在干净环境执行相同构建命令，不能替代设计审查。本项目尚未配置远程仓库和 CI；本课在你自己的练习仓库设计与验证，JUnit 迁移也需额外测试依赖。")
          ],
          code: `public class BuildEnvironment {
    public static void main(String[] args) {
        System.out.println("Java: " + System.getProperty("java.version"));
        System.out.println("运行目录: " + System.getProperty("user.dir"));
        System.out.println("VM: " + System.getProperty("java.vm.name"));
        // 拓展构建约定：maven.compiler.release=21；测试依赖仅在 test scope。
        // 命令行练习：mvn test、mvn package、git status、git diff。
        // 此类只诊断环境，不会安装 Maven、下载依赖或推送提交。
    }
}`,
          lab: null,
          exercise: ex("验证已有构建并设计持续集成", ["阅读 pom.xml，找到 release=21、编译/打包插件和 test 阶段的 lab.TestSuite。","执行 mvn test 与 mvn package；在自己的练习 Git 仓库提交一项小功能，检查暂存 diff。","编写 CI 检出、设置 JDK 21、测试、打包步骤；可选在副本将检查迁移到 JUnit，声明 test scope。"], ["按 README 命令构建，已有检查确实执行，JAR 能按规定启动。","提交不含凭据、build/target 产物或无关文件。","区分已验证的本地构建与尚未配置的远程 CI；不以 Surefire 未发现 JUnit 测试断言没有运行自检。"], "先检查 Maven 日志中 run-contract-checks 的输出；不要只看某个插件的测试数量。", "mvn test 由 exec-maven-plugin 运行 lab.TestSuite；mvn package 生成 target/java-learning-lab.jar。记录真实结果；git status 与 git diff --staged 后在自己的仓库提交。CI 复用同一命令，若迁移 JUnit，保持行为契约并增加 test scope 依赖。"),
          quiz: q("CI 的主要价值是什么？", ["保证所有业务设计自动正确","在统一环境重复执行已定义的检查，尽早发现集成问题","自动批准所有代码修改","取代对外部服务的权限配置"], 1, "CI 提供可重复检查证据，检查的覆盖和设计仍由团队负责，不能自动证明没有缺陷。")
        }),
        l("38", "Spring Boot 与 REST 分层", {
          minutes: 60,
          level: "拓展",
          tags: ["Spring Boot","REST","DTO","外部环境"],
          resources: refs(["Spring Boot 官方文档","https://docs.spring.io/spring-boot/"], ["Spring REST 入门","https://spring.io/guides/gs/rest-service/"], ["Spring 事务文档","https://docs.spring.io/spring-framework/reference/data-access/transaction.html"]),
          codeNote: "此类不属于当前项目可直接编译的源码集。需在独立 Spring Boot 工程补全依赖、启动类、服务实现和错误映射。",
          summary: "把已有业务服务接入框架；需独立 Spring Boot 工程和依赖。",
          goals: ["理解容器、构造器注入与自动配置","设计 DTO、控制器、服务和仓储边界","认识事务代理、校验与框架测试的边界"],
          sections: [
            sec("框架负责组装与横切能力", "Spring 容器管理对象和依赖关系，Boot 提供约定配置与启动支持；这些能力建立在普通对象、接口、注解和反射等基础上。控制器接收协议数据并返回 DTO，服务实现用例，仓储访问存储。不要把数据库实体直接当作所有接口的数据契约，也不要把全部业务塞进一个 Controller。自动配置仍需理解触发条件与实际生效的配置。"),
            sec("注解背后仍有执行机制", "@Transactional 常通过代理生效，事务管理器、调用路径和传播规则影响行为，不能把注解当魔法。参数校验、错误映射、安全过滤链和集成测试需要独立配置。本课仅提供形态示例，项目不捆绑 Spring、ORM、Web 安全或数据库；请在独立工程选择兼容 JDK 21 的受支持版本，按官方当前文档完成依赖与启动，不把下列片段当作已部署服务。")
          ],
          code: `// 独立 Spring Boot 工程片段；需要框架依赖与启动类。
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/books")
class BookController {
    private final BookQuery service;
    BookController(BookQuery service) { this.service = service; }
    @GetMapping("/{id}")
    BookDto get(@PathVariable("id") long id) { return service.find(id); }
    record BookDto(long id, String title) {}
    interface BookQuery { BookDto find(long id); }
}
// 还需提供 BookQuery 的受管实现、缺失对象错误映射及安全配置。`,
          lab: null,
          exercise: ex("把图书服务接到独立 REST 工程", ["按官方指南建立兼容 JDK 21 的 Spring Boot 工程。","为已有图书服务建立 HTTP 适配，新增 GET /books/{id} 按编号返回 DTO；这个路由是框架练习，不是当前 /api/books 的已实现子路径。","补控制器/集成测试，记录配置与未实现的登录等能力。"], ["练习 GET /books/{id} 成功返回 DTO，缺失为 404。","控制器不直接访问静态 Map 或拼 SQL。","依赖、测试可复现，不把框架启动当作完整后端交付。"], "先用内存仓储跑通协议，再接数据库，逐项扩展。", "构造器注入 BookQuery，明确提供受管实现、领域到 BookDto 的映射与 404 异常处理。断言状态码/字段；事务需验证真实代理与数据库，而非只看注解。"),
          quiz: q("控制器最适合承担哪类职责？", ["解释 HTTP 输入、调用用例、映射响应","在每个方法里拼接全部 SQL 和认证逻辑","代替所有业务对象维护状态","自动证明事务覆盖全部外部系统"], 0, "协议适配与业务规则分开，使服务可在命令行、HTTP 和测试中复用；框架能力也有明确边界。")
        }),
        l("39", "缓存、消息与分布式可靠性", {
          minutes: 60,
          level: "拓展",
          tags: ["幂等","消息","缓存","分布式","外部环境"],
          resources: refs(["Redis 官方文档","https://redis.io/docs/latest/"], ["Apache Kafka 设计","https://kafka.apache.org/documentation/#design"], ["AWS 事务发件箱模式","https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html"]),
          codeNote: "本地模型只能用于理解幂等键。完整分布式方案需持久存储、原子业务处理、过期策略、外部服务与故障测试。",
          summary: "认识跨进程失败、幂等与一致性；Redis、消息队列和部署需外部环境。",
          goals: ["区分本地线程安全与分布式一致性","解释缓存失效、消息重复与幂等","设计可观测的重试、补偿和部署边界"],
          sections: [
            sec("多进程不会共享同一把 Java 锁", "synchronized 和 ConcurrentHashMap 只作用于当前 JVM，多个服务实例需要依赖数据库、消息或专门协议协调。缓存可能过期、丢失或返回旧数据，必须先定义正确性来源、TTL 和失效策略。数据库提交与消息发送跨系统时存在部分成功，需要事务发件箱等可靠方案或明确补偿，不能凭一个本地事务包住全部动作。"),
            sec("重试以重复为前提设计", "消息至少一次投递意味着可能重复，消费者应按业务键去重，并把去重记录与业务修改放在恰当的持久事务中。幂等键需要作用域、参数一致性、有效期与并发处理定义。超时、重试上限、退避和观测缺一不可。以下代码仅演示单进程内存去重，不具备宕机恢复、跨实例协调或无限增长控制；Redis、消息代理、容器与生产部署都是外部环境拓展。")
          ],
          code: `import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

public class LocalIdempotency {
    record Request(String borrowerId, String requestKey) {}
    record Loan(long id, long bookId, String borrowerId) {}
    record Saved(long bookId, Loan loan) {}
    private final ConcurrentHashMap<Request, Saved> seen = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();
    Loan borrow(String borrowerId, String requestKey, long bookId) {
        if (borrowerId == null || borrowerId.isBlank() || requestKey == null || requestKey.isBlank() || bookId <= 0)
            throw new IllegalArgumentException("幂等请求参数无效");
        var request = new Request(borrowerId, requestKey);
        var saved = seen.compute(request, (key, old) -> {
            if (old != null && old.bookId() != bookId)
                throw new IllegalArgumentException("同一请求键不能更换图书");
            return old == null ? new Saved(bookId, new Loan(ids.incrementAndGet(), bookId, borrowerId)) : old;
        });
        return saved.loan();
    }
    // 仅演示请求去重，不扣真实库存、不保存文件；重启丢失，无 TTL、跨实例或事务能力。
}`,
          lab: null,
          exercise: ex("为借阅重试设计可靠性方案", ["列出“库存已提交但响应丢失”“数据库成功但消息失败”等三种部分失败。","为借阅设计用户范围内的幂等键，同键不同 bookId 拒绝，并约定有效期。","用本地示例测试重复请求，再设计持久去重与事务发件箱；有外部环境时实现故障注入。"], ["同用户同键同参数返回同一 Loan，同键不同参数失败。","不同用户的相同请求键互不干扰，说明重启/多实例局限。","方案把库存扣减、新 Loan、去重结果放入同一持久事务，并说明消息重复、乱序及重试耗尽的观测。"], "本地代码只演示去重，不是可接入真实库存的完整借阅服务；不能在 compute 回调中随意增加慢 I/O。", "数据库以 (borrower_id, request_key) 唯一约束；借阅、库存、幂等结果与 outbox 同事务提交。发布器重试，消费者按 eventId 去重并在本地事务更新。当前主系统、Redis/Kafka 与多实例可靠性需分别验收。"),
          quiz: q("两个独立 JVM 中各有一个 synchronized 方法，能否共同保护一份远程数据的全部更新？", ["能，方法名相同就共享锁","不能，监视器只在各自 JVM 内有效","能，只要部署在同一台机器","能，static 会自动跨进程同步"], 1, "跨实例协调依赖共享系统或协议，本地线程安全不等同于分布式一致性。")
        }),
        l("40", "毕业项目：可维护的校园图书借阅系统", {
          minutes: 90,
          level: "进阶",
          tags: ["毕业项目","交付","设计权衡","独立实现"],
          resources: refs(["Java 官方学习路线","https://dev.java/learn/"], ["Java 21 API 总览","https://docs.oracle.com/en/java/javase/21/docs/api/"]),
          codeNote: "代码是独立学习示例，模型为逐步演进的简化版；先预测结果，再修改、编译并核对。阅读或自检不等于完成自己的练习。",
          summary: "在现有项目上独立完成一条功能链，提交代码、测试、说明和复盘证据。",
          goals: ["把语言、模型、存储和测试串成完整用例","用明确边界交付可运行工程","解释设计权衡并定位一个真实故障"],
          sections: [
            sec("毕业标准关注独立解决问题", "沿用已有 JDK 21、HTTP 页面、内存快照与文件仓储。现成的图书搜索、分类筛选、借阅、归还及基础统计不能作为你新增的功能。可选应还日期区间筛选、UTF-8 借阅报告、续借规则或记录归还日期后的历史时长统计。先确认尚未提供，再独立完成模型、服务、存储、入口与失败路径。"),
            sec("把未做的事写清楚也是工程能力", "交付包括运行命令、数据格式、错误策略、测试与已知限制。解释为什么选某种集合、如何保证相等契约、哪里需要锁以及哪些状态可以不共享。外部数据库、Spring、鉴权、分布式和部署是后续可选方向，必须独立实现、配置与验证才算完成。完成本路线意味着建立覆盖广的 Java 核心和工程知识体系，不意味着穷尽所有版本、库与行业场景。")
          ],
          code: `import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public class DueRangeFeature {
    // 独立简化模型；接入主系统时使用 lab.domain.Loan。
    record Loan(long id, long bookId, LocalDate dueAt, boolean returned) {}
    static List<Loan> dueBetween(List<Loan> loans, LocalDate from, LocalDate to) {
        if (from == null || to == null || from.isAfter(to)) throw new IllegalArgumentException("日期区间无效");
        return loans.stream()
            .filter(loan -> !loan.returned())
            .filter(loan -> !loan.dueAt().isBefore(from) && !loan.dueAt().isAfter(to))
            .sorted(Comparator.comparing(Loan::dueAt).thenComparingLong(Loan::id))
            .toList();
    }
    // 接入后请在界面以 dueAt.isBefore(LocalDate.now(clock)) 标出逾期；这里只演示筛选能力。
}`,
          lab: null,
          exercise: ex("交付你自己的图书借阅功能闭环", ["从应还日期区间查询、借阅报告导出、续借或归还日期记录中选一个尚未实现的功能，先写 5 条验收标准与范围。","独立修改模型/服务/存储/HTTP 与页面所需部分，至少增加一个失败路径测试。","固定输入演示，提交 README、源码、测试证据和故障复盘；数据库或 Spring 为可选独立拓展。"], ["功能从真实用户入口操作，重启后行为符合格式和兼容说明。","正常、空结果、非法输入、保存失败、边界日期均有证据。","能不看参考解解释数据结构、异常、线程安全和持久化边界。","数据库、框架、登录与消息分别标明已实现/仅设计/尚未开始。"], "先把一个小闭环交付；主系统固定 30 天且保留归还历史，新增续借等规则必须明确变化。", "以日期区间为例：服务过滤 !returned，使用 dueAt 的闭区间，按应还日/编号排序；入口解析 from/to，拒绝倒置区间。Clock 固定测试昨天/今天，验证空列表和非法输入；若选 returnedAt，则同步迁移持久格式，并测试旧数据与坏文件。"),
          quiz: q("以下哪项最符合本路线的毕业证据？", ["只把 40 课全部勾选为完成","独立实现功能、测试失败与成功路径，并解释设计和限制","仅运行一次项目自检","宣称已经掌握所有 Java 生态"], 1, "学习掌握依赖你自己的修改、验证与解释。完成标记和既有演示只帮助组织学习，不能替代能力证据。")
        })
      ]
    }
  ];
  const labSources = {
    basics: 'BasicsLab', oop: 'OopLab', collections: 'CollectionsLab', streams: 'StreamsLab',
    io: 'IoLab', concurrency: 'ConcurrencyLab', modern: 'ModernLab', reflection: 'ReflectionLab', jvm: 'JvmLab'
  };
  for (const stage of stages) {
    for (const lesson of stage.lessons) {
      if (lesson.lab && labSources[lesson.lab]) {
        lesson.source = `src/main/java/lab/examples/${labSources[lesson.lab]}.java`;
        lesson.codeNote += ' 实验按钮运行该主题已有的图书借阅演示，并不执行本页全部示例，也不会判定你的练习通过。';
      }
    }
  }
  window.CURRICULUM = { version: '1.0', javaVersion: '21', stages };
})();
