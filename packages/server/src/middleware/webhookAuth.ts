import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { UnauthorizedError } from './errorHandler'

export function validateWebhookSecret(): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const secret = process.env['WEBHOOK_SECRET']
    if (!secret) {
      next(new Error('WEBHOOK_SECRET is not configured'))
      return
    }

    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      next(new UnauthorizedError('Missing or invalid webhook Authorization header'))
      return
    }

    const provided = authHeader.slice(7)
    if (provided !== secret) {
      next(new UnauthorizedError('Invalid webhook secret'))
      return
    }

    next()
  }
}
