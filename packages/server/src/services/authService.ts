import type { DecodedIdToken } from 'firebase-admin/auth'

export type RegisteredUser = {
  firebase_uid: string
  email: string
}

export async function register(token: DecodedIdToken): Promise<RegisteredUser> {
  const { email } = token
  if (!email) throw new Error('Token missing email claim')

  // Phase 3: upsert users/{uid} document in Firestore here
  return {
    firebase_uid: token.uid,
    email,
  }
}
