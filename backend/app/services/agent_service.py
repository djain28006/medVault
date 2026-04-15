import uuid
import datetime
from agents.record_agent import RecordAgent
from agents.access_agent import AccessAgent
from agents.alert_agent import AlertAgent
from agents.doctor_access_agent import DoctorAccessAgent
from agents.intelligence_agent import IntelligenceAgent
from agents.prescription_agent import PrescriptionAgent
from agents.emergency_agent import EmergencyAgent

from app.services.db_service import db_service
from app.firebase_config import bucket

class AgentService:
    def __init__(self):
        self.record_agent = RecordAgent()
        self.access_agent = AccessAgent()
        self.alert_agent = AlertAgent()
        self.doctor_access_agent = DoctorAccessAgent()
        self.intelligence_agent = IntelligenceAgent()
        self.prescription_agent = PrescriptionAgent()
        self.emergency_agent = EmergencyAgent()

    def process_record(self, file_name: str, file_bytes: bytes, content_type: str, patient_id: str) -> dict:
        # 1. Upload to Firebase Storage
        signed_url = None
        if bucket:
            blob_path = f"patients/{patient_id}/reports/{uuid.uuid4().hex}_{file_name}"
            blob = bucket.blob(blob_path)
            blob.upload_from_string(file_bytes, content_type=content_type)
            # Generate a Signed URL valid for 7 days ensuring Privacy
            signed_url = blob.generate_signed_url(expiration=datetime.timedelta(days=7), method='GET')
        else:
            signed_url = "mock_url_since_firebase_not_configured"

        # 2. Extract logic via Agent
        result = self.record_agent.process_record(file_name, file_bytes, content_type, patient_id)
        result["fileUrl"] = signed_url
        result["storagePath"] = blob_path if bucket else "mock_path"

        # 3. Save metadata to Firestore
        db_service.save_report(result)
        
        # 4. Trigger subsequent agents based on extracted data
        extracted = result.get("extractedData", {})
        
        # Save medications to prescriptions if present
        if extracted.get("medications"):
            import logging
            logging.getLogger(__name__).info(f"💊 [AgentService] Found {len(extracted['medications'])} medications in report, saving to DB.")
            rx_data = {
                "patientId": patient_id,
                "doctorId": "system_extracted", 
                "medications": extracted["medications"],
                "sourceReportId": result["reportId"]
            }
            rx = self.prescription_agent.create_prescription(rx_data)
            db_service.save_prescription(rx)
        
        # Save vitals if present
        if extracted.get("vitals"):
            vitals = extracted["vitals"]
            # only save if at least one vital is present and not null
            if any(v is not None for v in vitals.values() if isinstance(vitals, dict)):
                import logging
                logging.getLogger(__name__).info(f"❤️ [AgentService] Found vitals in report, saving to DB.")
                db_service.save_vitals(patient_id, result["reportId"], vitals)

        # Trigger health score recalculation & patient summary analysis
        self.calculate_health_score(patient_id)
        self.analyze_patient(patient_id)
        
        return result

    def grant_access(self, patient_id: str, doctor_id: str) -> dict:
        grant = self.access_agent.grant_access(patient_id, doctor_id)
        db_service.save_access_grant(grant)
        return grant

    def calculate_health_score(self, patient_id: str) -> dict:
        # In a real scenario, we fetch reports from db_service here and pass to agent
        return self.alert_agent.calculate_health_score(patient_id)

    def request_doctor_access(self, doctor_id: str, patient_id: str) -> dict:
        req = self.doctor_access_agent.request_access(doctor_id, patient_id)
        # Store mock OTP in firestore doc for verification
        req["mock_otp"] = "123456" 
        db_service.save_access_request(req)
        return req
        
    def verify_otp(self, request_id: str, otp: str) -> dict:
        req = db_service.get_access_request(request_id)
        if not req:
            raise ValueError("Request not found in DB")
        
        if otp != req.get("mock_otp", "123456"):
            raise ValueError("Invalid OTP")
        
        result = self.doctor_access_agent.verify_otp(request_id, otp)
        req["status"] = "approved"
        db_service.save_access_request(req)
        
        # Auto-grant access upon successful OTP
        self.grant_access(req["patientId"], req["doctorId"])
        return result

    def analyze_patient(self, patient_id: str) -> dict:
        # E.g., reports = db_service.get_patient_reports(patient_id)
        # rx = db_service.get_patient_prescriptions(patient_id)
        return self.intelligence_agent.analyze_patient(patient_id)

    def create_prescription(self, data: dict) -> dict:
        rx = self.prescription_agent.create_prescription(data)
        db_service.save_prescription(rx)
        return rx

    def handle_emergency(self, qr_data: str) -> dict:
        return self.emergency_agent.handle_scan(qr_data)
        
    def generate_emergency_qr(self, patient_id: str) -> dict:
        return self.emergency_agent.generate_qr(patient_id)
