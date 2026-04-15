from fastapi import APIRouter, HTTPException
from app.services.agent_service import AgentService
from app.models.schemas import ScanQRReq
from fastapi.responses import Response

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
    try:
        res = service.get_emergency_critical_info(patientId)
        return res
    except Exception as e:
        raise HTTPException(status_code=404, detail="Patient record not accessible")

@router.get("/download-summary/{patientId}")
def download_summary(patientId: str):
    try:
        pdf_bytes = service.get_emergency_summary_pdf(patientId)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"inline; filename=emergency_summary_{patientId}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate dossier: {str(e)}")
