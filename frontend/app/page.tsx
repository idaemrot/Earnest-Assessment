'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import AuthModal from '@/components/AuthModal'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-hidden relative selection:bg-teal-500/30">
      
      {/* ─── Background ambient glows ──────────────────────────────────────── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-teal-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      
      {/* ─── Dot grid overlay ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />

      {/* ─── Navbar ────────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-bold tracking-tight text-white tracking-widest uppercase">MANAGER</span>
        </div>
        
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <button 
                onClick={() => openAuth('login')}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block"
              >
                Sign in
              </button>
              <button 
                onClick={() => openAuth('register')}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-full border border-white/5 transition-all w-full text-center sm:w-auto backdrop-blur-sm"
              >
                Sign up
              </button>
            </>
          )}
        </nav>
      </header>

      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-24 pb-32 sm:pt-32 sm:pb-40 flex flex-col items-center text-center">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          v1.0 is now live
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl animate-fade-in-up animation-delay-150">
          Manage your tasks with <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">effortless precision.</span>
        </h1>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl leading-relaxed animate-fade-in-up animation-delay-300">
          MANAGER brings absolute clarity to your day. A blazing-fast, secure, and beautiful task manager designed for those who value deep focus.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animation-delay-500">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-gray-950 rounded-full font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30 transition-all active:scale-95 w-full sm:w-auto"
            >
              Go to Dashboard
            </Link>
          ) : (
            <button
              onClick={() => openAuth('register')}
              className="px-8 py-3.5 bg-teal-500 hover:bg-teal-400 text-gray-950 rounded-full font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-400/30 transition-all active:scale-95 w-full sm:w-auto"
            >
              Start for free
            </button>
          )}
        </div>

        {/* Abstract UI Preview (Visual anchor) */}
        <div className="mt-20 sm:mt-28 w-full max-w-4xl relative animate-fade-in-up animation-delay-700">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-left">
            
            {/* Fake toolbar */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-800">
              <div className="h-10 w-full max-w-xs bg-gray-950 border border-gray-800 rounded-xl flex items-center px-4 gap-2">
                <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <div className="h-2 w-24 bg-gray-800 rounded"></div>
              </div>
              <div className="hidden sm:flex gap-2">
                <div className="h-10 w-24 bg-gray-950 border border-gray-800 rounded-xl"></div>
                <div className="h-10 w-24 bg-gray-950 border border-gray-800 rounded-xl"></div>
              </div>
              <div className="h-10 w-28 bg-teal-500/20 border border-teal-500/30 rounded-xl ml-auto flex items-center justify-center gap-2">
                <div className="h-3 w-16 bg-teal-500/50 rounded"></div>
              </div>
            </div>

            {/* Fake tasks */}
            <div className="space-y-3">
              {[
                { done: true, w1: 'w-48', w2: 'w-80' },
                { done: false, w1: 'w-64', w2: 'w-40' },
                { done: false, w1: 'w-56', w2: 'w-64' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 bg-gray-950/50 border border-gray-800 rounded-2xl">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${item.done ? 'bg-teal-500 border-teal-500' : 'border-gray-700'}`}>
                    {item.done && <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className={`h-2.5 rounded ${item.w1} ${item.done ? 'bg-gray-800' : 'bg-gray-300'}`}></div>
                    <div className={`h-2 rounded ${item.w2} bg-gray-800`}></div>
                  </div>
                  <div className={`h-6 w-20 rounded-full hidden sm:block ${item.done ? 'bg-teal-500/10 border border-teal-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}></div>
                </div>
              ))}
            </div>

            {/* Gradient mask to fade out bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
          </div>
        </div>
      </main>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        initialMode={authMode} 
      />

      {/* ─── Animations ─ */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animation-delay-150 { animation-delay: 150ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
        .animation-delay-700 { animation-delay: 700ms; }
      `}</style>
    </div>
  )
}
