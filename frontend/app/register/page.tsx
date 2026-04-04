import Link from 'next/link';

export default function Register() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-xl border border-gray-700">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-400">Register</h1>
        <p className="text-gray-400 text-center mb-8">Placeholder for registration form</p>
        
        <div className="flex justify-center">
          <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
