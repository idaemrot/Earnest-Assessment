import { Link } from 'react-router-dom'

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <h1 className="text-xl font-bold text-teal-400 tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Welcome, User</span>
          <Link
            to="/"
            className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 transition rounded-full text-sm font-medium border border-gray-700"
          >
            Logout
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow p-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold mb-2 text-gray-100">Overview</h2>
          <p className="text-gray-500 mb-8">Dashboard placeholder — data will appear once backend is connected.</p>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {['Total Users', 'Active Sessions', 'Reports'].map((label, i) => (
              <div key={i} className="p-6 bg-gray-800/60 rounded-2xl border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">{label}</p>
                <div className="h-8 w-24 bg-gray-700/60 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Table placeholder */}
          <div className="bg-gray-800/60 rounded-2xl border border-gray-700 p-6">
            <p className="text-sm text-gray-400 mb-4 font-medium uppercase tracking-wider">Recent Activity</p>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-700/50 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
