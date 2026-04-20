#!/usr/bin/env python3
import httpx
import os
from dotenv import load_dotenv

load_dotenv('.env')

url = os.getenv("AI_MODEL_URL_V2")
secret = os.getenv("AI_API_SECRET")

print(f"Testing AI API: {url}\n")

# Test different endpoints and formats
tests = [
    {"endpoint": "", "json": {"prompt": "hi"}},
    {"endpoint": "", "json": {"message": "hi"}},
    {"endpoint": "/chat", "json": {"prompt": "hi"}},
    {"endpoint": "/chat", "json": {"message": "hi"}},
    {"endpoint": "/generate", "json": {"prompt": "hi"}},
    {"endpoint": "/v1/chat", "json": {"message": "hi"}},
]

for test in tests:
    try:
        full_url = f"{url}{test['endpoint']}"
        print(f"Testing: POST {full_url}")
        print(f"Body: {test['json']}")
        
        response = httpx.post(
            full_url,
            json=test['json'],
            headers={"Authorization": f"Bearer {secret}"},
            timeout=10.0
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text[:200]}\n")
        
        if response.status_code == 200:
            print("✓ SUCCESS! Use this configuration.\n")
            break
    except Exception as e:
        print(f"Error: {e}\n")
