from fastapi import APIRouter, HTTPException, Depends
from app.services.agent_service import AgentService
from app.services.db_service import db_service
from app.models.schemas import AccessRequestReq, AccessRequestRes, OTPVerifyReq, PrescriptionCreateReq
from app.dependencies import require_doctor

router = APIRouter(prefix="/api/doctor", tags=["Doctor"], dependencies=[Depends(require_doctor)])
service = AgentService()

@router.post("/request-access", response_model=AccessRequestRes)
def request_access(req: AccessRequestReq):
    try:
        res = service.request_doctor_access(req.doctorId, req.patientId)
        return {"message": "Access requested", "request": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-otp")
def verify_otp(req: OTPVerifyReq):
    try:
        res = service.verify_otp(req.requestId, req.otp)
        return {"message": "OTP verified", "verification": res}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/patient-summary/{patientId}")
def patient_summary(patientId: str):
    return service.analyze_patient(patientId)

@router.post("/create-prescription")
def create_prescription(req: PrescriptionCreateReq):
    try:
        res = service.create_prescription(req.model_dump())
        return {"message": "Prescription created", "prescription": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/my-patients/{doctorId}")
def my_patients(doctorId: str):
    # This should dynamically fetch from db_service where Doctor has active grants
    # Simplified placeholder
    return {"patients": []}
