import { User } from '@prisma/client'
import { prisma } from '../prisma/client'
import { hashPassword, comparePassword } from '../utils/password.util'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util'
import { validateRegisterInput, validateLoginInput } from '../utils/validate.util'
import { AppError } from '../utils/AppError'
import { tokenBlacklist } from '../utils/tokenBlacklist'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface RefreshResult {
  accessToken: string
}

// Strip password from returned user object
type SafeUser = Omit<User, 'password'>

// ─── Service ──────────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Connectivity check — called by the test endpoint
   */
  ping: (): string => 'auth service is reachable',

  /**
   * Registers a new user.
   * 1. Validates email + password
   * 2. Hashes the password
   * 3. Creates the user in DB (Prisma handles unique-email constraint via P2002)
   * 4. Returns the created user (without password)
   */
  register: async (input: RegisterInput): Promise<SafeUser> => {
    const { email, password } = input

    // Step 1 — Validate
    validateRegisterInput(email, password)

    // Step 2 — Hash password
    const hashed = await hashPassword(password)

    // Step 3 — Persist (Prisma throws P2002 if email already exists)
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashed,
      },
    })

    // Step 4 — Return user without password
    const { password: _pw, ...safeUser } = user
    return safeUser
  },

  /**
   * Authenticates an existing user.
   * 1. Validates email + password presence
   * 2. Looks up user by email
   * 3. Compares passwords
   * 4. Generates and returns access + refresh tokens
   */
  login: async (input: LoginInput): Promise<AuthTokens> => {
    const { email, password } = input

    // Step 1 — Validate
    validateLoginInput(email, password)

    // Step 2 — Find user
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    // Use a generic message for both "not found" and "wrong password"
    // to avoid leaking whether an email is registered (security best practice)
    if (!user) {
      throw new AppError('Invalid email or password', 401)
    }

    // Step 3 — Compare password
    const isMatch = await comparePassword(password, user.password)
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401)
    }

    // Step 4 — Issue tokens
    const accessToken = generateAccessToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    return { accessToken, refreshToken }
  },

  /**
   * Issues a new access token from a valid refresh token.
   *
   * 1. Validates the refreshToken field is present in the request
   * 2. Verifies the JWT signature + expiry (throws TokenExpiredError /
   *    JsonWebTokenError — caught by the global error handler)
   * 3. Confirms the token type is 'refresh', not an access token
   * 4. Confirms the user still exists in the database
   * 5. Returns a fresh access token
   *
   * NOTE: Refresh token rotation (issuing a new refresh token on each use)
   *       should be added when a token-revocation store (Redis / DB table) is
   *       in place. That is out of scope for now.
   */
  refresh: async (refreshToken: unknown): Promise<RefreshResult> => {
    // Step 1 — Validate presence
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new AppError('Refresh token is required', 400)
    }

    // Step 2 — Reject if already revoked (logout was called)
    if (tokenBlacklist.has(refreshToken)) {
      throw new AppError('Token has been revoked. Please log in again.', 401)
    }

    // Step 3 — Verify signature + expiry
    // (throws TokenExpiredError or JsonWebTokenError — handled by errorHandler)
    const payload = verifyRefreshToken(refreshToken)

    // Step 4 — Reject access tokens masquerading as refresh tokens
    if (payload.type !== 'refresh') {
      throw new AppError('Invalid token type', 401)
    }

    // Step 5 — Confirm the user still exists (defensive: account may be deleted)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true },
    })

    if (!user) {
      throw new AppError('User no longer exists', 401)
    }

    // Step 6 — Issue fresh access token
    const accessToken = generateAccessToken(user.id)

    return { accessToken }
  },

  /**
   * Logs out a user by revoking their refresh token.
   *
   * The token is added to an in-memory blacklist so it cannot be reused
   * to obtain new access tokens.  The access token continues to be valid
   * until it naturally expires (15 min) — this is standard JWT behaviour.
   *
   * Upgrade path: replace tokenBlacklist with Redis or a DB revocation table
   * when multiple server instances are needed.
   */
  logout: (refreshToken: unknown): void => {
    if (!refreshToken || typeof refreshToken !== 'string') {
      // Nothing to revoke — treat as a no-op (idempotent logout)
      return
    }

    tokenBlacklist.add(refreshToken)
  },
}
