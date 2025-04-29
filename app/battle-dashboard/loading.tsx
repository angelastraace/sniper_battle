export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="text-4xl text-cyan-400 font-mono mb-4">ACE SNIPER</div>
      <div className="text-xl text-white mb-8">Loading Battle Station...</div>

      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse"></div>
      </div>
    </div>
  )
}
