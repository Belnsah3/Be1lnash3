// Полный список всех доступных моделей
const MODELS = [
    // OpenAI
    { name: 'gpt-5-chat', category: 'OpenAI', type: 'text' },
    { name: 'gpt-5-nano', category: 'OpenAI', type: 'text' },
    { name: 'gpt-5-mini', category: 'OpenAI', type: 'text' },
    { name: 'gpt-4.1-mini', category: 'OpenAI', type: 'text' },
    { name: 'gpt-4.1-nano', category: 'OpenAI', type: 'text' },
    { name: 'gpt-4o-mini', category: 'OpenAI', type: 'multimodal' },
    { name: 'gpt-3.5-turbo', category: 'OpenAI', type: 'text' },
    { name: 'o1-pro', category: 'OpenAI', type: 'text' },
    { name: 'o4-mini', category: 'OpenAI', type: 'text' },
    { name: 'o3-mini', category: 'OpenAI', type: 'text' },
    { name: 'gpt-oss-120b', category: 'OpenAI', type: 'text' },
    { name: 'gpt-image-1', category: 'OpenAI', type: 'image' },
    { name: 'dall-e-3', category: 'OpenAI', type: 'image' },
    
    // Google
    { name: 'gemini-2.5-pro', category: 'Google', type: 'multimodal' },
    { name: 'gemini-2.5-flash', category: 'Google', type: 'multimodal' },
    { name: 'gemini-2.5-flash-lite', category: 'Google', type: 'multimodal' },
    { name: 'gemma-3n-e4b', category: 'Google', type: 'text' },
    { name: 'nano-banana', category: 'Google', type: 'image' },
    
    // DeepSeek
    { name: 'deepseek-v3.1', category: 'DeepSeek', type: 'text' },
    { name: 'deepseek-v3.2', category: 'DeepSeek', type: 'text' },
    { name: 'deepseek-v3', category: 'DeepSeek', type: 'text' },
    { name: 'deepseek-chat', category: 'DeepSeek', type: 'text' },
    { name: 'deepseek-reasoner', category: 'DeepSeek', type: 'text' },
    { name: 'deepseek-r1', category: 'DeepSeek', type: 'text' },
    { name: 'deepseek-r1-0528', category: 'DeepSeek', type: 'text' },
    
    // Anthropic (Claude)
    { name: 'claude-sonnet-4.5', category: 'Anthropic', type: 'text' },
    { name: 'claude-sonnet-4', category: 'Anthropic', type: 'text' },
    { name: 'claude-3-7-sonnet', category: 'Anthropic', type: 'text' },
    { name: 'claude-haiku-4.5', category: 'Anthropic', type: 'text' },
    
    // Qwen (Alibaba)
    { name: 'qwen3-omni', category: 'Qwen', type: 'multimodal' },
    { name: 'qwen3-coder', category: 'Qwen', type: 'text' },
    { name: 'qwen3-coder-big', category: 'Qwen', type: 'text' },
    { name: 'qwen2.5-coder-32b', category: 'Qwen', type: 'text' },
    { name: 'qwen3-next', category: 'Qwen', type: 'text' },
    { name: 'qwq-32b-fast', category: 'Qwen', type: 'text' },
    
    // Meta (Llama)
    { name: 'llama-4-maverick', category: 'Meta', type: 'text' },
    { name: 'llama-4-scout', category: 'Meta', type: 'text' },
    { name: 'llama-3.3', category: 'Meta', type: 'text' },
    
    // xAI (Grok)
    { name: 'grok-4', category: 'xAI', type: 'multimodal' },
    { name: 'grok-4-think', category: 'xAI', type: 'multimodal' },
    { name: 'grok-code-1', category: 'xAI', type: 'text' },
    { name: 'grok-3-mini', category: 'xAI', type: 'text' },
    
    // Mistral AI
    { name: 'mistral-medium-3', category: 'Mistral', type: 'text' },
    { name: 'mistral-small-3.1-24b', category: 'Mistral', type: 'text' },
    
    // GLM (Zhipu AI)
    { name: 'glm-4.6', category: 'GLM', type: 'multimodal' },
    { name: 'glm-4.5', category: 'GLM', type: 'text' },
    { name: 'glm-4.5-air', category: 'GLM', type: 'text' },
    
    // AWS
    { name: 'nova-pro', category: 'AWS', type: 'text' },
    { name: 'nova-lite', category: 'AWS', type: 'text' },
    { name: 'nova-micro', category: 'AWS', type: 'text' },
    
    // Moonshot AI
    { name: 'kimi-k2', category: 'Moonshot', type: 'text' },
    { name: 'kimi-k2-0905', category: 'Moonshot', type: 'text' },
    
    // Nous Research
    { name: 'hermes-4-405b', category: 'Nous', type: 'text' },
    { name: 'hermes-3-405b', category: 'Nous', type: 'text' },
    
    // Stability AI
    { name: 'sd-3.5-large', category: 'Stability', type: 'image' },
    { name: 'sd-3.5', category: 'Stability', type: 'image' },
    { name: 'sdxl', category: 'Stability', type: 'image' },
    { name: 'cogvideox-flash', category: 'Stability', type: 'video' },
    
    // Flux
    { name: 'flux-schnell', category: 'Flux', type: 'image' },
    { name: 'seed-oss', category: 'Flux', type: 'text' },
    
    // Другие
    { name: 'command-a', category: 'Cohere', type: 'text' },
    { name: 'ernie-4.5', category: 'Baidu', type: 'text' },
    { name: 'nemotron-ultra-235b', category: 'NVIDIA', type: 'text' },
    { name: 'sonar', category: 'Perplexity', type: 'text' },
    { name: 'cliptagger-12b', category: 'Other', type: 'multimodal' },
    { name: 'goliath-120b', category: 'Other', type: 'text' },
    { name: 'lucid-origin', category: 'Other', type: 'text' },
    { name: 'ring-1t', category: 'Other', type: 'text' },
    { name: 'ling-1t', category: 'Other', type: 'text' }
];

module.exports = MODELS;
