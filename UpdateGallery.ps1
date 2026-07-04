# UpdateGallery v2.2
# Автономное обновление data/gallery.json для проекта Portfolio

$ErrorActionPreference = "Stop"

function Write-Info($text) {
    Write-Host $text -ForegroundColor Cyan
}

function Write-Ok($text) {
    Write-Host $text -ForegroundColor Green
}

function Write-Warn($text) {
    Write-Host $text -ForegroundColor Yellow
}

function Write-Err($text) {
    Write-Host $text -ForegroundColor Red
}

function Get-NaturalKey([string]$name) {
    # Делает естественную сортировку: 1, 2, 10 вместо 1, 10, 2
    return [regex]::Replace($name.ToLowerInvariant(), '\d+', {
        param($m)
        $m.Value.PadLeft(12, '0')
    })
}

try {
    Clear-Host

    Write-Info "========================================"
    Write-Info "UpdateGallery v2.2"
    Write-Info "========================================"
    Write-Host ""

    $ProjectDir = Split-Path -Parent $MyInvocation.MyCommand.Path

    $IndexFile = Join-Path $ProjectDir "index.html"
    $DataDir = Join-Path $ProjectDir "data"
    $ImagesGalleryDir = Join-Path $ProjectDir "images\gallery"
    $PdfDir = Join-Path $ProjectDir "pdf"
    $SectionsFile = Join-Path $DataDir "sections.json"
    $GalleryFile = Join-Path $DataDir "gallery.json"

    Write-Host "Папка проекта: $ProjectDir"
    Write-Host ""

    if (-not (Test-Path $IndexFile)) {
        Write-Err "Ошибка: рядом с программой не найден index.html"
        Write-Warn "Положите UpdateGallery.cmd и UpdateGallery.ps1 в корень проекта Portfolio."
        exit 1
    }

    if (-not (Test-Path $SectionsFile)) {
        Write-Err "Ошибка: не найден файл data\sections.json"
        exit 1
    }

    if (-not (Test-Path $ImagesGalleryDir)) {
        Write-Warn "Папка images\gallery не найдена. Создаю..."
        New-Item -ItemType Directory -Path $ImagesGalleryDir | Out-Null
    }

    Write-Info "Чтение sections.json..."

    $raw = Get-Content -Path $SectionsFile -Raw -Encoding UTF8
    $sections = $raw | ConvertFrom-Json

    if ($null -eq $sections) {
        Write-Err "Ошибка: sections.json пустой или повреждён."
        exit 1
    }

    # Если JSON содержит один объект, превращаем в массив.
    if ($sections -isnot [System.Array]) {
        $sections = @($sections)
    }

    $gallery = New-Object System.Collections.Generic.List[object]

    $totalSections = 0
    $totalImages = 0
    $missingFolders = 0
    $emptyFolders = 0
    $missingPdf = 0

    $extensions = @(".jpg", ".jpeg", ".png", ".webp")

    Write-Host ""
    Write-Info "Сканирование разделов..."
    Write-Host "----------------------------------------"

    foreach ($section in $sections) {
        $totalSections++

        $id = [string]$section.id
        $title = [string]$section.title
        $pdf = [string]$section.pdf

        if ([string]::IsNullOrWhiteSpace($id)) {
            Write-Warn "Раздел без id пропущен."
            continue
        }

        if ([string]::IsNullOrWhiteSpace($title)) {
            $title = $id
        }

        $folder = Join-Path $ImagesGalleryDir $id

        if (-not (Test-Path $folder)) {
            $missingFolders++
            Write-Warn ("{0,-30} папка отсутствует ({1})" -f $title, "images\gallery\$id")
            continue
        }

        $files = Get-ChildItem -Path $folder -File |
            Where-Object { $extensions -contains $_.Extension.ToLowerInvariant() } |
            Sort-Object @{ Expression = { Get-NaturalKey $_.Name } }

        if ($files.Count -eq 0) {
            $emptyFolders++
            Write-Warn ("{0,-30} пустая папка" -f $title)
        }
        else {
            Write-Ok ("{0,-30} {1} изображ." -f $title, $files.Count)
        }

        foreach ($file in $files) {
            $gallery.Add([ordered]@{
                file = ("images/gallery/{0}/{1}" -f $id, $file.Name)
                section = $id
                name = $file.Name
            })
            $totalImages++
        }

        if (-not [string]::IsNullOrWhiteSpace($pdf)) {
            $pdfPath = Join-Path $ProjectDir $pdf.Replace("/", "\")
            if (-not (Test-Path $pdfPath)) {
                $missingPdf++
                Write-Warn ("{0,-30} PDF отсутствует ({1})" -f $title, $pdf)
            }
        }
    }

    Write-Host "----------------------------------------"

    if (-not (Test-Path $DataDir)) {
        New-Item -ItemType Directory -Path $DataDir | Out-Null
    }

    $json = $gallery | ConvertTo-Json -Depth 5
    Set-Content -Path $GalleryFile -Value $json -Encoding UTF8

    Write-Host ""
    Write-Ok "gallery.json создан успешно."
    Write-Host ""
    Write-Info "Итог:"
    Write-Host ("Разделов:          {0}" -f $totalSections)
    Write-Host ("Изображений:       {0}" -f $totalImages)
    Write-Host ("Папок отсутствует: {0}" -f $missingFolders)
    Write-Host ("Пустых папок:      {0}" -f $emptyFolders)
    Write-Host ("PDF отсутствует:   {0}" -f $missingPdf)

    if ($totalImages -eq 0) {
        Write-Warn "Внимание: изображения не найдены."
    }
    else {
        Write-Ok "Обновление завершено. Можно проверять сайт."
    }
}
catch {
    Write-Host ""
    Write-Err "Ошибка:"
    Write-Err $_.Exception.Message
    Write-Host ""
}
