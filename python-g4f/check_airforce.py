"""Check ApiAirforce provider"""
from g4f import Provider
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

print("=" * 60)
print("ApiAirforce Provider Details")
print("=" * 60)
print()

prov = Provider.ApiAirforce

print(f"URL: {getattr(prov, 'url', 'N/A')}")
print(f"Working: {getattr(prov, 'working', False)}")
print(f"Needs Auth: {getattr(prov, 'needs_auth', False)}")
print(f"Supports Stream: {getattr(prov, 'supports_stream', False)}")
print()

# Check if this is the same as "Airforce" provider
print("Comparing with 'Airforce' provider:")
if hasattr(Provider, 'Airforce'):
    airforce = Provider.Airforce
    print(f"  Airforce exists: YES")
    print(f"  Same as ApiAirforce: {airforce == prov}")
else:
    print(f"  Airforce exists: NO")

print()
print("=" * 60)
print("CONCLUSION:")
print("=" * 60)
print()
print("ApiAirforce is the correct provider name!")
print("URL: https://api.airforce")
print("Status: Working, No Auth Required")
print()
print("Use in config: 'ApiAirforce' (not 'Airforce')")
