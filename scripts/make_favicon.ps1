Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "..\public\logo-1.jpg"
$outFavicon = Join-Path $PSScriptRoot "..\public\favicon.png"
$outFavicon32 = Join-Path $PSScriptRoot "..\public\favicon-32x32.png"
$outRounded = Join-Path $PSScriptRoot "..\public\logo-rounded.png"
$outApple = Join-Path $PSScriptRoot "..\public\apple-touch-icon.png"

$src = [System.Drawing.Image]::FromFile((Resolve-Path $srcPath))
$size = 512
$bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::Transparent)

# Squircle radius like ChatGPT / iOS app icon
$radius = 112
$path = New-Object System.Drawing.Drawing2D.GraphicsPath
$path.AddArc(0, 0, $radius * 2, $radius * 2, 180, 90)
$path.AddArc($size - $radius * 2, 0, $radius * 2, $radius * 2, 270, 90)
$path.AddArc($size - $radius * 2, $size - $radius * 2, $radius * 2, $radius * 2, 0, 90)
$path.AddArc(0, $size - $radius * 2, $radius * 2, $radius * 2, 90, 90)
$path.CloseFigure()

$g.SetClip($path)
# Fill crisp pure white inside squircle
$g.FillPath([System.Drawing.Brushes]::White, $path)

# Draw image centered with balanced padding
$padding = 24
$drawSize = $size - ($padding * 2)
$g.DrawImage($src, $padding, $padding, $drawSize, $drawSize)

# Save high-res PNGs
$bmp.Save($outFavicon, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outRounded, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outApple, [System.Drawing.Imaging.ImageFormat]::Png)

# Generate 32x32 crisp favicon
$bmp32 = New-Object System.Drawing.Bitmap(32, 32, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g32 = [System.Drawing.Graphics]::FromImage($bmp32)
$g32.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g32.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g32.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g32.Clear([System.Drawing.Color]::Transparent)
$g32.DrawImage($bmp, 0, 0, 32, 32)
$bmp32.Save($outFavicon32, [System.Drawing.Imaging.ImageFormat]::Png)

$src.Dispose()
$g.Dispose()
$bmp.Dispose()
$g32.Dispose()
$bmp32.Dispose()

Write-Output "Successfully generated polished squircle favicons!"
