import { AppError } from './AppError'

/**
 * Validates that an email string has a proper format.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Validates register input — email + password.
 * Throws AppError (400) on any validation failure.
 */
export const validateRegisterInput = (name: unknown, email: unknown, password: unknown): void => {
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new AppError('Name is required', 400)
  }
  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw new AppError('Email is required', 400)
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    throw new AppError('Invalid email format', 400)
  }
  if (!password || typeof password !== 'string') {
    throw new AppError('Password is required', 400)
  }
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400)
  }
}

/**
 * Validates login input — email + password presence only.
 * Throws AppError (400) on any validation failure.
 */
export const validateLoginInput = (email: unknown, password: unknown): void => {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw new AppError('Email is required', 400)
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    throw new AppError('Password is required', 400)
  }
}
