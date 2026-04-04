import { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { asyncHandler } from '../utils/asyncHandler'

// ─── Test ─────────────────────────────────────────────────────────────────────

/**
 * GET /auth/test
 */
export const testAuth = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Auth route is working',
    service: authService.ping(),
  })
}

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /auth/register
 * Body: { email: string, password: string }
 *
 * 201 → { success, message, data: { user } }
 * 400 → validation failure
 * 409 → email already taken
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  const user = await authService.register({ email, password })

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: { user },
  })
})

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * Body: { email: string, password: string }
 *
 * 200 → { success, message, data: { accessToken, refreshToken } }
 * 400 → missing fields
 * 401 → invalid credentials
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body

  const tokens = await authService.login({ email, password })

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: tokens,
  })
})

// ─── Refresh ──────────────────────────────────────────────────────────────────

/**
 * POST /auth/refresh
 * Body: { refreshToken: string }
 *
 * 200 → { success, data: { accessToken } }
 * 400 → missing token
 * 401 → expired, revoked, or invalid token
 */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body

  const result = await authService.refresh(refreshToken)

  res.status(200).json({
    success: true,
    message: 'Access token refreshed',
    data: result,
  })
})

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * POST /auth/logout
 * Body: { refreshToken: string }
 *
 * Revokes the refresh token by adding it to the in-memory blacklist.
 * Idempotent — safe to call even if the token is already revoked or missing.
 *
 * 200 → { success, message }
 */
export const logout = (req: Request, res: Response): void => {
  const { refreshToken } = req.body

  // Synchronous — no async needed (in-memory Set operation)
  authService.logout(refreshToken)

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  })
}
