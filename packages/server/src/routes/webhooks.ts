import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { jobEventSchema } from '@deckforge/shared'
import { validate } from '../middleware/validate'
import { asyncHandler } from '../middleware/asyncHandler'
import { validateWebhookSecret } from '../middleware/webhookAuth'
import { handleJobComplete } from '../services/webhookService'

export const webhooksRouter = Router()

const webhookLimiter = rateLimit({ windowMs: 60_000, max: 60 })

webhooksRouter.post(
  '/job-complete',
  webhookLimiter,
  validateWebhookSecret(),
  validate(jobEventSchema),
  asyncHandler(async (req, res) => {
    await handleJobComplete(req.body)
    res.status(204).send()
  }),
)
