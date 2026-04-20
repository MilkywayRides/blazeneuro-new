from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import asyncpg
from pydantic import BaseModel
from datetime import datetime

load_dotenv("../.env.local")
load_dotenv(".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    userId: str

@app.get("/")
async def root():
    return {"message": "FastAPI is running"}

@app.get("/test-db")
async def test_db():
    try:
        conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
        result = await conn.fetchval("SELECT COUNT(*) FROM user")
        await conn.close()
        return {"status": "success", "user_count": result}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/admin/ai/chat")
async def admin_chat(request: ChatRequest):
    try:
        conn = await asyncpg.connect(os.getenv("DATABASE_URL"))
        
        # Check if user is admin
        role = await conn.fetchval(
            'SELECT role FROM "user" WHERE id = $1',
            request.userId
        )
        
        if role != "admin":
            await conn.close()
            raise HTTPException(status_code=403, detail="Unauthorized")
        
        # Save user message
        await conn.execute(
            """
            INSERT INTO ai_chat (user_id, role, content, created_at)
            VALUES ($1, $2, $3, $4)
            """,
            request.userId, "user", request.message, datetime.utcnow()
        )
        
        # Call AI model
        import httpx
        try:
            async with httpx.AsyncClient(timeout=120.0) as client:  # 2 min timeout for cold start
                ai_response = await client.post(
                    os.getenv("AI_MODEL_URL_V2"),
                    json={
                        "prompt": request.message,
                        "secret": os.getenv("AI_API_SECRET")
                    }
                )
                if ai_response.status_code == 200:
                    response_data = ai_response.json()
                    ai_reply = response_data.get("response", "No response")
                else:
                    ai_reply = f"[AI Error {ai_response.status_code}] {ai_response.text}"
        except Exception as e:
            ai_reply = f"[AI Error] {str(e)}"
        
        # Save AI response
        await conn.execute(
            """
            INSERT INTO ai_chat (user_id, role, content, created_at)
            VALUES ($1, $2, $3, $4)
            """,
            request.userId, "assistant", ai_reply, datetime.utcnow()
        )
        
        await conn.close()
        return {"reply": ai_reply}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
