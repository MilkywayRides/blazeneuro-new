#!/usr/bin/env python3
import requests
import sys

API_URL = "http://localhost:8000/admin/ai/chat"

print("AI Chat CLI\n")
USER_ID = input("Enter your user ID: ").strip()

if not USER_ID:
    print("User ID required!")
    sys.exit(1)

print("\nType 'exit' to quit\n")

while True:
    message = input("You: ").strip()
    
    if message.lower() == "exit":
        break
    
    if not message:
        continue
    
    try:
        response = requests.post(
            API_URL,
            json={"message": message, "userId": USER_ID}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"AI: {data.get('reply', 'No response')}\n")
        elif response.status_code == 403:
            print("Error: Unauthorized - You must be an admin to use this chat\n")
            break
        else:
            print(f"Error: {response.status_code} - {response.text}\n")
    except Exception as e:
        print(f"Error: {e}\n")
