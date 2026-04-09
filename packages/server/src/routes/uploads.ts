import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth'
import { validateParams } from '../middleware/validate'
import { asyncHandler } from '../middleware/asyncHandler'
import { listUploads, getUpload, initUpload } from '../services/uploadService'
import { upload } from '../config/multer'
import { uploadInitLimiter } from '../middleware/rateLimiter'
import type { AuthenticatedRequest } from '../types'

export const uploadsRouter = Router()

uploadsRouter.post(
  '/init',
  uploadInitLimiter,
  authenticate,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    const file = req.file
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' })
      return
    }
    const result = await initUpload((req as AuthenticatedRequest).user.uid, file)
    res.status(201).json(result)
  }),
)

uploadsRouter.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const uploads = await listUploads((req as AuthenticatedRequest).user.uid)
    res.json(uploads)
  }),
)

uploadsRouter.get(
  '/:id',
  authenticate,
  validateParams(z.object({ id: z.string().min(1) })),
  asyncHandler(async (req, res) => {
    const id = req.params['id']!
    const upload = await getUpload(id, (req as AuthenticatedRequest).user.uid)
    res.json(upload)
  }),
)
