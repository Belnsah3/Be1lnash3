// Полный список всех доступных моделей
const MODELS = [
    // Claude Models
    { name: 'claude-sonnet-4.5', category: 'Claude' },
    { name: 'claude-sonnet-4', category: 'Claude' },
    { name: 'claude-3.7-sonnet', category: 'Claude' },
    { name: 'claude-haiku-4.5', category: 'Claude' },
    { name: 'claude-3.5-sonnet', category: 'Claude' },
    { name: 'claude-3-opus', category: 'Claude' },
    { name: 'claude-3-sonnet', category: 'Claude' },
    { name: 'claude-3-haiku', category: 'Claude' },
    
    // Gemini Models
    { name: 'gemini-2.5-pro', category: 'Gemini' },
    { name: 'gemini-2.5-flash', category: 'Gemini' },
    { name: 'gemini-2.0-flash-exp', category: 'Gemini' },
    { name: 'gemini-exp-1206', category: 'Gemini' },
    { name: 'gemini-1.5-pro', category: 'Gemini' },
    { name: 'gemini-1.5-flash', category: 'Gemini' },
    
    // GPT Models
    { name: 'gpt-5-nano', category: 'GPT' },
    { name: 'gpt-5-chat', category: 'GPT' },
    { name: 'gpt-4.1-mini', category: 'GPT' },
    { name: 'gpt-4o', category: 'GPT' },
    { name: 'gpt-4o-mini', category: 'GPT' },
    { name: 'gpt-4-turbo', category: 'GPT' },
    { name: 'gpt-4', category: 'GPT' },
    { name: 'gpt-3.5-turbo', category: 'GPT' },
    
    // DeepSeek Models
    { name: 'deepseek-r1', category: 'DeepSeek' },
    { name: 'deepseek-v3.2', category: 'DeepSeek' },
    { name: 'deepseek-chat', category: 'DeepSeek' },
    { name: 'deepseek-coder', category: 'DeepSeek' },
    
    // Grok Models
    { name: 'grok-4', category: 'Grok' },
    { name: 'grok-3', category: 'Grok' },
    { name: 'grok-2', category: 'Grok' },
    { name: 'grok-beta', category: 'Grok' },
    
    // Llama Models
    { name: 'llama-4-maverick', category: 'Llama' },
    { name: 'llama-3.3-70b', category: 'Llama' },
    { name: 'llama-3.1-405b', category: 'Llama' },
    { name: 'llama-3.1-70b', category: 'Llama' },
    { name: 'llama-3.1-8b', category: 'Llama' },
    { name: 'llama-3-70b', category: 'Llama' },
    { name: 'llama-3-8b', category: 'Llama' },
    
    // Mistral Models
    { name: 'mistral-large', category: 'Mistral' },
    { name: 'mistral-medium', category: 'Mistral' },
    { name: 'mistral-small', category: 'Mistral' },
    { name: 'mixtral-8x7b', category: 'Mistral' },
    { name: 'mixtral-8x22b', category: 'Mistral' },
    
    // Qwen Models
    { name: 'qwen-2.5-72b', category: 'Qwen' },
    { name: 'qwen-2.5-coder-32b', category: 'Qwen' },
    { name: 'qwen-2-72b', category: 'Qwen' },
    { name: 'qwq-32b', category: 'Qwen' },
    
    // Phi Models
    { name: 'phi-4', category: 'Phi' },
    { name: 'phi-3.5-mini', category: 'Phi' },
    { name: 'phi-3-medium', category: 'Phi' },
    
    // Command Models
    { name: 'command-r-plus', category: 'Command' },
    { name: 'command-r', category: 'Command' },
    
    // Nemotron Models
    { name: 'nemotron-70b', category: 'Nemotron' },
    
    // Sonar Models
    { name: 'sonar-pro', category: 'Sonar' },
    { name: 'sonar', category: 'Sonar' },
    
    // Hermes Models
    { name: 'hermes-3-70b', category: 'Hermes' },
    { name: 'hermes-3-405b', category: 'Hermes' },
    
    // WizardLM Models
    { name: 'wizardlm-2-8x22b', category: 'WizardLM' },
    
    // Yi Models
    { name: 'yi-34b', category: 'Yi' },
    { name: 'yi-lightning', category: 'Yi' },
    
    // Dolphin Models
    { name: 'dolphin-mixtral-8x22b', category: 'Dolphin' },
    
    // Dbrx Models
    { name: 'dbrx-instruct', category: 'Dbrx' },
    
    // Mythomax Models
    { name: 'mythomax-l2-13b', category: 'Mythomax' },
    
    // Nous Models
    { name: 'nous-hermes-2-mixtral-8x7b', category: 'Nous' },
    
    // Toppy Models
    { name: 'toppy-m-7b', category: 'Toppy' },
    
    // OpenChat Models
    { name: 'openchat-3.6-8b', category: 'OpenChat' }
];

module.exports = MODELS;
