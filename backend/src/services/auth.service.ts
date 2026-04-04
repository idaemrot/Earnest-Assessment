import { User } from '@prisma/client'
import { prisma } from '../prisma/client'
import { hashPassword, comparePassword } from '../utils/password.util'
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util'
import { validateRegisterInput, validateLoginInput } from '../utils/validate.util'
import { AppError } from '../utils/AppError'

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
}
