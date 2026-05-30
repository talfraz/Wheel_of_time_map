# Robust PowerShell script to perform OCR using native Windows.Media.Ocr with generic AsTask reflection (foolproof foreach logic)

try {
    Write-Host "Loading WinRT assemblies..."
    [void][Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime]
    [void][Windows.Storage.Streams.IRandomAccessStream, Windows.Storage.Streams, ContentType=WindowsRuntime]
    [void][Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType=WindowsRuntime]
    [void][Windows.Globalization.Language, Windows.Globalization, ContentType=WindowsRuntime]
    [void][Windows.Media.Ocr.OcrEngine, Windows.Media.Ocr, ContentType=WindowsRuntime]
    
    # Load WindowsRuntime assembly for AsTask
    $winrtAssembly = [System.Reflection.Assembly]::Load("System.Runtime.WindowsRuntime, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089")
    $extType = $winrtAssembly.GetType("System.WindowsRuntimeSystemExtensions")
    
    # Helper function to invoke WinRT generic AsTask in PowerShell
    function Await-WinRT($asyncOp, $resultType) {
        $asTaskMethods = $extType.GetMethods() | Where-Object { $_.Name -eq "AsTask" }
        $method = $asTaskMethods | Where-Object { 
            $params = $_.GetParameters()
            $params.Length -eq 1 -and 
            $params[0].ParameterType.Name.StartsWith("IAsyncOperation") -and
            $_.GetGenericArguments().Length -eq 1
        }
        
        if ($null -eq $method) {
            throw "Could not find generic AsTask method for IAsyncOperation with 1 generic argument."
        }
        
        $genericMethod = $method.MakeGenericMethod($resultType)
        $task = $genericMethod.Invoke($null, @($asyncOp))
        
        # Wait for the task to complete
        $task.Wait()
        return $task.Result
    }

    $imgPath = "d:\google antigravity\WHEELOFTIME\afavl8.jpeg"
    if (-not (Test-Path $imgPath)) {
        Write-Error "Map image not found at $imgPath"
        exit 1
    }

    Write-Host "Opening image file natively via WinRT StorageFile..."
    $fileAsync = [Windows.Storage.StorageFile]::GetFileFromPathAsync($imgPath)
    $file = Await-WinRT $fileAsync ([Windows.Storage.StorageFile])
    
    Write-Host "Opening file stream..."
    $streamAsync = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    $stream = Await-WinRT $streamAsync ([Windows.Storage.Streams.IRandomAccessStream])
    
    Write-Host "Decoding image into SoftwareBitmap..."
    $decoderAsync = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    $decoder = Await-WinRT $decoderAsync ([Windows.Graphics.Imaging.BitmapDecoder])
    
    $bitmapAsync = $decoder.GetSoftwareBitmapAsync()
    $softwareBitmap = Await-WinRT $bitmapAsync ([Windows.Graphics.Imaging.SoftwareBitmap])

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

    Write-Host "Running OCR Recognition (this will take a few seconds on a 7K image)..."
    $ocrAsync = $engine.RecognizeAsync($softwareBitmap)
    $ocrResult = Await-WinRT $ocrAsync ([Windows.Media.Ocr.OcrResult])
    
    Write-Host "Processing OCR Results..."
    $results = @()
    
    foreach ($line in $ocrResult.Lines) {
        $firstWord = $null
        $lastWord = $null
        $words = @()
        
        foreach ($word in $line.Words) {
            if ($null -eq $firstWord) { $firstWord = $word }
            $lastWord = $word
            
            $words += @{
                Text = $word.Text
                X = $word.BoundingRect.X
                Y = $word.BoundingRect.Y
                Width = $word.BoundingRect.Width
                Height = $word.BoundingRect.Height
            }
        }
        
        if ($null -ne $firstWord) {
            $results += @{
                Text = $line.Text
                X = $firstWord.BoundingRect.X
                Y = $firstWord.BoundingRect.Y
                Width = $lastWord.BoundingRect.X + $lastWord.BoundingRect.Width - $firstWord.BoundingRect.X
                Height = $firstWord.BoundingRect.Height
                Words = $words
            }
        }
    }
    
    $jsonPath = "d:\google antigravity\WHEELOFTIME\ocr_raw_results.json"
    Write-Host "Saving OCR raw data ($($results.Count) lines) to $jsonPath..."
    $results | ConvertTo-Json -Depth 5 | Out-File $jsonPath -Encoding utf8
    
    Write-Host "OCR Completed Successfully!"
} catch {
    Write-Error "An error occurred during OCR: $_"
}
