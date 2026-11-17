# Rebuilds src_assets/common/assets/web/assets/webrtc.js (committed; server has no npm build step).
Push-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
try {
  npx --yes esbuild@0.24.0 main.ts --bundle --minify --target=es2020 --format=iife --outfile=../../src_assets/common/assets/web/assets/webrtc.js
} finally {
  Pop-Location
}
