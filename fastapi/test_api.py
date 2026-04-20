import requests

print("Testing FastAPI endpoints...\n")

# Test root endpoint
response = requests.get("http://localhost:8000/")
print(f"GET / - Status: {response.status_code}")
print(f"Response: {response.json()}\n")

# Test database endpoint
response = requests.get("http://localhost:8000/test-db")
print(f"GET /test-db - Status: {response.status_code}")
print(f"Response: {response.json()}")
