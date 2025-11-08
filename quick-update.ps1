# Quick server update with auto password using plink
$pass = "24162006gorA!"
$server = "root@147.45.48.64"

Write-Host "Updating server..." -ForegroundColor Cyan

# Проверяем наличие plink
$plinkPath = "$PSScriptRoot\plink.exe"
if (-not (Test-Path $plinkPath)) {
    $plinkPath = "C:\Program Files\PuTTY\plink.exe"
    if (-not (Test-Path $plinkPath)) {
        $plinkPath = "plink.exe"
    }
}

try {
    # Используем plink с паролем
    $commands = "cd ~/rest-api && git pull origin main && pm2 restart lumeai"
    
    # Выполняем команду с автоматическим паролем
    Write-Output y | & $plinkPath -ssh $server -pw $pass $commands
    
    Write-Host ""
    Write-Host "[DONE] Server updated!" -ForegroundColor Green
    Write-Host "Check: https://lumeai.ru" -ForegroundColor Cyan
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying alternative method..." -ForegroundColor Yellow
    
    # Альтернатива - используем sshpass через WSL
    if (Get-Command wsl -ErrorAction SilentlyContinue) {
        wsl sshpass -p '$pass' ssh -o StrictHostKeyChecking=no $server '$commands'
    } else {
        Write-Host "Please install PuTTY or WSL with sshpass" -ForegroundColor Red
    }
}
