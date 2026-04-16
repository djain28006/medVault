import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
import json

# Detect Production Environment (Render)
is_production = os.getenv("RENDER") == "true"

def validate_firebase_config(config_dict: dict) -> bool:
    """Check for 5 critical keys required by Firebase Admin SDK."""
    required_keys = ["type", "project_id", "private_key", "client_email", "token_uri"]
    return all(key in config_dict for key in required_keys)

# Prevent re-initialization if imported multiple times
if not firebase_admin._apps:
    json_creds = os.getenv("FIREBASE_CREDENTIALS_JSON")
    cert_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-service-account.json")
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET", "healthcareai-a5e07.firebasestorage.app")
    
    cred = None
    
    # 1. Try Environment Variable (Primary for Production)
    if json_creds:
        try:
            cred_dict = json.loads(json_creds)
            if validate_firebase_config(cred_dict):
                cred = credentials.Certificate(cred_dict)
                print("Firebase initialized successfully (Render mode)")
            else:
                print("ERROR: FIREBASE_CREDENTIALS_JSON is missing required clinical service keys.")
        except Exception as e:
            print(f"ERROR: Failed to parse FIREBASE_CREDENTIALS_JSON: {e}")
    
    # 2. Try Local File (Fallback for Local Development ONLY)
    if not cred and os.path.exists(cert_path):
        try:
            cred = credentials.Certificate(cert_path)
            print(f"Firebase initialized via local file: {cert_path}")
        except Exception as e:
            print(f"ERROR: Failed to initialize via local file {cert_path}: {e}")
    
    # 3. Final Initialization or Fail-Fast
    if cred:
        firebase_admin.initialize_app(cred, {
            'storageBucket': bucket_name
        })
        print("Firebase Admin Initialized Successfully!")
    elif is_production:
        # STRICT RULE: Fail-fast in production to prevent insecure database bypass
        raise RuntimeError("FATAL: Incomplete Firebase credentials on Render. Production environment secured — refusal to start without valid Auth.")
    else:
        # Allow bypass for local dev early prototyping
        print("WARNING: No valid Firebase credentials found. Running in localized bypass mode.")

# Export initialized services
db = firestore.client() if firebase_admin._apps else None
bucket = storage.bucket() if firebase_admin._apps else None
firebase_auth = auth if firebase_admin._apps else None
