import { z } from 'zod'

export const MAX_CARDS_PER_DECK = 500

export const cardSchema = z.object({
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
  front_image_url: z.string().url().nullable(),
  back_image_url: z.string().url().nullable(),
})

export type Card = z.infer<typeof cardSchema>

export const deckSchema = z.object({
  id: z.string().min(1),
  firebase_uid: z.string().min(1),
  upload_id: z.string().nullable(),
  title: z.string().min(1).max(200),
  cards: z.array(cardSchema).max(MAX_CARDS_PER_DECK),
  created_at: z.string().datetime(),
})

export type Deck = z.infer<typeof deckSchema>

// Full write shape (cards require id + image URLs) — used internally/server-side
export const deckWriteSchema = deckSchema.omit({ id: true, created_at: true, firebase_uid: true })
export type DeckWrite = z.infer<typeof deckWriteSchema>

// Client input schemas — cards need only front + back; server generates ids
const MAX_CARD_FIELD_LENGTH = 5000

export const createCardInputSchema = z.object({
  front: z.string().min(1).max(MAX_CARD_FIELD_LENGTH),
  back: z.string().min(1).max(MAX_CARD_FIELD_LENGTH),
})
export type CreateCardInput = z.infer<typeof createCardInputSchema>

export const createDeckInputSchema = z.object({
  upload_id: z.string().nullable(),
  title: z.string().min(1).max(200),
  cards: z.array(createCardInputSchema).max(MAX_CARDS_PER_DECK),
})
export type CreateDeckInput = z.infer<typeof createDeckInputSchema>

export const updateDeckSchema = deckWriteSchema.partial()
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>
