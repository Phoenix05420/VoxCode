import os
import asyncio

# Silence verbose AI logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['AUTOGRAPH_VERBOSITY'] = '0'
import logging
import json
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse, JSONResponse
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
from llm_service import llm_service
from compiler_service import compiler_service

# Configuration
load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("VoxCode")

DATABASE_URL = os.getenv("DATABASE_URL")
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24
CLERK_PEM_PUBLIC_KEY = os.getenv("CLERK_PEM_PUBLIC_KEY")
CLERK_ISSUER = os.getenv("CLERK_ISSUER")
CLERK_AUTHORIZED_PARTIES = [
    party.strip() for party in os.getenv("CLERK_AUTHORIZED_PARTIES", "").split(",") if party.strip()
]

# Database Pool (optional - works without PostgreSQL for demo mode)
if DATABASE_URL:
    db_pool = ThreadedConnectionPool(1, 20, dsn=DATABASE_URL)
else:
    db_pool = None
    logger.warning("DATABASE_URL not set - running in demo mode (no persistence)")

# ─── Lifespan (Startup/Shutdown) ───
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Trigger background loading of heavy AI models
    logger.info("PRE-IGNITION: Pre-loading AI Speech & NLP Models...")
    try:
        ensure_schema()
        # NLP models have their own threading in __init__
        # But we also trigger speech models
        import threading
        threading.Thread(target=speech_service.init_models, daemon=True).start()
    except Exception as e:
        logger.error(f"Startup loading failed: {e}")
    
    yield
    # Cleanup logic (if any) here

app = FastAPI(title="VoxCode Extreme API", lifespan=lifespan)

ELITE_TEMPLATES = {
    "jwt_enterprise", "quick_sort", "quick_sort_inplace",
    "array_list", "stack", "react_comp",
    "binary_search", "sieve_eratosthenes", "linked_list",
    "fastapi_pro", "sqlalchemy_models", "spring_crud", "jpa_repo",
    "react_context", "redux_toolkit", "database_sqlite", "junit_advanced",
}

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
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

# ─── Pydantic Models ───

class User(BaseModel):
    username: str

class UserCreate(User):
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AuthResponse(Token):
    user: User

class PromptRequest(BaseModel):
    prompt: str = Field(min_length=1)
    language: str = Field(min_length=1)

class CodeRequest(BaseModel):
    code: str = Field(min_length=1)
    language: str = Field(min_length=1)

class ExecuteRequest(BaseModel):
    code: str = Field(min_length=1)
    language: str = Field(min_length=1)
    stdin: str = Field("", description="Standard input for the program")
    timeout: int = Field(5, ge=1, le=30, description="Timeout in seconds")
    mode: str = Field("standard", description="Execution mode: standard, audit, trace, test")
    test_cases: Optional[List[dict]] = Field(None, description="Test cases for unit test benchmarking")

class SearchRequest(BaseModel):
    query: str = ""

class SnippetCreate(BaseModel):
    title: str
    code: str
    language: str

class Snippet(SnippetCreate):
    id: int
    user_id: str
    created_at: datetime

# ─── Auth ───

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def get_session_token(request: Request, bearer_token: str | None):
    if bearer_token:
        return bearer_token
    cookie_token = request.cookies.get("__session")
    if cookie_token:
        return cookie_token
    raise HTTPException(status_code=401, detail="Missing authentication token")

def verify_clerk_session(token: str):
    if not CLERK_PEM_PUBLIC_KEY:
        raise HTTPException(status_code=500, detail="CLERK_PEM_PUBLIC_KEY is not configured")

    try:
        claims = jwt.decode(
            token,
            CLERK_PEM_PUBLIC_KEY,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER if CLERK_ISSUER else None,
            options={"verify_aud": False},
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Clerk session")

    if CLERK_AUTHORIZED_PARTIES:
        azp = claims.get("azp")
        if azp not in CLERK_AUTHORIZED_PARTIES:
            raise HTTPException(status_code=401, detail="Unauthorized Clerk session")

    subject = claims.get("sub")
    if not subject:
        raise HTTPException(status_code=401, detail="Invalid Clerk session payload")

    return {
        "id": subject,
        "username": claims.get("username") or claims.get("preferred_username") or subject,
        "auth_provider": "clerk",
    }

async def get_current_user(request: Request, token: str | None = Depends(oauth2_scheme)):
    session_token = get_session_token(request, token)

    try:
        token_alg = jwt.get_unverified_header(session_token).get("alg")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    if token_alg == "RS256" and CLERK_PEM_PUBLIC_KEY:
        return verify_clerk_session(session_token)

    try:
        payload = jwt.decode(session_token, JWT_SECRET, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        user_id = payload.get("id")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username, "id": str(user_id), "auth_provider": "local"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")

# ─── Database Helpers ───

def get_db():
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not configured (demo mode)")
    conn = db_pool.getconn()
    try:
        yield conn
    finally:
        db_pool.putconn(conn)

# ─── Endpoints ───

@app.post("/api/auth/register", response_model=AuthResponse)
async def register(user: UserCreate):
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not configured (demo mode)")
    username = user.username.strip()
    password = user.password.strip()
    if len(username) < 3:
        raise HTTPException(status_code=400, detail="Username must be at least 3 characters")
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            hashed = pwd_context.hash(password)
            cur.execute(
                "INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING id",
                (username, hashed)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            access_token = create_access_token(data={"sub": username, "id": user_id})
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {"id": user_id, "username": username},
            }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=f"Registration failed: {str(e)}")
    finally:
        db_pool.putconn(conn)

def ensure_schema():
    if not db_pool:
        return
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(64) UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                )
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS snippets (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    code TEXT NOT NULL,
                    language VARCHAR(32) NOT NULL,
                    user_id INTEGER NULL REFERENCES users(id) ON DELETE CASCADE,
                    auth_subject VARCHAR(255),
                    username VARCHAR(255),
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                )
                """
            )
            cur.execute(
                "ALTER TABLE snippets ADD COLUMN IF NOT EXISTS auth_subject VARCHAR(255)"
            )
            cur.execute(
                "ALTER TABLE snippets ADD COLUMN IF NOT EXISTS username VARCHAR(255)"
            )
            cur.execute(
                "ALTER TABLE snippets ALTER COLUMN user_id DROP NOT NULL"
            )
            cur.execute(
                "CREATE INDEX IF NOT EXISTS idx_snippets_user_created_at ON snippets(user_id, created_at DESC)"
            )
            cur.execute(
                "CREATE INDEX IF NOT EXISTS idx_snippets_auth_subject_created_at ON snippets(auth_subject, created_at DESC)"
            )
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        db_pool.putconn(conn)

@app.post("/api/auth/login")
async def login_json(payload: LoginRequest):
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not configured (demo mode)")
    username = payload.username.strip()
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, password_hash FROM users WHERE username = %s", (username,))
            user = cur.fetchone()
            if not user or not pwd_context.verify(payload.password, user[1]):
                raise HTTPException(status_code=401, detail="Incorrect username or password")

            access_token = create_access_token(data={"sub": username, "id": user[0]})
            return {
                "access_token": access_token,
                "token_type": "bearer",
                "user": {"id": user[0], "username": username},
            }
    finally:
        db_pool.putconn(conn)

@app.get("/api/auth/me", response_model=User)
async def auth_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user["username"]}

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not configured (demo mode)")
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
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not configured (demo mode)")
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id, title, code, language, COALESCE(auth_subject, user_id::text), created_at
                FROM snippets
                WHERE auth_subject = %s OR user_id::text = %s
                ORDER BY created_at DESC
                """,
                (current_user["id"], current_user["id"])
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
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not configured (demo mode)")
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO snippets (title, code, language, user_id, auth_subject, username)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, created_at
                """,
                (
                    snippet.title,
                    snippet.code,
                    snippet.language,
                    int(current_user["id"]) if current_user.get("auth_provider") == "local" and str(current_user["id"]).isdigit() else None,
                    current_user["id"],
                    current_user["username"],
                )
            )
            data = cur.fetchone()
            conn.commit()
            
            # Sync to Vector Index
            nlp_service.add_snippet_to_index(data[0], snippet.title, snippet.code, snippet.language)
            
            return {**snippet.model_dump(), "id": data[0], "user_id": current_user["id"], "created_at": data[1]}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db_pool.putconn(conn)

@app.post("/api/snippets/search")
async def search_snippets(payload: SearchRequest, current_user: dict = Depends(get_current_user)):
    results = nlp_service.search_snippets(payload.query)
    return results

@app.delete("/api/snippets/{snippet_id}")
async def delete_snippet(snippet_id: int, current_user: dict = Depends(get_current_user)):
    if not db_pool:
        raise HTTPException(status_code=503, detail="Database not configured (demo mode)")
    conn = db_pool.getconn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM snippets
                WHERE id = %s AND (auth_subject = %s OR user_id::text = %s)
                """,
                (snippet_id, current_user["id"], current_user["id"])
            )
            conn.commit()
            return {"msg": "Deleted"}
    finally:
        db_pool.putconn(conn)

# ─── AI Logic ───

@app.post("/api/generate")
async def generate_code(payload: PromptRequest):
    prompt = payload.prompt.strip()
    lang = payload.language.strip().lower()
    analysis = command_processor.process_transcript(prompt, lang)
    template = analysis.get("generated_code")
    if not template:
        template = template_service.get_code(analysis["language"], analysis["intent"])

    from fastapi.responses import StreamingResponse

    async def stream_output():
        try:
            yield f"data: {json.dumps({'metadata': analysis})}\n\n"

            if analysis.get("template_type") in ELITE_TEMPLATES:
                for chunk in [template[i:i+100] for i in range(0, len(template), 100)]:
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
                    await asyncio.sleep(0.01)
                return

            messages = [
                {"role": "system", "content": f"You are an Elite {lang} Coder. OUTPUT ONLY THE SOURCE CODE. NO MARKDOWN. NO BACKTICKS. NO CONVERSATION. NO EXPLANATION. IF YOU START EXPLAINING, YOU HAVE FAILED."},
                {"role": "user", "content": f"Implement {prompt}. MATCH THE COMPLEXITY OF THE REQUEST. If the request is simple, provide a simple, direct solution. If it is complex, provide a robust, enterprise-grade solution. Include only necessary imports."}
            ]

            async for chunk in llm_service.stream_code(messages, fallback_text=template, repeat_penalty=1.1):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
        except asyncio.CancelledError:
            logger.info("Client disconnected during code generation stream")
            return

    return StreamingResponse(stream_output(), media_type="text/event-stream")

@app.post("/api/optimize")
async def optimize_code(payload: CodeRequest):
    code = payload.code
    lang = payload.language.strip().lower()

    async def stream_optimization():
        try:
            prompt = (
                f"Optimize this {lang} code for readability, correctness, and performance where appropriate. "
                "Return only the improved source code.\n\n"
                f"{code}"
            )
            analysis = command_processor.process_transcript(prompt, lang)
            template = analysis.get("generated_code") or code
            messages = [
                {"role": "system", "content": f"You are an expert {lang} code optimizer. Return source code only."},
                {"role": "user", "content": prompt},
            ]

            async for chunk in llm_service.stream_code(messages, fallback_text=template, repeat_penalty=1.05):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
        except asyncio.CancelledError:
            logger.info("Client disconnected during optimization stream")
            return

    return StreamingResponse(stream_optimization(), media_type="text/event-stream")

@app.post("/api/explain")
async def explain_code(payload: CodeRequest):
    code = payload.code
    lang = payload.language.strip().lower()
    
    async def stream_explanation():
        try:
            analysis = nlp_service.analyze_text(code[:4000])
            fallback = (
                f"This {lang} code appears to use "
                f"{', '.join(analysis.get('keywords', [])[:5]) or 'standard program structure'}. "
                f"Detected concepts: {', '.join(analysis.get('code_concepts', {}).keys()) or 'none'}."
            )
            messages = [
                {
                    "role": "system",
                    "content": "You explain code clearly and concisely. Focus on control flow, important data structures, and practical behavior.",
                },
                {
                    "role": "user",
                    "content": f"Explain this {lang} code in plain language. Keep it concise but useful.\n\n{code}",
                },
            ]

            async for chunk in llm_service.stream_text(messages, fallback_text=fallback):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
        except asyncio.CancelledError:
            logger.info("Client disconnected during explanation stream")
            return

    return StreamingResponse(stream_explanation(), media_type="text/event-stream")

# ─── In-Built Compiler & Code Execution ───

@app.post("/api/execute")
@app.post("/api/compile")
async def execute_code_endpoint(payload: ExecuteRequest):
    """Compiles (if applicable) and executes source code in an isolated sandbox across 4 specialized modes."""
    result = compiler_service.execute_code(
        code=payload.code,
        language=payload.language,
        stdin=payload.stdin,
        timeout=payload.timeout,
        mode=payload.mode,
        test_cases=payload.test_cases
    )
    return result

@app.get("/api/compiler/languages")
async def get_compiler_languages():
    """Returns status and versions of installed OS compilers and interpreters."""
    return compiler_service.get_supported_languages()

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
        "db": "connected" if db_pool else "demo (no database)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001)
