import os
import logging
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import g4f
from g4f.client import AsyncClient
from puter_provider import get_puter_provider

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Инициализация FastAPI
app = FastAPI(title="G4F API", description="OpenAI-compatible API using g4f", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Модели данных (OpenAI-compatible)
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = "gpt-4o-mini"
    stream: Optional[bool] = False

# Поддерживаемые модели (как у OpenAI)
SUPPORTED_MODELS = {
    "gpt-4o-mini": "GPT-4o Mini",
    "gpt-4o": "GPT-4o",
    "gpt-4": "GPT-4",
    "gpt-3.5-turbo": "GPT-3.5 Turbo",
    "deepseek": "DeepSeek",
    "claude-sonnet-4.5": "Claude Sonnet 4.5",
    "gemini-2.5-flash": "Gemini 2.5 Flash",
    "llama-3.2-90b": "Llama 3.2 90B",
}

# Модели, которые используют Puter.js провайдер
PUTER_MODELS = {
    "claude-sonnet-4.5": "gpt-4o-mini",  # Puter поддерживает эти модели
    "gpt-4.1": "gpt-4.1",
    "o1": "o1",
    "o1-mini": "o1-mini",
}

# Функция для проверки API ключа (как у OpenAI)
def verify_api_key(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="API key required")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid API key format. Use: Bearer <key>")

    api_key = authorization[7:]  # Убираем "Bearer "

    # Простая проверка (можно заменить на свою логику)
    if api_key != "sk-test-key":  # Тестовый ключ
        raise HTTPException(status_code=401, detail="Invalid API key")

    return api_key

@app.get("/")
async def root():
    return {"message": "G4F API - OpenAI-compatible", "version": "1.0.0"}

@app.get("/v1/models")
async def list_models(authorization: str = Header(None)):
    """Список доступных моделей (как у OpenAI)"""
    verify_api_key(authorization)

    models = []
    for model_id, name in SUPPORTED_MODELS.items():
        models.append({
            "id": model_id,
            "object": "model",
            "created": 1677610602,
            "owned_by": "g4f"
        })

    return {
        "object": "list",
        "data": models
    }

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatRequest, authorization: str = Header(None)):
    """Основной endpoint для чата (как у OpenAI)"""
    verify_api_key(authorization)

    try:
        # Валидация
        if not request.messages:
            raise HTTPException(
                status_code=400,
                detail="Массив messages обязателен и должен содержать хотя бы одно сообщение"
            )

        valid_roles = {'system', 'user', 'assistant'}
        for msg in request.messages:
            if msg.role not in valid_roles:
                raise HTTPException(
                    status_code=400,
                    detail=f"Роль '{msg.role}' недопустима. Используйте: {valid_roles}"
                )

        # Преобразование сообщений
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        logger.info(f"Отправка запроса к G4F с моделью {request.model}")

        # Проверяем, нужно ли использовать Puter.js
        if request.model in PUTER_MODELS:
            logger.info(f"Используем Puter.js провайдер для {request.model}")
            try:
                puter = get_puter_provider()
                puter_model = PUTER_MODELS[request.model]
                
                # Синхронный вызов Puter API
                puter_response = puter.chat_completion(
                    messages=messages,
                    model=puter_model,
                    stream=request.stream
                )
                
                logger.info("Запрос через Puter успешно обработан")
                return puter_response
                
            except Exception as e:
                logger.error(f"Ошибка Puter провайдера: {e}")
                raise HTTPException(status_code=500, detail=f"Ошибка Puter.js: {str(e)}")
        
        # Используем AsyncClient G4F для остальных моделей
        client = AsyncClient()

        # Отправка запроса (как в примере)
        response = await client.chat.completions.create(
            model=request.model,
            messages=messages,
            stream=request.stream
        )

        # Формирование ответа (OpenAI-compatible)
        result = {
            "id": f"chatcmpl-{hash(str(messages))}",
            "object": "chat.completion",
            "created": int(__import__('time').time()),
            "model": request.model,
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": response.choices[0].message.content
                },
                "finish_reason": response.choices[0].finish_reason
            }],
            "usage": {
                "prompt_tokens": len(str(messages)),
                "completion_tokens": len(response.choices[0].message.content.split()),
                "total_tokens": len(str(messages)) + len(response.choices[0].message.content.split())
            }
        }

        logger.info("Запрос успешно обработан")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Ошибка при обработке запроса: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка AI: {str(e)}")

@app.get("/health")
async def health_check():
    """Проверка здоровья API"""
    return {"status": "healthy", "service": "g4f-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info")
