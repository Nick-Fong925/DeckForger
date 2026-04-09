import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

import { authRouter } from './routes/auth'
import { decksRouter } from './routes/decks'
import { uploadsRouter } from './routes/uploads'
import { webhooksRouter } from './routes/webhooks'
import { errorHandler } from './middleware/errorHandler'
import { logger } from './lib/logger'

const app = express()
const PORT = process.env['PORT'] ?? 8080

const allowedOrigins = (process.env['ALLOWED_ORIGINS'] ?? 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())

app.use(helmet())
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRouter)
app.use('/decks', decksRouter)
app.use('/uploads', uploadsRouter)
app.use('/webhooks', webhooksRouter)

// Must be registered last — catches errors thrown by all route handlers
app.use(errorHandler)

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server running')
})
