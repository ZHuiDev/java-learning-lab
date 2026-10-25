param([ValidateRange(1,65535)][int]$Port = 8787, [switch]$SkipBuild)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$stateFile = Join-Path $projectRoot 'build/preview.json'
if (Test-Path -LiteralPath $stateFile) {
    $previous = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
    $existing = Get-Process -Id ([int]$previous.processId) -ErrorAction SilentlyContinue
    if ($existing -and $existing.StartTime.ToUniversalTime().Ticks.ToString() -eq $previous.startTicks) {
        Write-Host "后台学习页面已运行：http://127.0.0.1:$($previous.port)/"
        return
    }
}
if (-not $SkipBuild) { & (Join-Path $PSScriptRoot 'build.ps1') }
$classes = Join-Path $projectRoot 'build/classes'
if (-not (Test-Path -LiteralPath (Join-Path $classes 'lab/Main.class'))) { throw '缺少编译结果，请先运行 build.ps1。' }
$outLog = Join-Path $projectRoot 'build/preview.log'
$errorLog = Join-Path $projectRoot 'build/preview-error.log'
$javaCommand = (Get-Command java -ErrorAction Stop).Source
$arguments = @('--add-modules', 'jdk.httpserver', '-cp', ('"' + $classes + '"'), 'lab.Main', '--root', ('"' + $projectRoot + '"'), '--port', $Port.ToString())
$previewProcess = Start-Process -FilePath $javaCommand -ArgumentList $arguments -WindowStyle Hidden -PassThru -RedirectStandardOutput $outLog -RedirectStandardError $errorLog
try {
    $started = $false
    for ($attempt = 0; $attempt -lt 20; $attempt++) {
        if ($previewProcess.HasExited) { throw "Java 启动失败，请查看 $errorLog" }
        try {
            $health = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/api/health" -TimeoutSec 1
            if ($health.status -eq 'ok') { $started = $true; break }
        } catch { Start-Sleep -Milliseconds 200 }
    }
    if (-not $started) { throw '后台预览未能启动，请查看 build/preview-error.log。' }
    @{processId = $previewProcess.Id; startTicks = $previewProcess.StartTime.ToUniversalTime().Ticks.ToString(); port = $Port; root = $projectRoot} | ConvertTo-Json | Set-Content -LiteralPath $stateFile -Encoding UTF8
    Write-Host "后台学习页面：http://127.0.0.1:$Port/"
    Write-Host '停止方式：双击 停止后台预览.cmd，或运行 .\scripts\stop-preview.ps1。'
} catch {
    if (-not $previewProcess.HasExited) { $previewProcess.Kill() }
    throw
}
