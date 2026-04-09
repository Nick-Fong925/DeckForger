import { describe, it, expect } from 'vitest'
import { Timestamp } from 'firebase-admin/firestore'
import { normalizeTimestamps } from '../firestoreUtils'

const EPOCH_SECONDS = 1_700_000_000
const EXPECTED_ISO = '2023-11-14T22:13:20.000Z'

function makeTimestamp(epochSeconds: number): Timestamp {
  return new Timestamp(epochSeconds, 0)
}

describe('normalizeTimestamps', () => {
  it('returns an empty object for empty input', () => {
    expect(normalizeTimestamps({})).toEqual({})
  })

  it('converts a top-level Timestamp to an ISO 8601 string', () => {
    const result = normalizeTimestamps({ created_at: makeTimestamp(EPOCH_SECONDS) })
    expect(result['created_at']).toBe(EXPECTED_ISO)
  })

  it('preserves a string field unchanged', () => {
    const result = normalizeTimestamps({ email: 'user@example.com' })
    expect(result['email']).toBe('user@example.com')
  })

  it('preserves a number field unchanged', () => {
    const result = normalizeTimestamps({ count: 42 })
    expect(result['count']).toBe(42)
  })

  it('preserves null unchanged', () => {
    const result = normalizeTimestamps({ upload_id: null })
    expect(result['upload_id']).toBeNull()
  })

  it('preserves an array unchanged (shallow — does not recurse into arrays)', () => {
    const arr = ['a', 'b']
    const result = normalizeTimestamps({ tags: arr })
    expect(result['tags']).toBe(arr)
  })

  it('converts multiple Timestamp fields in the same document', () => {
    const result = normalizeTimestamps({
      created_at: makeTimestamp(EPOCH_SECONDS),
      updated_at: makeTimestamp(EPOCH_SECONDS + 60),
    })
    expect(result['created_at']).toBe(EXPECTED_ISO)
    expect(result['updated_at']).toBe('2023-11-14T22:14:20.000Z')
  })

  it('handles a mix of Timestamp and non-Timestamp fields', () => {
    const result = normalizeTimestamps({
      firebase_uid: 'uid-123',
      email: 'a@b.com',
      created_at: makeTimestamp(EPOCH_SECONDS),
    })
    expect(result['firebase_uid']).toBe('uid-123')
    expect(result['email']).toBe('a@b.com')
    expect(result['created_at']).toBe(EXPECTED_ISO)
  })

  it('does NOT recurse into nested objects — known shallow limitation', () => {
    const nested = { ts: makeTimestamp(EPOCH_SECONDS) }
    const result = normalizeTimestamps({ meta: nested })
    expect(result['meta']).toBe(nested)
    expect((result['meta'] as typeof nested).ts).toBeInstanceOf(Timestamp)
  })

  it('returns a new object, not the original reference', () => {
    const input = { email: 'x@y.com' }
    const result = normalizeTimestamps(input)
    expect(result).not.toBe(input)
  })

  it('the resulting ISO string passes z.string().datetime() validation', async () => {
    const { z } = await import('zod')
    const schema = z.object({ created_at: z.string().datetime() })
    const result = normalizeTimestamps({ created_at: makeTimestamp(EPOCH_SECONDS) })
    expect(() => schema.parse(result)).not.toThrow()
  })
})
