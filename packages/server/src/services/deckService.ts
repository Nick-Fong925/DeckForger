import { type Deck } from '@deckforge/shared'
import { listDecksByUid, getDeckById } from '../repositories/deckRepository'
import { NotFoundError } from '../middleware/errorHandler'

export async function listDecks(uid: string): Promise<Deck[]> {
  return listDecksByUid(uid)
}

export async function getDeck(id: string, uid: string): Promise<Deck> {
  const deck = await getDeckById(id, uid)
  if (!deck) throw new NotFoundError()
  return deck
}
