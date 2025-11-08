"""
Тестирование провайдеров G4F без авторизации
"""
from g4f import Provider
import inspect

print("=" * 60)
print("G4F PROVIDERS TEST - NO AUTH REQUIRED")
print("=" * 60)
print()

# Список провайдеров для проверки
providers_to_check = [
    'DeepInfra', 'HuggingFace', 'PollinationsAI', 'PollinationsImage',
    'MetaAI', 'Qwen', 'GLM', 'StabilityAI_SD35Large', 
    'BlackForestLabs_Flux1Dev', 'DuckDuckGo', 'You', 'Blackbox',
    'PerplexityLabs', 'Groq', 'DeepSeek', 'Gemini', 'Grok'
]

print("📊 CHECKING PROVIDERS:")
print()

working_no_auth = []
needs_auth = []
not_working = []

for prov_name in providers_to_check:
    try:
        prov = getattr(Provider, prov_name, None)
        if prov:
            needs_auth_flag = getattr(prov, 'needs_auth', False)
            working = getattr(prov, 'working', True)
            
            status = ""
            if needs_auth_flag:
                status = "❌ NEEDS AUTH"
                needs_auth.append(prov_name)
            elif not working:
                status = "⚠️  NOT WORKING"
                not_working.append(prov_name)
            else:
                status = "✅ NO AUTH + WORKING"
                working_no_auth.append(prov_name)
            
            print(f"{status:25} {prov_name}")
    except Exception as e:
        print(f"❓ ERROR              {prov_name}: {str(e)[:30]}")

print()
print("=" * 60)
print("📈 SUMMARY:")
print("=" * 60)
print(f"✅ Working (No Auth):  {len(working_no_auth)}")
print(f"❌ Needs Auth:         {len(needs_auth)}")
print(f"⚠️  Not Working:        {len(not_working)}")
print()

if working_no_auth:
    print("✅ WORKING PROVIDERS (NO AUTH):")
    for p in working_no_auth:
        print(f"   - {p}")
    print()

if needs_auth:
    print("❌ NEEDS AUTH:")
    for p in needs_auth:
        print(f"   - {p}")
    print()

if not_working:
    print("⚠️  NOT WORKING:")
    for p in not_working:
        print(f"   - {p}")
    print()

print("=" * 60)
print("🎯 RECOMMENDED PROVIDERS FOR YOUR CONFIG:")
print("=" * 60)
print()

recommended = {
    "Llama models": ["MetaAI", "DeepInfra", "HuggingFace"],
    "DeepSeek models": ["DeepInfra"],
    "Qwen models": ["Qwen", "DeepInfra"],
    "GLM models": ["GLM"],
    "Mistral models": ["DeepInfra", "HuggingFace"],
    "Images (DALL-E, SD, Flux)": ["PollinationsAI", "PollinationsImage", "StabilityAI_SD35Large", "BlackForestLabs_Flux1Dev"]
}

for model_type, providers in recommended.items():
    available = [p for p in providers if p in working_no_auth]
    if available:
        print(f"📌 {model_type}:")
        print(f"   {', '.join(available)}")
        print()

print("=" * 60)
print("✅ TEST COMPLETE!")
print("=" * 60)
