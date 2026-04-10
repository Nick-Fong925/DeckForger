import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import type { Deck, CreateDeckInput } from '@deckforge/shared'
import { createDeck } from '@/services/api/decks'

export function useCreateDeck(): UseMutationResult<Deck, Error, CreateDeckInput> {
  const queryClient = useQueryClient()
  return useMutation<Deck, Error, CreateDeckInput>({
    mutationFn: createDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
  })
}
