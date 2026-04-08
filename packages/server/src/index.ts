import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'

dotenv.config()

import { authRouter } from './routes/auth'
import { errorHandler } from './middleware/errorHandler'

const app = express()
const PORT = process.env['PORT'] ?? 8080

app.use(helmet())
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/auth', authRouter)

// Must be registered last — catches errors thrown by all route handlers
app.use(errorHandler)

app.listen(PORT, () => {
  console.warn(`Server running on port ${PORT}`)
})
