param([string]$Id = '')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
& (Join-Path $PSScriptRoot 'build.ps1') -SkipJar
& java -cp (Join-Path $projectRoot 'build/classes') lab.examples.LabRunner $Id
exit $LASTEXITCODE
