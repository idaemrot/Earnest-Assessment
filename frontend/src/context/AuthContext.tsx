import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { loginUser, logoutUser, registerUser } from '../services/auth.service'
import { tokenStorage } from '../services/api'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  isAuthenticated: boolean
  user:            { name: string; email: string } | null
  isLoading:       boolean       // true while we check for a stored token on mount
}

interface AuthContextValue extends AuthState {
  login:    (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout:   () => Promise<void>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Decode the user info from a JWT payload without a library.
 * Returns null if the token is missing or malformed.
 */
function decodeUser(token: string | null): { name: string; email: string } | null {
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload?.email && payload?.name ? { name: payload.name, email: payload.email } : null
  } catch {
    return null
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user:            null,
    isLoading:       true,   // start true — bootstrap check
  })

  // ── Bootstrap: check for existing tokens on app load ──────────────────────
  useEffect(() => {
    const token = tokenStorage.getAccess()
    if (token) {
      setState({
        isAuthenticated: true,
        user:            decodeUser(token),
        isLoading:       false,
      })
    } else {
      setState(s => ({ ...s, isLoading: false }))
    }
  }, [])

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const { accessToken } = await loginUser(email, password)
    setState({
      isAuthenticated: true,
      user:            decodeUser(accessToken) ?? { name: 'User', email },
      isLoading:       false,
    })
  }, [])

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name: string, email: string, password: string) => {
    await registerUser(name, email, password)
    // Registration does not auto-login — redirect to login page
  }, [])

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await logoutUser()
    setState({ isAuthenticated: false, user: null, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
