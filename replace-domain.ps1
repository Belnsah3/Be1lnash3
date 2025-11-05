# PowerShell скрипт для замены IP на домен

Write-Host "🔄 Замена IP адреса на домен lumeai.ru..." -ForegroundColor Cyan
Write-Host ""

# Список файлов для замены
$files = @(
    "README.md",
    "API_ENDPOINTS.md",
    "SUMMARY.md",
    "UPLOAD_TO_SERVER.md",
    "FINAL_UPDATE.md",
    "RESTART_SERVER.md",
    "DOMAIN_SETUP.md",
    "NO_G4F.md",
    "GPT4FREE_PRO_SETUP.md",
    "KILO_CODE_SETUP.md",
    "UPDATE_NOW.md",
    "URGENT_FIX.md",
    "QUICK_START.md",
    "UBUNTU_INSTALL.md",
    "COPY_FIX.md",
    "KILO_CODE_ISSUE.md",
    "MOBILE_OPTIMIZATION.md",
    "GPT4FREE_ONLY.md",
    "QUICK_UPDATE.md",
    "SWAGGER_DOCS.md",
    "SERVER_INFO.md",
    "deploy.sh",
    "install.sh",
    "setup_ubuntu.py",
    "test-mock.js",
    "update-domain.sh",
    "update-ip.py",
    "update-ip.sh",
    "src\config\swagger.js",
    "src\routes\endpoints.js"
)

$count = 0

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $filePath) {
        Write-Host "📝 Обработка: $file" -ForegroundColor Yellow
        
        # Читаем содержимое
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Замены
        $newContent = $content `
            -replace 'http://147\.45\.48\.64:3000', 'https://lumeai.ru' `
            -replace 'http://147\.45\.48\.64', 'https://lumeai.ru' `
            -replace '147\.45\.48\.64:3000', 'lumeai.ru' `
            -replace '147\.45\.48\.64', 'lumeai.ru'
        
        # Сохраняем если были изменения
        if ($content -ne $newContent) {
            Set-Content $filePath $newContent -Encoding UTF8 -NoNewline
            $count++
            Write-Host "   ✅ Обновлено" -ForegroundColor Green
        } else {
            Write-Host "   ⏭️  Без изменений" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  Файл не найден" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done! Updated files: $count" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "   1. Check changes: git diff" -ForegroundColor White
Write-Host "   2. Commit: git add ." -ForegroundColor White
Write-Host "   3. Commit: git commit -m Update domain" -ForegroundColor White
Write-Host "   4. Push: git push" -ForegroundColor White
Write-Host ""
