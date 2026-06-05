$ErrorActionPreference = 'Stop'
$appRoot = $PSScriptRoot
$python = Join-Path $appRoot '.venv\Scripts\python.exe'
$script = Join-Path $appRoot 'app.py'

Set-Location $appRoot
& $python $script
