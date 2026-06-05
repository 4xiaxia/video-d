$ErrorActionPreference = 'Stop'
$toolRoot = $PSScriptRoot
$python = Join-Path $toolRoot '.venv\Scripts\python.exe'
$script = Join-Path $toolRoot 'gui-support\click_tool.py'

Set-Location $toolRoot
& $python $script @args
