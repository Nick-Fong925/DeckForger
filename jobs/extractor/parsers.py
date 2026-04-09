import csv
import os
import sqlite3
import tempfile
import uuid
import zipfile
from typing import Any

MAX_CARDS_PER_DECK = 500


def pdf_to_text(file_path: str) -> str:
    import fitz  # PyMuPDF

    doc = fitz.open(file_path)
    pages = [page.get_text() for page in doc]
    doc.close()
    return '\n\n'.join(pages)


def pptx_to_text(file_path: str) -> str:
    from pptx import Presentation

    prs = Presentation(file_path)
    slides: list[str] = []
    for slide in prs.slides:
        texts = [shape.text for shape in slide.shapes if shape.has_text_frame]
        slides.append('\n'.join(texts))
    return '\n\n'.join(slides)


def csv_to_cards(file_path: str) -> list[dict[str, Any]]:
    cards: list[dict[str, Any]] = []
    with open(file_path, newline='', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader, None)  # skip header row
        for row in reader:
            if len(cards) >= MAX_CARDS_PER_DECK:
                break
            if len(row) < 2:
                continue
            front = row[0].strip()
            back = row[1].strip()
            if not front or not back:
                continue
            cards.append({
                'id': str(uuid.uuid4()),
                'front': front,
                'back': back,
                'front_image_url': None,
                'back_image_url': None,
            })
    return cards


def apkg_to_cards(file_path: str) -> list[dict[str, Any]]:
    # .apkg is a zip containing collection.anki2 (SQLite).
    # The `flds` column uses \x1f (unit separator) to delimit fields.
    cards: list[dict[str, Any]] = []
    with tempfile.TemporaryDirectory() as tmp_dir:
        with zipfile.ZipFile(file_path, 'r') as zf:
            # Zip slip prevention: reject members with path traversal
            for member in zf.namelist():
                member_path = os.path.realpath(os.path.join(tmp_dir, member))
                if not member_path.startswith(os.path.realpath(tmp_dir) + os.sep):
                    raise ValueError(f'Zip slip attempt detected in member: {member}')
            zf.extractall(tmp_dir)
        db_path = os.path.join(tmp_dir, 'collection.anki2')
        conn = sqlite3.connect(db_path)
        try:
            cursor = conn.execute('SELECT flds FROM notes')
            for (flds,) in cursor:
                if len(cards) >= MAX_CARDS_PER_DECK:
                    break
                parts = flds.split('\x1f')
                if len(parts) < 2:
                    continue
                front = parts[0].strip()
                back = parts[1].strip()
                if not front or not back:
                    continue
                cards.append({
                    'id': str(uuid.uuid4()),
                    'front': front,
                    'back': back,
                    'front_image_url': None,
                    'back_image_url': None,
                })
        finally:
            conn.close()
    return cards
