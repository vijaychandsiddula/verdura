import type { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(public message: string, public statusCode = 400, public code?: string) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err)
  if (err.name === 'AppError') {
    const e = err as AppError
    return res.status(e.statusCode).json({ success: false, error: e.message, code: e.code })
  }
  if (err.name === 'ZodError') {
    return res.status(422).json({ success: false, error: 'Validation failed', details: err })
  }
  return res.status(500).json({ success: false, error: 'Internal server error' })
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: 'Route not found' })
}
