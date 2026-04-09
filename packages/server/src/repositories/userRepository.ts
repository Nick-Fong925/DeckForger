import { getFirestoreDb } from '../config/firestore'
import { userSchema, type User } from '@deckforge/shared'
import { normalizeTimestamps } from './firestoreUtils'

export async function upsertUser(uid: string, email: string): Promise<User> {
  const db = getFirestoreDb()
  const ref = db.collection('users').doc(uid)
  const now = new Date().toISOString()

  try {
    const newUser = { firebase_uid: uid, email, created_at: now }
    await ref.create(newUser)
    // No extra read needed — we know exactly what was written
    return userSchema.parse(newUser)
  } catch (err: unknown) {
    // gRPC status code 6 = ALREADY_EXISTS (Firebase Admin SDK, not client SDK)
    if ((err as { code?: number }).code === 6) {
      await ref.update({ email })
      // Read needed here to retrieve the original created_at from first registration
      const snap = await ref.get()
      return userSchema.parse(normalizeTimestamps(snap.data() ?? {}))
    }
    throw err
  }
}

export async function getUserByUid(uid: string): Promise<User | null> {
  const db = getFirestoreDb()
  const snap = await db.collection('users').doc(uid).get()
  if (!snap.exists) return null
  return userSchema.parse(normalizeTimestamps(snap.data() ?? {}))
}
