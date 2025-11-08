# Install plink (PuTTY) for automated SSH
Write-Host "Installing plink..." -ForegroundColor Cyan

$plinkUrl = "https://the.earth.li/~sgtatham/putty/latest/w64/plink.exe"
$plinkPath = "$PSScriptRoot\plink.exe"

try {
    Write-Host "Downloading plink.exe..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $plinkUrl -OutFile $plinkPath
    
    Write-Host ""
    Write-Host "[DONE] plink.exe installed!" -ForegroundColor Green
    Write-Host "Location: $plinkPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Now you can use quick-update.ps1 with auto password!" -ForegroundColor Green
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
