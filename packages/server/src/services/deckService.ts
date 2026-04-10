import { type Deck, type CreateDeckInput, type PatchDeckInput } from '@deckforge/shared'
import { listDecksByUid, getDeckById, createDeckDoc, updateDeckDoc, deleteDeckDoc } from '../repositories/deckRepository'
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
  return createDeckDoc(uid, input)
}

export async function updateDeck(id: string, uid: string, input: PatchDeckInput): Promise<Deck> {
  const deck = await getDeckById(id, uid)
  if (!deck) throw new NotFoundError()
  return updateDeckDoc(id, uid, input)
}

export async function deleteDeck(id: string, uid: string): Promise<void> {
  const deck = await getDeckById(id, uid)
  if (!deck) throw new NotFoundError()
  await deleteDeckDoc(id, uid)
}
