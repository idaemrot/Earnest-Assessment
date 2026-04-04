'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { isAxiosError } from 'axios'
import { useToast } from '@/context/ToastContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register'
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const hasUpper = (s: string) => /[A-Z]/.test(s)
const hasNumber = (s: string) => /[0-9]/.test(s)
const hasLength = (s: string) => s.length >= 8

function StrengthBar({ password }: { password: string }) {
  if (!password) return null
  const checks = [hasLength(password), hasUpper(password), hasNumber(password)]
  const score = checks.filter(Boolean).length
  const colors = ['bg-red-500', 'bg-amber-400', 'bg-teal-500']
  const labels = ['Weak', 'Fair', 'Strong']
  const tClrs = ['text-red-400', 'text-amber-400', 'text-teal-400']

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score - 1] : 'bg-gray-700'}`} />
        ))}
      </div>
      <ul className="grid grid-cols-3 gap-x-2">
        {[{ label: '8+ chars', ok: hasLength(password) }, { label: 'Uppercase', ok: hasUpper(password) }, { label: 'Number', ok: hasNumber(password) }].map(({ label, ok }) => (
          <li key={label} className={`flex items-center gap-1 text-[10px] sm:text-xs ${ok ? 'text-teal-400' : 'text-gray-600'}`}>
            <svg className="h-2.5 w-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              {ok ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />}
            </svg>
            <span className="truncate">{label}</span>
          </li>
        ))}
      </ul>
      {score > 0 && <p className={`text-xs font-medium ${tClrs[score - 1]}`}>Strength: {labels[score - 1]}</p>}
    </div>
  )
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, register } = useAuth()
  const router = useRouter()
  const toast = useToast()
  const overlayRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  // Reset form when opening or changing mode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setErrors({})
      setApiError('')
    }
  }, [isOpen, initialMode])

  useEffect(() => {
    // Handle Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    // Lock body scroll
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  const clearError = (f: keyof FormErrors) => setErrors(p => ({ ...p, [f]: undefined }))

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (mode === 'register') {
      if (!name.trim()) errs.name = 'Name is required'
    }

    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address'

    if (!password) errs.password = 'Password is required'
    else if (mode === 'register') {
      if (!hasLength(password)) errs.password = 'Must be at least 8 characters'
      else if (!hasUpper(password)) errs.password = 'Must contain at least one uppercase letter'
      else if (!hasNumber(password)) errs.password = 'Must contain at least one number'

      if (!confirmPassword) errs.confirmPassword = 'Please confirm your password'
      else if (confirmPassword !== password) errs.confirmPassword = 'Passwords do not match'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
        onClose()
        router.push('/dashboard')
      } else {
        await register(name, email, password)
        toast.success('Account created successfully! You can now sign in.')
        setMode('login')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      if (isAxiosError(err)) {
        const data = err.response?.data
        if (data?.errors?.length) {
          setApiError(data.errors.map((e: { message: string }) => e.message).join(' · '))
        } else {
          setApiError(data?.message ?? `${mode === 'login' ? 'Login' : 'Registration'} failed. Please try again.`)
        }
      } else {
        setApiError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(m => m === 'login' ? 'register' : 'login')
    setErrors({})
    setApiError('')
    setPassword('')
    setConfirmPassword('')
  }

  const showEyeIcon = (visible: boolean) => visible
    ? <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
    : <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>

  const errIcon = <svg className="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>

  const inputCls = (err?: string) =>
    `w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-gray-100 placeholder-gray-600 bg-gray-800/80 border transition-colors outline-none focus:ring-2 ${err ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-700 focus:border-teal-500/60 focus:ring-teal-500/20'}`

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm transition-opacity"
    >
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden shadow-teal-500/10 animate-fade-in-up">

        {/* Glow effect */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 opacity-50" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-white hover:bg-gray-800 transition-colors z-10"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-gray-400 mt-2">
              {mode === 'login'
                ? 'Sign in to continue to MANAGER'
                : 'Start managing your tasks with MANAGER'}
            </p>
          </div>

          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 bg-red-500/20 rounded-md">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 text-red-200 leading-relaxed">
                <strong className="font-semibold text-red-300 block mb-1">Quick heads-up! ✌️</strong>
                <p className="mb-2.5">
                  Since this is hosted on a free tier, the server might be asleep right now. Don't worry if your {mode === 'login' ? 'first login' : 'first signup'} takes up to <span className="font-bold underline decoration-red-500/50 underline-offset-2">30 seconds</span>, Sorry for the wait, it's just waking up!
                </p>
                <div className="pt-3 mt-1 border-t border-red-500/20 text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold opacity-80 space-y-1">
                  <div className="text-red-200/90">(Manish Daemrot 2K22/MC/088)</div>
                </div>
              </div>
            </div>
          </div>

          {apiError && (
            <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/25 rounded-xl text-sm text-red-400">
              <span className="mt-0.5">{errIcon}</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name (Register Only) */}
            {mode === 'register' && (
              <div className="animate-fade-in-up">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input type="text" autoComplete="name" value={name}
                    onChange={e => { setName(e.target.value); clearError('name'); setApiError('') }}
                    placeholder="Manish Daemrot"
                    className={inputCls(errors.name).replace('pr-11', 'pr-4')}
                  />
                </div>
                {errors.name && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">{errIcon}{errors.name}</p>}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></span>
                <input type="email" autoComplete="email" value={email}
                  onChange={e => { setEmail(e.target.value); clearError('email'); setApiError('') }}
                  placeholder="you@example.com"
                  className={inputCls(errors.email).replace('pr-11', 'pr-4')}
                />
              </div>
              {errors.email && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">{errIcon}{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></span>
                <input type={showPw ? 'text' : 'password'} autoComplete={mode === 'login' ? "current-password" : "new-password"} value={password}
                  onChange={e => { setPassword(e.target.value); clearError('password') }}
                  placeholder="••••••••" className={inputCls(errors.password)}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors" tabIndex={-1}>{showEyeIcon(showPw)}</button>
              </div>
              {errors.password
                ? <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">{errIcon}{errors.password}</p>
                : mode === 'register' && <StrengthBar password={password} />
              }
            </div>

            {/* Confirm Password (Register Only) */}
            {mode === 'register' && (
              <div className="animate-fade-in-up">
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"><svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></span>
                  <input type={showConfirm ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); clearError('confirmPassword') }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl text-sm text-gray-100 placeholder-gray-600 bg-gray-800/80 border transition-colors outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500/60 focus:ring-red-500/20' : confirmPassword && confirmPassword === password ? 'border-teal-500/40 focus:ring-teal-500/20' : 'border-gray-700 focus:ring-teal-500/20'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors" tabIndex={-1}>{showEyeIcon(showConfirm)}</button>
                </div>
                {errors.confirmPassword
                  ? <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">{errIcon}{errors.confirmPassword}</p>
                  : confirmPassword && confirmPassword === password &&
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-teal-400"><svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Passwords match</p>
                }
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-teal-500 hover:bg-teal-400 text-gray-950 shadow-lg shadow-teal-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-4"
            >
              {loading
                ? <><svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Please wait…</>
                : mode === 'login' ? 'Sign in' : 'Create account'
              }
            </button>
          </form>

          {/* Footer Toggle */}
          <div className="mt-8 text-center text-sm text-gray-400">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-white font-medium hover:text-teal-400 transition-colors"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
