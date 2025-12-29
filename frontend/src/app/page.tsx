import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      {/* Top Status Bar */}
      <div className="absolute top-5 left-5 border border-emerald-500/30 bg-emerald-900/10 px-4 py-2 rounded-full">
        <p className="text-xs font-mono text-emerald-400">
          SYSTEM STATUS: <span className="animate-pulse">ONLINE</span>
        </p>
      </div>

      {/* Main Hero Section */}
      <div className="text-center z-10 max-w-4xl space-y-6">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-500 to-emerald-600">
          CareerForge_
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-light text-gray-300">
          The Trust-Based Career OS
        </h2>
        
        <p className="mx-auto max-w-[600px] text-gray-400 text-lg leading-relaxed">
          Stop &quot;Vibecoding&quot;. Start building. <br/>
          We verify skills via <span className="text-emerald-400">Adversarial Testing</span>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <button className="px-8 py-4 rounded-lg bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-all hover:scale-105">
            Launch Terminal
          </button>
          <button className="px-8 py-4 rounded-lg border border-gray-700 bg-gray-900/50 hover:bg-gray-800 transition-all">
            Read The Docs
          </button>
        </div>
      </div>

      {/* Background Grid Effect (Optional Visual) */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </main>
  );
}