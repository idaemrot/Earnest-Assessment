import { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'

/**
 * Global error handler middleware.
 * Must be registered LAST in Express (after all routes).
 *
 * Handles:
 *  - AppError (operational errors — 4xx, 5xx with clean messages)
 *  - Prisma unique constraint violations (P2002)
 *  - Generic / unexpected errors (returns 500)
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Log all errors server-side
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
  console.error(err)

  // Operational error — thrown intentionally via AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }

  // Prisma unique constraint violation (e.g. duplicate email)
  if (err?.code === 'P2002') {
    const field = err?.meta?.target?.[0] ?? 'field'
    res.status(409).json({
      success: false,
      message: `A user with this ${field} already exists`,
    })
    return
  }

  // Prisma record not found
  if (err?.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Record not found',
    })
    return
  }

  // Unexpected / programming errors — hide details from client
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  })
}
