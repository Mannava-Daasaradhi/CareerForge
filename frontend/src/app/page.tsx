"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auditUser } from "../lib/api";

export default function Home() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLaunch = async () => {
    if (!username) {
      setError("⚠️ Username required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Run the Audit
      const data = await auditUser(username);
      
      // 2. Log result (for now) and Redirect
      console.log("Audit Result:", data);
      
      // Pass the score to the interview page via URL query params (simple way)
      router.push(`/interview?user=${username}&score=${data.trust_score}`);
      
    } catch (err) {
      setError("❌ User not found or API offline");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4 relative overflow-hidden">
      
      {/* Top Status Bar */}
      <div className="absolute top-5 left-5 border border-emerald-500/30 bg-emerald-900/10 px-4 py-2 rounded-full z-20">
        <p className="text-xs font-mono text-emerald-400">
          SYSTEM STATUS: <span className="animate-pulse">ONLINE</span>
        </p>
      </div>

      <div className="text-center z-10 max-w-4xl space-y-8">
        {/* Hero Text */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-500 to-emerald-600">
          CareerForge_
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-light text-gray-300">
          The Trust-Based Career OS
        </h2>
        
        <p className="mx-auto max-w-[600px] text-gray-400 text-lg">
          Stop &quot;Vibecoding&quot;. Start building. <br/>
          Enter your GitHub username to verify your history.
        </p>

        {/* Interactive Input Area */}
        <div className="flex flex-col items-center gap-4 mt-8 w-full max-w-md mx-auto">
          <input
            type="text"
            placeholder="github_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 text-center text-white text-lg rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 transition-all"
          />
          
          {error && <p className="text-red-500 text-sm font-mono">{error}</p>}

          <button 
            onClick={handleLaunch}
            disabled={loading}
            className="w-full px-8 py-4 rounded-lg bg-emerald-600 text-black font-bold text-lg hover:bg-emerald-500 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "AUDITING..." : "INITIALIZE PROTOCOL"}
          </button>
        </div>
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </main>
  );
}