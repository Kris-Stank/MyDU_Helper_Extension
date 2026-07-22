param(
  [string]$Version = "1.4.0"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$workspaceRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$assetsDirectory = Join-Path $workspaceRoot "src\assets"
$storeAssetsDirectory = Join-Path $workspaceRoot "store\assets"
$storeSourceDirectory = Join-Path $workspaceRoot "store\source"
$releaseDirectory = Join-Path $workspaceRoot "release"
$manifestPath = Join-Path $workspaceRoot "manifest.json"

New-Item -ItemType Directory -Force -Path $storeAssetsDirectory, $storeSourceDirectory, $releaseDirectory | Out-Null

function New-RoundedRectanglePath {
  param([System.Drawing.RectangleF]$Rectangle, [float]$Radius)
  $diameter = $Radius * 2
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($Rectangle.X, $Rectangle.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($Rectangle.Right - $diameter, $Rectangle.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($Rectangle.Right - $diameter, $Rectangle.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($Rectangle.X, $Rectangle.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function New-MasterIcon {
  param([string]$Destination)
  $size = 512
  $bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $logo = [System.Drawing.Image]::FromFile((Join-Path $assetsDirectory "aitu-logo.png"))
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)

    $backgroundRect = New-Object System.Drawing.RectangleF(6, 6, 500, 500)
    $backgroundPath = New-RoundedRectanglePath -Rectangle $backgroundRect -Radius 105
    $backgroundBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
      (New-Object System.Drawing.PointF(40, 30)),
      (New-Object System.Drawing.PointF(470, 490)),
      ([System.Drawing.Color]::FromArgb(255, 5, 61, 158)),
      ([System.Drawing.Color]::FromArgb(255, 8, 139, 250))
    )
    $graphics.FillPath($backgroundBrush, $backgroundPath)

    $circleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $graphics.FillEllipse($circleBrush, 58, 58, 396, 396)

    $targetHeight = 338
    $targetWidth = [int][math]::Round($targetHeight * $logo.Width / $logo.Height)
    $targetX = [int](($size - $targetWidth) / 2)
    $targetY = [int](($size - $targetHeight) / 2)
    $graphics.DrawImage($logo, $targetX, $targetY, $targetWidth, $targetHeight)
    $bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    if ($circleBrush) { $circleBrush.Dispose() }
    if ($backgroundBrush) { $backgroundBrush.Dispose() }
    if ($backgroundPath) { $backgroundPath.Dispose() }
    $logo.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

function Resize-Png {
  param([string]$Source, [string]$Destination, [int]$Size)
  $sourceImage = [System.Drawing.Image]::FromFile($Source)
  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($sourceImage, 0, 0, $Size, $Size)
    $bitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
  }
  finally {
    $graphics.Dispose()
    $bitmap.Dispose()
    $sourceImage.Dispose()
  }
}

$masterIcon = Join-Path $storeSourceDirectory "icon-master-512.png"
New-MasterIcon -Destination $masterIcon
foreach ($size in 16, 32, 48, 128) {
  Resize-Png -Source $masterIcon -Destination (Join-Path $assetsDirectory "icon$size.png") -Size $size
}
Copy-Item -LiteralPath (Join-Path $assetsDirectory "icon128.png") -Destination (Join-Path $storeAssetsDirectory "icon128.png") -Force

$manifest = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
if ($manifest.version -ne $Version) {
  throw "Manifest version $($manifest.version) does not match requested release $Version."
}

$zipPath = Join-Path $releaseDirectory "MyDU-Manager-Helper-$Version.zip"
$resolvedZipPath = [System.IO.Path]::GetFullPath($zipPath)
if (-not $resolvedZipPath.StartsWith($workspaceRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Release path is outside the workspace: $resolvedZipPath"
}
if (Test-Path -LiteralPath $resolvedZipPath) {
  Remove-Item -LiteralPath $resolvedZipPath -Force
}

$archive = [System.IO.Compression.ZipFile]::Open($resolvedZipPath, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  $packageFiles = @($manifestPath)
  $packageFiles += Join-Path $workspaceRoot "THIRD_PARTY_NOTICES.txt"
  $packageFiles += Join-Path $workspaceRoot "licenses\tessdata-MIT.txt"
  $packageFiles += Get-ChildItem -LiteralPath (Join-Path $workspaceRoot "src") -Recurse -File | Select-Object -ExpandProperty FullName
  $packageFiles += Get-ChildItem -LiteralPath (Join-Path $workspaceRoot "ocr") -Recurse -File | Select-Object -ExpandProperty FullName
  foreach ($file in $packageFiles) {
    $entryName = $file.Substring($workspaceRoot.Length).TrimStart("\", "/").Replace("\", "/")
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $archive,
      $file,
      $entryName,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
  [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
    $archive,
    (Join-Path $workspaceRoot "node_modules\tesseract.js\LICENSE.md"),
    "licenses/APACHE-2.0.txt",
    [System.IO.Compression.CompressionLevel]::Optimal
  ) | Out-Null
}
finally {
  $archive.Dispose()
}

$zipInfo = Get-Item -LiteralPath $resolvedZipPath
Write-Output "Release: $($zipInfo.FullName)"
Write-Output "Size MB: $([math]::Round($zipInfo.Length / 1MB, 2))"
