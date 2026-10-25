package lab.examples;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Comparator;

/** 只扫描自有演示类的公开方法；不突破访问控制，不加载外部类。 */
final class ReflectionLab {
    private ReflectionLab() {}

    @Retention(RetentionPolicy.RUNTIME)
    @Target(ElementType.METHOD)
    @interface Lesson { String value(); }

    public static final class DemoService {
        @Lesson("列出图书")
        public String listBooks() { return "Java, SQL"; }
        public String helper() { return "未标注的方法不会被调用"; }
    }

    static String run() throws ReflectiveOperationException {
        StringBuilder out = new StringBuilder("[reflection] 注解驱动的公开方法发现\n");
        DemoService service = new DemoService();
        // 反射返回顺序未规定，因此显式排序。
        Method[] methods = DemoService.class.getDeclaredMethods();
        Arrays.sort(methods, Comparator.comparing(Method::getName));
        for (Method method : methods) {
            Lesson annotation = method.getAnnotation(Lesson.class);
            if (annotation != null) {
                out.append(annotation.value()).append(" → ").append(method.getName())
                        .append("() → ").append(method.invoke(service)).append('\n');
            }
        }
        return out.append("观察：RUNTIME 注解在运行时可读；invoke 的目标异常会包装为 InvocationTargetException。\n")
                .append("框架常用反射发现元数据；普通业务调用优先使用可检查的直接调用。\n").toString();
    }
}
