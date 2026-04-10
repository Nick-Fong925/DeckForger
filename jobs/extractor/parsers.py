import csv
import os
import re
import sqlite3
import tempfile
import uuid
import zipfile
from html import unescape
from typing import Any

MAX_CARDS_PER_DECK = 500

_CLOZE_RE = re.compile(r'\{\{c\d+::([^:}]+)(?:::[^}]*)?\}\}')
_HEADER_KEYWORDS = {'front', 'back', 'question', 'answer', 'term', 'definition'}


def _strip_html(text: str) -> str:
    text = re.sub(r'\[sound:[^\]]+\]', '', text)  # Anki [sound:...] tags
    text = re.sub(r'<[^>]+>', '', text)            # HTML tags
    return unescape(text).strip()                  # HTML entities (&amp; etc.)


def _cloze_to_qa(text: str) -> tuple[str, str]:
    answers = _CLOZE_RE.findall(text)
    front = _CLOZE_RE.sub('_____', text)
    return front, ', '.join(answers)


def _is_header_row(row: list[str]) -> bool:
    return len(row) >= 2 and row[0].strip().lower() in _HEADER_KEYWORDS


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


def csv_to_cards(file_path: str, delimiter: str = ',') -> list[dict[str, Any]]:
    cards: list[dict[str, Any]] = []
    # utf-8-sig handles Windows BOM; falls back gracefully for standard UTF-8
    with open(file_path, newline='', encoding='utf-8-sig') as f:
        reader = csv.reader(f, delimiter=delimiter)
        first_row = next(reader, None)
        if first_row is None:
            return cards
        # Include first row as a card only if it doesn't look like a header
        rows_to_process = iter([first_row]) if not _is_header_row(first_row) else iter([])
        for row in [*rows_to_process, *reader]:
            if len(cards) >= MAX_CARDS_PER_DECK:
                break
            if len(row) < 2:
                continue
            front = row[0].strip()
            back = row[1].strip()
            if not front or not back:
                continue
            cards.append({'id': str(uuid.uuid4()), 'front': front, 'back': back})
    return cards


def tsv_to_cards(file_path: str) -> list[dict[str, Any]]:
    return csv_to_cards(file_path, delimiter='\t')


def apkg_to_cards(file_path: str) -> list[dict[str, Any]]:
    # .apkg is a zip containing collection.anki2 (SQLite).
    # The `flds` column uses \x1f (unit separator) to delimit fields.
    # Field content is stored as HTML; strip tags before returning.
    cards: list[dict[str, Any]] = []
    with tempfile.TemporaryDirectory() as tmp_dir:
        with zipfile.ZipFile(file_path, 'r') as zf:
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
                raw_front = _strip_html(parts[0])
                if _CLOZE_RE.search(raw_front):
                    front, back = _cloze_to_qa(raw_front)
                else:
                    front = raw_front
                    back = _strip_html(parts[1])
                if not front or not back:
                    continue
                cards.append({'id': str(uuid.uuid4()), 'front': front, 'back': back})
        finally:
            conn.close()
    return cards
