/**
 * In-memory token blacklist for invalidated refresh tokens.
 *
 * Simple approach:  stores revoked refresh tokens in a Set for the server's
 * lifetime.  This is appropriate for single-instance deployments.
 *
 * Limitations / upgrade path:
 *  - Cleared on server restart (users' refresh tokens become valid again).
 *  - Not shared across multiple server instances.
 *  - For production, replace with Redis (e.g. SET token EX <ttl>) or a
 *    DB table of revoked token JTIs.
 */
const blacklist = new Set<string>()

export const tokenBlacklist = {
  /** Add a token to the revocation list. */
  add: (token: string): void => {
    blacklist.add(token)
  },

  /** Returns true if the token has been revoked. */
  has: (token: string): boolean => {
    return blacklist.has(token)
  },

  /** Remove a token (useful in tests). */
  remove: (token: string): void => {
    blacklist.delete(token)
  },
}
