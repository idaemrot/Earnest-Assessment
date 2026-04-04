import api, { tokenStorage } from '@/services/api'

// ─── Response types ───────────────────────────────────────────────────────────

export interface AuthUser {
  id:        string
  email:     string
  createdAt: string
}

export interface LoginResponse {
  accessToken:  string
  refreshToken: string
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * POST /auth/register
 * Returns the created user object.
 */
export async function registerUser(name: string, email: string, password: string): Promise<AuthUser> {
  const { data } = await api.post('/auth/register', { name, email, password })
  return data.data.user as AuthUser
}

/**
 * POST /auth/login
 * Stores tokens in localStorage and returns them.
 */
export async function loginUser(
  email:    string,
  password: string
): Promise<LoginResponse> {
  const { data } = await api.post('/auth/login', { email, password })
  const { accessToken, refreshToken } = data.data as LoginResponse
  tokenStorage.setTokens(accessToken, refreshToken)
  return { accessToken, refreshToken }
}

/**
 * POST /auth/logout
 * Revokes the stored refresh token, then clears local storage.
 */
export async function logoutUser(): Promise<void> {
  const refreshToken = tokenStorage.getRefresh()
  try {
    await api.post('/auth/logout', { refreshToken })
  } finally {
    // Always clear tokens, even if the request fails
    tokenStorage.clear()
  }
}

/**
 * POST /auth/refresh
 * Manually refresh the access token (rarely needed — interceptor does this automatically).
 */
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenStorage.getRefresh()
  const { data } = await api.post('/auth/refresh', { refreshToken })
  const newToken: string = data.data.accessToken
  tokenStorage.setAccess(newToken)
  return newToken
}
