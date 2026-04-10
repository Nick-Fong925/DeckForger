import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Deck, CreateCardInput } from '@deckforge/shared'
import { patchDeck } from '@/services/api/decks'

type UpdateDeckPayload = { cards: CreateCardInput[]; description: string | null }

export function useUpdateDeck(deckId: string) {
  const queryClient = useQueryClient()
  return useMutation<Deck, Error, UpdateDeckPayload>({
    mutationFn: ({ cards, description }) => patchDeck(deckId, cards, description),
    onSuccess: (deck) => {
      queryClient.setQueryData(['decks', deckId], deck)
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
  })
}
