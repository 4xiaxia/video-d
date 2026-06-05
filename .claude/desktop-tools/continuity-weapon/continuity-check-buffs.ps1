param()

$ErrorActionPreference = 'Stop'
$script = Join-Path $PSScriptRoot 'check-suite-buffs.mjs'

if (-not (Test-Path -LiteralPath $script)) {
  throw "Cannot find suite buff checker: $script"
}

node $script
