#!/usr/bin/env python3
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

FASTAPI_URL = os.getenv("FASTAPI_URL", "http://localhost:8000")

def list_flows():
    """List all available flows"""
    try:
        response = httpx.get(f"{FASTAPI_URL}/api/flows", timeout=10.0)
        if response.status_code == 200:
            flows = response.json()
            if not flows:
                print("No flows found. Create one in the UI first.")
                return None
            
            print("\nAvailable Flows:")
            for i, flow in enumerate(flows, 1):
                print(f"{i}. {flow['name']} (ID: {flow['id']})")
            
            return flows
        else:
            print(f"Error fetching flows: {response.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def execute_flow():
    """Execute a flow"""
    flows = list_flows()
    if not flows:
        return
    
    choice = input("\nSelect flow number: ").strip()
    try:
        flow_idx = int(choice) - 1
        if flow_idx < 0 or flow_idx >= len(flows):
            print("Invalid selection")
            return
        
        flow = flows[flow_idx]
        print(f"\nExecuting flow: {flow['name']}")
        
        # Get input
        topic = input("Enter topic/input: ")
        
        print(f"\n⏳ Executing flow...\n")
        
        response = httpx.post(
            f"{FASTAPI_URL}/api/flows/execute",
            json={
                "flowId": flow['id'],
                "input": {"topic": topic, "client_id": "ui-client"}
            },
            timeout=120.0
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Flow executed successfully!\n")
            
            result = data['result']
            
            if 'blog_id' in result:
                print(f"📝 Blog created!")
                print(f"   Topic: {result.get('topic', 'N/A')}")
                print(f"   ID: {result['blog_id']}")
                print(f"   🔗 View at: {result['url']}\n")
            elif 'output' in result:
                print(f"📄 Output:\n")
                print(result['output'][:500] + "..." if len(result['output']) > 500 else result['output'])
                print()
            else:
                print(f"Result: {result}\n")
        else:
            print(f"❌ Error: {response.text}")
    except ValueError:
        print("Invalid input")
    except Exception as e:
        print(f"❌ Error: {e}")

def create_blog():
    print("Create Blog")
    topic = input("Enter blog topic: ")
    
    print(f"\nCreating blog about: {topic}")
    print(f"Using API: {FASTAPI_URL}\n")
    
    try:
        response = httpx.post(
            f"{FASTAPI_URL}/api/blogs/create",
            json={"topic": topic, "userId": "cli-user"},
            timeout=120.0
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✓ Blog created successfully!")
            print(f"\nID: {data['id']}")
            print(f"Topic: {data['topic']}")
            print(f"Status: {data['status']}")
            print(f"\nContent:\n{data['content'][:500]}...")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def main():
    print("Flow CLI\n")
    
    while True:
        print("1. Execute Flow")
        print("2. Create Blog (Direct)")
        print("3. Exit")
        
        choice = input("\nSelect option [1/2/3]: ").strip()
        
        if choice == "1":
            execute_flow()
        elif choice == "2":
            create_blog()
        elif choice == "3":
            print("Goodbye!")
            break
        else:
            print("Please select one of the available options")

if __name__ == "__main__":
    main()
