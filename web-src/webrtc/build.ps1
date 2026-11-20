# Rebuilds src_assets/common/assets/web/assets/webrtc.{js,css} (committed; server has no npm build step)
# and stamps their content hash into index.html, so browsers never run a stale cached client.
Push-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
try {
  $web = Resolve-Path ../../src_assets/common/assets/web
  npx --yes esbuild@0.24.0 main.ts --bundle --minify --target=es2020 --format=iife --outfile="$web/assets/webrtc.js"
  if ($LASTEXITCODE -ne 0) { throw "esbuild failed" }
  # 5 hex chars of each file's hash: a change to either file yields a new version.
  $v = ((Get-FileHash "$web/assets/webrtc.js", "$web/assets/webrtc.css" -Algorithm SHA256 | ForEach-Object { $_.Hash.Substring(0, 5) }) -join '').ToLower()
  $html = [IO.File]::ReadAllText("$web/index.html")
  $html = $html -replace '/assets/webrtc\.(js|css)(\?v=[0-9a-f]+)?', "/assets/webrtc.`$1?v=$v"
  [IO.File]::WriteAllText("$web/index.html", $html)
  Write-Host "Stamped bundle version $v"
} finally {
  Pop-Location
}
