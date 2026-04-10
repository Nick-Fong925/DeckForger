import { getFirestoreDb } from '../config/firestore'
import { deckSchema, type Deck, type CreateCardInput, type CreateDeckInput, type PatchDeckInput } from '@deckforge/shared'
import { normalizeTimestamps } from './firestoreUtils'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

// normalizeTimestamps is shallow — card fields are plain strings, never Timestamps
function parseDoc(id: string, data: FirebaseFirestore.DocumentData): Deck | null {
  const result = deckSchema.safeParse({ ...normalizeTimestamps(data), id })
  if (!result.success) return null
  return result.data
}

export async function listDecksByUid(uid: string): Promise<Deck[]> {
  const db = getFirestoreDb()
  const snapshot = await db
    .collection('decks')
    .where('firebase_uid', '==', uid)
    .orderBy('created_at', 'desc')
    .get()

  return snapshot.docs.flatMap((doc: QueryDocumentSnapshot) => {
    const deck = parseDoc(doc.id, doc.data())
    return deck ? [deck] : []
  })
}

export async function createDeckDoc(uid: string, input: CreateDeckInput): Promise<Deck> {
  const db = getFirestoreDb()
  const ref = db.collection('decks').doc()
  const now = new Date().toISOString()
  const data = {
    firebase_uid: uid,
    upload_id: input.upload_id,
    title: input.title,
    ...(input.description !== undefined && { description: input.description }),
    cards: input.cards.map((c) => ({
      id: crypto.randomUUID(),
      front: c.front,
      back: c.back,
    })),
    created_at: now,
  }
  await ref.set(data)
  return deckSchema.parse({ ...data, id: ref.id })
}

export async function updateDeckDoc(id: string, uid: string, input: PatchDeckInput): Promise<Deck> {
  const db = getFirestoreDb()
  const ref = db.collection('decks').doc(id)
  const snap = await ref.get()
  if (!snap.exists) throw new Error('Deck not found')
  const stored = normalizeTimestamps(snap.data()!)
  if (stored['firebase_uid'] !== uid) throw new Error('Deck not found')

  const updatedCards = input.cards.map((c) => ({
    id: crypto.randomUUID(),
    front: c.front,
    back: c.back,
  }))
  const patch: Record<string, unknown> = { cards: updatedCards }
  if (input.description !== undefined) patch['description'] = input.description

  await ref.update(patch)

  const merged = {
    ...stored,
    id,
    cards: updatedCards,
    ...(input.description !== undefined && { description: input.description }),
  }
  return deckSchema.parse(merged)
}

export async function deleteDeckDoc(id: string, uid: string): Promise<void> {
  const db = getFirestoreDb()
  const ref = db.collection('decks').doc(id)
  const snap = await ref.get()
  if (!snap.exists || snap.data()?.['firebase_uid'] !== uid) throw new Error('Deck not found')
  await ref.delete()
}

export async function getDeckById(id: string, uid: string): Promise<Deck | null> {
  const db = getFirestoreDb()
  const doc = await db.collection('decks').doc(id).get()
  if (!doc.exists || !doc.data()) return null

  const data = normalizeTimestamps(doc.data()!)
  if (data['firebase_uid'] !== uid) return null

  return parseDoc(doc.id, doc.data()!)
}
