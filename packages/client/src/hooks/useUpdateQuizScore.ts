import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Deck } from '@deckforge/shared'
import { patchQuizScore } from '@/services/api/decks'

export function useUpdateQuizScore(deckId: string) {
  const queryClient = useQueryClient()
  return useMutation<Deck, Error, number>({
    mutationFn: (score) => patchQuizScore(deckId, score),
    onSuccess: (deck) => {
      queryClient.setQueryData(['decks', deckId], deck)
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
  })
}
