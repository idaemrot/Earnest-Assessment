import { Request, Response } from 'express'
import { authService } from '../services/auth.service'

/**
 * GET /auth/test
 * Health check for auth routes
 */
export const testAuth = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'Auth route is working',
    service: authService.ping(),
  })
}

/**
 * POST /auth/register
 * Placeholder — business logic to be implemented in auth.service.ts
 */
export const register = (req: Request, res: Response): void => {
  res.status(501).json({
    success: false,
    message: 'Register not implemented yet',
  })
}

/**
 * POST /auth/login
 * Placeholder — business logic to be implemented in auth.service.ts
 */
export const login = (req: Request, res: Response): void => {
  res.status(501).json({
    success: false,
    message: 'Login not implemented yet',
  })
}
