param([ValidateRange(1,65535)][int]$Port = 8787)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
& (Join-Path $PSScriptRoot 'build.ps1') -SkipJar
if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "学习页面：http://127.0.0.1:$Port （Ctrl+C 停止）" -ForegroundColor Cyan
& java --add-modules jdk.httpserver -cp (Join-Path $projectRoot 'build/classes') lab.Main --root $projectRoot --port $Port
exit $LASTEXITCODE
