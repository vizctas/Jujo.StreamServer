param(
  [string]$ServiceName = "Jujo.Server",
  [string]$BuildDir = "",
  [string]$InstallDir = "C:\Program Files\Jujo.Stream Server",
  [string]$LogPath = ""
)

$ErrorActionPreference = "Stop"
if ($LogPath) { Start-Transcript -LiteralPath $LogPath -Force | Out-Null }

try {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = [Security.Principal.WindowsPrincipal]::new($identity)
  if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Run this script from an elevated PowerShell session."
  }

  $scriptDir = Split-Path -Parent $PSCommandPath
  if ([string]::IsNullOrWhiteSpace($BuildDir)) {
    $BuildDir = Join-Path (Resolve-Path -LiteralPath (Join-Path $scriptDir "..")) "build-ninja"
  }

  # Exe is mandatory; WebRTC runtime (dll + browser client) ships only when the build produced it.
  $items = @(
    @{ src = Join-Path $BuildDir "sunshine.exe"; dst = Join-Path $InstallDir "sunshine.exe"; required = $true },
    @{ src = Join-Path $BuildDir "libwebrtc.dll"; dst = Join-Path $InstallDir "libwebrtc.dll"; required = $false },
    @{ src = Join-Path $BuildDir "assets\web"; dst = Join-Path $InstallDir "assets\web"; required = $false }
  )
  foreach ($item in $items) {
    if ($item.required -and -not (Test-Path -LiteralPath $item.src)) { throw "Build output not found: $($item.src)" }
  }
  $statePath = Join-Path $InstallDir "config\jujoserver_state.json"

  $backup = Join-Path $InstallDir ("rollback-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
  New-Item -ItemType Directory -Path $backup | Out-Null

  Stop-Service -Name $ServiceName -Force
  (Get-Service -Name $ServiceName).WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))

  $installed = @()
  try {
    foreach ($item in $items) {
      if (-not (Test-Path -LiteralPath $item.src)) { continue }
      $name = Split-Path -Leaf $item.dst
      if (Test-Path -LiteralPath $item.dst) {
        Copy-Item -LiteralPath $item.dst -Destination (Join-Path $backup $name) -Recurse -Force
        if ((Get-Item -LiteralPath $item.dst).PSIsContainer) { Remove-Item -LiteralPath $item.dst -Recurse -Force }
      }
      $installed += $item
      New-Item -ItemType Directory -Force -Path (Split-Path -Parent $item.dst) | Out-Null
      Copy-Item -LiteralPath $item.src -Destination $item.dst -Recurse -Force
      Write-Host "Installed $name"
    }
    if (Test-Path -LiteralPath $statePath) {
      & (Join-Path $scriptDir "repair-game-source-state.ps1") -StatePath $statePath
    }
    Start-Service -Name $ServiceName
    (Get-Service -Name $ServiceName).WaitForStatus('Running', [TimeSpan]::FromSeconds(30))
  } catch {
    Write-Warning "Install failed, rolling back: $($_.Exception.Message)"
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    foreach ($item in $installed) {
      $saved = Join-Path $backup (Split-Path -Leaf $item.dst)
      Remove-Item -LiteralPath $item.dst -Recurse -Force -ErrorAction SilentlyContinue
      if (Test-Path -LiteralPath $saved) { Copy-Item -LiteralPath $saved -Destination $item.dst -Recurse -Force }
    }
    Start-Service -Name $ServiceName
    throw
  }

  Write-Host "Installed patched server. Backup: $backup"
} finally {
  if ($LogPath) { Stop-Transcript | Out-Null }
}
