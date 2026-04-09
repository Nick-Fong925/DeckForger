import { Router } from 'express'
import { z } from 'zod'
import { createDeckInputSchema } from '@deckforge/shared'
import { authenticate } from '../middleware/auth'
import { validate, validateParams } from '../middleware/validate'
import { asyncHandler } from '../middleware/asyncHandler'
import { listDecks, getDeck, createDeck } from '../services/deckService'
import type { AuthenticatedRequest } from '../types'

export const decksRouter = Router()

decksRouter.post(
  '/',
  authenticate,
  validate(createDeckInputSchema),
  asyncHandler(async (req, res) => {
    const deck = await createDeck((req as AuthenticatedRequest).user.uid, req.body)
    res.status(201).json(deck)
  }),
)

decksRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const decks = await listDecks((req as AuthenticatedRequest).user.uid)
    res.json(decks)
  }),
)

decksRouter.get(
  '/:id',
  authenticate,
  validateParams(z.object({ id: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    const id = req.params['id']!
    const deck = await getDeck(id, (req as AuthenticatedRequest).user.uid)
    res.json(deck)
  }),
)
