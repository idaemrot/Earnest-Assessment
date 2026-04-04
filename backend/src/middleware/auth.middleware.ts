import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.util'
import { AppError } from '../utils/AppError'

/**
 * Authentication middleware.
 *
 * Reads the `Authorization: Bearer <token>` header, verifies the access token,
 * and attaches `userId` to `req` for downstream handlers.
 *
 * Rejects with 401 if:
 *  - Authorization header is missing or malformed
 *  - Token is expired   (TokenExpiredError  → caught by global errorHandler)
 *  - Token is invalid   (JsonWebTokenError  → caught by global errorHandler)
 *  - Token type is not 'access' (e.g. a refresh token was passed by mistake)
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // ── Step 1: Read header ─────────────────────────────────────────────────
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Authorization header missing or malformed. Expected: Bearer <token>',
        401
      )
    }

    // ── Step 2: Extract token ───────────────────────────────────────────────
    const token = authHeader.split(' ')[1]

    if (!token) {
      throw new AppError('Access token is missing', 401)
    }

    // ── Step 3: Verify (throws on expired / invalid signature) ─────────────
    const payload = verifyAccessToken(token)

    // ── Step 4: Guard against refresh tokens used as access tokens ─────────
    if (payload.type !== 'access') {
      throw new AppError('Invalid token type', 401)
    }

    // ── Step 5: Attach userId to request for downstream handlers ───────────
    req.userId = payload.userId

    next()
  } catch (err) {
    // Forward AppError and JWT errors to the global error handler
    next(err)
  }
}
