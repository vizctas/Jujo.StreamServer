param(
  [Parameter(Mandatory = $true)][string]$PatchedExe,
  [Parameter(Mandatory = $true)][ValidatePattern('^[A-Fa-f0-9]{64}$')][string]$ExpectedHash,
  [Parameter(Mandatory = $true)][ValidatePattern('^[A-Fa-f0-9]{64}$')][string]$ExpectedInstalledHash,
  [Parameter(Mandatory = $true)][string]$ResultPath,
  [switch]$ValidateOnly
)

$ErrorActionPreference = 'Stop'
$installDir = 'C:\Program Files\Jujo.Stream Server'
$installedExe = Join-Path $installDir 'sunshine.exe'
$serviceName = 'Jujo.Server'
$changed = $false
$stopped = $false
$backup = $null
$result = [ordered]@{ success = $false; rolledBack = $false; backup = $null; hash = $null; error = $null }

function Get-ServerState {
  $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:47989/serverinfo' -TimeoutSec 3
  $content = $response.Content
  if ($content -is [byte[]]) { $content = [Text.Encoding]::UTF8.GetString($content) }
  [xml]$document = $content
  if ($document.root.status_code -ne '200') { throw 'Server health response failed.' }
  return $document.root
}

try {
  $source = (Resolve-Path -LiteralPath $PatchedExe).Path
  if ($source -eq $installedExe) { throw 'Source must differ from installed executable.' }
  if ((Get-FileHash -LiteralPath $source).Hash -ne $ExpectedHash) { throw 'Source hash mismatch.' }
  if ((Get-FileHash -LiteralPath $installedExe).Hash -ne $ExpectedInstalledHash) { throw 'Installed binary changed since preparation.' }
  $service = Get-CimInstance Win32_Service -Filter "Name='$serviceName'"
  if ($service.PathName -notmatch '^"C:\\Program Files\\Jujo\.Stream Server\\tools\\sunshinesvc\.exe" --service$') {
    throw 'Unexpected service executable; refusing replacement.'
  }
  if ($service.State -ne 'Running') { throw 'Expected running service before deployment.' }
  $state = Get-ServerState
  if ($state.state -ne 'SUNSHINE_SERVER_FREE' -or $state.currentgame -ne '0') {
    throw 'Streaming or an application is active; refusing automatic interruption.'
  }
  if ($ValidateOnly) {
    Write-Output 'Validated source hash, installed hash, service path and idle server. No changes made.'
    return
  }
  $principal = [Security.Principal.WindowsPrincipal]::new([Security.Principal.WindowsIdentity]::GetCurrent())
  if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Normal Windows administrator elevation is required.'
  }
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
  $backup = Join-Path $installDir "rollback-$stamp"
  New-Item -ItemType Directory -Path $backup | Out-Null
  $result.backup = $backup
  Copy-Item -LiteralPath $installedExe -Destination (Join-Path $backup 'sunshine.exe')
  if ((Get-FileHash -LiteralPath (Join-Path $backup 'sunshine.exe')).Hash -ne $ExpectedInstalledHash) {
    throw 'Backup hash mismatch.'
  }
  $stopped = $true
  Stop-Service -Name $serviceName
  (Get-Service -Name $serviceName).WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))
  Copy-Item -LiteralPath (Join-Path $installDir 'config') -Destination (Join-Path $backup 'config') -Recurse
  # A failed copy can partially overwrite the destination, so arm rollback first.
  $changed = $true
  Copy-Item -LiteralPath $source -Destination $installedExe -Force
  if ((Get-FileHash -LiteralPath $installedExe).Hash -ne $ExpectedHash) { throw 'Installed hash mismatch.' }
  Start-Service -Name $serviceName
  (Get-Service -Name $serviceName).WaitForStatus('Running', [TimeSpan]::FromSeconds(30))
  $deadline = [DateTime]::UtcNow.AddSeconds(45)
  $healthy = $false
  do {
    try { $null = Get-ServerState; $healthy = $true } catch { Start-Sleep -Milliseconds 500 }
  } while (-not $healthy -and [DateTime]::UtcNow -lt $deadline)
  if (-not $healthy) { throw 'Server did not become healthy after restart.' }
  $runningBinary = Get-CimInstance Win32_Process -Filter "Name='sunshine.exe'" |
    Where-Object { $_.ExecutablePath -eq $installedExe }
  if (-not $runningBinary) { throw 'Installed server process was not found.' }
  $result.success = $true
  $result.hash = (Get-FileHash -LiteralPath $installedExe).Hash
} catch {
  $result.error = $_.Exception.Message
  if ($changed) {
    try {
      Stop-Service -Name $serviceName
      (Get-Service -Name $serviceName).WaitForStatus('Stopped', [TimeSpan]::FromSeconds(30))
      Copy-Item -LiteralPath (Join-Path $backup 'sunshine.exe') -Destination $installedExe -Force
      if ((Get-FileHash -LiteralPath $installedExe).Hash -ne $ExpectedInstalledHash) { throw 'Rollback hash mismatch.' }
      Start-Service -Name $serviceName
      (Get-Service -Name $serviceName).WaitForStatus('Running', [TimeSpan]::FromSeconds(30))
      $result.rolledBack = $true
    } catch { $result.error += '; rollback failed: ' + $_.Exception.Message }
  } elseif ($stopped) {
    try { Start-Service -Name $serviceName } catch { $result.error += '; restart failed: ' + $_.Exception.Message }
  }
} finally {
  if (-not $ValidateOnly) { $result | ConvertTo-Json | Set-Content -LiteralPath $ResultPath -Encoding UTF8 }
}
if (-not $result.success) { throw $result.error }
$result | ConvertTo-Json
