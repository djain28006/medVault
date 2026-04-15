from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ReportUploadResponse(BaseModel):
    message: str
    report: Dict[str, Any]

class AccessRequestReq(BaseModel):
    doctorId: str
    patientId: str

class AccessRequestRes(BaseModel):
    message: str
    request: Dict[str, Any]

class OTPVerifyReq(BaseModel):
    otp: str
    requestId: str

class Medication(BaseModel):
    drug: str
    dosage: str
    frequency: str
    duration: str

class PrescriptionCreateReq(BaseModel):
    patientId: str
    doctorId: str
    medications: List[Medication]

class HealthScoreResponse(BaseModel):
    patientId: str
    score: int
    category: str
    factors: List[str]

class EmergencyQRRequest(BaseModel):
    patientId: str

class ScanQRReq(BaseModel):
    qrData: str
