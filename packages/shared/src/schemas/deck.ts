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

export const createDeckSchema = deckSchema.omit({ id: true, created_at: true, firebase_uid: true })
export type CreateDeckInput = z.infer<typeof createDeckSchema>

export const updateDeckSchema = createDeckSchema.partial()
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>
