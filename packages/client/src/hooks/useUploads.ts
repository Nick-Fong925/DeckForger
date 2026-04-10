import { useEffect, useRef } from 'react'
import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import type { Upload, UploadStatus } from '@deckforge/shared'
import { fetchUploads } from '@/services/api/uploads'

const POLLING_STATUSES = new Set<UploadStatus>(['uploaded', 'extracting', 'generating'])

function shouldPoll(uploads: Upload[] | undefined): boolean {
  // Keep polling on initial load (undefined = first fetch not complete)
  if (uploads === undefined) return true
  return uploads.some((u) => POLLING_STATUSES.has(u.status))
}

export function useUploads(): UseQueryResult<Upload[], Error> {
  const queryClient = useQueryClient()
  const query = useQuery<Upload[], Error>({
    queryKey: ['uploads'],
    queryFn: fetchUploads,
    refetchInterval: (q) => (shouldPoll(q.state.data) ? 3000 : false),
  })

  // Cascade: invalidate ['decks'] when any upload transitions to 'complete'
  const prevDataRef = useRef<Upload[] | undefined>(undefined)
  useEffect(() => {
    const prev = prevDataRef.current
    const curr = query.data
    if (prev && curr) {
      const hasNewlyComplete = curr.some(
        (u) => u.status === 'complete' && prev.find((p) => p.id === u.id)?.status !== 'complete',
      )
      if (hasNewlyComplete) {
        queryClient.invalidateQueries({ queryKey: ['decks'] })
      }
    }
    prevDataRef.current = curr
  }, [query.data, queryClient])

  return query
}
