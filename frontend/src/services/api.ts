/// <reference types="vite/client" />
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'

// ─── Token storage helpers ────────────────────────────────────────────────────
const KEYS = {
  accessToken:  'tf_access_token',
  refreshToken: 'tf_refresh_token',
} as const

export const tokenStorage = {
  getAccess:      ()          => localStorage.getItem(KEYS.accessToken),
  getRefresh:     ()          => localStorage.getItem(KEYS.refreshToken),
  setAccess:      (t: string) => localStorage.setItem(KEYS.accessToken,  t),
  setRefresh:     (t: string) => localStorage.setItem(KEYS.refreshToken, t),
  setTokens:      (access: string, refresh: string) => {
    localStorage.setItem(KEYS.accessToken,  access)
    localStorage.setItem(KEYS.refreshToken, refresh)
  },
  clear: () => {
    localStorage.removeItem(KEYS.accessToken)
    localStorage.removeItem(KEYS.refreshToken)
  },
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ─── Request interceptor — attach Bearer token ────────────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor — refresh on 401 ───────────────────────────────────
// Uses a queue so concurrent requests all wait for the single refresh call
// instead of firing multiple refresh requests simultaneously.

let isRefreshing    = false
let refreshQueue:   Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = []

function processQueue(error: unknown, token: string | null) {
  refreshQueue.forEach(p => (token ? p.resolve(token) : p.reject(error)))
  refreshQueue = []
}

api.interceptors.response.use(
  res => res,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Only attempt refresh on 401, and only once per request
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const refreshToken = tokenStorage.getRefresh()
    if (!refreshToken) {
      tokenStorage.clear()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue this request until the in-progress refresh completes
      return new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      })
        .then(newToken => {
          originalRequest.headers = originalRequest.headers ?? {}
          ;(originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`
          return api(originalRequest)
        })
        .catch(err => Promise.reject(err))
    }

    originalRequest._retry = true
    isRefreshing            = true

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'}/auth/refresh`,
        { refreshToken }
      )
      const newAccessToken: string = data.data.accessToken
      tokenStorage.setAccess(newAccessToken)
      processQueue(null, newAccessToken)

      // Retry original request with new token
      originalRequest.headers = originalRequest.headers ?? {}
      ;(originalRequest.headers as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`
      return api(originalRequest)

    } catch (refreshError) {
      processQueue(refreshError, null)
      tokenStorage.clear()
      window.location.href = '/login'
      return Promise.reject(refreshError)

    } finally {
      isRefreshing = false
    }
  }
)

export default api
