import { z } from 'zod'

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Must be a valid email address')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer')   // bcrypt max
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export type RegisterInput = z.infer<typeof registerSchema>

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Must be a valid email address')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ─── Refresh ──────────────────────────────────────────────────────────────────

export const refreshSchema = z.object({
  refreshToken: z
    .string({ required_error: 'refreshToken is required' })
    .min(1, 'refreshToken cannot be empty'),
})

export type RefreshInput = z.infer<typeof refreshSchema>

// ─── Logout ───────────────────────────────────────────────────────────────────
// Logout is intentionally NOT validated — it's idempotent and a missing
// token is treated as a no-op in the service layer.
