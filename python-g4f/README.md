# 🐍 G4F Python FastAPI

FastAPI сервис для интеграции с g4f (GPT4Free).

## Быстрый старт

### Windows

```powershell
.\start.ps1
```

### Linux/Mac

```bash
chmod +x start.sh
./start.sh
```

## Установка вручную

```bash
# Создать виртуальное окружение
python -m venv venv

# Активировать (Windows)
.\venv\Scripts\Activate.ps1

# Активировать (Linux/Mac)
source venv/bin/activate

# Установить зависимости
pip install -r requirements.txt

# Запустить сервер
uvicorn main:app --host 0.0.0.0 --port 5000
```

## API Endpoints

- `GET /` - Корневой endpoint
- `GET /health` - Health check
- `POST /v1/chat/completions` - Chat completion
- `GET /v1/models` - Список моделей
- `GET /v1/providers` - Список провайдеров
- `GET /v1/test` - Тестовый endpoint

## Swagger UI

http://localhost:5000/docs

## Примеры

### Curl

```bash
curl -X POST http://localhost:5000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "model": "gpt-4"
  }'
```

### Python

```python
import requests

response = requests.post('http://localhost:5000/v1/chat/completions', json={
    'messages': [{'role': 'user', 'content': 'Hello!'}],
    'model': 'gpt-4'
})

print(response.json())
```

## Зависимости

- FastAPI 0.115.5
- Uvicorn 0.32.1
- g4f 0.3.11.5
- Pydantic 2.10.3
