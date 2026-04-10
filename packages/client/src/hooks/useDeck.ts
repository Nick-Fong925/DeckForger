import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import type { Deck } from '@deckforge/shared'
import { fetchDeck } from '@/services/api/decks'

export function useDeck(id: string | undefined): UseQueryResult<Deck, Error> {
  return useQuery({
    queryKey: ['decks', id],
    queryFn: () => fetchDeck(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}
