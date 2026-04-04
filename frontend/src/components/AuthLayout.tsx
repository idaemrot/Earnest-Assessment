import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  title: string
  subtitle: string
  footerText: string
  footerLinkLabel: string
  footerLinkTo: string
  children: ReactNode
}

export default function AuthLayout({
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerLinkTo,
  children,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-950 px-4 overflow-hidden">

      {/* Background glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-teal-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-3xl" />
      </div>

      {/* Grid dot texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle, #374151 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="h-9 w-9 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-teal-500/40 group-hover:shadow-teal-500/60 transition-shadow">
              T
            </span>
            <span className="text-xl font-bold text-white tracking-tight">
              Task<span className="text-teal-400">Flow</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl shadow-black/40 p-8">

          {/* Heading */}
          <div className="mb-7 text-center">
            <h1 className="text-2xl font-bold text-gray-100 tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-gray-500">{subtitle}</p>
          </div>

          {children}

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            {footerText}{' '}
            <Link
              to={footerLinkTo}
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              {footerLinkLabel}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
