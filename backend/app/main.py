import logging
import os
from dotenv import load_dotenv

# Explicitly load .env from the backend directory with override=True
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path, override=True)



from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .routes import patient, doctor, emergency
from .dependencies import get_current_user
from .services.db_service import db_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")




app = FastAPI(title="Healthcare API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patient.router)
app.include_router(doctor.router)
app.include_router(emergency.router)



@app.get("/")
def root():
    return {
        "status": "MediAgent API v1.1.0 (Live)",
        "provider": "OpenAI-Primary",
        "timestamp": "2026-04-15"
    }
    
@app.get("/api/test-email")
def test_email(email: str = "danishsjain@gmail.com"):
    """Public diagnostic endpoint to verify Resend connectivity."""
    from .services.mail_service import mail_service
    res = mail_service.send_test_email(email)
    return {"status": "triggered", "response": res}




class RegisterRequest(BaseModel):
    role: str = "patient"

@app.post("/api/auth/register")
def register_user(req: RegisterRequest, current_user: dict = Depends(get_current_user)):
    """Register a new user doc in Firestore with their role (called after Firebase Auth signup)."""
    user_data = {
        "uid": current_user["uid"],
        "email": current_user.get("email", ""),
        "role": req.role,
    }
    db_service.save_user(user_data)
    return {"message": "User registered", "user": user_data}

