import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { asyncHandler } from '../middleware/asyncHandler'
import { register, getMe } from '../services/authService'
import { authLimiter } from '../middleware/rateLimiter'
import type { AuthenticatedRequest } from '../types'

export const authRouter = Router()

authRouter.post(
  '/register',
  authLimiter,
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await register((req as AuthenticatedRequest).user)
    res.status(201).json(user)
  }),
)

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await getMe((req as AuthenticatedRequest).user.uid)
    res.json(user)
  }),
)
