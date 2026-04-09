import json
import os

import firebase_admin
from firebase_admin import credentials, firestore


def get_db() -> firestore.Client:
    if firebase_admin._apps:
        return firestore.client()

    service_account_json = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON')
    if service_account_json:
        cred = credentials.Certificate(json.loads(service_account_json))
        firebase_admin.initialize_app(cred)
    else:
        # Local dev: GOOGLE_APPLICATION_CREDENTIALS env var points to service account JSON
        firebase_admin.initialize_app()

    return firestore.client()
