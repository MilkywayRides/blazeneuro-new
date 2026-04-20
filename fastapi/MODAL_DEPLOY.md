# Deploy Gemma AI to Modal

1. Install Modal:
```bash
pip install modal
```

2. Setup Modal:
```bash
modal setup
```

3. Create secret:
```bash
modal secret create ai-secret AI_API_SECRET=843468041e6e1d32f94609992d3c0563fdb51e4d9edb62c4e8174f47e9e92562
```

4. Deploy:
```bash
modal deploy modal_ai.py
```

5. Update .env with the new URL Modal provides
