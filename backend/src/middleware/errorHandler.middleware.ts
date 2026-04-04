import { Request, Response, NextFunction } from 'express'
import { ZodError, ZodIssue } from 'zod'
import { TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken'
import { AppError } from '../utils/AppError'

/**
 * Global error handler middleware.
 *
 * Must be registered LAST in Express — after all routes and other middleware.
 * Express identifies it as an error handler because it accepts exactly 4 args.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  Error type            │ HTTP │ Triggered by                        │
 * ├─────────────────────────────────────────────────────────────────────┤
 * │  AppError              │ 4xx  │ throw new AppError(msg, status)     │
 * │  ZodError              │ 400  │ validate() middleware                │
 * │  SyntaxError (JSON)    │ 400  │ malformed request body              │
 * │  TokenExpiredError     │ 401  │ jwt.verify() — expired token        │
 * │  JsonWebTokenError     │ 401  │ jwt.verify() — bad signature/format │
 * │  Prisma P2002          │ 409  │ unique constraint violation          │
 * │  Prisma P2025          │ 404  │ record not found                    │
 * │  Anything else         │ 500  │ unexpected / programming error      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * All responses follow the shape:
 *   { success: false, message: string, errors?: { field, message }[] }
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // ── Server-side logging ─────────────────────────────────────────────────────
  console.error(
    `[ERROR] ${new Date().toISOString()} | ${req.method} ${req.originalUrl}`
  )
  console.error(err)

  // ── 1. Operational AppError ─────────────────────────────────────────────────
  //    Thrown explicitly via `throw new AppError(message, statusCode)`.
  //    The message is safe to expose to the client.
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    })
    return
  }

  // ── 2. Zod validation error ─────────────────────────────────────────────────
  //    Produced by the validate() middleware when a schema check fails.
  //    Returns a field-level errors array alongside the summary message.
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue: ZodIssue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
    }))
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    })
    return
  }

  // ── 3. Malformed JSON body ──────────────────────────────────────────────────
  //    Express's express.json() throws a SyntaxError when the body cannot
  //    be parsed (e.g. `{"email":}` — missing value).
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
    })
    return
  }

  // ── 4. Auth — JWT token expired ─────────────────────────────────────────────
  //    Token was valid but has passed its expiry time.
  if (err instanceof TokenExpiredError) {
    res.status(401).json({
      success: false,
      message: 'Token has expired. Please log in again.',
    })
    return
  }

  // ── 5. Auth — JWT malformed / bad signature ─────────────────────────────────
  //    Token structure is invalid or signature does not match.
  if (err instanceof JsonWebTokenError) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
    })
    return
  }

  // ── 6. Database — unique constraint violation ───────────────────────────────
  //    Prisma P2002: a unique field (e.g. email) already exists in the DB.
  if (err?.code === 'P2002') {
    const field = err?.meta?.target?.[0] ?? 'field'
    res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists`,
    })
    return
  }

  // ── 7. Database — record not found ─────────────────────────────────────────
  //    Prisma P2025: a findUnique / update / delete targeted a missing record.
  if (err?.code === 'P2025') {
    res.status(404).json({
      success: false,
      message: 'Record not found',
    })
    return
  }

  // ── 8. Fallback — unexpected server error ───────────────────────────────────
  //    All other errors (programming bugs, uncaught throws, etc.).
  //    Details are intentionally hidden from the client.
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  })
}
