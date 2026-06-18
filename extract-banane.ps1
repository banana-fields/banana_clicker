Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot "images\logo-las-bananas-complet.png"
$out = Join-Path $PSScriptRoot "images\banane-seule.png"

$img = [System.Drawing.Image]::FromFile($src)
$w = $img.Width
$h = $img.Height
$cropSize = [int]([Math]::Min($w, $h) * 0.48)
$x = [int](($w - $cropSize) / 2)
$y = [int](($h - $cropSize) / 2 - ($h * 0.03))

$bmp = New-Object System.Drawing.Bitmap($cropSize, $cropSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = "HighQuality"
$g.InterpolationMode = "HighQualityBicubic"
$srcRect = New-Object System.Drawing.Rectangle($x, $y, $cropSize, $cropSize)
$dstRect = New-Object System.Drawing.Rectangle(0, 0, $cropSize, $cropSize)
$g.DrawImage($img, $dstRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$img.Dispose()

for ($py = 0; $py -lt $cropSize; $py++) {
  for ($px = 0; $px -lt $cropSize; $px++) {
    $c = $bmp.GetPixel($px, $py)
    $r = $c.R; $g2 = $c.G; $b = $c.B

    $isBlack = ($r -lt 40 -and $g2 -lt 40 -and $b -lt 40)
    $isTriangle = ($r -gt 210 -and $g2 -gt 160 -and $b -lt 100 -and ($r - $g2) -lt 50)

    if ($isBlack -or $isTriangle) {
      $bmp.SetPixel($px, $py, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    }
  }
}

$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Host "OK: $out"
