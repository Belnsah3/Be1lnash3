"""Quick test - check if g4f is installed"""
try:
    from g4f import Provider
    print("✅ g4f installed!")
    print(f"✅ Available providers: {len(dir(Provider))}")
    
    # Quick check
    providers = ['DeepInfra', 'MetaAI', 'Qwen', 'GLM', 'PollinationsAI']
    print("\nChecking key providers:")
    for p in providers:
        exists = hasattr(Provider, p)
        print(f"  {'✅' if exists else '❌'} {p}")
        
except ImportError as e:
    print(f"❌ g4f not installed: {e}")
    print("\nInstall with: pip install g4f")
