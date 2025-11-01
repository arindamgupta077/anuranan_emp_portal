Add-Type -AssemblyName System.Drawing

# Create 192x192 icon
$bmp192 = New-Object System.Drawing.Bitmap(192, 192)
$graphics192 = [System.Drawing.Graphics]::FromImage($bmp192)
$graphics192.Clear([System.Drawing.Color]::FromArgb(220, 38, 38))
$graphics192.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$font192 = New-Object System.Drawing.Font("Arial", 80, [System.Drawing.FontStyle]::Bold)
$brush192 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics192.DrawString("A", $font192, $brush192, 50, 40)
$bmp192.Save("$PSScriptRoot\public\icon-192x192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics192.Dispose()
$bmp192.Dispose()
Write-Host "Created icon-192x192.png" -ForegroundColor Green

# Create 512x512 icon
$bmp512 = New-Object System.Drawing.Bitmap(512, 512)
$graphics512 = [System.Drawing.Graphics]::FromImage($bmp512)
$graphics512.Clear([System.Drawing.Color]::FromArgb(220, 38, 38))
$graphics512.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$font512 = New-Object System.Drawing.Font("Arial", 220, [System.Drawing.FontStyle]::Bold)
$brush512 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics512.DrawString("A", $font512, $brush512, 130, 100)
$bmp512.Save("$PSScriptRoot\public\icon-512x512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$graphics512.Dispose()
$bmp512.Dispose()
Write-Host "Created icon-512x512.png" -ForegroundColor Green

# Create favicon
$bmp32 = New-Object System.Drawing.Bitmap(32, 32)
$graphics32 = [System.Drawing.Graphics]::FromImage($bmp32)
$graphics32.Clear([System.Drawing.Color]::FromArgb(220, 38, 38))
$graphics32.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$font32 = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Bold)
$brush32 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics32.DrawString("A", $font32, $brush32, 6, 4)
$bmp32.Save("$PSScriptRoot\public\favicon.ico", [System.Drawing.Imaging.ImageFormat]::Icon)
$graphics32.Dispose()
$bmp32.Dispose()
Write-Host "Created favicon.ico" -ForegroundColor Green

Write-Host "`nAll icons created successfully!" -ForegroundColor Cyan
