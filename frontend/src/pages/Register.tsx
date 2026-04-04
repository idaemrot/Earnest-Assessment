import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
}

// Password strength helpers
const hasUpper   = (s: string) => /[A-Z]/.test(s)
const hasNumber  = (s: string) => /[0-9]/.test(s)
const hasLength  = (s: string) => s.length >= 8

function StrengthBar({ password }: { password: string }) {
  if (!password) return null

  const checks = [hasLength(password), hasUpper(password), hasNumber(password)]
  const score  = checks.filter(Boolean).length  // 0–3

  const label = ['Weak', 'Fair', 'Strong'][score - 1] ?? ''
  const color = ['bg-red-500', 'bg-amber-400', 'bg-teal-500'][score - 1] ?? 'bg-gray-700'
  const textColor = ['text-red-400', 'text-amber-400', 'text-teal-400'][score - 1] ?? ''

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? color : 'bg-gray-700'}`}
          />
        ))}
      </div>
      <ul className="grid grid-cols-3 gap-x-2 gap-y-0.5">
        {[
          { label: '8+ chars',  ok: hasLength(password) },
          { label: 'Uppercase', ok: hasUpper(password) },
          { label: 'Number',    ok: hasNumber(password) },
        ].map(({ label, ok }) => (
          <li key={label} className={`flex items-center gap-1 text-xs transition-colors ${ok ? 'text-teal-400' : 'text-gray-600'}`}>
            <svg className="h-2.5 w-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              {ok
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              }
            </svg>
            {label}
          </li>
        ))}
      </ul>
      {label && <p className={`text-xs font-medium ${textColor}`}>Strength: {label}</p>}
    </div>
  )
}

export default function Register() {
  const navigate = useNavigate()

  const [email, setEmail]                   = useState('')
  const [password, setPassword]             = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw]                 = useState(false)
  const [showConfirm, setShowConfirm]       = useState(false)
  const [errors, setErrors]                 = useState<FormErrors>({})
  const [apiError, setApiError]             = useState('')
  const [loading, setLoading]               = useState(false)

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
    } else if (!hasLength(password)) {
      errs.password = 'Password must be at least 8 characters'
    } else if (!hasUpper(password)) {
      errs.password = 'Password must contain at least one uppercase letter'
    } else if (!hasNumber(password)) {
      errs.password = 'Password must contain at least one number'
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password'
    } else if (confirmPassword !== password) {
      errs.confirmPassword = 'Passwords do not match'
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
      await new Promise(r => setTimeout(r, 1400))
      navigate('/login')
    } catch {
      setApiError('Registration failed. This email may already be in use.')
    } finally {
      setLoading(false)
    }
  }

  const clearError = (field: keyof FormErrors) =>
    setErrors(p => ({ ...p, [field]: undefined }))

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your tasks with TaskFlow"
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkTo="/login"
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
          <label htmlFor="reg-email" className="block text-xs font-medium text-gray-400 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); clearError('email'); setApiError('') }}
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
          <label htmlFor="reg-password" className="block text-xs font-medium text-gray-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              id="reg-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={e => { setPassword(e.target.value); clearError('password') }}
              placeholder="••••••••"
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-gray-100 placeholder-gray-600 bg-gray-800/80 border transition-colors outline-none focus:ring-2 ${
                errors.password
                  ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-700 focus:border-teal-500/60 focus:ring-teal-500/20'
              }`}
            />
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
          {errors.password ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
              <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          ) : (
            <StrengthBar password={password} />
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="reg-confirm" className="block text-xs font-medium text-gray-400 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); clearError('confirmPassword') }}
              placeholder="••••••••"
              className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-gray-100 placeholder-gray-600 bg-gray-800/80 border transition-colors outline-none focus:ring-2 ${
                errors.confirmPassword
                  ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
                  : confirmPassword && confirmPassword === password
                    ? 'border-teal-500/40 focus:border-teal-500/60 focus:ring-teal-500/20'
                    : 'border-gray-700 focus:border-teal-500/60 focus:ring-teal-500/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? (
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
          {errors.confirmPassword && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
              <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.confirmPassword}
            </p>
          )}
          {!errors.confirmPassword && confirmPassword && confirmPassword === password && (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-teal-400">
              <svg className="h-3 w-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Passwords match
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
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthLayout>
  )
}
