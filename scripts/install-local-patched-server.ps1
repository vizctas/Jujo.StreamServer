param(
  [string]$ServiceName = "Jujo.Server",
  [string]$PatchedExe = "",
  [string]$InstallDir = "C:\Program Files\Jujo.Stream Server"
)

$ErrorActionPreference = "Stop"

$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "Run this script from an elevated PowerShell session."
}

$scriptDir = Split-Path -Parent $PSCommandPath
$repoRoot = Resolve-Path -LiteralPath (Join-Path $scriptDir "..")
if ([string]::IsNullOrWhiteSpace($PatchedExe)) {
  $PatchedExe = Join-Path $repoRoot "build-ninja\sunshine.exe"
}

$installedExe = Join-Path $InstallDir "sunshine.exe"
$statePath = Join-Path $InstallDir "config\jujoserver_state.json"

if (-not (Test-Path -LiteralPath $PatchedExe)) {
  throw "Patched executable not found: $PatchedExe"
}
if (-not (Test-Path -LiteralPath $installedExe)) {
  throw "Installed executable not found: $installedExe"
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$exeBackup = "$installedExe.bak-$stamp"

Stop-Service -Name $ServiceName -Force
Copy-Item -LiteralPath $installedExe -Destination $exeBackup -Force
Copy-Item -LiteralPath $PatchedExe -Destination $installedExe -Force

if (Test-Path -LiteralPath $statePath) {
  & (Join-Path $scriptDir "repair-game-source-state.ps1") -StatePath $statePath
}

Start-Service -Name $ServiceName
Write-Host "Installed patched server executable."
Write-Host "Executable backup: $exeBackup"
