// Полный список всех доступных моделей
const MODELS = [
    // OpenAI
    { name: 'gpt-5-chat', category: 'OpenAI', type: 'text', supportsTools: true },
    { name: 'gpt-5-nano', category: 'OpenAI', type: 'text', supportsTools: true },
    { name: 'gpt-5-mini', category: 'OpenAI', type: 'text', supportsTools: true },
    { name: 'gpt-4.1-mini', category: 'OpenAI', type: 'text', supportsTools: true },
    { name: 'gpt-4.1-nano', category: 'OpenAI', type: 'text', supportsTools: true },
    { name: 'gpt-4o-mini', category: 'OpenAI', type: 'multimodal', supportsTools: true },
    { name: 'gpt-3.5-turbo', category: 'OpenAI', type: 'text', supportsTools: true },
    { name: 'o1-pro', category: 'OpenAI', type: 'text', supportsTools: true },
    { name: 'o4-mini', category: 'OpenAI', type: 'text', supportsTools: true },
    { name: 'o3-mini', category: 'OpenAI', type: 'text', supportsTools: true },
    { name: 'gpt-oss-120b', category: 'OpenAI', type: 'text', supportsTools: false },
    { name: 'gpt-image-1', category: 'OpenAI', type: 'image', supportsTools: false },
    { name: 'dall-e-3', category: 'OpenAI', type: 'image', supportsTools: false },
    
    // Google
    { name: 'gemini-2.5-pro', category: 'Google', type: 'multimodal', supportsTools: true },
    { name: 'gemini-2.5-flash', category: 'Google', type: 'multimodal', supportsTools: true },
    { name: 'gemini-2.5-flash-lite', category: 'Google', type: 'multimodal', supportsTools: true },
    { name: 'gemma-3n-e4b', category: 'Google', type: 'text', supportsTools: false },
    { name: 'nano-banana', category: 'Google', type: 'image', supportsTools: false },
    
    // DeepSeek
    { name: 'deepseek-v3.1', category: 'DeepSeek', type: 'text', supportsTools: true },
    { name: 'deepseek-v3.2', category: 'DeepSeek', type: 'text', supportsTools: true },
    { name: 'deepseek-v3', category: 'DeepSeek', type: 'text', supportsTools: true },
    { name: 'deepseek-chat', category: 'DeepSeek', type: 'text', supportsTools: true },
    { name: 'deepseek-reasoner', category: 'DeepSeek', type: 'text', supportsTools: false },
    { name: 'deepseek-r1', category: 'DeepSeek', type: 'text', supportsTools: false },
    { name: 'deepseek-r1-0528', category: 'DeepSeek', type: 'text', supportsTools: false },
    
    // Anthropic (Claude)
    { name: 'claude-sonnet-4.5', category: 'Anthropic', type: 'text', supportsTools: true },
    { name: 'claude-sonnet-4', category: 'Anthropic', type: 'text', supportsTools: true },
    { name: 'claude-3-7-sonnet', category: 'Anthropic', type: 'text', supportsTools: true },
    { name: 'claude-haiku-4.5', category: 'Anthropic', type: 'text', supportsTools: true },
    
    // Qwen (Alibaba)
    { name: 'qwen3-omni', category: 'Qwen', type: 'multimodal', supportsTools: true },
    { name: 'qwen3-coder', category: 'Qwen', type: 'text', supportsTools: true },
    { name: 'qwen3-coder-big', category: 'Qwen', type: 'text', supportsTools: true },
    { name: 'qwen2.5-coder-32b', category: 'Qwen', type: 'text', supportsTools: true },
    { name: 'qwen3-next', category: 'Qwen', type: 'text', supportsTools: true },
    { name: 'qwq-32b-fast', category: 'Qwen', type: 'text', supportsTools: false },
    
    // Meta (Llama)
    { name: 'llama-4-maverick', category: 'Meta', type: 'text', supportsTools: true },
    { name: 'llama-4-scout', category: 'Meta', type: 'text', supportsTools: true },
    { name: 'llama-3.3', category: 'Meta', type: 'text', supportsTools: true },
    
    // xAI (Grok)
    { name: 'grok-4', category: 'xAI', type: 'multimodal', supportsTools: true },
    { name: 'grok-4-think', category: 'xAI', type: 'multimodal', supportsTools: true },
    { name: 'grok-code-1', category: 'xAI', type: 'text', supportsTools: true },
    { name: 'grok-3-mini', category: 'xAI', type: 'text', supportsTools: true },
    
    // Mistral AI
    { name: 'mistral-medium-3', category: 'Mistral', type: 'text', supportsTools: true },
    { name: 'mistral-small-3.1-24b', category: 'Mistral', type: 'text', supportsTools: true },
    
    // GLM (Zhipu AI)
    { name: 'glm-4.6', category: 'GLM', type: 'multimodal', supportsTools: true },
    { name: 'glm-4.5', category: 'GLM', type: 'text', supportsTools: true },
    { name: 'glm-4.5-air', category: 'GLM', type: 'text', supportsTools: true },
    
    // AWS
    { name: 'nova-pro', category: 'AWS', type: 'text', supportsTools: true },
    { name: 'nova-lite', category: 'AWS', type: 'text', supportsTools: true },
    { name: 'nova-micro', category: 'AWS', type: 'text', supportsTools: true },
    
    // Moonshot AI
    { name: 'kimi-k2', category: 'Moonshot', type: 'text', supportsTools: true },
    { name: 'kimi-k2-0905', category: 'Moonshot', type: 'text', supportsTools: true },
    
    // Nous Research
    { name: 'hermes-4-405b', category: 'Nous', type: 'text', supportsTools: true },
    { name: 'hermes-3-405b', category: 'Nous', type: 'text', supportsTools: true },
    
    // Stability AI
    { name: 'sd-3.5-large', category: 'Stability', type: 'image', supportsTools: false },
    { name: 'sd-3.5', category: 'Stability', type: 'image', supportsTools: false },
    { name: 'sdxl', category: 'Stability', type: 'image', supportsTools: false },
    { name: 'cogvideox-flash', category: 'Stability', type: 'video', supportsTools: false },
    
    // Flux
    { name: 'flux-schnell', category: 'Flux', type: 'image', supportsTools: false },
    { name: 'seed-oss', category: 'Flux', type: 'text', supportsTools: false },
    
    // Другие
    { name: 'command-a', category: 'Cohere', type: 'text', supportsTools: true },
    { name: 'ernie-4.5', category: 'Baidu', type: 'text', supportsTools: false },
    { name: 'nemotron-ultra-235b', category: 'NVIDIA', type: 'text', supportsTools: true },
    { name: 'sonar', category: 'Perplexity', type: 'text', supportsTools: true },
    { name: 'cliptagger-12b', category: 'Other', type: 'multimodal', supportsTools: false },
    { name: 'goliath-120b', category: 'Other', type: 'text', supportsTools: false },
    { name: 'lucid-origin', category: 'Other', type: 'text', supportsTools: false },
    { name: 'ring-1t', category: 'Other', type: 'text', supportsTools: false },
    { name: 'ling-1t', category: 'Other', type: 'text', supportsTools: false }
];

module.exports = MODELS;
