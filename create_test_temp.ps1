# Create test temp_apps.toml without elevated = false
$testLines = @(
    '# Test file',
    '',
    '[[apps]]',
    'name = "Desktop"',
    '',
    '[[apps]]',
    'name = "Steam Big Picture"',
    'source = "steam"',
    'source_id = "bigpicture"',
    'image_path = "steam.png"',
    'detached = ["steam://open/bigpicture"]',
    '',
    '[[apps.prep_cmd]]',
    'do = ""',
    'undo = "steam://close/bigpicture"',
    '# Note: elevated = false is intentionally missing'
)

$testContent = $testLines -join "`n"
Set-Content -LiteralPath 'C:\Users\Jozh\repos\Jujo.StreamServer\temp_apps.toml' -Value $testContent -Encoding UTF8
Write-Host 'Created test temp_apps.toml without elevated = false'