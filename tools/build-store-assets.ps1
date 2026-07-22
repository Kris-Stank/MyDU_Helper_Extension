$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$workspaceRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$storeAssets = Join-Path $workspaceRoot "store\assets"
$storeScreenshots = Join-Path $workspaceRoot "store\screenshots"
$sourceAssets = Join-Path $workspaceRoot "src\assets"
$conceptPath = Join-Path $workspaceRoot "design\mydu-helper-concept.png"
$templatesSource = Join-Path $workspaceRoot "store\source\templates-reference.png"

New-Item -ItemType Directory -Force -Path $storeAssets, $storeScreenshots | Out-Null

function New-RoundedPath {
  param([float]$X,[float]$Y,[float]$Width,[float]$Height,[float]$Radius)
  $diameter = $Radius * 2
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($X,$Y,$diameter,$diameter,180,90)
  $path.AddArc($X+$Width-$diameter,$Y,$diameter,$diameter,270,90)
  $path.AddArc($X+$Width-$diameter,$Y+$Height-$diameter,$diameter,$diameter,0,90)
  $path.AddArc($X,$Y+$Height-$diameter,$diameter,$diameter,90,90)
  $path.CloseFigure()
  return $path
}

function New-Canvas {
  param([int]$Width,[int]$Height)
  return New-Object System.Drawing.Bitmap($Width,$Height,[System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
}

function Initialize-Graphics {
  param([System.Drawing.Bitmap]$Bitmap)
  $graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  return $graphics
}

function Save-Png {
  param([System.Drawing.Bitmap]$Bitmap,[string]$Path)
  $Bitmap.Save($Path,[System.Drawing.Imaging.ImageFormat]::Png)
}

function Draw-GradientBackground {
  param([System.Drawing.Graphics]$Graphics,[int]$Width,[int]$Height,[System.Drawing.Color]$Start,[System.Drawing.Color]$End)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    (New-Object System.Drawing.PointF(0,0)),
    (New-Object System.Drawing.PointF($Width,$Height)),
    $Start,$End
  )
  try { $Graphics.FillRectangle($brush,0,0,$Width,$Height) } finally { $brush.Dispose() }
}

function Draw-Pill {
  param([System.Drawing.Graphics]$Graphics,[float]$X,[float]$Y,[float]$Width,[string]$Text)
  $path = New-RoundedPath -X $X -Y $Y -Width $Width -Height 38 -Radius 19
  $fill = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(38,255,255,255))
  $border = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70,255,255,255),1)
  $font = New-Object System.Drawing.Font("Segoe UI",11,[System.Drawing.FontStyle]::Bold)
  $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  try {
    $Graphics.FillPath($fill,$path); $Graphics.DrawPath($border,$path)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $Graphics.DrawString($Text,$font,$textBrush,(New-Object System.Drawing.RectangleF($X,$Y,$Width,38)),$format)
    $format.Dispose()
  } finally { $path.Dispose();$fill.Dispose();$border.Dispose();$font.Dispose();$textBrush.Dispose() }
}

# Screenshot 1: safe concept with synthetic applicant data.
$concept = [System.Drawing.Image]::FromFile($conceptPath)
$screenshot1 = New-Canvas -Width 1280 -Height 800
$graphics1 = Initialize-Graphics -Bitmap $screenshot1
try {
  $sourceHeight = [int][math]::Round($concept.Width / 1.6)
  $sourceY = [int](($concept.Height - $sourceHeight) / 2)
  $graphics1.DrawImage($concept,(New-Object System.Drawing.Rectangle(0,0,1280,800)),(New-Object System.Drawing.Rectangle(0,$sourceY,$concept.Width,$sourceHeight)),[System.Drawing.GraphicsUnit]::Pixel)
  Save-Png -Bitmap $screenshot1 -Path (Join-Path $storeScreenshots "01-checks.png")
} finally { $graphics1.Dispose();$screenshot1.Dispose();$concept.Dispose() }

# Screenshot 2: actual template screen placed on a privacy-safe branded canvas.
if (-not (Test-Path -LiteralPath $templatesSource)) { throw "Template screenshot source not found: $templatesSource" }
$templateImage = [System.Drawing.Image]::FromFile($templatesSource)
$screenshot2 = New-Canvas -Width 1280 -Height 800
$graphics2 = Initialize-Graphics -Bitmap $screenshot2
try {
  Draw-GradientBackground -Graphics $graphics2 -Width 1280 -Height 800 -Start ([System.Drawing.Color]::FromArgb(255,4,54,144)) -End ([System.Drawing.Color]::FromArgb(255,8,145,250))
  $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
  $softWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220,255,255,255))
  $labelFont = New-Object System.Drawing.Font("Segoe UI",12,[System.Drawing.FontStyle]::Bold)
  $titleFont = New-Object System.Drawing.Font("Segoe UI",36,[System.Drawing.FontStyle]::Bold)
  $bodyFont = New-Object System.Drawing.Font("Segoe UI",17,[System.Drawing.FontStyle]::Regular)
  $logo = [System.Drawing.Image]::FromFile((Join-Path $storeAssets "icon128.png"))
  try {
    $graphics2.DrawImage($logo,68,54,82,82)
    $graphics2.DrawString("MYDU MANAGER HELPER",$labelFont,$softWhite,68,160)
    $graphics2.DrawString("Комментарии на`nтрёх языках",$titleFont,$white,64,195)
    $bodyRect = New-Object System.Drawing.RectangleF(68,318,590,112)
    $graphics2.DrawString("Интерфейс и названия ошибок остаются на русском. Меняется только текст комментария для абитуриента.",$bodyFont,$softWhite,$bodyRect)
    Draw-Pill -Graphics $graphics2 -X 68 -Y 458 -Width 134 -Text "РУС · Русский"
    Draw-Pill -Graphics $graphics2 -X 214 -Y 458 -Width 146 -Text "ҚАЗ · Қазақша"
    Draw-Pill -Graphics $graphics2 -X 372 -Y 458 -Width 138 -Text "ENG · English"
    Draw-Pill -Graphics $graphics2 -X 68 -Y 516 -Width 196 -Text "Локальная работа"
    Draw-Pill -Graphics $graphics2 -X 276 -Y 516 -Width 218 -Text "Без передачи данных"

    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45,0,22,71))
    $shadowPath = New-RoundedPath -X 778 -Y 29 -Width 442 -Height 762 -Radius 31
    $graphics2.FillPath($shadowBrush,$shadowPath)
    $panelPath = New-RoundedPath -X 770 -Y 20 -Width 442 -Height 762 -Radius 31
    $graphics2.SetClip($panelPath)
    $sourceRect = New-Object System.Drawing.Rectangle(28,30,526,907)
    $destRect = New-Object System.Drawing.Rectangle(770,20,442,762)
    $graphics2.DrawImage($templateImage,$destRect,$sourceRect,[System.Drawing.GraphicsUnit]::Pixel)
    $graphics2.ResetClip()
    $panelBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100,255,255,255),1)
    $graphics2.DrawPath($panelBorder,$panelPath)
    $panelBorder.Dispose();$panelPath.Dispose();$shadowPath.Dispose();$shadowBrush.Dispose()
  } finally { $logo.Dispose();$white.Dispose();$softWhite.Dispose();$labelFont.Dispose();$titleFont.Dispose();$bodyFont.Dispose() }
  Save-Png -Bitmap $screenshot2 -Path (Join-Path $storeScreenshots "02-templates.png")
} finally { $graphics2.Dispose();$screenshot2.Dispose();$templateImage.Dispose() }

function New-PromoImage {
  param([int]$Width,[int]$Height,[string]$Destination,[bool]$Compact)
  $bitmap = New-Canvas -Width $Width -Height $Height
  $graphics = Initialize-Graphics -Bitmap $bitmap
  $icon = [System.Drawing.Image]::FromFile((Join-Path $storeAssets "icon128.png"))
  $mascot = [System.Drawing.Image]::FromFile((Join-Path $sourceAssets "mascot-smile.png"))
  try {
    Draw-GradientBackground -Graphics $graphics -Width $Width -Height $Height -Start ([System.Drawing.Color]::FromArgb(255,4,52,139)) -End ([System.Drawing.Color]::FromArgb(255,7,151,249))
    $circleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26,255,255,255))
    $graphics.FillEllipse($circleBrush,$Width-([int]($Height*.9)),-([int]($Height*.33)),[int]($Height*1.15),[int]($Height*1.15))
    $graphics.FillEllipse($circleBrush,-([int]($Height*.35)),$Height-([int]($Height*.42)),[int]($Height*.75),[int]($Height*.75))
    if ($Compact) {
      $graphics.DrawImage($icon,24,23,54,54)
      $titleFont = New-Object System.Drawing.Font("Segoe UI",22,[System.Drawing.FontStyle]::Bold)
      $bodyFont = New-Object System.Drawing.Font("Segoe UI",11,[System.Drawing.FontStyle]::Regular)
      $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
      $softWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(225,255,255,255))
      $graphics.DrawString("MyDU Manager`nHelper",$titleFont,$white,23,91)
      $graphics.DrawString("Локальная проверка заявлений`nи документов",$bodyFont,$softWhite,25,167)
      $graphics.DrawImage($mascot,270,42,188,226)
    } else {
      $graphics.DrawImage($icon,86,78,96,96)
      $labelFont = New-Object System.Drawing.Font("Segoe UI",14,[System.Drawing.FontStyle]::Bold)
      $titleFont = New-Object System.Drawing.Font("Segoe UI",43,[System.Drawing.FontStyle]::Bold)
      $bodyFont = New-Object System.Drawing.Font("Segoe UI",20,[System.Drawing.FontStyle]::Regular)
      $white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
      $softWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(225,255,255,255))
      $graphics.DrawString("ЛОКАЛЬНЫЙ ПОМОЩНИК ПРИЁМНОЙ КОМИССИИ",$labelFont,$softWhite,212,91)
      $graphics.DrawString("MyDU Manager Helper",$titleFont,$white,84,195)
      $graphics.DrawString("Проверка заявлений, документов и комментариев без передачи данных во внешние сервисы.",$bodyFont,$softWhite,(New-Object System.Drawing.RectangleF(88,276,850,86)))
      Draw-Pill -Graphics $graphics -X 88 -Y 392 -Width 170 -Text "Локальный OCR"
      Draw-Pill -Graphics $graphics -X 272 -Y 392 -Width 178 -Text "РУС · ҚАЗ · ENG"
      Draw-Pill -Graphics $graphics -X 464 -Y 392 -Width 150 -Text "Версия 1.4.0"
      $graphics.DrawImage($mascot,1010,20,420,510)
    }
    Save-Png -Bitmap $bitmap -Path $Destination
  } finally {
    if ($circleBrush) { $circleBrush.Dispose() }
    if ($labelFont) { $labelFont.Dispose() }
    if ($titleFont) { $titleFont.Dispose() }
    if ($bodyFont) { $bodyFont.Dispose() }
    if ($white) { $white.Dispose() }
    if ($softWhite) { $softWhite.Dispose() }
    $icon.Dispose();$mascot.Dispose();$graphics.Dispose();$bitmap.Dispose()
  }
}

New-PromoImage -Width 440 -Height 280 -Destination (Join-Path $storeAssets "promo-small-440x280.png") -Compact $true
New-PromoImage -Width 1400 -Height 560 -Destination (Join-Path $storeAssets "promo-marquee-1400x560.png") -Compact $false

Write-Output "Store assets generated in $storeAssets and $storeScreenshots"
