from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.hash import bcrypt
from pydantic import BaseModel
from database import SessionLocal, engine
from models import Base, User, Package
import json

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Gopu.gp Backend")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
security = HTTPBearer()
DEPLOY_TOKEN = "gopu-secret-token"

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- Auth routes ---
class AuthIn(BaseModel):
    email: str
    password: str

@app.post("/signup")
def signup(auth: AuthIn, db: Session = Depends(get_db)):
    if db.query(User).filter_by(email=auth.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    user = User(email=auth.email, password=bcrypt.hash(auth.password), otp="123456")
    db.add(user)
    db.commit()
    return {"ok": True, "otp": "123456"}

@app.post("/login")
def login(auth: AuthIn, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=auth.email).first()
    if not user or not bcrypt.verify(auth.password, user.password):
        raise HTTPException(status_code=403, detail="Identifiants invalides")
    return {"token": DEPLOY_TOKEN, "email": auth.email}

# --- Publish route ---
class PublishIn(BaseModel):
    name: str
    version: str
    source: str
    metadata: dict

@app.post("/publish")
def publish(pkg: PublishIn, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if credentials.credentials != DEPLOY_TOKEN:
        raise HTTPException(status_code=403, detail="Token invalide")
    db.add(Package(name=pkg.name, version=pkg.version, source=pkg.source, metadata=json.dumps(pkg.metadata)))
    db.commit()
    return {"ok": True, "name": pkg.name, "version": pkg.version}
