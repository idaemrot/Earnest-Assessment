import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white px-4">
      <div className="text-center max-w-2xl">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-blue-900/40 border border-blue-700/50 text-blue-300 text-sm font-medium">
          React + Express · TypeScript
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Fullstack App
        </h1>
        <p className="text-xl text-gray-400 mb-12">
          A modern full-stack starter with React (Vite) and Node.js (Express)
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/login"
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 transition-all duration-200 rounded-full font-semibold shadow-lg hover:shadow-blue-500/25"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-gray-800 hover:bg-gray-700 transition-all duration-200 rounded-full font-semibold shadow-lg border border-gray-700"
          >
            Register
          </Link>
          <Link
            to="/dashboard"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 rounded-full font-semibold shadow-lg hover:shadow-indigo-500/25"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
