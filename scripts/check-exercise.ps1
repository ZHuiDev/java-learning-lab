$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
    New-Item -ItemType Directory -Force -Path build/exercise-01 | Out-Null
    & javac --release 21 -encoding UTF-8 -d build/exercise-01 exercises/01-loan-policy/LoanPolicyExercise.java exercises/01-loan-policy/ExerciseCheck.java
    if ($LASTEXITCODE -ne 0) { throw '练习编译失败，先修复语法错误再检查。' }
    & java -cp build/exercise-01 ExerciseCheck
    $exerciseExit = $LASTEXITCODE
    if ($exerciseExit -ne 0) { Write-Host '检查未通过是练习初始状态。修改 LoanPolicyExercise.java 的 TODO 后重试。' -ForegroundColor Yellow }
} finally { Pop-Location }
exit $exerciseExit
