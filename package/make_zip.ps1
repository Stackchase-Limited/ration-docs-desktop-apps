<#
.SYNOPSIS
    Portable ZIP of the Windows build (#2404): RationDocs-<version>-<arch>.zip in
    package\zip, made from what make.ps1 prepared in build\<arch>\desktop.

.DESCRIPTION
    Run make.ps1 first with the same -Version/-Arch/-Target, then this script;
    build_tools scripts/package_desktop.py does both (make_prepare, make_zip). Needs
    7z on PATH. -Target standalone or xp also packs the offline help.

    What "portable" means: unzip anywhere (a USB stick included) and start
    RationDocs.exe - nothing is installed. The ZIP has no converter\package.config,
    which the installers write; without it the app knows it is the ZIP
    (AppOptions::packageType, win-linux/src/utils.cpp) and does not offer to take
    over file associations. Settings, recent files and the editors' cache still go
    to the user's profile (%LOCALAPPDATA%\Ration\Docs and the registry under
    HKCU\Software\Ration), so a stick moved to another PC starts with that PC's
    settings. The Visual C++ runtime the installer brings (vc_redist) is not added
    to the ZIP: Windows must already have it (VC++ 2015-2022, same arch). The files
    inside are signed when make.ps1 ran with -Sign; the archive itself is not.
#>
param (
    [System.Version]$Version = "0.0.0.0",
    [string]$Arch = "x64",
    [string]$Target,
    [string]$CompanyName = "Ration",
    [string]$ProductName = "Docs",
    [string]$BuildDir
)

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot

if (-not $BuildDir) {
    $BuildDir = "build\$Arch"
}
if (-not (Test-Path "$BuildDir")) {
    Write-Error "Path `"$BuildDir`" does not exist"
}
# #2404: a ZIP that carries package.config does not know it is portable. make_advinst.ps1
# writes one into this same build directory, so a ZIP must come from a fresh make.ps1.
if (Test-Path "$BuildDir\desktop\converter\package.config") {
    Write-Error "$BuildDir\desktop\converter\package.config exists (left by an installer build); run make.ps1 again first"
}
$ZipFile = switch ($Target) {
    "commercial" { "$CompanyName$ProductName-Enterprise-$Version-$Arch.zip" }
    "xp"         { "$CompanyName$ProductName-XP-$Version-$Arch.zip" }
    default      { "$CompanyName$ProductName-$Version-$Arch.zip" }
}

Write-Host @"
Version     = $Version
Arch        = $Arch
Target      = $Target
CompanyName = $CompanyName
ProductName = $ProductName
BuildDir    = $BuildDir
ZipFile     = $ZipFile
"@

####

Write-Host "`n[ Create archive ]"

New-Item -ItemType Directory -Force -Path "zip" | Out-Null
Push-Location "zip"

if (Test-Path "$ZipFile") {
    Write-Host "DELETE: $ZipFile"
    Remove-Item -Force -LiteralPath "$ZipFile"
}

Write-Host "7z a -y $ZipFile ..\$BuildDir\desktop\*"
& 7z a -y "$ZipFile" "..\$BuildDir\desktop\*"
if ($LastExitCode -ne 0) { throw }

if ($Target -eq "standalone" -or $Target -eq "xp") {
    Write-Host "7z a -y $ZipFile ..\$BuildDir\help\*"
    & 7z a -y "$ZipFile" "..\$BuildDir\help\*"
    if ($LastExitCode -ne 0) { throw }
}

Pop-Location
