param(
  [string]$ProjectPath = (Get-Location).Path,
  [string]$SkillPath = "",
  [string]$ConfigPath = ""
)

$ErrorActionPreference = 'Stop'

function Resolve-NodeScript {
  param([string]$ProjectPath, [string]$SkillPath)

  $projectScript = Join-Path $ProjectPath 'scripts\audit-local-order.mjs'
  if (Test-Path -LiteralPath $projectScript) {
    return $projectScript
  }

  if ($SkillPath) {
    $skillScript = Join-Path $SkillPath 'scripts\audit-local-order.mjs'
    if (Test-Path -LiteralPath $skillScript) {
      return $skillScript
    }
  }

  throw "Cannot find audit-local-order.mjs. Install project continuity first or pass -SkillPath."
}

$ProjectPath = (Resolve-Path -LiteralPath $ProjectPath).Path
$script = Resolve-NodeScript -ProjectPath $ProjectPath -SkillPath $SkillPath

if ($ConfigPath) {
  $env:CONTINUITY_STACK_CONFIG = (Resolve-Path -LiteralPath $ConfigPath).Path
}

Push-Location $ProjectPath
try {
  node $script
} finally {
  Pop-Location
}
