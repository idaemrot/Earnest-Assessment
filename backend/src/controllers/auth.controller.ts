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
 * Success 201:
 *   { success: true, message: "Registration successful", data: { id, email, createdAt } }
 *
 * Errors:
 *   400 — validation failure
 *   409 — email already taken
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
 * Success 200:
 *   { success: true, data: { accessToken, refreshToken } }
 *
 * Errors:
 *   400 — missing fields
 *   401 — invalid credentials
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
