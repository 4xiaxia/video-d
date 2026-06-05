param(
  [string]$ProjectPath = (Get-Location).Path,
  [string]$SkillPath = ""
)

$ErrorActionPreference = 'Stop'

Write-Host "Continuity weapon doctor"
Write-Host "ProjectPath: $ProjectPath"
Write-Host "SkillPath: $SkillPath"
Write-Host ""

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
  Write-Host "OK node: $($node.Source)"
} else {
  Write-Host "MISSING node"
}

if ($SkillPath) {
  $skillFile = Join-Path $SkillPath 'SKILL.md'
  if (Test-Path -LiteralPath $skillFile) {
    Write-Host "OK skill: $skillFile"
  } else {
    Write-Host "MISSING skill: $skillFile"
  }
} else {
  Write-Host "SKIP skill: pass -SkillPath to check a rules package"
}

$projectAudit = Join-Path $ProjectPath 'scripts\audit-local-order.mjs'
if (Test-Path -LiteralPath $projectAudit) {
  Write-Host "OK project audit: $projectAudit"
} else {
  Write-Host "MISSING project audit: $projectAudit"
}

Write-Host ""
Write-Host "Run audit:"
if ($SkillPath) {
  & (Join-Path $PSScriptRoot 'continuity-audit.ps1') -ProjectPath $ProjectPath -SkillPath $SkillPath
} else {
  & (Join-Path $PSScriptRoot 'continuity-audit.ps1') -ProjectPath $ProjectPath
}
