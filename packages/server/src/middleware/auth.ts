import type { Request, Response, NextFunction } from 'express'
import { getAdminAuth } from '../config/firebase'
import type { AuthenticatedRequest } from '../types'
import { UnauthorizedError } from './errorHandler'

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing or invalid Authorization header'))
    return
  }

  const token = authHeader.slice(7)

  try {
    const decoded = await getAdminAuth().verifyIdToken(token)
    // authenticate middleware guarantees req.user is set; cast is safe here
    ;(req as AuthenticatedRequest).user = decoded
    next()
  } catch {
    next(new UnauthorizedError('Invalid or expired token'))
  }
}
