import { describe, it, expect } from 'vitest'
import { cardSchema, deckSchema, MAX_CARDS_PER_DECK } from '../deck'

const validCard = {
  id: 'card-1',
  front: 'What is the capital of France?',
  back: 'Paris',
  front_image_url: null,
  back_image_url: null,
}

const validDeck = {
  id: 'deck-abc123',
  firebase_uid: 'uid-abc123',
  upload_id: null,
  title: 'My Deck',
  cards: [validCard],
  created_at: '2024-01-15T10:30:00.000Z',
}

describe('cardSchema', () => {
  it('accepts a valid card with null image URLs', () => {
    expect(() => cardSchema.parse(validCard)).not.toThrow()
  })

  it('accepts a card with valid image URLs', () => {
    const card = {
      ...validCard,
      front_image_url: 'https://storage.googleapis.com/bucket/image.png',
      back_image_url: 'https://storage.googleapis.com/bucket/image2.png',
    }
    expect(() => cardSchema.parse(card)).not.toThrow()
  })

  it('rejects an empty front', () => {
    expect(cardSchema.safeParse({ ...validCard, front: '' }).success).toBe(false)
  })

  it('rejects an empty back', () => {
    expect(cardSchema.safeParse({ ...validCard, back: '' }).success).toBe(false)
  })

  it('rejects an empty id', () => {
    expect(cardSchema.safeParse({ ...validCard, id: '' }).success).toBe(false)
  })

  it('rejects a non-URL front_image_url', () => {
    expect(cardSchema.safeParse({ ...validCard, front_image_url: 'not-a-url' }).success).toBe(false)
  })

  it('rejects a non-URL back_image_url', () => {
    expect(cardSchema.safeParse({ ...validCard, back_image_url: 'not-a-url' }).success).toBe(false)
  })

  it('rejects undefined front_image_url — must be null, not absent', () => {
    const { front_image_url: _, ...card } = validCard
    expect(cardSchema.safeParse(card).success).toBe(false)
  })

  it('rejects undefined back_image_url — must be null, not absent', () => {
    const { back_image_url: _, ...card } = validCard
    expect(cardSchema.safeParse(card).success).toBe(false)
  })

  it('rejects a missing front field', () => {
    const { front: _, ...card } = validCard
    expect(cardSchema.safeParse(card).success).toBe(false)
  })

  it('rejects a missing back field', () => {
    const { back: _, ...card } = validCard
    expect(cardSchema.safeParse(card).success).toBe(false)
  })
})

describe('deckSchema', () => {
  it('accepts a valid deck', () => {
    expect(() => deckSchema.parse(validDeck)).not.toThrow()
  })

  it('accepts a deck with null upload_id (manually created)', () => {
    expect(deckSchema.safeParse({ ...validDeck, upload_id: null }).success).toBe(true)
  })

  it('accepts a deck with a non-null upload_id (from upload pipeline)', () => {
    expect(deckSchema.safeParse({ ...validDeck, upload_id: 'upload-abc123' }).success).toBe(true)
  })

  it('rejects a missing upload_id — must be explicitly null, not absent', () => {
    const { upload_id: _, ...deck } = validDeck
    expect(deckSchema.safeParse(deck).success).toBe(false)
  })

  it('rejects an empty title', () => {
    expect(deckSchema.safeParse({ ...validDeck, title: '' }).success).toBe(false)
  })

  it('rejects a title exceeding 200 characters', () => {
    expect(deckSchema.safeParse({ ...validDeck, title: 'a'.repeat(201) }).success).toBe(false)
  })

  it('accepts a title of exactly 200 characters', () => {
    expect(deckSchema.safeParse({ ...validDeck, title: 'a'.repeat(200) }).success).toBe(true)
  })

  it('rejects an empty firebase_uid', () => {
    expect(deckSchema.safeParse({ ...validDeck, firebase_uid: '' }).success).toBe(false)
  })

  it('accepts a deck with zero cards', () => {
    expect(deckSchema.safeParse({ ...validDeck, cards: [] }).success).toBe(true)
  })

  it('rejects a deck exceeding MAX_CARDS_PER_DECK cards', () => {
    const cards = Array.from({ length: MAX_CARDS_PER_DECK + 1 }, (_, i) => ({
      ...validCard,
      id: `card-${i}`,
    }))
    expect(deckSchema.safeParse({ ...validDeck, cards }).success).toBe(false)
  })

  it('accepts a deck with exactly MAX_CARDS_PER_DECK cards', () => {
    const cards = Array.from({ length: MAX_CARDS_PER_DECK }, (_, i) => ({
      ...validCard,
      id: `card-${i}`,
    }))
    expect(deckSchema.safeParse({ ...validDeck, cards }).success).toBe(true)
  })

  it('rejects an invalid nested card', () => {
    const badCard = { ...validCard, front: '' }
    expect(deckSchema.safeParse({ ...validDeck, cards: [badCard] }).success).toBe(false)
  })

  it('rejects a date-only created_at string', () => {
    expect(deckSchema.safeParse({ ...validDeck, created_at: '2024-01-15' }).success).toBe(false)
  })

  it('rejects a non-ISO created_at string', () => {
    expect(deckSchema.safeParse({ ...validDeck, created_at: 'January 15 2024' }).success).toBe(false)
  })

  it('accepts a valid ISO datetime with Z suffix', () => {
    expect(deckSchema.safeParse({ ...validDeck, created_at: '2024-01-15T10:30:00.000Z' }).success).toBe(true)
  })

  it('strips unknown fields (e.g. removed gcs_delivery_path)', () => {
    const result = deckSchema.safeParse({ ...validDeck, gcs_delivery_path: '/some/path' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect((result.data as Record<string, unknown>)['gcs_delivery_path']).toBeUndefined()
    }
  })
})
