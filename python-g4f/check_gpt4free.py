"""Check gpt4free and gpt4free.pro providers"""
from g4f import Provider
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 60)
print("CHECKING GPT4FREE PROVIDERS")
print("=" * 60)
print()

# Check various name variations
variations = [
    'gpt4free',
    'Gpt4Free', 
    'GPT4Free',
    'gpt4free_pro',
    'Gpt4FreePro',
    'GPT4FreePro'
]

print("Checking name variations:")
for name in variations:
    exists = hasattr(Provider, name)
    print(f"  {'[OK]' if exists else '[X] '} {name}")

print()
print("=" * 60)
print("ALL PROVIDERS WITH 'FREE' OR 'GPT' IN NAME:")
print("=" * 60)

all_providers = [p for p in dir(Provider) if not p.startswith('_') and p[0].isupper()]
matching = [p for p in all_providers if 'free' in p.lower() or 'gpt' in p.lower()]

if matching:
    for p in sorted(matching):
        print(f"  - {p}")
else:
    print("  None found")

print()
print("=" * 60)
print(f"Total providers available: {len(all_providers)}")
print("=" * 60)
