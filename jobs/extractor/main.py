import argparse
import os
import re
import sys
from datetime import datetime, timezone
from typing import Any

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from lib.firestore_client import get_db
from lib.webhook import call_webhook
from parsers import apkg_to_cards, csv_to_cards, pdf_to_text, pptx_to_text

TMP_DIR = os.path.join(os.path.dirname(__file__), '..', 'tmp')
_UPLOAD_ID_RE = re.compile(r'^[A-Za-z0-9_-]+$')


def _validate_upload_id(upload_id: str) -> None:
    if not _UPLOAD_ID_RE.match(upload_id):
        raise ValueError(f'Invalid upload_id format')


def save_extracted_text(upload_id: str, text: str) -> None:
    os.makedirs(TMP_DIR, exist_ok=True)
    path = os.path.join(TMP_DIR, f'{upload_id}.extracted.txt')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)


def write_deck(
    firebase_uid: str,
    upload_id: str,
    title: str,
    cards: list[dict[str, Any]],
) -> None:
    db = get_db()
    deck = {
        'firebase_uid': firebase_uid,
        'upload_id': upload_id,
        'title': title,
        'cards': cards,
        'created_at': datetime.now(timezone.utc).isoformat(),
    }
    db.collection('decks').document().set(deck)


def run(upload_id: str, server_url: str, webhook_secret: str) -> None:
    _validate_upload_id(upload_id)

    db = get_db()
    snap = db.collection('uploads').document(upload_id).get()
    if not snap.exists:
        raise ValueError(f'Upload not found in Firestore')

    data = snap.to_dict() or {}
    firebase_uid: str = data['firebase_uid']
    file_name: str = data['file_name']
    file_type: str = data['file_type']
    file_path: str = data['gcs_path']
    title = os.path.splitext(file_name)[0]

    if file_type == 'pdf':
        save_extracted_text(upload_id, pdf_to_text(file_path))
    elif file_type == 'pptx':
        save_extracted_text(upload_id, pptx_to_text(file_path))
    elif file_type == 'csv':
        write_deck(firebase_uid, upload_id, title, csv_to_cards(file_path))
    elif file_type == 'apkg':
        write_deck(firebase_uid, upload_id, title, apkg_to_cards(file_path))
    else:
        raise ValueError(f'Unsupported file type')

    call_webhook(server_url, webhook_secret, upload_id, 'extractor', 'complete')


def main() -> None:
    parser = argparse.ArgumentParser(description='DeckForge extractor job')
    parser.add_argument('--upload-id', required=True)
    parser.add_argument('--server-url', required=True)
    args = parser.parse_args()

    webhook_secret = os.environ.get('WEBHOOK_SECRET', '')
    if not webhook_secret:
        sys.stderr.write('WEBHOOK_SECRET environment variable is not set\n')
        sys.exit(1)

    try:
        run(args.upload_id, args.server_url, webhook_secret)
    except Exception:
        # Sanitize: don't forward raw exception messages (may contain file paths)
        call_webhook(args.server_url, webhook_secret, args.upload_id, 'extractor', 'error', 'Extractor job failed')
        sys.exit(1)


if __name__ == '__main__':
    main()
