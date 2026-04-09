import { useQuery } from '@tanstack/react-query'
import { fetchDecks } from '@/services/api/decks'

export function useDecks() {
  return useQuery({
    queryKey: ['decks'],
    queryFn: fetchDecks,
    staleTime: 30_000,
  })
}
