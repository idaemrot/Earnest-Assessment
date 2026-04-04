import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id:       string
  type:     ToastType
  message:  string
  duration: number   // ms before auto-dismiss
}

type AddToastFn = (message: string, options?: { type?: ToastType; duration?: number }) => void

interface ToastContextValue {
  toasts:  Toast[]
  success: (message: string, duration?: number) => void
  error:   (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info:    (message: string, duration?: number) => void
  dismiss: (id: string) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const add: AddToastFn = useCallback((message, { type = 'info', duration = 4000 } = {}) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
    setToasts(prev => [...prev, { id, type, message, duration }])
  }, [])

  const success = useCallback((m: string, d?: number) => add(m, { type: 'success', duration: d }), [add])
  const error   = useCallback((m: string, d?: number) => add(m, { type: 'error',   duration: d ?? 5000 }), [add])
  const warning = useCallback((m: string, d?: number) => add(m, { type: 'warning', duration: d }), [add])
  const info    = useCallback((m: string, d?: number) => add(m, { type: 'info',    duration: d }), [add])

  return (
    <ToastContext.Provider value={{ toasts, success, error, warning, info, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}

// ─── Individual Toast item ────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  warning: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
    </svg>
  ),
  info: (
    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
}

const STYLES: Record<ToastType, { bar: string; icon: string; border: string; bg: string }> = {
  success: { bar: 'bg-teal-500',   icon: 'text-teal-400',   border: 'border-teal-500/25',  bg: 'bg-gray-900' },
  error:   { bar: 'bg-red-500',    icon: 'text-red-400',    border: 'border-red-500/25',   bg: 'bg-gray-900' },
  warning: { bar: 'bg-amber-400',  icon: 'text-amber-400',  border: 'border-amber-400/25', bg: 'bg-gray-900' },
  info:    { bar: 'bg-blue-500',   icon: 'text-blue-400',   border: 'border-blue-500/25',  bg: 'bg-gray-900' },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)          // controls fade-in
  const [leaving, setLeaving] = useState(false)          // controls fade-out
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const style    = STYLES[toast.type]

  // Animate in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // Auto-dismiss
  useEffect(() => {
    timerRef.current = setTimeout(() => handleDismiss(), toast.duration)
    return () => clearTimeout(timerRef.current)
  }, [toast.duration])

  const handleDismiss = () => {
    setLeaving(true)
    setTimeout(() => onDismiss(toast.id), 300)
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        opacity:    visible && !leaving ? 1 : 0,
        transform:  visible && !leaving ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
      }}
      className={`flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)] ${style.bg} border ${style.border} rounded-2xl shadow-2xl shadow-black/50 overflow-hidden`}
    >
      {/* Coloured left bar */}
      <div className={`w-1 self-stretch flex-shrink-0 ${style.bar} rounded-l-2xl`} />

      {/* Icon */}
      <span className={`${style.icon} flex-shrink-0 mt-3.5`}>{ICONS[toast.type]}</span>

      {/* Message */}
      <p className="flex-1 text-sm text-gray-200 py-3.5 pr-1 leading-snug">{toast.message}</p>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-1 right-0 h-0.5 bg-gray-800 overflow-hidden rounded-b-2xl">
        <div
          className={`h-full ${style.bar} opacity-60`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
          }}
        />
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 mt-3 mr-3 p-1 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-800 transition-colors"
        aria-label="Dismiss notification"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ─── Toaster (portal-style fixed container) ───────────────────────────────────

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <>
      {/* Progress bar keyframe */}
      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>

      {/* Fixed bottom-right stack */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end"
        aria-label="Notifications"
      >
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </>
  )
}
