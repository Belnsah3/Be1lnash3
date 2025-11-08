# G4F Model Providers Research

**Date:** 2025-11-08  
**Purpose:** Найти провайдеров для моделей без API ключей

---

## 📋 **ДОСТУПНЫЕ ПРОВАЙДЕРЫ G4F:**

### **Основные провайдеры (112 total):**

#### **Текстовые модели:**
- `You` - поддерживает GPT-4, Claude, Gemini
- `Blackbox` - GPT-4, Claude
- `DeepInfra` - множество open-source моделей
- `HuggingChat` - Llama, Mistral, Qwen
- `HuggingFace` - все HF модели
- `PerplexityLabs` - Llama, Mistral, Claude
- `Groq` - быстрые Llama модели
- `DeepSeek` - DeepSeek модели
- `Cerebras` - Llama модели
- `Cohere` - Command модели
- `MetaAI` - Llama модели
- `Gemini` - Google Gemini
- `Grok` - xAI Grok
- `Qwen` - Qwen модели
- `GLM` - Zhipu AI модели
- `Nvidia` - Nemotron модели
- `DuckDuckGo` - GPT-3.5, Claude

#### **Генерация изображений:**
- `PollinationsAI` - DALL-E, Stable Diffusion, Flux
- `PollinationsImage` - множество image моделей
- `StabilityAI_SD35Large` - Stable Diffusion 3.5
- `BlackForestLabs_Flux1Dev` - Flux модели
- `BingCreateImages` - DALL-E 3
- `MicrosoftDesigner` - генерация изображений
- `Replicate` - множество моделей

#### **Мультимодальные:**
- `Together` - множество моделей
- `OpenRouter` - агрегатор моделей
- `Replicate` - все типы моделей

---

## 🎯 **РЕКОМЕНДУЕМЫЕ ПРОВАЙДЕРЫ ДЛЯ МОДЕЛЕЙ:**

### **GPT модели:**
```python
"gpt-4": ["You", "Blackbox", "DuckDuckGo"],
"gpt-4o-mini": ["You", "Blackbox"],
"gpt-3.5-turbo": ["DuckDuckGo", "You"],
```

### **Claude модели:**
```python
"claude-sonnet-4": ["You", "Blackbox", "PerplexityLabs"],
"claude-sonnet-4.5": ["You", "Blackbox"],
"claude-haiku-4.5": ["You", "PerplexityLabs"],
```

### **Gemini модели:**
```python
"gemini-2.5-pro": ["Gemini", "You"],
"gemini-2.5-flash": ["Gemini", "You"],
```

### **Llama модели:**
```python
"llama-3.3": ["MetaAI", "HuggingChat", "PerplexityLabs", "Groq"],
"llama-4-maverick": ["MetaAI", "HuggingChat"],
```

### **DeepSeek модели:**
```python
"deepseek-v3": ["DeepSeek", "DeepInfra"],
"deepseek-r1": ["DeepSeek", "DeepInfra"],
"deepseek-chat": ["DeepSeek"],
```

### **Mistral модели:**
```python
"mistral-small-3.1-24b": ["HuggingChat", "PerplexityLabs"],
"mistral-medium-3": ["HuggingChat"],
```

### **Qwen модели:**
```python
"qwen2.5-coder-32b": ["Qwen", "HuggingChat", "DeepInfra"],
"qwen3-coder": ["Qwen", "HuggingChat"],
```

### **Grok модели:**
```python
"grok-4": ["Grok"],
"grok-3-mini": ["Grok"],
```

### **GLM модели:**
```python
"glm-4.5": ["GLM"],
"glm-4.6": ["GLM"],
```

### **Изображения:**
```python
"dall-e-3": ["BingCreateImages", "PollinationsAI"],
"sdxl": ["PollinationsImage", "Replicate"],
"sd-3.5-large": ["StabilityAI_SD35Large", "PollinationsImage"],
"flux-schnell": ["BlackForestLabs_Flux1Dev", "PollinationsImage"],
```

---

## 💡 **ИТОГОВАЯ КОНФИГУРАЦИЯ:**

### **Для main.py:**

```python
MODEL_PROVIDERS = {
    # === GPT модели ===
    "gpt-4": ["You", "Blackbox", "DuckDuckGo"],
    "gpt-4o-mini": ["You", "Blackbox"],
    "gpt-3.5-turbo": ["DuckDuckGo", "You"],
    "o1-mini": ["You"],
    "o3-mini": ["You"],
    
    # === Claude модели ===
    "claude-sonnet-4": ["You", "Blackbox", "PerplexityLabs"],
    "claude-sonnet-4.5": ["You", "Blackbox"],
    "claude-haiku-4.5": ["You", "PerplexityLabs"],
    "claude-3-7-sonnet": ["You", "Blackbox"],
    
    # === Gemini модели ===
    "gemini-2.5-pro": ["Gemini", "You"],
    "gemini-2.5-flash": ["Gemini", "You"],
    "gemini-2.5-flash-lite": ["Gemini"],
    
    # === Llama модели ===
    "llama-3.3": ["MetaAI", "HuggingChat", "PerplexityLabs", "Groq"],
    "llama-4-maverick": ["MetaAI", "HuggingChat"],
    "llama-4-scout": ["MetaAI", "HuggingChat"],
    
    # === DeepSeek модели ===
    "deepseek-v3": ["DeepSeek", "DeepInfra"],
    "deepseek-v3.1": ["DeepSeek"],
    "deepseek-v3.2": ["DeepSeek"],
    "deepseek-r1": ["DeepSeek", "DeepInfra"],
    "deepseek-chat": ["DeepSeek"],
    "deepseek-reasoner": ["DeepSeek"],
    
    # === Mistral модели ===
    "mistral-small-3.1-24b": ["HuggingChat", "PerplexityLabs"],
    "mistral-medium-3": ["HuggingChat"],
    
    # === Qwen модели ===
    "qwen2.5-coder-32b": ["Qwen", "HuggingChat", "DeepInfra"],
    "qwen3-coder": ["Qwen", "HuggingChat"],
    "qwen3-coder-big": ["Qwen"],
    "qwen3-next": ["Qwen"],
    "qwen3-omni": ["Qwen"],
    
    # === Grok модели ===
    "grok-4": ["Grok"],
    "grok-4-think": ["Grok"],
    "grok-3-mini": ["Grok"],
    "grok-code-1": ["Grok"],
    
    # === Cohere модели ===
    "command-a": ["Cohere"],
    
    # === GLM модели ===
    "glm-4.5": ["GLM"],
    "glm-4.5-air": ["GLM"],
    "glm-4.6": ["GLM"],
    
    # === Nvidia модели ===
    "nemotron-ultra-235b": ["Nvidia"],
    
    # === Другие модели ===
    "hermes-3-405b": ["DeepInfra", "HuggingChat"],
    "hermes-4-405b": ["DeepInfra"],
    "goliath-120b": ["DeepInfra"],
    "qwq-32b-fast": ["HuggingChat"],
    
    # === Изображения ===
    "dall-e-3": ["BingCreateImages", "PollinationsAI"],
    "sdxl": ["PollinationsImage", "Replicate"],
    "sd-3.5": ["PollinationsImage"],
    "sd-3.5-large": ["StabilityAI_SD35Large", "PollinationsImage"],
    "flux-schnell": ["BlackForestLabs_Flux1Dev", "PollinationsImage"],
}
```

---

## ✅ **ВЫВОДЫ:**

### **Лучшие универсальные провайдеры:**

1. **You** - поддерживает GPT, Claude, Gemini
2. **Blackbox** - GPT, Claude
3. **HuggingChat** - Llama, Mistral, Qwen
4. **DeepInfra** - множество open-source
5. **PollinationsAI** - изображения

### **Специализированные:**

- **Gemini** → Google модели
- **DeepSeek** → DeepSeek модели
- **Grok** → xAI модели
- **Qwen** → Qwen модели
- **GLM** → Zhipu AI модели
- **MetaAI** → Llama модели

---

## 🚀 **СЛЕДУЮЩИЕ ШАГИ:**

1. Обновить `MODEL_PROVIDERS` в main.py
2. Добавить nest_asyncio.apply()
3. Протестировать разные модели
4. Создать UI для выбора моделей

---

**Исследование завершено!** ✅  
**Найдено 112 провайдеров!** 🎉  
**Готово к использованию!** 🚀
