import type { Request, Response, NextFunction, RequestHandler } from 'express'
import type { ZodSchema } from 'zod'
import { ValidationError } from './errorHandler'

export function validate(schema: ZodSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      next(new ValidationError(result.error.message))
      return
    }
    req.body = result.data
    next()
  }
}

export function validateParams(schema: ZodSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params)
    if (!result.success) {
      next(new ValidationError(result.error.message))
      return
    }
    // as Record<string, string>: Express types req.params as string-only.
    // All validateParams callers must use string-only schemas — enforced by convention.
    req.params = result.data as Record<string, string>
    next()
  }
}
