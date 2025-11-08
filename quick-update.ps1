# Quick server update with auto password
$pass = "24162006gorA!"

Write-Host "Updating server..." -ForegroundColor Cyan

# Используем expect для автоматизации
$expectScript = @"
#!/usr/bin/expect -f
set timeout 30
spawn ssh root@147.45.48.64 "cd ~/rest-api && git pull origin main && pm2 restart lumeai"
expect "password:"
send "$pass\r"
expect eof
"@

$expectScript | Out-File -FilePath "temp_expect.exp" -Encoding ASCII

if (Get-Command wsl -ErrorAction SilentlyContinue) {
    wsl expect temp_expect.exp
} else {
    # Альтернатива - используем PowerShell напрямую
    $securePass = ConvertTo-SecureString $pass -AsPlainText -Force
    $cred = New-Object System.Management.Automation.PSCredential ("root", $securePass)
    
    # Команды для выполнения
    $commands = "cd ~/rest-api && git pull origin main && pm2 restart lumeai"
    
    # Выполняем через SSH
    ssh root@147.45.48.64 $commands
}

Remove-Item "temp_expect.exp" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "[DONE] Server updated!" -ForegroundColor Green
Write-Host "Check: https://lumeai.ru" -ForegroundColor Cyan
