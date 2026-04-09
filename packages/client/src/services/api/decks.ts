import { apiClient } from '@/lib/axios'
import type { Deck, CreateDeckInput } from '@deckforge/shared'

export async function fetchDecks(): Promise<Deck[]> {
  const res = await apiClient.get<Deck[]>('/decks')
  return res.data
}

export async function fetchDeck(id: string): Promise<Deck> {
  const res = await apiClient.get<Deck>(`/decks/${id}`)
  return res.data
}

export async function createDeck(input: CreateDeckInput): Promise<Deck> {
  const res = await apiClient.post<Deck>('/decks', input)
  return res.data
}
