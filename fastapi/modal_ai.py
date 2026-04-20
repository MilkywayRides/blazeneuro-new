import modal

app = modal.App("gemma-ai")

@app.function(
    secrets=[modal.Secret.from_name("ai-secret")],
    timeout=300,
)
@modal.asgi_app()
def fastapi_app():
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    import os
    import anthropic
    
    web_app = FastAPI()
    
    class ChatRequest(BaseModel):
        prompt: str
        secret: str
    
    @web_app.post("/")
    def chat(request: ChatRequest):
        # Verify secret
        if request.secret != os.environ.get("AI_API_SECRET"):
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        # Simple echo for now (replace with your preferred AI API)
        response = f"AI Response: {request.prompt}"
        
        return {"response": response}
    
    return web_app
