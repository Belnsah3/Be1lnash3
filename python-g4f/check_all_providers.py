"""Check all providers and their URLs"""
from g4f import Provider
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 60)
print("ALL G4F PROVIDERS")
print("=" * 60)
print()

all_providers = [p for p in dir(Provider) if not p.startswith('_') and p[0].isupper()]

print(f"Total providers: {len(all_providers)}")
print()

# Check for providers that might connect to gpt4free.pro
print("Looking for providers with 'pro' or 'api' in name:")
print()

for prov_name in sorted(all_providers):
    if 'pro' in prov_name.lower() or 'api' in prov_name.lower():
        try:
            prov = getattr(Provider, prov_name)
            url = getattr(prov, 'url', 'N/A')
            working = getattr(prov, 'working', True)
            needs_auth = getattr(prov, 'needs_auth', False)
            
            print(f"  {prov_name}:")
            print(f"    URL: {url}")
            print(f"    Working: {working}")
            print(f"    Needs Auth: {needs_auth}")
            print()
        except:
            pass

print("=" * 60)
print("Checking specific provider names:")
print("=" * 60)
print()

# Check specific names
specific = [
    'Gpt4FreePro',
    'GPT4FreePro', 
    'ApiGpt4Free',
    'Gpt4FreeAPI',
    'FreeGPT',
    'FreeGpt'
]

for name in specific:
    exists = hasattr(Provider, name)
    print(f"  {name}: {'EXISTS' if exists else 'NOT FOUND'}")
