Write-Host 'API Keys Test' -ForegroundColor Cyan
Write-Host ''

# Test 1: List keys
Write-Host '[1] GET /api/v1/keys' -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri 'https://lumeai.ru/api/v1/keys' -UseBasicParsing
    Write-Host 'Result: ' $response.StatusCode -ForegroundColor Green
} catch {
    Write-Host 'Error: ' $_.Exception.Message -ForegroundColor Red
}
