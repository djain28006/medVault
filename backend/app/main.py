import logging
import os
from dotenv import load_dotenv

# Load .env locally; Render/Prod uses dashboard environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(env_path):
    load_dotenv(env_path, override=True)



from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Any
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from .routes import patient, doctor
from .dependencies import get_current_user
from .services.db_service import db_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")




app = FastAPI(title="Healthcare API", version="1.0.0")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patient.router)
app.include_router(doctor.router)



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
    email: Optional[str] = None
    bloodType: Optional[str] = "Unknown"
    emergencyContacts: Optional[List[dict]] = []

@app.post("/api/auth/register")
def register_user(req: RegisterRequest, current_user: dict = Depends(get_current_user)):
    """Register a new user doc in Firestore with their role and emergency data."""
    final_email = req.email or current_user.get("email", "")
    
    user_data = {
        "uid": current_user["uid"],
        "email": final_email,
        "role": req.role,
        "bloodType": req.bloodType,
        "emergencyContacts": req.emergencyContacts
    }
    db_service.save_user(user_data)
    return {"message": "User registered", "user": user_data}

