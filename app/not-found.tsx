export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-4xl font-bold mb-4 text-cyan-400">404 - Page Not Found</h1>
      <p className="text-xl mb-8">The page you are looking for does not exist.</p>
      <a
        href="/"
        className="px-6 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full text-white font-bold shadow-lg transform transition-transform hover:scale-110"
      >
        Return to Dashboard
      </a>
    </div>
  )
}
