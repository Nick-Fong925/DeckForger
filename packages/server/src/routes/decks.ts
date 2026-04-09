import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { validateParams } from '../middleware/validate'
import { asyncHandler } from '../middleware/asyncHandler'
import { listDecks, getDeck } from '../services/deckService'
import type { AuthenticatedRequest } from '../types'

export const decksRouter = Router()

decksRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    // authenticate middleware guarantees req.user is set; cast is safe here
    const decks = await listDecks((req as AuthenticatedRequest).user.uid)
    res.json(decks)
  }),
)

decksRouter.get(
  '/:id',
  authenticate,
  validateParams(z.object({ id: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    // authenticate middleware guarantees req.user is set; cast is safe here
    // validateParams guarantees req.params['id'] is a non-empty string
    const id = req.params['id']!
    const deck = await getDeck(id, (req as AuthenticatedRequest).user.uid)
    res.json(deck)
  }),
)
