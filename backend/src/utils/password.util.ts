import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Hashes a plain-text password using bcrypt.
 * @param password - The plain-text password to hash
 * @returns The bcrypt hash string
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS)
  return bcrypt.hash(password, salt)
}

/**
 * Compares a plain-text password against a stored bcrypt hash.
 * @param password - The plain-text password provided by the user
 * @param hash     - The stored bcrypt hash
 * @returns `true` if they match, `false` otherwise
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}
