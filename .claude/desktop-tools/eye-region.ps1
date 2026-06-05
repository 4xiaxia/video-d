$ErrorActionPreference = 'Stop'
$toolRoot = $PSScriptRoot
$python = Join-Path $toolRoot '.venv\Scripts\python.exe'
$script = Join-Path $toolRoot 'gui-support\grid_region.py'

Set-Location $toolRoot
& $python $script @args
