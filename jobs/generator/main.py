import argparse
import json
import os
import re
import sys
import uuid
from datetime import datetime, timezone
from typing import Any

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from lib.firestore_client import get_db
from lib.webhook import call_webhook

TMP_DIR = os.path.join(os.path.dirname(__file__), '..', 'tmp')
ANTHROPIC_MODEL = os.environ.get('ANTHROPIC_MODEL', 'claude-haiku-4-5-20251001')
TARGET_CARD_COUNT = 20
MAX_CARDS_PER_DECK = 500
_UPLOAD_ID_RE = re.compile(r'^[A-Za-z0-9_-]+$')


def _validate_upload_id(upload_id: str) -> None:
    if not _UPLOAD_ID_RE.match(upload_id):
        raise ValueError(f'Invalid upload_id format')


def load_extracted_text(upload_id: str) -> str:
    path = os.path.join(TMP_DIR, f'{upload_id}.extracted.txt')
    with open(path, encoding='utf-8') as f:
        return f.read()


def generate_cards(text: str) -> list[dict[str, Any]]:
    import anthropic

    client = anthropic.Anthropic()
    prompt = (
        f'Generate {TARGET_CARD_COUNT} high-quality flashcards from the text below.\n\n'
        'Rules:\n'
        '- Each card front is a clear question or prompt\n'
        '- Each card back is a concise, accurate answer\n'
        '- Be specific and testable; avoid trivial or overly broad cards\n'
        '- Cover the most important concepts\n\n'
        'Respond with ONLY a JSON array, no markdown or other text:\n'
        '[{"front": "...", "back": "..."}, ...]\n\n'
        f'Text:\n{text}'
    )

    message = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=4096,
        messages=[{'role': 'user', 'content': prompt}],
    )

    raw: str = message.content[0].text.strip()
    if raw.startswith('```'):
        raw = raw.split('\n', 1)[1].rsplit('```', 1)[0].strip()

    parsed: list[dict[str, str]] = json.loads(raw)
    # Cap to MAX_CARDS_PER_DECK regardless of what the model returns
    capped = parsed[:MAX_CARDS_PER_DECK]
    return [
        {
            'id': str(uuid.uuid4()),
            'front': card['front'],
            'back': card['back'],
        }
        for card in capped
    ]


def run(upload_id: str, server_url: str, webhook_secret: str) -> None:
    _validate_upload_id(upload_id)

    extracted_path = os.path.join(TMP_DIR, f'{upload_id}.extracted.txt')

    db = get_db()
    snap = db.collection('uploads').document(upload_id).get()
    if not snap.exists:
        raise ValueError(f'Upload not found in Firestore')

    data = snap.to_dict() or {}
    firebase_uid: str = data['firebase_uid']
    title = os.path.splitext(data['file_name'])[0]

    cards = generate_cards(load_extracted_text(upload_id))

    db.collection('decks').document().set({
        'firebase_uid': firebase_uid,
        'upload_id': upload_id,
        'title': title,
        'cards': cards,
        'created_at': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z',
    })

    call_webhook(server_url, webhook_secret, upload_id, 'generator', 'complete')

    try:
        os.unlink(extracted_path)
    except OSError:
        pass


def main() -> None:
    parser = argparse.ArgumentParser(description='DeckForge generator job')
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
        call_webhook(args.server_url, webhook_secret, args.upload_id, 'generator', 'error', 'Generator job failed')
        sys.exit(1)


if __name__ == '__main__':
    main()
