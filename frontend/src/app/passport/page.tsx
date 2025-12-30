"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";

// --- TYPES ---
interface Badge {
  id: string;
  skill: string;
  level: "Basic" | "Intermediate" | "Expert";
  minted_at: string;
  method: "GitHub Audit" | "Live Challenge" | "Interview Sim";
  hash: string; // Simulated crypto hash
}

interface PassportData {
  username: string;
  trust_score: number;
  rank: string; // "Top 5%", "Top 10%"
  badges: Badge[];
  audit_log: { metric: string; score: string; impact: "positive" | "negative" | "neutral" }[];
}

export default function PassportPage() {
  const [data, setData] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock Data Fetch
    setTimeout(() => {
      setData({
        username: "dev_candidate",
        trust_score: 82,
        rank: "Top 8%",
        badges: [
          { id: "b1", skill: "React Hooks", level: "Expert", minted_at: "2023-10-15", method: "Live Challenge", hash: "0x7a...9f" },
          { id: "b2", skill: "System Design", level: "Intermediate", minted_at: "2023-11-02", method: "Interview Sim", hash: "0x3c...2a" },
          { id: "b3", skill: "Python Scripting", level: "Expert", minted_at: "2023-09-20", method: "GitHub Audit", hash: "0x1d...4b" }
        ],
        audit_log: [
          { metric: "Code Consistency", score: "A", impact: "positive" },
          { metric: "Communication Confidence", score: "C+", impact: "negative" },
          { metric: "Problem Solving Speed", score: "B+", impact: "positive" }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">Loading Cryptographic Ledger...</div>;

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 space-y-12">
        
        {/* HEADER: IDENTITY CARD */}
        <section className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-3xl blur-xl" />
            <div className="relative bg-gray-900/80 backdrop-blur border border-gray-700 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
                
                {/* User Info */}
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-bold text-black border-4 border-gray-800 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                        {data?.username[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">@{data?.username}</h1>
                        <div className="flex gap-2 text-sm">
                            <span className="bg-green-900/50 text-green-400 border border-green-500/30 px-3 py-0.5 rounded-full font-bold">
                                Verified Human
                            </span>
                            <span className="bg-gray-800 text-gray-400 px-3 py-0.5 rounded-full border border-gray-700">
                                ID: {data?.trust_score}8492...
                            </span>
                        </div>
                    </div>
                </div>

                {/* Trust Score Big Display */}
                <div className="text-center md:text-right">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">CareerForge Trust Score</div>
                    <div className="text-6xl font-black text-white tracking-tighter flex items-center justify-center md:justify-end gap-2">
                        {data?.trust_score}
                        <span className="text-2xl text-gray-600 font-bold">/100</span>
                    </div>
                    <div className="text-cyan-400 font-bold text-sm mt-2">
                        {data?.rank} of Global Candidates
                    </div>
                </div>

            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT: MINTED BADGES */}
            <section className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-end">
                    <h2 className="text-2xl font-bold text-white">Verified Assets <span className="text-gray-500 text-lg">({data?.badges.length})</span></h2>
                    <Link href="/challenge" className="text-sm text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                        + Mint New Badge
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data?.badges.map((badge, i) => (
                        <motion.div
                            key={badge.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-cyan-500/50 transition-all"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                            </div>
                            
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`text-xs font-bold px-2 py-1 rounded uppercase ${badge.level === 'Expert' ? 'bg-purple-900/50 text-purple-400 border border-purple-500/30' : 'bg-blue-900/50 text-blue-400 border border-blue-500/30'}`}>
                                        {badge.level}
                                    </div>
                                    <div className="text-[10px] font-mono text-gray-500">{badge.minted_at}</div>
                                </div>
                                
                                <h3 className="text-xl font-bold text-white mb-1">{badge.skill}</h3>
                                <p className="text-xs text-gray-400 mb-4">via {badge.method}</p>
                                
                                <div className="bg-black/50 rounded p-2 border border-gray-800 font-mono text-[10px] text-gray-500 truncate flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    HASH: {badge.hash}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* RIGHT: AUDIT LOG */}
            <section className="lg:col-span-1 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 h-fit">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Score Breakdown</h3>
                
                <div className="space-y-4">
                    {data?.audit_log.map((log, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-900 rounded-xl border border-gray-800">
                            <div>
                                <p className="text-sm font-bold text-gray-200">{log.metric}</p>
                                <p className={`text-xs ${log.impact === 'positive' ? 'text-green-400' : log.impact === 'negative' ? 'text-red-400' : 'text-gray-500'}`}>
                                    {log.impact === 'positive' ? 'High Impact' : log.impact === 'negative' ? 'Needs Work' : 'Neutral'}
                                </p>
                            </div>
                            <div className={`text-xl font-black ${log.impact === 'positive' ? 'text-green-400' : log.impact === 'negative' ? 'text-red-400' : 'text-gray-400'}`}>
                                {log.score}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800">
                    <p className="text-xs text-gray-500 mb-4 text-center">
                        Want to improve your score?
                    </p>
                    <Link 
                        href="/interview"
                        className="block w-full bg-gray-800 hover:bg-gray-700 text-white text-center font-bold py-3 rounded-xl transition-colors mb-2"
                    >
                        Practice Interview
                    </Link>
                    <Link 
                        href="/challenge"
                        className="block w-full border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/10 text-center font-bold py-3 rounded-xl transition-colors"
                    >
                        Take Challenge
                    </Link>
                </div>
            </section>

        </div>
      </main>
    </div>
  );
}