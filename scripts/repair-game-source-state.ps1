param(
  [string]$StatePath = "C:\Program Files\Jujo.Stream Server\config\jujoserver_state.json"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path -LiteralPath $StatePath)) {
  throw "State file not found: $StatePath"
}

function Convert-LegacyBool($value) {
  if ($value -is [bool]) {
    return $value
  }
  if ($value -is [int] -or $value -is [long]) {
    return ($value -ne 0)
  }

  $text = ([string]$value).Trim().ToLowerInvariant()
  if ($text -in @("true", "1", "yes", "on")) {
    return $true
  }
  if ($text -in @("false", "0", "no", "off", "")) {
    return $false
  }
  return $false
}

function Convert-LegacyInt($value) {
  if ($value -is [int]) {
    return $value
  }

  $number = 0
  if ([int]::TryParse(([string]$value).Trim(), [ref]$number)) {
    return $number
  }
  return 0
}

function Set-BoolProp($obj, [string]$name) {
  if ($null -ne $obj -and $obj.PSObject.Properties.Name -contains $name) {
    $obj.$name = Convert-LegacyBool $obj.$name
  }
}

function Set-IntProp($obj, [string]$name) {
  if ($null -ne $obj -and $obj.PSObject.Properties.Name -contains $name) {
    $obj.$name = Convert-LegacyInt $obj.$name
  }
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = "$StatePath.bak-$stamp"
Copy-Item -LiteralPath $StatePath -Destination $backupPath -Force

$json = Get-Content -LiteralPath $StatePath -Raw | ConvertFrom-Json
$gameSources = $json.root.game_sources

if ($null -ne $gameSources) {
  Set-IntProp $gameSources "schemaVersion"
  $sources = $gameSources.sources

  if ($null -ne $sources) {
    foreach ($prop in $sources.PSObject.Properties) {
      $source = $prop.Value
      Set-BoolProp $source "connected"
      Set-BoolProp $source "disabled"
      Set-BoolProp $source "tokenEncrypted"
      Set-BoolProp $source "metadataAvailable"
      Set-IntProp $source "ownedGameCount"
      Set-IntProp $source "installedGameCount"
      Set-IntProp $source "playableGameCount"

      if ($null -ne $source.publicConfig) {
        Set-BoolProp $source.publicConfig "apiKeyConfigured"
        Set-BoolProp $source.publicConfig "webLoginLibraryCaptured"
        Set-IntProp $source.publicConfig "webOwnedAppCount"
      }

      if ($null -ne $source.games) {
        foreach ($game in $source.games) {
          Set-BoolProp $game "owned"
          Set-BoolProp $game "installed"
          Set-BoolProp $game "playable"
        }
      }
    }
  }
}

$json | ConvertTo-Json -Depth 80 | Set-Content -LiteralPath $StatePath -Encoding UTF8
Write-Host "Repaired game-source state."
Write-Host "Backup: $backupPath"
