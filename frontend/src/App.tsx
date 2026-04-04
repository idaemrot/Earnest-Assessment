import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider, Toaster } from './context/ToastContext'
import type { ReactNode } from 'react'
import Home      from './pages/Home'
import Dashboard from './pages/Dashboard'

// ─── Route guards ─────────────────────────────────────────────────────────────


/** Redirect unauthenticated users to login */
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <AppSpinner />
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />
}

/** Full-screen loading spinner shown during auth bootstrap */
function AppSpinner() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
          <span className="text-white font-bold tracking-widest uppercase">MANAGER</span>
        <svg className="h-5 w-5 text-teal-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />



      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
        <Toaster />
      </ToastProvider>
    </BrowserRouter>
  )
}
