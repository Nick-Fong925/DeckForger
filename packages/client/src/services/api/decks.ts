import { apiClient } from '@/lib/axios'
import type { Deck, CreateDeckInput, CreateCardInput } from '@deckforge/shared'

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

export async function patchDeck(
  id: string,
  cards: CreateCardInput[],
  description: string | null,
): Promise<Deck> {
  const res = await apiClient.patch<Deck>(`/decks/${id}`, { cards, description })
  return res.data
}

export async function deleteDeck(id: string): Promise<void> {
  await apiClient.delete(`/decks/${id}`)
}

export async function patchQuizScore(id: string, score: number): Promise<Deck> {
  const res = await apiClient.patch<Deck>(`/decks/${id}/quiz-score`, { score })
  return res.data
}
