import { useQuery } from '@tanstack/react-query'
import { fetchDeck } from '@/services/api/decks'

export function useDeck(id: string | undefined) {
  return useQuery({
    queryKey: ['decks', id],
    queryFn: () => fetchDeck(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}
