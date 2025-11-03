from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from passlib.hash import bcrypt
from pydantic import BaseModel
import psycopg
import json

# --- Configuration ---
DEPLOY_TOKEN = "gopu-secret-token"
DB_CONFIG = {
    "dbname": "gopu",
    "user": "ceose",
    "password": "agentic",
    "host": "sources-dl87.onrender.com",
    "port": 5432,
    "autocommit": True
}

# --- App setup ---
app = FastAPI(title="Gopu.gp Backend")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
security = HTTPBearer()

# --- DB helper ---
def get_conn():
    return psycopg.connect(**DB_CONFIG)

# --- Models ---
class AuthIn(BaseModel):
    email: str
    password: str

class PublishIn(BaseModel):
    name: str
    version: str
    source: str
    metadata: dict

# --- Auth routes ---
@app.post("/signup")
def signup(auth: AuthIn):
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("SELECT 1 FROM users WHERE email = %s", (auth.email,))
        if cur.fetchone():
            raise HTTPException(status_code=400, detail="Email déjà utilisé")
        hashed = bcrypt.hash(auth.password)
        cur.execute("INSERT INTO users (email, password, otp, verified) VALUES (%s, %s, %s, %s)",
                    (auth.email, hashed, "123456", False))
    return {"ok": True, "otp": "123456"}

@app.post("/login")
def login(auth: AuthIn):
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("SELECT password FROM users WHERE email = %s", (auth.email,))
        row = cur.fetchone()
        if not row or not bcrypt.verify(auth.password, row[0]):
            raise HTTPException(status_code=403, detail="Identifiants invalides")
    return {"token": DEPLOY_TOKEN, "email": auth.email}

# --- Publish route ---
@app.post("/publish")
def publish(pkg: PublishIn, credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != DEPLOY_TOKEN:
        raise HTTPException(status_code=403, detail="Token invalide")
    conn = get_conn()
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO packages (name, version, source, metadata)
            VALUES (%s, %s, %s, %s)
        """, (pkg.name, pkg.version, pkg.source, json.dumps(pkg.metadata)))
    return {"ok": True, "name": pkg.name, "version": pkg.version}
