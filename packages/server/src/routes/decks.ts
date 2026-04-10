import { Router } from 'express'
import { z } from 'zod'
import { createDeckInputSchema, patchDeckSchema, patchQuizScoreSchema } from '@deckforge/shared'
import { authenticate } from '../middleware/auth'
import { validate, validateParams } from '../middleware/validate'
import { asyncHandler } from '../middleware/asyncHandler'
import { listDecks, getDeck, createDeck, updateDeck, deleteDeck, updateQuizBestScore } from '../services/deckService'
import type { AuthenticatedRequest } from '../types'

export const decksRouter = Router()

const idParams = validateParams(z.object({ id: z.string().min(1) }))

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
  idParams,
  asyncHandler(async (req, res) => {
    const deck = await getDeck(req.params['id']!, (req as AuthenticatedRequest).user.uid)
    res.json(deck)
  }),
)

decksRouter.patch(
  '/:id',
  authenticate,
  idParams,
  validate(patchDeckSchema),
  asyncHandler(async (req, res) => {
    const deck = await updateDeck(req.params['id']!, (req as AuthenticatedRequest).user.uid, req.body)
    res.json(deck)
  }),
)

decksRouter.patch(
  '/:id/quiz-score',
  authenticate,
  idParams,
  validate(patchQuizScoreSchema),
  asyncHandler(async (req, res) => {
    const deck = await updateQuizBestScore(req.params['id']!, (req as AuthenticatedRequest).user.uid, req.body.score)
    res.json(deck)
  }),
)

decksRouter.delete(
  '/:id',
  authenticate,
  idParams,
  asyncHandler(async (req, res) => {
    await deleteDeck(req.params['id']!, (req as AuthenticatedRequest).user.uid)
    res.status(204).send()
  }),
)
