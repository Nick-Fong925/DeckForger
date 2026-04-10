import { z } from 'zod'

export const MAX_CARDS_PER_DECK = 500

export const cardSchema = z.object({
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
})

export type Card = z.infer<typeof cardSchema>

export const deckSchema = z.object({
  id: z.string().min(1),
  firebase_uid: z.string().min(1),
  upload_id: z.string().nullable(),
  title: z.string().min(1).max(200),
  // nullable so existing decks without a description parse cleanly, and cleared descriptions
  // can be stored as null rather than requiring a Firestore field delete
  description: z.string().max(500).nullable().optional(),
  cards: z.array(cardSchema).max(MAX_CARDS_PER_DECK),
  created_at: z.string().datetime(),
  // optional so existing decks without a score parse cleanly
  quiz_best_score: z.number().int().nonnegative().nullable().optional(),
})

export type Deck = z.infer<typeof deckSchema>

// Full write shape (cards require id) — used internally/server-side
export const deckWriteSchema = deckSchema.omit({ id: true, created_at: true, firebase_uid: true })
export type DeckWrite = z.infer<typeof deckWriteSchema>

// Client input schemas — cards need only front + back; server generates ids
export const MAX_CARD_FIELD_LENGTH = 10000

export const createCardInputSchema = z.object({
  front: z.string().min(1).max(MAX_CARD_FIELD_LENGTH),
  back: z.string().min(1).max(MAX_CARD_FIELD_LENGTH),
})
export type CreateCardInput = z.infer<typeof createCardInputSchema>

export const patchDeckSchema = z.object({
  cards: z.array(createCardInputSchema).max(MAX_CARDS_PER_DECK),
  // null = clear the description; string = set it; omitted = leave unchanged
  description: z.string().max(500).nullable().optional(),
})
export type PatchDeckInput = z.infer<typeof patchDeckSchema>

export const createDeckInputSchema = z.object({
  upload_id: z.string().nullable(),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  cards: z.array(createCardInputSchema).max(MAX_CARDS_PER_DECK),
})
export type CreateDeckInput = z.infer<typeof createDeckInputSchema>

export const updateDeckSchema = deckWriteSchema.partial()
export type UpdateDeckInput = z.infer<typeof updateDeckSchema>

export const patchQuizScoreSchema = z.object({
  score: z.number().int().nonnegative(),
})
export type PatchQuizScoreInput = z.infer<typeof patchQuizScoreSchema>
