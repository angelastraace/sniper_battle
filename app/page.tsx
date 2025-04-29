import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <div className="w-full max-w-2xl mx-auto border border-gray-800 rounded-xl p-12 bg-black">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center mb-6">
            <span className="text-4xl mr-4">🧠</span>
            <h1 className="text-6xl font-mono font-bold tracking-wider text-center">
              Ace Sniper
              <br />
              Battle
              <br />
              Station
            </h1>
          </div>

          <p className="mt-2 mb-8 text-xl text-gray-400">Commander system is now ONLINE. 🚀</p>

          <Link
            href="/battle-dashboard"
            className="bg-white text-black hover:bg-gray-200 transition-colors py-3 px-6 rounded-md font-medium"
          >
            Enter Battle Dashboard
          </Link>
        </div>
      </div>

      {/* Grid background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          pointerEvents: "none",
        }}
      />
    </main>
  )
}
