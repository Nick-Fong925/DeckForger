import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteDeck } from '@/services/api/decks'

export function useDeleteDeck() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: deleteDeck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decks'] })
    },
  })
}
