import jwt, { SignOptions } from 'jsonwebtoken'

// ─── Env validation ──────────────────────────────────────────────────────────

const getSecret = (key: string): string => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }
  return value
}

// ─── Token payloads ──────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  userId: string
  name: string
  email: string
  type: 'access'
}

export interface RefreshTokenPayload {
  userId: string
  type: 'refresh'
}

// ─── Access Token ────────────────────────────────────────────────────────────

/**
 * Generates a short-lived JWT access token (default: 15 minutes).
 * Should be sent in Authorization header: `Bearer <token>`
 */
export const generateAccessToken = (userId: string, name: string, email: string): string => {
  const secret = getSecret('JWT_ACCESS_SECRET')
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ?? '15m') as SignOptions['expiresIn']

  const payload: AccessTokenPayload = { userId, name, email, type: 'access' }
  return jwt.sign(payload, secret, { expiresIn })
}

/**
 * Verifies and decodes a JWT access token.
 * Throws if the token is invalid or expired.
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  const secret = getSecret('JWT_ACCESS_SECRET')
  return jwt.verify(token, secret) as AccessTokenPayload
}

// ─── Refresh Token ───────────────────────────────────────────────────────────

/**
 * Generates a long-lived JWT refresh token (default: 7 days).
 * Should be stored in an httpOnly cookie.
 */
export const generateRefreshToken = (userId: string): string => {
  const secret = getSecret('JWT_REFRESH_SECRET')
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as SignOptions['expiresIn']

  const payload: RefreshTokenPayload = { userId, type: 'refresh' }
  return jwt.sign(payload, secret, { expiresIn })
}

/**
 * Verifies and decodes a JWT refresh token.
 * Throws if the token is invalid or expired.
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const secret = getSecret('JWT_REFRESH_SECRET')
  return jwt.verify(token, secret) as RefreshTokenPayload
}
