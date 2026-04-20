from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime
import asyncpg
import json

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AI_MODEL_URL = os.getenv("AI_MODEL_URL_V2")
AI_API_SECRET = os.getenv("AI_API_SECRET")
DATABASE_URL = os.getenv("DATABASE_URL")

# WebSocket connections
active_connections: dict[str, WebSocket] = {}

class BlogCreate(BaseModel):
    topic: str
    userId: str | None = None

class BlogResponse(BaseModel):
    id: str
    topic: str
    content: str | None
    status: str

class FlowExecute(BaseModel):
    flowId: str
    input: dict

@app.post("/api/blogs/create", response_model=BlogResponse)
async def create_blog(blog: BlogCreate):
    """Create a new blog using AI"""
    blog_id = str(uuid.uuid4())
    
    try:
        # Call AI model
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{AI_MODEL_URL}/v1/chat/completions",
                json={
                    "messages": [
                        {"role": "user", "content": f"Write a comprehensive blog post about: {blog.topic}"}
                    ],
                    "temperature": 0.7,
                },
                headers={"Authorization": f"Bearer {AI_API_SECRET}"}
            )
            
            print(f"AI Response Status: {response.status_code}")
            print(f"AI Response: {response.text}")
            
            if response.status_code == 200:
                result = response.json()
                content = result.get("content") or result["choices"][0]["message"]["content"]
                
                # TODO: Save to database
                return BlogResponse(
                    id=blog_id,
                    topic=blog.topic,
                    content=content,
                    status="published"
                )
            else:
                raise HTTPException(status_code=500, detail=f"AI generation failed: {response.text}")
                
    except httpx.HTTPError as e:
        print(f"HTTP Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/blogs/{blog_id}")
async def get_blog(blog_id: str):
    """Get a blog by ID"""
    # TODO: Fetch from database
    return {"id": blog_id, "topic": "Sample", "content": "Sample content"}

@app.get("/api/blogs")
async def list_blogs(userId: str | None = None):
    """List all blogs"""
    # TODO: Fetch from database
    return []

@app.get("/api/flows")
async def list_flows():
    """List all flows"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        flows = await conn.fetch('SELECT id, name, nodes, edges FROM flows ORDER BY created_at DESC')
        return [dict(flow) for flow in flows]
    finally:
        await conn.close()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    active_connections[client_id] = websocket
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        if client_id in active_connections:
            del active_connections[client_id]

async def send_execution_update(client_id: str, node_id: str, status: str, data: dict = None):
    """Send execution update to WebSocket client"""
    if client_id in active_connections:
        try:
            await active_connections[client_id].send_json({
                "nodeId": node_id,
                "status": status,
                "data": data or {}
            })
        except:
            pass

@app.post("/api/flows/execute")
async def execute_flow(flow_exec: FlowExecute):
    """Execute a flow by ID"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        # Get flow
        flow = await conn.fetchrow('SELECT * FROM flows WHERE id = $1', flow_exec.flowId)
        if not flow:
            raise HTTPException(status_code=404, detail="Flow not found")
        
        nodes = json.loads(flow['nodes']) if isinstance(flow['nodes'], str) else flow['nodes']
        edges = json.loads(flow['edges']) if isinstance(flow['edges'], str) else flow['edges']
        
        # Execute flow
        client_id = flow_exec.input.get('client_id', 'cli')
        result = await execute_flow_nodes(nodes, edges, flow_exec.input, conn, client_id)
        return {"status": "success", "result": result}
    finally:
        await conn.close()

async def execute_flow_nodes(nodes, edges, input_data, conn, client_id: str = None):
    """Execute nodes in order based on edges"""
    node_outputs = {}
    
    # Find start node
    start_node = next((n for n in nodes if n.get('data', {}).get('label', '').lower() == 'start'), None)
    if not start_node:
        raise HTTPException(status_code=400, detail="No start node found")
    
    current_node_id = start_node['id']
    node_outputs[current_node_id] = input_data
    
    print(f"Starting execution from node: {current_node_id}")
    print(f"Total nodes: {len(nodes)}, Total edges: {len(edges)}")
    
    # Execute nodes in sequence
    while current_node_id:
        # Send executing status
        if client_id:
            await send_execution_update(client_id, current_node_id, "executing")
        
        # Find next edge
        next_edge = next((e for e in edges if e['source'] == current_node_id), None)
        print(f"Current node: {current_node_id}, Next edge: {next_edge}")
        
        if not next_edge:
            print("No next edge found, breaking")
            break
        
        next_node_id = next_edge['target']
        next_node = next((n for n in nodes if n['id'] == next_node_id), None)
        
        if not next_node:
            break
        
        # Execute node based on type
        node_type = next_node['data'].get('label', '').lower()
        print(f"Executing node: {next_node_id}, type: {node_type}, label: {next_node['data'].get('label')}")
        
        if node_type in ['process', 'transform']:
            prompt = next_node['data'].get('prompt', '')
            
            # Get the actual topic from input_data
            current_data = node_outputs[current_node_id]
            topic = current_data.get('topic') or input_data.get('topic', '')
            
            # Replace {topic} in prompt
            prompt = prompt.replace('{topic}', topic)
            
            # Replace other variables
            for key, value in current_data.items():
                if key not in ['client_id', 'topic']:
                    prompt = prompt.replace(f"{{{key}}}", str(value))
            
            print(f"Calling AI with prompt: {prompt}")
            
            # Call AI
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{AI_MODEL_URL}/v1/chat/completions",
                    json={
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": float(next_node['data'].get('temperature', 0.7)),
                    },
                    headers={"Authorization": f"Bearer {AI_API_SECRET}"}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result.get("content") or result["choices"][0]["message"]["content"]
                    # Preserve topic through the flow
                    node_outputs[next_node_id] = {
                        "output": content, 
                        "topic": topic
                    }
                    print(f"AI response: {content[:100]}...")
                else:
                    raise HTTPException(status_code=500, detail="AI generation failed")
        
        elif node_type == 'input':
            # Pass through input data
            node_outputs[next_node_id] = node_outputs[current_node_id]
        
        elif node_type == 'output':
            # Pass through output data
            node_outputs[next_node_id] = node_outputs[current_node_id]
        
        elif node_type == 'publish':
            # Save blog to database
            try:
                blog_id = str(uuid.uuid4())
                topic = input_data.get('topic', 'Untitled')
                content = node_outputs[current_node_id].get('output', '')
                
                print(f"Publishing blog - Topic: {topic}, Content length: {len(content)}")
                
                await conn.execute(
                    'INSERT INTO blogs (id, user_id, topic, content, status, published) VALUES ($1, $2, $3, $4, $5, $6)',
                    blog_id, 'cli-user', topic, content, 'published', True
                )
                
                print(f"Blog saved with ID: {blog_id}")
                
                node_outputs[next_node_id] = {
                    "blog_id": blog_id,
                    "url": f"http://localhost:3000/blog/{blog_id}",
                    "topic": topic
                }
            except Exception as e:
                print(f"Error publishing blog: {e}")
                raise
        
        elif node_type == 'end':
            # Just return the result from publish node
            if client_id:
                await send_execution_update(client_id, next_node_id, "completed", node_outputs[current_node_id])
            return node_outputs[current_node_id]
        
        # Send completed status
        if client_id:
            await send_execution_update(client_id, next_node_id, "completed")
        
        current_node_id = next_node_id
    
    return node_outputs.get(current_node_id, {})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
