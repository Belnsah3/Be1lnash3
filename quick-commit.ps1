# ⚡ Быстрый коммит и пуш

param(
    [string]$Message = "Quick update"
)

Write-Host "⚡ Quick Commit" -ForegroundColor Cyan
Write-Host ""

# Добавить все файлы
git add .

# Создать коммит
git commit -m $Message

# Загрузить на GitHub
git push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Успешно загружено на GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Для обновления сервера:" -ForegroundColor Yellow
    Write-Host "  ssh root@147.45.48.64 'cd ~/rest-api && git pull && ./restart.sh app'" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Ошибка!" -ForegroundColor Red
}
