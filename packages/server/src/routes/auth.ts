import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { asyncHandler } from '../middleware/asyncHandler'
import { register } from '../services/authService'
import type { AuthenticatedRequest } from '../types'

export const authRouter = Router()

authRouter.post(
  '/register',
  authenticate,
  asyncHandler(async (req, res) => {
    // authenticate middleware guarantees req.user is set; cast is safe here
    const user = await register((req as AuthenticatedRequest).user)
    res.status(200).json(user)
  }),
)
