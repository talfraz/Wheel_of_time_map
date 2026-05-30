[Reflection.Assembly]::LoadWithPartialName("System.Drawing") | Out-Null
$srcPath = "d:\google antigravity\WHEELOFTIME\afavl8.jpeg"
$dstPath = "d:\google antigravity\WHEELOFTIME\legend_crop.png"

if (Test-Path $srcPath) {
    Write-Host "Opening image..."
    $src = [System.Drawing.Image]::FromFile($srcPath)
    Write-Host "Image size: $($src.Width) x $($src.Height)"
    
    # We want bottom-left corner. Let's crop X: 0 to 2200, Y: 3200 to 5079 (Height is 5079, Width is 7146)
    $cropRect = New-Object System.Drawing.Rectangle(0, 3200, 2200, 1879)
    Write-Host "Cropping rect: X=$($cropRect.X), Y=$($cropRect.Y), W=$($cropRect.Width), H=$($cropRect.Height)"
    
    $bmp = New-Object System.Drawing.Bitmap($cropRect.Width, $cropRect.Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $cropRect.Width, $cropRect.Height)
    $g.DrawImage($src, $destRect, $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    Write-Host "Saving cropped image to $dstPath..."
    $bmp.Save($dstPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g.Dispose()
    $bmp.Dispose()
    $src.Dispose()
    Write-Host "Done!"
} else {
    Write-Error "Source image not found at $srcPath"
}
