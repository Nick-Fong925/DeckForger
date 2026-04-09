import type { DecodedIdToken } from 'firebase-admin/auth'
import { type User } from '@deckforge/shared'
import { upsertUser, getUserByUid } from '../repositories/userRepository'
import { NotFoundError, UnauthorizedError } from '../middleware/errorHandler'

export async function register(token: DecodedIdToken): Promise<User> {
  const { email, uid } = token
  if (!email) throw new UnauthorizedError('Token missing email claim')
  return upsertUser(uid, email)
}

export async function getMe(uid: string): Promise<User> {
  const user = await getUserByUid(uid)
  if (!user) throw new NotFoundError('User not found')
  return user
}
