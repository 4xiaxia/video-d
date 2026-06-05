param(
  [Parameter(Mandatory = $true)]
  [string]$SkillPath,
  [string]$Target = "",
  [switch]$Yes,
  [switch]$Replace
)

$ErrorActionPreference = 'Stop'

$SkillPath = (Resolve-Path -LiteralPath $SkillPath).Path
$installer = Join-Path $SkillPath 'scripts\install-system-skill.mjs'

if (-not (Test-Path -LiteralPath $installer)) {
  throw "Cannot find system installer: $installer"
}

$argsList = @()
if ($Target) {
  $argsList += @('--target', $Target)
}
if ($Yes) {
  $argsList += '--yes'
} else {
  $argsList += '--dry-run'
}
if ($Replace) {
  $argsList += '--replace'
}

node $installer @argsList
