import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-md p-8 bg-gray-800/60 backdrop-blur rounded-2xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">Welcome back</h1>
        <p className="text-gray-400 text-center mb-8">Login placeholder — logic coming soon</p>

        <div className="space-y-4">
          <div className="h-10 bg-gray-700/50 rounded-lg animate-pulse" />
          <div className="h-10 bg-gray-700/50 rounded-lg animate-pulse" />
          <div className="h-10 bg-blue-600/40 rounded-lg animate-pulse" />
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 transition">
            Register
          </Link>
        </div>

        <div className="mt-4 flex justify-center">
          <Link to="/" className="text-xs text-gray-600 hover:text-gray-400 transition">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
