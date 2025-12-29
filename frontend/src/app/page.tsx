import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
          CareerForge_
        </h1>
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          System Status: <span className="text-emerald-400 ml-2">ONLINE</span>
        </p>
      </div>

      <div className="relative flex place-items-center mt-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">The Trust-Based Career OS</h2>
          <p className="max-w-[600px] text-gray-400">
            Verify your skills. Bypass the resume filters. Prove you can actually build.
          </p>
          
          <div className="mt-8 flex gap-4 justify-center">
            <button className="px-6 py-3 rounded-md bg-white text-black font-bold hover:bg-gray-200 transition">
              Launch Terminal
            </button>
            <button className="px-6 py-3 rounded-md border border-gray-700 hover:bg-gray-900 transition">
              Documentation
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}