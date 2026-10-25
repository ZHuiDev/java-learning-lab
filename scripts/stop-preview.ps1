$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$stateFile = Join-Path $projectRoot 'build/preview.json'
if (-not (Test-Path -LiteralPath $stateFile)) { Write-Host '没有本项目记录的后台预览。手动启动的终端请按 Ctrl+C。'; return }
$state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
$previewPid = [int]$state.processId
$running = Get-Process -Id $previewPid -ErrorAction SilentlyContinue
if (-not $running -or $running.StartTime.ToUniversalTime().Ticks.ToString() -ne $state.startTicks) {
    Remove-Item -LiteralPath $stateFile -Force
    Write-Host '后台预览已停止。'
    return
}
$details = Get-CimInstance Win32_Process -Filter "ProcessId = $previewPid"
if ($details.Name -notin @('java.exe','javaw.exe') -or $details.CommandLine -notmatch [regex]::Escape($projectRoot) -or $details.CommandLine -notmatch 'lab\.Main') {
    throw '进程与本项目后台预览不匹配，未停止任何进程。'
}
Stop-Process -Id $previewPid
Remove-Item -LiteralPath $stateFile -Force
Write-Host '本项目后台预览已停止。已完成的借阅数据仍保留。'
