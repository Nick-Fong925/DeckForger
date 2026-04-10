import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Deck } from '@deckforge/shared'
import { fetchDecks } from '@/services/api/decks'

export function useDecks(): UseQueryResult<Deck[], Error> {
  return useQuery({
    queryKey: ['decks'],
    queryFn: fetchDecks,
    staleTime: 30_000,
  })
}
