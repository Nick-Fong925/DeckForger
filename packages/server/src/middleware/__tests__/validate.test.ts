import { describe, it, expect, vi, type Mock } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { validate, validateParams } from '../validate'
import { ValidationError } from '../errorHandler'

function makeReq(body: unknown = {}, params: unknown = {}): Request {
  return { body, params } as unknown as Request
}

function makeRes(): Response {
  return {} as Response
}

function makeNext(): NextFunction {
  return vi.fn() as unknown as NextFunction
}

const nameSchema = z.object({ name: z.string().min(1) })
const idParamsSchema = z.object({ id: z.string().min(1) })

describe('validate middleware', () => {
  it('calls next() with no arguments when body is valid', () => {
    const next = makeNext()
    validate(nameSchema)(makeReq({ name: 'Alice' }), makeRes(), next)
    expect(next).toHaveBeenCalledOnce()
    expect((next as Mock).mock.calls[0]).toHaveLength(0)
  })

  it('replaces req.body with parsed data on success', () => {
    const req = makeReq({ name: 'Alice', extra: 'stripped' })
    validate(nameSchema)(req, makeRes(), makeNext())
    expect(req.body).toEqual({ name: 'Alice' })
  })

  it('calls next() with a ValidationError when body is invalid', () => {
    const next = makeNext()
    validate(nameSchema)(makeReq({ name: '' }), makeRes(), next)
    const err = (next as Mock).mock.calls[0]?.[0]
    expect(err).toBeInstanceOf(ValidationError)
  })

  it('does not modify req.body when validation fails', () => {
    const original = { name: 123 }
    const req = makeReq(original)
    validate(nameSchema)(req, makeRes(), makeNext())
    expect(req.body).toBe(original)
  })

  it('ValidationError has statusCode 400', () => {
    const next = makeNext()
    validate(nameSchema)(makeReq({}), makeRes(), next)
    const err = (next as Mock).mock.calls[0]?.[0] as ValidationError
    expect(err.statusCode).toBe(400)
  })

  it('calls next() with ValidationError when body is null', () => {
    const next = makeNext()
    validate(nameSchema)(makeReq(null), makeRes(), next)
    expect((next as Mock).mock.calls[0]?.[0]).toBeInstanceOf(ValidationError)
  })

  it('does not call next() more than once', () => {
    const next = makeNext()
    validate(nameSchema)(makeReq({}), makeRes(), next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('strips unknown fields from req.body', () => {
    const req = makeReq({ name: 'Alice', unknown_field: true })
    validate(nameSchema)(req, makeRes(), makeNext())
    expect((req.body as Record<string, unknown>)['unknown_field']).toBeUndefined()
  })

  it('works with nested schemas', () => {
    const nested = z.object({ user: z.object({ email: z.string().email() }) })
    const next = makeNext()
    validate(nested)(makeReq({ user: { email: 'a@b.com' } }), makeRes(), next)
    expect((next as Mock).mock.calls[0]).toHaveLength(0)
  })

  it('fails with ValidationError for invalid nested data', () => {
    const nested = z.object({ user: z.object({ email: z.string().email() }) })
    const next = makeNext()
    validate(nested)(makeReq({ user: { email: 'not-an-email' } }), makeRes(), next)
    expect((next as Mock).mock.calls[0]?.[0]).toBeInstanceOf(ValidationError)
  })
})

describe('validateParams middleware', () => {
  it('calls next() with no arguments when params are valid', () => {
    const next = makeNext()
    validateParams(idParamsSchema)(makeReq({}, { id: 'abc123' }), makeRes(), next)
    expect(next).toHaveBeenCalledOnce()
    expect((next as Mock).mock.calls[0]).toHaveLength(0)
  })

  it('replaces req.params with parsed data on success', () => {
    const req = makeReq({}, { id: 'abc123' })
    validateParams(idParamsSchema)(req, makeRes(), makeNext())
    expect(req.params).toEqual({ id: 'abc123' })
  })

  it('calls next() with ValidationError when a param is invalid', () => {
    const next = makeNext()
    validateParams(idParamsSchema)(makeReq({}, { id: '' }), makeRes(), next)
    expect((next as Mock).mock.calls[0]?.[0]).toBeInstanceOf(ValidationError)
  })

  it('calls next() with ValidationError when a required param is missing', () => {
    const next = makeNext()
    validateParams(idParamsSchema)(makeReq({}, {}), makeRes(), next)
    expect((next as Mock).mock.calls[0]?.[0]).toBeInstanceOf(ValidationError)
  })

  it('ValidationError has statusCode 400', () => {
    const next = makeNext()
    validateParams(idParamsSchema)(makeReq({}, { id: '' }), makeRes(), next)
    const err = (next as Mock).mock.calls[0]?.[0] as ValidationError
    expect(err.statusCode).toBe(400)
  })

  it('does not mutate req.body when validating params', () => {
    const req = makeReq({ name: 'Alice' }, { id: 'abc123' })
    validateParams(idParamsSchema)(req, makeRes(), makeNext())
    expect(req.body).toEqual({ name: 'Alice' })
  })

  it('does not call next() more than once', () => {
    const next = makeNext()
    validateParams(idParamsSchema)(makeReq({}, { id: '' }), makeRes(), next)
    expect(next).toHaveBeenCalledOnce()
  })
})
