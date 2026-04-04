import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

interface FormErrors {
  email?: string
  password?: string
}

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [errors, setErrors]     = useState<FormErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading]   = useState(false)

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const errs: FormErrors = {}

    if (!email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Enter a valid email address'
    }

    if (!password) {
      errs.password = 'Password is required'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setLoading(true)
    try {
      // TODO: replace with real API call
      await new Promise(r => setTimeout(r, 1200))
      navigate('/dashboard')
    } catch {
      setApiError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue to TaskFlow"
      footerText="Don't have an account?"
      footerLinkLabel="Create one"
      footerLinkTo="/register"
    >
      {/* API error banner */}
      {apiError && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-400">
          <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">

        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-xs font-medium text-gray-400 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); setApiError('') }}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-100 placeholder-gray-600 bg-gray-800/80 border transition-colors outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-700 focus:border-teal-500/60 focus:ring-teal-500/20'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
              <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-xs font-medium text-gray-400">
              Password
            </label>
            <button
              type="button"
              className="text-xs text-teal-500 hover:text-teal-400 transition-colors"
              onClick={() => {/* TODO: forgot password */}}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              id="login-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); setApiError('') }}
              placeholder="••••••••"
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-gray-100 placeholder-gray-600 bg-gray-800/80 border transition-colors outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-700 focus:border-teal-500/60 focus:ring-teal-500/20'
              }`}
            />
            {/* Show/hide toggle */}
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
              <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-400/35 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </AuthLayout>
  )
}
