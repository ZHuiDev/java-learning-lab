$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
& (Join-Path $PSScriptRoot 'build.ps1') -SkipJar
Push-Location $projectRoot
try {
    New-Item -ItemType Directory -Force -Path build/test-classes | Out-Null
    $testSources = Get-ChildItem -LiteralPath src/test/java -Recurse -Filter '*.java' | Sort-Object FullName
    $testArgs = @('--release','21','--add-modules','jdk.httpserver','-encoding','UTF-8','-cp','build/classes','-d','build/test-classes') + @($testSources | ForEach-Object { '"' + $_.FullName.Replace('\','/') + '"' })
    [System.IO.File]::WriteAllLines((Join-Path $projectRoot 'build/tests.args'), $testArgs, [System.Text.UTF8Encoding]::new($false))
    & javac '@build/tests.args'
    if ($LASTEXITCODE -ne 0) { throw '测试编译失败。' }
    & java --add-modules jdk.httpserver -cp 'build/classes;build/test-classes' lab.TestSuite
    if ($LASTEXITCODE -ne 0) { throw '测试未通过，请阅读断言失败信息。' }
} finally { Pop-Location }
