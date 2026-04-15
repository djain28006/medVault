import os
import logging
import resend
import json
from typing import List, Optional

logger = logging.getLogger(__name__)

# DEBUG: Explicitly log loading state
RAW_KEY = os.getenv("RESEND_API_KEY", "")
KEY_PRESENT = len(RAW_KEY) > 0
KEY_PREVIEW = f"...{RAW_KEY[-6:]}" if KEY_PRESENT else "NOT_FOUND"

logger.info(f"🔍 [MailService] Init - Key Present: {KEY_PRESENT} | Preview: {KEY_PREVIEW}")

# Initialize Resend
resend.api_key = RAW_KEY
FROM_EMAIL = os.getenv("MAIL_FROM_EMAIL", "onboarding@resend.dev")
FROM_NAME = os.getenv("MAIL_FROM_NAME", "MedVault")

class MailService:
    def send_email(self, to: str, subject: str, html_content: str):
        """Rigorous diagnostic email sender."""
        logger.info(f"📧 [MailService] Triggering OUTBOUND to: {to}")
        
        # Ensure key is set in case of dynamic reloads
        if not resend.api_key:
            resend.api_key = os.getenv("RESEND_API_KEY")

        payload = {
            "from": f"{FROM_NAME} <{FROM_EMAIL}>",
            "to": [to],
            "subject": subject,
            "html": html_content,
        }

        try:
            # Deep Log of Payload
            logger.info(f"📤 [MailService] Payload: {json.dumps(payload)}")
            
            # Send via SDK
            response = resend.Emails.send(payload)
            
            # Log Full Response
            logger.info(f"✅ [MailService] API Success Response: {json.dumps(response)}")
            return response
            
        except Exception as e:
            # CAPTURE COMPLETE EXCEPTION DETAILS
            error_data = {
                "error_type": type(e).__name__,
                "error_msg": str(e),
                "details": getattr(e, 'message', 'No detail'),
                "status_code": getattr(e, 'status_code', 'Unknown')
            }
            logger.error(f"❌ [MailService] FULL API FAILURE: {json.dumps(error_data)}")
            
            # Print to console for immediate visibility in terminal
            print(f"\nCRITICAL MAIL FAILURE: {error_data}\n")
            
            return {"error": error_data, "status": "failed"}

    def send_test_email(self, to_email: str):
        subject = "Resend Backend Test"
        html = "<p>This is a backend connectivity test.</p>"
        return self.send_email(to_email, subject, html)

    def send_health_alert(self, to_email: str, score: int, assessment: str):
        subject = "🚨 URGENT: Clinical Alert from MedVault"
        html = f"<h2>Clinical High Priority Alert</h2><p>Score: {score}/100</p><p>Assessment: {assessment}</p>"
        return self.send_email(to_email, subject, html)

    def send_medication_reminder(self, to_email: str, missed_meds: List[str]):
        subject = "Pill Reminder: Daily Adherence Check"
        med_list = ", ".join(missed_meds)
        html = f"<h2>Medication Reminder</h2><p>Meds: {med_list}</p>"
        return self.send_email(to_email, subject, html)

# Singleton
mail_service = MailService()
