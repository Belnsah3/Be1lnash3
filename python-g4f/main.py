from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from tortoise import Tortoise
from models.api_key import APIKey

from g4f.client import Client
import logging
import os

import secrets

from dotenv import load_dotenv

load_dotenv()

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def lifespan(app):
    # Инициализация базы данных Tortoise ORM
    await Tortoise.init(
        db_url='sqlite://db.sqlite3',
        modules={'models': ['models.api_key']}
    )
    await Tortoise.generate_schemas()
    logger.info("База данных инициализирована")
    yield
    
    await Tortoise.close_connections()

async def admin_key_check(admin_key: str = Header(alias="X-Admin-Key")):
    expected_key = os.getenv("ADMIN_BASE_KEY")
    if admin_key != expected_key:
        raise HTTPException(status_code=403, detail="Недействительный административный ключ")
    return True

async def api_key_check(api_key: str = Header(alias="X-API-Key")):
    api_key_obj = await APIKey.get_or_none(key=api_key)

    if api_key_obj is None:
        raise HTTPException(status_code=403, detail="Недействительный API ключ")

    return True

# Создание FastAPI приложения
app = FastAPI(
    title="G4F API",
    description="GPT4Free API для интеграции с Node.js REST API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Инициализация G4F клиента
client = Client()

# Модели и их провайдеры (те, что работают без API ключа)
MODEL_PROVIDERS = {
    # Claude модели - пробуем разные провайдеры
    "claude-sonnet-4.5": ["You", "Puter", "Airforce", "PerplexityLabs", "auto"],
    "claude-sonnet-4": ["You", "Puter", "Airforce", "PerplexityLabs", "auto"],
    "claude-haiku-4.5": ["You", "Puter", "Airforce", "PerplexityLabs", "auto"],
    "claude-3.5-sonnet": ["You", "Puter", "Airforce", "PerplexityLabs", "auto"],
    "claude-3-sonnet": ["You", "Puter", "Airforce", "PerplexityLabs", "auto"],
    "claude-3-haiku": ["You", "Puter", "Airforce", "PerplexityLabs", "auto"],

    # GPT модели - работают без ключа
    "gpt-4": ["auto", "Airforce"],
    "gpt-4o": ["auto", "Airforce"],
    "gpt-4o-mini": ["auto", "Airforce"],
    "gpt-3.5-turbo": ["auto", "Airforce"],

    # Gemini - работает без ключа
    "gemini-2.5-flash": ["auto", "Airforce"],
    "gemini-2.5-pro": ["auto", "Airforce"],

    # DeepSeek - работает без ключа
    "deepseek-v3": ["auto", "Airforce"],
    "deepseek-r1": ["auto", "Airforce"],
}

# Модели данных
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: Optional[str] = "gpt-4"
    stream: Optional[bool] = False

class ChatResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None

# Роуты
@app.get("/")
async def root():
    """Корневой endpoint"""
    return {
        "message": "G4F FastAPI сервис",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/v1/chat/completions",
            "models": "/v1/models",
            "test": "/v1/test",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "g4f-api"}

@app.post("/v1/chat/completions", response_model=ChatResponse, dependencies=[Depends(api_key_check)])
async def chat_completions(request: ChatRequest):
    """
    Создать chat completion через G4F
    
    Args:
        request: ChatRequest с messages, model и stream
        
    Returns:
        ChatResponse с ответом от AI
    """
    try:
        logger.info(f"Получен запрос с моделью: {request.model}")
        
        # Валидация сообщений
        if not request.messages or len(request.messages) == 0:
            raise HTTPException(
                status_code=400, 
                detail="Массив messages обязателен и должен содержать хотя бы одно сообщение"
            )
        
        # Проверка ролей
        valid_roles = {'system', 'user', 'assistant'}
        for msg in request.messages:
            if msg.role not in valid_roles:
                raise HTTPException(
                    status_code=400,
                    detail=f"Роль '{msg.role}' недопустима. Используйте: {valid_roles}"
                )
        
        # Преобразование сообщений
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        # Отправка запроса к G4F
        logger.info(f"Отправка запроса к G4F с моделью {request.model}")

        # Получить список провайдеров для модели
        providers = MODEL_PROVIDERS.get(request.model, ["auto"])

        # Попробовать каждый провайдер
        last_error = None
        for provider in providers:
            try:
                logger.info(f"Пробуем провайдер: {provider}")

                if provider == "auto":
                    # Автоматический выбор провайдера
                    response = client.chat.completions.create(
                        model=request.model,
                        messages=messages,
                        stream=request.stream
                    )
                else:
                    # Явно указанный провайдер
                    response = client.chat.completions.create(
                        model=request.model,
                        messages=messages,
                        provider=provider,
                        stream=request.stream
                    )

                logger.info(f"Успешно! Провайдер: {provider}")
                break  # Выход из цикла при успехе

            except Exception as e:
                error_msg = str(e)
                logger.warning(f"Провайдер {provider} не работает: {error_msg}")
                last_error = error_msg

                # Если это последний провайдер, выбросить ошибку
                if provider == providers[-1]:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Все провайдеры для модели {request.model} недоступны. Последняя ошибка: {last_error}"
                    )
                continue  # Попробовать следующий провайдер
        
        # Формирование ответа
        result = {
            "content": response.choices[0].message.content,
            "model": request.model,
            "finish_reason": response.choices[0].finish_reason,
            "messages_count": len(messages)
        }
        
        logger.info("Запрос успешно обработан")
        
        return ChatResponse(success=True, data=result)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Ошибка при обработке запроса: {str(e)}")
        return ChatResponse(
            success=False,
            error=f"Ошибка при обращении к AI: {str(e)}"
        )

@app.get("/v1/admin/api_keys", tags=["admin"], dependencies=[Depends(admin_key_check)])
async def list_api_keys():
    """
    Получить список всех API ключей
    
    Returns:
        Список API ключей
    """
    try:
        api_keys = await APIKey.all().values("key", "created_at", "remark")
        return {
            "success": True,
            "data": {
                "api_keys": api_keys
            }
        }
    except Exception as e:
        logger.error(f"Ошибка при получении списка API ключей: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }
    
@app.post("/v1/admin/generate_api_key", tags=["admin"], dependencies=[Depends(admin_key_check)])
async def generate_api_key(remark: Optional[str] = None):
    """
    Генерит новый API ключ для доступа к сервису
    
    Args:
        remark: Необязательная пометка для ключа

    Returns:
        Новый API ключ
    """
    try:
        new_key = secrets.token_urlsafe(32)

        if remark is None:
            await APIKey.create(key=new_key)
        else:
            await APIKey.create(key=new_key, remark=remark)
        
        logger.info(f"Сгенерирован новый API ключ: {new_key}")
        
        return {
            "success": True,
            "data": {
                "api_key": new_key
            }
        }
        
    except Exception as e:
        logger.error(f"Ошибка при генерации API ключа: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.delete("/v1/admin/revoke_api_key/{api_key}", tags=["admin"], dependencies=[Depends(admin_key_check)])
async def revoke_api_key(api_key: str):
    """
    Удаляет существующий API ключ
    
    Args:
        api_key: API ключ для отзыва
        
    Returns:
        Результат операции
    """
    try:
        api_key_obj = await APIKey.get_or_none(key=api_key)
        
        if api_key_obj is None:
            raise HTTPException(status_code=404, detail="API ключ не найден")
        
        await api_key_obj.delete()
        
        logger.info(f"API ключ отозван: {api_key}")
        
        return {
            "success": True,
            "data": {
                "message": "API ключ успешно отозван"
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Ошибка при отзыве API ключа: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/v1/models", dependencies=[Depends(api_key_check)])
async def get_models():
    """
    Получить список доступных моделей
    
    Returns:
        Список моделей с их характеристиками
    """
    try:
        # Список популярных моделей
        models = [
            {
                "id": "gpt-4",
                "name": "GPT-4",
                "provider": "auto",
                "description": "Мощная языковая модель от OpenAI"
            },
            {
                "id": "gpt-4o",
                "name": "GPT-4o",
                "provider": "auto",
                "description": "Оптимизированная версия GPT-4"
            },
            {
                "id": "gpt-3.5-turbo",
                "name": "GPT-3.5 Turbo",
                "provider": "auto",
                "description": "Быстрая и эффективная модель"
            },
            {
                "id": "claude-sonnet-4.5",
                "name": "Claude Sonnet 4.5",
                "provider": "auto (с fallback)",
                "description": "Anthropic Claude Sonnet 4.5 (без API ключа через провайдеры)"
            },
            {
                "id": "claude-sonnet-4",
                "name": "Claude Sonnet 4",
                "provider": "auto (с fallback)",
                "description": "Anthropic Claude Sonnet 4 (без API ключа через провайдеры)"
            },
            {
                "id": "claude-haiku-4.5",
                "name": "Claude Haiku 4.5",
                "provider": "auto (с fallback)",
                "description": "Anthropic Claude Haiku 4.5 (быстрая, без API ключа)"
            },
            {
                "id": "gemini-2.5-flash",
                "name": "Gemini 2.5 Flash",
                "provider": "auto",
                "description": "Google Gemini 2.5 Flash"
            },
            {
                "id": "gemini-2.5-pro",
                "name": "Gemini 2.5 Pro",
                "provider": "auto",
                "description": "Google Gemini 2.5 Pro"
            },
            {
                "id": "deepseek-v3",
                "name": "DeepSeek V3",
                "provider": "auto",
                "description": "DeepSeek V3"
            },
            {
                "id": "deepseek-r1",
                "name": "DeepSeek R1",
                "provider": "auto",
                "description": "DeepSeek R1 Reasoning"
            },
            {
                "id": "llama-4-scout",
                "name": "Llama 4 Scout",
                "provider": "auto",
                "description": "Meta Llama 4 Scout"
            }
        ]
        
        return {
            "success": True,
            "data": {
                "models": models,
                "default_model": "gpt-4",
                "total": len(models)
            }
        }
        
    except Exception as e:
        logger.error(f"Ошибка при получении моделей: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/v1/providers", dependencies=[Depends(api_key_check)])
async def get_providers():
    """
    Получить список доступных провайдеров
    
    Returns:
        Список провайдеров
    """
    try:
        providers = [
            {
                "name": "api.airforce",
                "status": "active",
                "models": ["gpt-4o-mini", "claude-sonnet-4", "gemini-2.5-flash"],
                "description": "Airforce API провайдер"
            },
            {
                "name": "deep-infra",
                "status": "active",
                "models": ["meta-llama", "mistral", "qwen"],
                "description": "DeepInfra провайдер"
            },
            {
                "name": "gemini",
                "status": "active",
                "models": ["gemini-2.5-flash", "gemini-2.5-pro"],
                "description": "Google Gemini провайдер"
            },
            {
                "name": "groq",
                "status": "active",
                "models": ["llama-3.3", "mixtral"],
                "description": "Groq провайдер"
            }
        ]
        
        return {
            "success": True,
            "data": providers
        }
        
    except Exception as e:
        logger.error(f"Ошибка при получении провайдеров: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/v1/test", dependencies=[Depends(api_key_check)])
async def test():
    """
    Тестовый endpoint для проверки работоспособности
    
    Returns:
        Тестовое сообщение от AI
    """
    try:
        logger.info("Выполнение тестового запроса")
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "user", "content": "Say 'Hello from G4F Python API!'"}
            ]
        )
        
        return {
            "success": True,
            "data": {
                "message": response.choices[0].message.content,
                "model": "gpt-4",
                "status": "AI интеграция работает корректно",
                "provider": "g4f-python"
            }
        }
        
    except Exception as e:
        logger.error(f"Ошибка тестового запроса: {str(e)}")
        return {
            "success": False,
            "error": f"Ошибка при тестировании AI: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000, log_level="info")
