param(
  [Parameter(Mandatory=$true)][string]$Version,
  [string]$CpackDir = "build-ninja/cpack_artifacts",
  [string]$OutputDir = "build-ninja/cpack_artifacts"
)

$ErrorActionPreference = "Stop"

function Resolve-FullPath([string]$Path) {
  return [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $Path))
}

$cpackRoot = Resolve-FullPath $CpackDir
$outputRoot = Resolve-FullPath $OutputDir
$packagesRoot = Join-Path $cpackRoot "_CPack_Packages"
$buildRoot = Split-Path -Parent $cpackRoot
$wixPayloadRoot = Join-Path $buildRoot "wix_payload"

if (-not (Test-Path -LiteralPath $packagesRoot)) {
  throw "CPack packages folder not found: $packagesRoot. Run package first."
}

$appEntry = Get-ChildItem -LiteralPath $packagesRoot -Recurse -File |
  Where-Object { $_.Name -ieq "sunshine.exe" } |
  Select-Object -First 1

if ($null -eq $appEntry) {
  throw "No sunshine.exe found under $packagesRoot."
}

$cpackStagingRoot = $appEntry.Directory.Parent.FullName
$svcSource = Join-Path $wixPayloadRoot "tools\sunshinesvc.exe"
$hasServiceWrapper = Test-Path -LiteralPath $svcSource
$entrypointName = if ($hasServiceWrapper) { "tools\sunshinesvc.exe" } else { "sunshine.exe" }
$serviceArguments = if ($hasServiceWrapper) { "--service" } else { "" }
$zipPath = Join-Path $outputRoot "Jujo.StreamServer-win-x64.zip"
$manifestPath = Join-Path $outputRoot "server-manifest.json"
$shaPath = Join-Path $outputRoot "SHA256SUMS.txt"
$stagingRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("jujo_stream_server_zip_{0}" -f ([System.Guid]::NewGuid().ToString("N")))

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

try {
  New-Item -ItemType Directory -Force -Path $stagingRoot | Out-Null
  
  # Copy and merge all CPack component directories into the staging root
  Get-ChildItem -LiteralPath $cpackStagingRoot -Directory | ForEach-Object {
    Copy-Item -Path (Join-Path $_.FullName "*") -Destination $stagingRoot -Recurse -Force
  }
  
  if ($hasServiceWrapper) {
    New-Item -ItemType Directory -Force -Path (Join-Path $stagingRoot "tools") | Out-Null
    Copy-Item -LiteralPath $svcSource -Destination (Join-Path $stagingRoot "tools\sunshinesvc.exe") -Force
  }

  if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }

  Compress-Archive -Path (Join-Path $stagingRoot "*") -DestinationPath $zipPath -Force
  $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $zipPath).Hash.ToLowerInvariant()

  $manifest = [ordered]@{
    product = "Jujo.StreamServer"
    version = $Version
    platform = "windows-x64"
    asset = "Jujo.StreamServer-win-x64.zip"
    sha256 = $hash
    entrypoint = $entrypointName
    serviceName = "Jujo.Server"
    serviceArguments = $serviceArguments
  }

  $manifest | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath $manifestPath -Encoding ascii
  Set-Content -LiteralPath $shaPath -Encoding ascii -Value @(
    "$hash  Jujo.StreamServer-win-x64.zip"
  )

  Write-Host "Server ZIP payload: $zipPath"
  Write-Host "Server manifest: $manifestPath"
  Write-Host "Entrypoint: $entrypointName $serviceArguments"
} finally {
  if (Test-Path -LiteralPath $stagingRoot) {
    Remove-Item -LiteralPath $stagingRoot -Recurse -Force
  }
}
