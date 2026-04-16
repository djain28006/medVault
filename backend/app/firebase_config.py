import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from dotenv import load_dotenv

load_dotenv()

# Prevent re-initialization if imported multiple times
if not firebase_admin._apps:
    json_creds = os.getenv("FIREBASE_CREDENTIALS_JSON")
    cert_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-service-account.json")
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET", "healthcareai-a5e07.firebasestorage.app")
    
    cred = None
    if json_creds:
        try:
            import json
            cred_dict = json.loads(json_creds)
            cred = credentials.Certificate(cred_dict)
            print("Firebase initialized via JSON environment variable.")
        except Exception as e:
            print(f"ERROR: Failed to parse FIREBASE_CREDENTIALS_JSON: {e}")
    
    if not cred and os.path.exists(cert_path):
        cred = credentials.Certificate(cert_path)
        print(f"Firebase initialized via local file: {cert_path}")
    
    if cred:
        firebase_admin.initialize_app(cred, {
            'storageBucket': bucket_name
        })
        print("Firebase Admin Initialized Successfully!")
    else:
        print("WARNING: No Firebase credentials found (JSON or file).")
        print("Backend will bypass rigorous DB and Auth checks until credentials are provided.")

# Export initialized services
db = firestore.client() if firebase_admin._apps else None
bucket = storage.bucket() if firebase_admin._apps else None
firebase_auth = auth if firebase_admin._apps else None
