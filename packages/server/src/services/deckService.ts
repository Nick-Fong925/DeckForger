import { type Deck, type CreateDeckInput } from '@deckforge/shared'
import { listDecksByUid, getDeckById, createDeckDoc } from '../repositories/deckRepository'
import { getUploadById } from '../repositories/uploadRepository'
import { NotFoundError } from '../middleware/errorHandler'

export async function listDecks(uid: string): Promise<Deck[]> {
  return listDecksByUid(uid)
}

export async function getDeck(id: string, uid: string): Promise<Deck> {
  const deck = await getDeckById(id, uid)
  if (!deck) throw new NotFoundError()
  return deck
}

export async function createDeck(uid: string, input: CreateDeckInput): Promise<Deck> {
  if (input.upload_id !== null) {
    const upload = await getUploadById(input.upload_id, uid)
    if (!upload) throw new NotFoundError('Upload not found or does not belong to you')
  }
  return createDeckDoc(uid, input.title, input.upload_id, input.cards)
}
