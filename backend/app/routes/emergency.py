from fastapi import APIRouter, HTTPException
from app.services.agent_service import AgentService
from app.utils.mock_data import get_mock_patient
from app.models.schemas import ScanQRReq

router = APIRouter(prefix="/api/emergency", tags=["Emergency"])
service = AgentService()

@router.post("/scan-qr")
def scan_qr(req: ScanQRReq):
    try:
        res = service.handle_emergency(req.qrData)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/critical-info/{patientId}")
def critical_info(patientId: str):
    patient = get_mock_patient(patientId)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {
        "bloodType": patient.get("bloodType"),
        "allergies": patient.get("allergies"),
        "chronicConditions": patient.get("chronicConditions")
    }
