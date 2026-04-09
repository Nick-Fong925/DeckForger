import { getFirestoreDb } from '../config/firestore'
import { deckSchema, type Deck } from '@deckforge/shared'
import { normalizeTimestamps } from './firestoreUtils'
import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'

// normalizeTimestamps is shallow — card fields are plain strings, never Timestamps
function parseDoc(id: string, data: FirebaseFirestore.DocumentData): Deck | null {
  const result = deckSchema.safeParse({ ...normalizeTimestamps(data), id })
  if (!result.success) {
    console.error(`Deck ${id} failed schema validation:`, result.error.message)
    return null
  }
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

export async function getDeckById(id: string, uid: string): Promise<Deck | null> {
  const db = getFirestoreDb()
  const doc = await db.collection('decks').doc(id).get()
  if (!doc.exists || !doc.data()) return null

  const data = normalizeTimestamps(doc.data()!)
  if (data['firebase_uid'] !== uid) return null

  return parseDoc(doc.id, doc.data()!)
}
