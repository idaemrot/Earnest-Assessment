import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-gray-900 to-black text-white">
      <h1 className="text-5xl font-extrabold tracking-tight mb-8">
        Fullstack Application
      </h1>
      <p className="mt-4 text-xl text-gray-400 mb-12">
        Next.js Frontend + Express Backend
      </p>

      <div className="flex gap-6">
        <Link href="/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-full font-semibold shadow-lg">
          Login
        </Link>
        <Link href="/register" className="px-8 py-3 bg-gray-800 hover:bg-gray-700 transition rounded-full font-semibold shadow-lg border border-gray-700">
          Register
        </Link>
        <Link href="/dashboard" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-full font-semibold shadow-lg">
          Dashboard
        </Link>
      </div>
    </main>
  );
}
