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
from app.services.pdf_service import pdf_service
from app.services.mail_service import mail_service
from app.firebase_config import bucket
import os
import random
import string


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

    def request_doctor_access(self, doctor_id: str, patient_id: str = None, phone_number: str = None, email: str = None) -> dict:
        target_patient_id = patient_id
        
        # 1. Lookup by email or phone if patient_id not provided
        if not target_patient_id:
            if email:
                patient = db_service.get_user_by_email(email)
                if not patient:
                    raise ValueError(f"No account found for '{email}'. Please ensure the patient has logged in at least once.")
                target_patient_id = patient.get("uid")
            elif phone_number:
                patient = db_service.get_user_by_phone(phone_number)
                if not patient:
                    raise ValueError("Patient with this phone number not found")
                target_patient_id = patient.get("uid")

        if not target_patient_id:
            raise ValueError("Patient Email, ID, or Phone Number required")

        # 2. Get patient email for OTP delivery
        patient_profile = db_service.get_user(target_patient_id)
        patient_email = patient_profile.get("email")
        if not patient_email:
             # Fallback for demo if email not in profile but in auth
             # For hackathon, assume email exists in profile
             raise ValueError("Patient profile has no email for OTP delivery")

        # 3. Create request via agent
        req = self.doctor_access_agent.request_access(doctor_id, target_patient_id)
        
        # 4. Generate random 6-digit OTP
        otp_code = ''.join(random.choices(string.digits, k=6))
        req["mock_otp"] = otp_code # We still use mock_otp field to store it
        
        # 5. Save to DB
        db_service.save_access_request(req)
        
        # 6. Send Email via Resend
        mail_service.send_otp_email(patient_email, otp_code)
        
        return req
        
    def verify_otp(self, request_id: str, otp: str) -> dict:
        req = db_service.get_access_request(request_id)
        if not req:
            raise ValueError("Request not found in DB")
        
        # Verify against stored mock_otp
        if otp != req.get("mock_otp", "123456"):
            raise ValueError("Invalid OTP")
        
        result = self.doctor_access_agent.verify_otp(request_id, otp)
        req["status"] = "approved"
        db_service.save_access_request(req)
        
        # Create a real access grant with expiry (7 days)
        doctor_profile = db_service.get_user(req["doctorId"])
        patient_profile = db_service.get_user(req["patientId"])
        
        doctor_name = doctor_profile.get("displayName", "Dr. Doctor") if doctor_profile else "Doctor"
        patient_name = patient_profile.get("displayName", "Patient Name") if patient_profile else "Patient"

        grant = {
            "grantId": f"grant_{uuid.uuid4().hex[:6]}",
            "patientId": req["patientId"],
            "doctorId": req["doctorId"],
            "doctorName": doctor_name,
            "patientName": patient_name,
            "permission": "Full Read",
            "status": "active",
            "createdAt": datetime.datetime.now().isoformat(),
            "expiresAt": (datetime.datetime.now() + datetime.timedelta(days=7)).isoformat()
        }
        db_service.save_access_grant(grant)
        return {"result": result, "grant": grant}

    def analyze_patient(self, patient_id: str) -> dict:
        # E.g., reports = db_service.get_patient_reports(patient_id)
        # rx = db_service.get_patient_prescriptions(patient_id)
        return self.intelligence_agent.analyze_patient(patient_id)

    def create_prescription(self, data: dict) -> dict:
        rx = self.prescription_agent.create_prescription(data)
        db_service.save_prescription(rx)
        return rx

    def handle_emergency(self, qr_data: str) -> dict:
        # qr_data currently is just the patient_id (or encoded version)
        patient_id = qr_data 
        # In a real app, you'd decode/decrypt the qr_data token here
        
        # Log the emergency access
        scan_record = {
            "scanId": f"scan_{uuid.uuid4().hex[:6]}",
            "patientId": patient_id,
            "timestamp": datetime.datetime.now().isoformat(),
            "type": "emergency_qr_scan"
        }
        # db_service.save_emergency_scan(scan_record) # Optional log
        
        return self.emergency_agent.handle_scan(qr_data)
        
    def generate_emergency_qr(self, patient_id: str) -> dict:
        # Emergency QR should point to the FRONTEND public URL for human viewing
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        qr_target = f"{frontend_url}/emergency-report?pid={patient_id}"
        
        return {
            "patientId": patient_id,
            "qrCodePayload": qr_target,
            "message": "Emergency QR generated for browser-based clinical override"
        }

    def get_emergency_critical_info(self, patient_id: str) -> dict:
        profile = db_service.get_user_profile(patient_id) or {}
        reports = db_service.get_patient_reports(patient_id)
        prescriptions = db_service.get_patient_prescriptions(patient_id)
        vitals = db_service.get_latest_vitals(patient_id, limit=5)
        
        return {
            "patientId": patient_id,
            "displayName": profile.get("displayName", "Unknown Patient"),
            "bloodType": profile.get("bloodType", "Unknown"),
            "allergies": profile.get("allergies", []),
            "chronicConditions": profile.get("chronicConditions", []),
            "emergencyContacts": profile.get("emergencyContacts", []),
            "latestVitals": vitals,
            "recentReportsCount": len(reports),
            "recentPrescriptionsCount": len(prescriptions)
        }

    def get_emergency_summary_pdf(self, patient_id: str) -> bytes:
        profile = db_service.get_user_profile(patient_id) or {"uid": patient_id}
        reports = db_service.get_patient_reports(patient_id)
        prescriptions = db_service.get_patient_prescriptions(patient_id)
        return pdf_service.generate_medical_summary_pdf(profile, reports, prescriptions)
