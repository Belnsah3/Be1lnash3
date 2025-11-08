"""
Test G4F Providers - No Auth Required
"""
from g4f import Provider
import sys

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 60)
print("G4F PROVIDERS TEST - NO AUTH REQUIRED")
print("=" * 60)
print()

# Providers to check
providers_to_check = [
    'DeepInfra', 'HuggingFace', 'PollinationsAI', 'PollinationsImage',
    'MetaAI', 'Qwen', 'GLM', 'StabilityAI_SD35Large', 
    'BlackForestLabs_Flux1Dev', 'DuckDuckGo', 'You', 'Blackbox',
    'PerplexityLabs', 'Groq', 'DeepSeek', 'Gemini', 'Grok'
]

print("CHECKING PROVIDERS:")
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
            
            if needs_auth_flag:
                status = "[X] NEEDS AUTH"
                needs_auth.append(prov_name)
            elif not working:
                status = "[!] NOT WORKING"
                not_working.append(prov_name)
            else:
                status = "[OK] NO AUTH + WORKING"
                working_no_auth.append(prov_name)
            
            print(f"{status:25} {prov_name}")
    except Exception as e:
        print(f"[?] ERROR              {prov_name}: {str(e)[:30]}")

print()
print("=" * 60)
print("SUMMARY:")
print("=" * 60)
print(f"[OK] Working (No Auth):  {len(working_no_auth)}")
print(f"[X]  Needs Auth:         {len(needs_auth)}")
print(f"[!]  Not Working:        {len(not_working)}")
print()

if working_no_auth:
    print("[OK] WORKING PROVIDERS (NO AUTH):")
    for p in working_no_auth:
        print(f"   - {p}")
    print()

if needs_auth:
    print("[X] NEEDS AUTH:")
    for p in needs_auth:
        print(f"   - {p}")
    print()

if not_working:
    print("[!] NOT WORKING:")
    for p in not_working:
        print(f"   - {p}")
    print()

print("=" * 60)
print("RECOMMENDED PROVIDERS FOR YOUR CONFIG:")
print("=" * 60)
print()

recommended = {
    "Llama models": ["MetaAI", "DeepInfra", "HuggingFace"],
    "DeepSeek models": ["DeepInfra"],
    "Qwen models": ["Qwen", "DeepInfra"],
    "GLM models": ["GLM"],
    "Mistral models": ["DeepInfra", "HuggingFace"],
    "Images": ["PollinationsAI", "PollinationsImage", "StabilityAI_SD35Large"]
}

for model_type, providers in recommended.items():
    available = [p for p in providers if p in working_no_auth]
    if available:
        print(f"[+] {model_type}:")
        print(f"    {', '.join(available)}")
        print()

print("=" * 60)
print("[OK] TEST COMPLETE!")
print("=" * 60)
