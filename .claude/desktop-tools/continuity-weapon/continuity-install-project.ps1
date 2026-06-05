param(
  [string]$ProjectPath = (Get-Location).Path,
  [Parameter(Mandatory = $true)]
  [string]$SkillPath
)

$ErrorActionPreference = 'Stop'

$ProjectPath = (Resolve-Path -LiteralPath $ProjectPath).Path
$SkillPath = (Resolve-Path -LiteralPath $SkillPath).Path
$installer = Join-Path $SkillPath 'scripts\install-continuity-standard.mjs'

if (-not (Test-Path -LiteralPath $installer)) {
  throw "Cannot find installer: $installer"
}

Push-Location $ProjectPath
try {
  node $installer
} finally {
  Pop-Location
}
