# Kill any existing Vite dev server on the expected ports
5173..5179 | ForEach-Object {
  $port = $_
  $pids = netstat -ano 2>$null |
    Select-String ":$port\s" |
    ForEach-Object { ($_ -split '\s+')[-1] } |
    Select-Object -Unique
  foreach ($p in $pids) {
    if ($p -match '^\d+$' -and [int]$p -gt 0) {
      Stop-Process -Id ([int]$p) -Force -ErrorAction SilentlyContinue
    }
  }
}

# Auto-detect the Sunshine/Apollo backend HTTPS web-UI port.
# Port mapping: web UI HTTPS = base_port + 1  (confighttp::PORT_HTTPS = 1)
# Strategy: read each candidate config, then confirm that port is actually
# listening before using it.  Prefer the dev build over installed Apollo.
function Get-ConfigWebPort {
  param([string]$ConfPath, [int]$DefaultBase)
  $base = $DefaultBase
  if (Test-Path $ConfPath) {
    $line = Get-Content $ConfPath | Select-String '^\s*port\s*=' | Select-Object -First 1
    if ($line) {
      $base = [int]($line -replace '.*=\s*', '').Trim()
    }
  }
  return $base + 1
}

function Test-PortListening {
  param([int]$Port)
  $result = netstat -ano 2>$null | Select-String ":$Port\s.*LISTENING"
  return [bool]$result
}

$WorkspaceRoot = Split-Path -Parent $PSScriptRoot
$devConfPath    = Join-Path $WorkspaceRoot "build\config\sunshine.conf"
$apolloConfPath = "C:\Program Files\Apollo\config\sunshine.conf"

$devPort    = Get-ConfigWebPort -ConfPath $devConfPath    -DefaultBase 47989
$apolloPort = Get-ConfigWebPort -ConfPath $apolloConfPath -DefaultBase 47989

if (Test-PortListening -Port $devPort) {
  $env:VITE_SUNSHINE_PORT = "$devPort"
} elseif (Test-PortListening -Port $apolloPort) {
  $env:VITE_SUNSHINE_PORT = "$apolloPort"
} else {
  $env:VITE_SUNSHINE_PORT = "$devPort"   # nothing confirmed listening; use dev default
}

Write-Host "dev:live — proxying /api to https://127.0.0.1:$($env:VITE_SUNSHINE_PORT)"

# Start in live mode — proxies /api straight to the detected backend (no stubs)
npm run dev:live
