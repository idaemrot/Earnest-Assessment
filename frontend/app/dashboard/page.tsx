import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-900 text-white">
      <header className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-teal-400">Dashboard</h1>
        <Link href="/" className="px-4 py-2 bg-gray-800 rounded shadow hover:bg-gray-700 transition text-sm">
          Logout
        </Link>
      </header>
      <main className="flex-grow p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-4 text-gray-200">Welcome to your dashboard</h2>
          <p className="text-gray-400">Your data will appear here soon.</p>
        </div>
      </main>
    </div>
  );
}
