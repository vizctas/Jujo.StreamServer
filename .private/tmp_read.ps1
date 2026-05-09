$lines = Get-Content 'c:\Users\Jozh\repos\Jujo.StreamServer\src\process.cpp'
for ($i = 3069; $i -le 3083; $i++) {
    Write-Host ("{0}|{1}" -f ($i + 1), $lines[$i])
}
