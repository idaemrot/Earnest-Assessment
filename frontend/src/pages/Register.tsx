import { Link } from 'react-router-dom'

export default function Register() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white px-4">
      <div className="w-full max-w-md p-8 bg-gray-800/60 backdrop-blur rounded-2xl shadow-2xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-2 text-center text-indigo-400">Create Account</h1>
        <p className="text-gray-400 text-center mb-8">Register placeholder — logic coming soon</p>

        <div className="space-y-4">
          <div className="h-10 bg-gray-700/50 rounded-lg animate-pulse" />
          <div className="h-10 bg-gray-700/50 rounded-lg animate-pulse" />
          <div className="h-10 bg-gray-700/50 rounded-lg animate-pulse" />
          <div className="h-10 bg-indigo-600/40 rounded-lg animate-pulse" />
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition">
            Login
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
