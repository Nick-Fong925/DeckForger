import { z } from 'zod'

export const cardSchema = z.object({
  front: z.string(),
  back: z.string(),
})

export type Card = z.infer<typeof cardSchema>

export const deckSchema = z.object({
  id: z.string().uuid(),
  firebase_uid: z.string(),
  upload_id: z.string().uuid(),
  title: z.string(),
  cards: z.array(cardSchema),
  gcs_delivery_path: z.string().nullable(),
  created_at: z.string().datetime(),
})

export type Deck = z.infer<typeof deckSchema>
