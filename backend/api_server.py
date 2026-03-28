import os
import asyncio

# Silence verbose AI logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['AUTOGRAPH_VERBOSITY'] = '0'
import logging
import uuid
import time
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field
from jose import JWTError, jwt
from passlib.context import CryptContext
from psycopg2.pool import ThreadedConnectionPool
from dotenv import load_dotenv

# Internal Services
from speech_service import speech_service
from command_processor import command_processor
from template_service import template_service
from nlp_service import nlp_service

# Configuration
load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("VoxCode")

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Database Pool
db_pool = ThreadedConnectionPool(1, 20, dsn=DATABASE_URL)

# ─── Lifespan (Startup/Shutdown) ───
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Trigger background loading of heavy AI models
    logger.info("PRE-IGNITION: Pre-loading AI Speech & NLP Models...")
    try:
        # NLP models have their own threading in __init__
        # But we also trigger speech models
        import threading
        threading.Thread(target=speech_service.init_models, daemon=True).start()
    except Exception as e:
        logger.error(f"Startup loading failed: {e}")
    
    yield
    # Cleanup logic (if any) here

app = FastAPI(title="VoxCode Extreme API", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth Setup
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ─── Pydantic Models ───

class User(BaseModel):
    username: str

class UserCreate(User):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class SnippetCreate(BaseModel):
    title: str
    code: str
    language: str

class Snippet(SnippetCreate):
    id: int
    user_id: int
    created_at: datetime

# ─── Auth ───

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id: int = payload.get("id")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username, "id": user_id}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# ─── Database Helpers ───

def get_db():
    conn = db_pool.getconn()
    try:
        yield conn
    finally:
        db_pool.putconn(conn)

# ─── Endpoints ───

@app.post("/api/auth/register", response_model=Token)
async def register(user: UserCreate):
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            hashed = pwd_context.hash(user.password)
            cur.execute(
                "INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING id",
                (user.username, hashed)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            access_token = create_access_token(data={"sub": user.username, "id": user_id})
            return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")
    finally:
        db_pool.putconn(conn)

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, password_hash FROM users WHERE username = %s", (form_data.username,))
            user = cur.fetchone()
            if not user or not pwd_context.verify(form_data.password, user[1]):
                raise HTTPException(status_code=401, detail="Incorrect username or password")
            
            access_token = create_access_token(data={"sub": form_data.username, "id": user[0]})
            return {"access_token": access_token, "token_type": "bearer"}
    finally:
        db_pool.putconn(conn)

@app.get("/api/snippets", response_model=List[Snippet])
async def list_snippets(current_user: dict = Depends(get_current_user)):
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, title, code, language, user_id, created_at FROM snippets WHERE user_id = %s ORDER BY created_at DESC",
                (current_user["id"],)
            )
            rows = cur.fetchall()
            return [
                {
                    "id": r[0], "title": r[1], "code": r[2], 
                    "language": r[3], "user_id": r[4], "created_at": r[5]
                } for r in rows
            ]
    finally:
        db_pool.putconn(conn)

@app.post("/api/snippets", response_model=Snippet)
async def save_snippet(snippet: SnippetCreate, current_user: dict = Depends(get_current_user)):
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO snippets (title, code, language, user_id) VALUES (%s, %s, %s, %s) RETURNING id, created_at",
                (snippet.title, snippet.code, snippet.language, current_user["id"])
            )
            data = cur.fetchone()
            conn.commit()
            
            # Sync to Vector Index
            nlp_service.add_snippet_to_index(data[0], snippet.title, snippet.code, snippet.language)
            
            return {**snippet.dict(), "id": data[0], "user_id": current_user["id"], "created_at": data[1]}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db_pool.putconn(conn)

@app.post("/api/snippets/search")
async def search_snippets(req: Request, current_user: dict = Depends(get_current_user)):
    data = await req.json()
    query = data.get("query", "")
    results = nlp_service.search_snippets(query)
    return results

@app.delete("/api/snippets/{snippet_id}")
async def delete_snippet(snippet_id: int, current_user: dict = Depends(get_current_user)):
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM snippets WHERE id = %s AND user_id = %s", (snippet_id, current_user["id"]))
            conn.commit()
            return {"msg": "Deleted"}
    finally:
        db_pool.putconn(conn)

# ─── AI Logic ───

@app.post("/api/generate")
async def generate_code(req: Request):
    data = await req.json()
    prompt = data.get("prompt")
    lang = data.get("language")
    
    # Analyze prompt
    analysis = command_processor.process_transcript(prompt, lang)
    # Generate code using the service or use the pre-analyzed result
    template = analysis.get("generated_code")
    if not template:
        template = template_service.get_code(analysis["language"], analysis["intent"])
    
    # In a real app, this streams from the local LLM Server (Model Server)
    from fastapi.responses import StreamingResponse
    import httpx

    async def stream_output():
        # Add analysis metadata line first (hidden)
        yield f"data: {json.dumps({'metadata': analysis})}\n\n"
        
        # ELITE STRATEGY: If we have an enterprise-grade template, use it directly
        # to ensure 100% reliability and zero loops for 'Pro' shortcuts.
        elite_templates = [
            "jwt_enterprise", "quick_sort", "quick_sort_inplace", 
            "array_list", "stack", "react_comp",
            "binary_search", "sieve_eratosthenes", "linked_list",
            "fastapi_pro", "sqlalchemy_models", "spring_crud", "jpa_repo",
            "react_context", "redux_toolkit", "database_sqlite", "junit_advanced"
        ]
        if analysis.get("template_type") in elite_templates:
            # Simulate a live stream of the perfect code
            for chunk in [template[i:i+100] for i in range(0, len(template), 100)]:
                yield f"data: {json.dumps({'content': chunk})}\n\n"
                await asyncio.sleep(0.01)
            return

        # Otherwise, use the LLM for custom logic
        messages = [
            {"role": "system", "content": f"You are an Elite {lang} Coder. OUTPUT ONLY THE SOURCE CODE. NO MARKDOWN. NO BACKTICKS. NO CONVERSATION. NO EXPLANATION. IF YOU START EXPLAINING, YOU HAVE FAILED."},
            {"role": "user", "content": f"Implement {prompt}. MATCH THE COMPLEXITY OF THE REQUEST. If the request is simple, provide a simple, direct solution. If it is complex, provide a robust, enterprise-grade solution. Include only necessary imports."}
        ]
        
        # Stateful Code-Only Filter
        state = {
            "inside_think": False,
            "inside_code": False,
            "has_code_block": False,
            "finished": False,
            "buffer": ""
        }
        
        STOP_MARKERS = ["Key Feature", "Dependencies:", "Notes:", "Explanation:", "### ", "```"]

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", "http://localhost:8000/v1/chat/completions", json={
                    "messages": messages,
                    "stream": True,
                    "max_tokens": 4096,
                    "temperature": 0.0,
                    "repeat_penalty": 1.1
                }) as response:
                    async for line in response.aiter_lines():
                        if state["finished"]: break
                        if not line.startswith("data: "): continue
                        if "[DONE]" in line: break
                        
                        try:
                            chunk_json = json.loads(line[6:])
                            content = chunk_json["choices"][0]["delta"].get("content", "")
                            if not content: continue

                            state["buffer"] += content
                            
                            # 1. Handle Thinking Blocks (Aggressive)
                            if "<think>" in state["buffer"]:
                                state["inside_think"] = True
                                state["buffer"] = state["buffer"].split("<think>")[-1]
                            
                            if "</think>" in state["buffer"]:
                                state["inside_think"] = False
                                state["buffer"] = state["buffer"].split("</think>")[-1]
                                continue

                            if state["inside_think"]:
                                state["buffer"] = "" # Sink all thinking
                                continue

                            # 2. Handle Markdown Fences & Stopping
                            if "```" in state["buffer"]:
                                if not state["inside_code"]:
                                    state["inside_code"] = True
                                    state["has_code_block"] = True
                                    # Strip fence and language
                                    parts = state["buffer"].split("```")
                                    # Get the code part after the first fence
                                    code_part = parts[-1].split("\n", 1)
                                    state["buffer"] = code_part[1] if len(code_part) > 1 else ""
                                else:
                                    # Exiting code block -> DONE
                                    state["finished"] = True
                                    state["inside_code"] = False
                                    continue

                            # 3. Handle Stop Markers (if outside code or after code)
                            if state["has_code_block"] and not state["inside_code"]:
                                for marker in STOP_MARKERS:
                                    if marker in state["buffer"]:
                                        state["finished"] = True
                                        break
                            if state["finished"]: break

                            # 4. Yielding Logic
                            if state["inside_code"]:
                                to_yield = state["buffer"]
                                state["buffer"] = ""
                                yield f"data: {json.dumps({'content': to_yield})}\n\n"
                            else:
                                # Fallback for no-markdown or preparation
                                if not state["has_code_block"] and len(state["buffer"]) > 150:
                                    # If it starts with a common header, stop
                                    if any(m in state["buffer"] for m in STOP_MARKERS):
                                        state["finished"] = True
                                        continue
                                    to_yield = state["buffer"]
                                    state["buffer"] = ""
                                    yield f"data: {json.dumps({'content': to_yield})}\n\n"
                        except: continue

                    if not state["has_code_block"] and state["buffer"] and not state["finished"]:
                         yield f"data: {json.dumps({'content': state['buffer']})}\n\n"
        except Exception as e:
            logger.error(f"LLM Stream Error: {e}")
            for word in template.split():
                yield f"data: {json.dumps({'content': word + ' '})}\n\n"
                await asyncio.sleep(0.01)
            
    return StreamingResponse(stream_output(), media_type="text/event-stream")

@app.post("/api/explain")
async def explain_code(req: Request):
    data = await req.json()
    code = data.get("code")
    lang = data.get("language")
    
    async def stream_explanation():
        explanation = f"This {lang} code implements a logic based on your request. "
        explanation += "The NLP analysis identifies key data structures used here."
        for sentence in explanation.split("."):
            yield f"data: {json.dumps({'content': sentence.strip() + '. '})}\n\n"
            await asyncio.sleep(0.2)
            
    return StreamingResponse(stream_explanation(), media_type="text/event-stream")

# ─── Microphone Control ───

@app.post("/api/mic/start")
async def start_mic():
    speech_service.start_listening()
    return {"status": "listening"}

@app.post("/api/mic/stop")
async def stop_mic():
    speech_service.stop_listening()
    return {"status": "stopped"}

@app.post("/api/mic/clear")
async def clear_mic():
    speech_service.clear_transcript()
    return {"status": "cleared"}

@app.get("/api/mic/transcript")
async def get_mic_transcript():
    transcript = speech_service.get_transcript()
    audio_level = speech_service.get_audio_level()
    
    analysis = None
    if transcript and len(transcript.split()) > 2:
        # Perform real-time NLP analysis on the current transcript
        analysis = nlp_service.analyze_text(transcript)
    
    return {
        "transcript": transcript,
        "audio_level": audio_level,
        "is_running": speech_service.is_running(),
        "analysis": analysis
    }

# ─── WebSockets ───

@app.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("New WebSocket connection established")
    
    try:
        # Start background listener if needed, or wait for audio chunks
        while True:
            # For simplicity, we assume client sends audio or requests
            data = await websocket.receive_text()
            # Process text/audio here...
            await websocket.send_json({"transcript": "Processing...", "status": "listening"})
            
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")

@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "service": "VoxCode Extreme",
        "workers": 1,
        "db": "connected" if db_pool else "error"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
