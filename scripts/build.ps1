param([switch]$SkipJar)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
    if (-not (Get-Command javac -ErrorAction SilentlyContinue)) { throw '未找到 javac。请安装 JDK 21 并配置 PATH；只有 JRE 无法构建。' }
    $compilerVersion = (& javac -version 2>&1 | Out-String).Trim()
    if ($compilerVersion -notmatch 'javac (\d+)' -or [int]$Matches[1] -lt 21) { throw "需要 JDK 21 或更高版本，当前为 $compilerVersion" }
    $classesPath = Join-Path $projectRoot 'build/classes'
    if (Test-Path -LiteralPath $classesPath) {
        $resolvedClasses = (Resolve-Path -LiteralPath $classesPath).ProviderPath
        $expectedClasses = [IO.Path]::GetFullPath($classesPath)
        if ($resolvedClasses -ne $expectedClasses -or -not $resolvedClasses.StartsWith($projectRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) {
            throw '构建输出目录不在预期项目路径内，已停止清理。'
        }
        Remove-Item -LiteralPath $resolvedClasses -Recurse -Force
    }
    New-Item -ItemType Directory -Force -Path $classesPath | Out-Null
    $sourceFiles = Get-ChildItem -LiteralPath src/main/java -Recurse -Filter '*.java' | Sort-Object FullName
    $argLines = @('--release','21','--add-modules','jdk.httpserver','-encoding','UTF-8','-d','build/classes') + @($sourceFiles | ForEach-Object { '"' + $_.FullName.Replace('\','/') + '"' })
    [System.IO.File]::WriteAllLines((Join-Path $projectRoot 'build/sources.args'), $argLines, [System.Text.UTF8Encoding]::new($false))
    & javac '@build/sources.args'
    if ($LASTEXITCODE -ne 0) { throw 'Java 编译失败，请根据上方错误修改源码。' }
    if (-not $SkipJar) {
        & jar --create --file build/java-learning-lab.jar --main-class lab.Main -C build/classes .
        if ($LASTEXITCODE -ne 0) { throw 'JAR 打包失败。' }
    }
    Write-Host "构建成功：$compilerVersion" -ForegroundColor Green
} finally { Pop-Location }
