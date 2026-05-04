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

# Start fresh
npm run dev
