const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LumeAI API Documentation',
      version: '2.0.0',
      description: `
# 🚀 LumeAI - AI API Management Platform

Полная документация всех API endpoints для работы с 69 AI моделями.

## ✨ Возможности:
- 🔑 Управление API ключами
- 🤖 69 AI моделей (Claude, GPT, Gemini, DeepSeek и др.)
- 📊 Система лимитов и квот
- 🔐 Двухфакторная аутентификация (2FA)
- 🌐 20+ различных endpoints для максимальной совместимости

## 🎯 Поддерживаемые приложения:
- ChatGPT клиенты
- Kilo Code, Cursor AI, Continue
- LangChain, LlamaIndex
- Telegram/Discord/Slack боты
- n8n, Zapier, Make
- iOS Shortcuts, Android Tasker
- И многое другое!

## 📚 Дополнительная документация:
- [Все API Endpoints](https://github.com/yourusername/lumeai/blob/main/API_ENDPOINTS.md)
- [Быстрый старт](https://github.com/yourusername/lumeai/blob/main/QUICK_START.md)
- [Установка на Ubuntu](https://github.com/yourusername/lumeai/blob/main/UBUNTU_INSTALL.md)
      `,
      contact: {
        name: 'LumeAI Support',
        email: 'sahsaxboxvanx@gmail.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://lumeai.ru',
        description: 'Production Server'
      },
      {
        url: 'https://lumeai.ru/api/v1',
        description: 'API v1 (основной)'
      },
      {
        url: 'https://lumeai.ru/v1',
        description: 'OpenAI-совместимый'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
          description: 'Введите ваш API ключ (начинается с sk-)'
        }
      },
      schemas: {
        ChatCompletionRequest: {
          type: 'object',
          required: ['messages'],
          properties: {
            model: {
              type: 'string',
              description: 'ID модели для использования',
              example: 'gpt-4',
              enum: ['gpt-4', 'gpt-4o', 'claude-sonnet-4.5', 'gemini-2.5-pro', 'deepseek-r1']
            },
            messages: {
              type: 'array',
              description: 'Массив сообщений диалога',
              items: {
                type: 'object',
                required: ['role', 'content'],
                properties: {
                  role: {
                    type: 'string',
                    enum: ['system', 'user', 'assistant'],
                    description: 'Роль отправителя'
                  },
                  content: {
                    type: 'string',
                    description: 'Содержание сообщения'
                  }
                }
              },
              example: [
                { role: 'user', content: 'Привет! Как дела?' }
              ]
            },
            temperature: {
              type: 'number',
              description: 'Температура сэмплирования (0-2)',
              minimum: 0,
              maximum: 2,
              default: 1,
              example: 0.7
            },
            max_tokens: {
              type: 'integer',
              description: 'Максимальное количество токенов в ответе',
              example: 2048
            },
            stream: {
              type: 'boolean',
              description: 'Включить потоковую передачу',
              default: false
            }
          }
        },
        ChatCompletionResponse: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Уникальный ID запроса',
              example: 'chatcmpl-1234567890'
            },
            object: {
              type: 'string',
              description: 'Тип объекта',
              example: 'chat.completion'
            },
            created: {
              type: 'integer',
              description: 'Unix timestamp создания',
              example: 1699000000
            },
            model: {
              type: 'string',
              description: 'Использованная модель',
              example: 'gpt-4'
            },
            choices: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  index: {
                    type: 'integer',
                    example: 0
                  },
                  message: {
                    type: 'object',
                    properties: {
                      role: {
                        type: 'string',
                        example: 'assistant'
                      },
                      content: {
                        type: 'string',
                        example: 'Привет! У меня все отлично, спасибо!'
                      }
                    }
                  },
                  finish_reason: {
                    type: 'string',
                    example: 'stop'
                  }
                }
              }
            },
            usage: {
              type: 'object',
              properties: {
                prompt_tokens: {
                  type: 'integer',
                  example: 10
                },
                completion_tokens: {
                  type: 'integer',
                  example: 20
                },
                total_tokens: {
                  type: 'integer',
                  example: 30
                }
              }
            }
          }
        },
        Model: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID модели',
              example: 'gpt-4'
            },
            object: {
              type: 'string',
              example: 'model'
            },
            created: {
              type: 'integer',
              example: 1686935002
            },
            owned_by: {
              type: 'string',
              example: 'lumeai'
            }
          }
        },
        User: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор пользователя',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Имя пользователя',
              example: 'Иван Иванов'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя',
              example: 'ivan@example.com'
            }
          }
        },
        Product: {
          type: 'object',
          required: ['name', 'price'],
          properties: {
            id: {
              type: 'integer',
              description: 'Уникальный идентификатор товара',
              example: 1
            },
            name: {
              type: 'string',
              description: 'Название товара',
              example: 'Ноутбук'
            },
            description: {
              type: 'string',
              description: 'Описание товара',
              example: 'Мощный ноутбук для работы'
            },
            price: {
              type: 'number',
              format: 'float',
              description: 'Цена товара',
              example: 999.99
            },
            category: {
              type: 'string',
              description: 'Категория товара',
              example: 'Электроника'
            },
            inStock: {
              type: 'boolean',
              description: 'Наличие на складе',
              example: true
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Сообщение об ошибке',
              example: 'Ресурс не найден'
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Ресурс не найден',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        BadRequest: {
          description: 'Некорректный запрос',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    }
  },
  apis: [
    './src/routes/*.js',
    './src/routes/endpoints.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
