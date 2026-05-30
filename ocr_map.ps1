# PowerShell script to perform OCR on the high-res map using native Windows.Media.Ocr via .GetAwaiter().GetResult()

try {
    Write-Host "Loading Windows.Media.Ocr assemblies..."
    [void][Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType=WindowsRuntime]
    [void][Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
    [void][Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType=WindowsRuntime]
    
    $imgPath = "d:\google antigravity\WHEELOFTIME\afavl8.jpeg"
    if (-not (Test-Path $imgPath)) {
        Write-Error "Map image not found at $imgPath"
        exit 1
    }

    Write-Host "Opening image file..."
    $fileStream = [System.IO.File]::OpenRead($imgPath)
    $memStream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
    
    # Copy file stream to WinRT random access stream
    $buffer = New-Object byte[] 65536
    while (($read = $fileStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
        $writer = New-Object Windows.Storage.Streams.DataWriter($memStream)
        $writer.WriteBytes($buffer[0..($read-1)])
        [void]$writer.StoreAsync().GetAwaiter().GetResult()
        [void]$writer.FlushAsync().GetAwaiter().GetResult()
    }
    $fileStream.Close()
    $memStream.Seek(0)
    
    Write-Host "Decoding image into SoftwareBitmap..."
    $decoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($memStream).GetAwaiter().GetResult()
    $softwareBitmap = $decoder.GetSoftwareBitmapAsync().GetAwaiter().GetResult()

    Write-Host "Initializing OCR Engine..."
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("en-US"))
    if ($null -eq $engine) {
        Write-Host "English OCR Engine not found. Initializing default OCR Engine..."
        $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
    }
    
    if ($null -eq $engine) {
        Write-Error "Failed to create Windows OCR Engine."
        exit 1
    }

    Write-Host "Running OCR Recognition (this might take a few seconds)..."
    $ocrResult = $engine.RecognizeAsync($softwareBitmap).GetAwaiter().GetResult()
    
    Write-Host "Processing OCR Results..."
    $results = @()
    
    foreach ($line in $ocrResult.Lines) {
        $words = @()
        foreach ($word in $line.Words) {
            $words += @{
                Text = $word.Text
                X = $word.BoundingRect.X
                Y = $word.BoundingRect.Y
                Width = $word.BoundingRect.Width
                Height = $word.BoundingRect.Height
            }
        }
        
        $results += @{
            Text = $line.Text
            X = $line.Words[0].BoundingRect.X
            Y = $line.Words[0].BoundingRect.Y
            Width = $line.Words[-1].BoundingRect.X + $line.Words[-1].BoundingRect.Width - $line.Words[0].BoundingRect.X
            Height = $line.Words[0].BoundingRect.Height
            Words = $words
        }
    }
    
    $jsonPath = "d:\google antigravity\WHEELOFTIME\ocr_raw_results.json"
    Write-Host "Saving OCR raw data ($($results.Count) lines) to $jsonPath..."
    $results | ConvertTo-Json -Depth 5 | Out-File $jsonPath -Encoding utf8
    
    Write-Host "OCR Completed Successfully!"
} catch {
    Write-Error "An error occurred during OCR: $_"
    if ($null -ne $fileStream) { $fileStream.Close() }
}
