import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from dotenv import load_dotenv

load_dotenv()

# Prevent re-initialization if imported multiple times
if not firebase_admin._apps:
    cert_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-service-account.json")
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET", "healthcareai-a5e07.firebasestorage.app")
    
    if os.path.exists(cert_path):
        cred = credentials.Certificate(cert_path)
        firebase_admin.initialize_app(cred, {
            'storageBucket': bucket_name
        })
        print("Firebase Admin Initialized Successfully!")
    else:
        print(f"WARNING: Firebase credentials NOT found at {cert_path}.")
        print("Backend will bypass rigorous DB and Auth checks until credentials are provided.")
        # We don't initialize the app to gracefully degrade during early testing.

# Export initialized services
db = firestore.client() if firebase_admin._apps else None
bucket = storage.bucket() if firebase_admin._apps else None
firebase_auth = auth if firebase_admin._apps else None
