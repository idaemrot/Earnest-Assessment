import { Link } from 'react-router-dom'

interface NavbarProps {
  username?: string
  onLogout?: () => void
}

export default function Navbar({ username = 'User', onLogout }: NavbarProps) {

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <span className="text-white font-bold tracking-widest uppercase text-base">
            MANAGER
          </span>
        </Link>



        {/* User + Logout */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow">
              {username.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm text-gray-400 max-w-[120px] truncate">
              {username}
            </span>
          </div>

          <div className="h-4 w-px bg-gray-700" />

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
