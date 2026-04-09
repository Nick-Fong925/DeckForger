import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Upload } from '@deckforge/shared'
import { initUpload } from '@/services/api/uploads'

export function useUploadMutation() {
  const queryClient = useQueryClient()
  return useMutation<Upload, Error, File>({
    mutationFn: initUpload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['uploads'] })
    },
  })
}
