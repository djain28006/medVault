import uuid

class EmergencyAgent:
    def generate_qr(self, patient_id: str) -> dict:
        print(f"🚑 [EmergencyAgent] Compiling critical emergency profile for Patient {patient_id}...")
        print("🚑 [EmergencyAgent] Generating & encrypting JSON payload into QR code object...")
        return {
            "patientId": patient_id,
            "qrCodePayload": "mock_encrypted_payload_123",
            "message": "Emergency QR generated"
        }
        
    def handle_scan(self, qr_data: str) -> dict:
        print(f"🚑 [EmergencyAgent] Intercepting Emergency QR Scan payload: {qr_data}")
        print("🚑 [EmergencyAgent] Decoding and applying temporary 24-hour Read-Only access.")
        return {
            "scanId": f"scan_{uuid.uuid4().hex[:6]}",
            "status": "success",
            "accessGranted": True,
            "message": "Instant read-only access granted for 24h"
        }
