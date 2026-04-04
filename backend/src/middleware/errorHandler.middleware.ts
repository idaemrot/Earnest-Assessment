import { Request, Response, NextFunction } from 'express'
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'
import { AppError } from '../utils/AppError'

/**
 * Global error handler middleware.
 * Must be registered LAST in Express (after all routes).
 *
 * Handles:
 *  - AppError          — operational 4xx/5xx with explicit messages
 *  - TokenExpiredError — 401 "Token has expired"
 *  - JsonWebTokenError — 401 "Invalid token"
 *  - Prisma P2002      — 409 duplicate field
 *  - Prisma P2025      — 404 record not found
 *  - Everything else   — 500 Internal Server Error
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

  // ── Operational AppError ────────────────────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }

  // ── JWT — token expired ─────────────────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Token has expired. Please log in again.',
    })
    return
  }

  // ── JWT — malformed / invalid signature ────────────────────────────────────
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    })
    return
  }

  // ── Prisma — unique constraint (e.g. duplicate email) ──────────────────────
  if (err?.code === 'P2002') {
    const field = err?.meta?.target?.[0] ?? 'field'
    res.status(409).json({
      success: false,
      message: `A user with this ${field} already exists`,
    })
    return
  }

  // ── Prisma — record not found ───────────────────────────────────────────────
  if (err?.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Record not found',
    })
    return
  }

  // ── Fallback — hide implementation details from client ─────────────────────
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  })
}
