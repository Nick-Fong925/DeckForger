import { Timestamp, type DocumentData } from 'firebase-admin/firestore'

export function normalizeTimestamps(data: DocumentData): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    result[key] = value instanceof Timestamp ? value.toDate().toISOString() : value
  }
  return result
}
