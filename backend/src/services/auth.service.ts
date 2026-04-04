/**
 * Auth Service
 * Business logic for authentication will live here.
 * (register, login, token generation, password hashing, etc.)
 */
export const authService = {
  /**
   * Connectivity check — called by the controller test endpoint
   */
  ping: (): string => 'auth service is reachable',
}
