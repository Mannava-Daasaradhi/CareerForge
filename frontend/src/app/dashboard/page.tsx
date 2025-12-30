
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Link from "next/link";

// --- TYPES ---
interface AgentStatus {
  name: string;
  status: "active" | "standby" | "sleeping";
  last_action: string;
  link: string;
  icon: string;
  color: string;
}

interface DailyBriefing {
  greeting: string;
  messages: string[];
  readiness_score: number;
}

export default function DashboardPage() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock Data (In production, fetch from /api/dashboard/status)
  const agents: AgentStatus[] = [
    {
      name: "Job Hunter",
      status: "active",
      last_action: "Found 3 'High Match' roles at Stripe, Vercel...",
      link: "/kanban",
      icon: "🔍",
      color: "border-green-500 text-green-400"
    },
    {
      name: "Network Sniper",
      status: "standby",
      last_action: "2 Drafts waiting for review.",
      link: "/outreach",
      icon: "🎯",
      color: "border-cyan-500 text-cyan-400"
    },
    {
      name: "Resume Auditor",
      status: "sleeping",
      last_action: "Resume optimized for 'Full Stack' yesterday.",
      link: "/resume",
      icon: "🛡️",
      color: "border-purple-500 text-purple-400"
    },
    {
      name: "Interview Coach",
      status: "standby",
      last_action: "Confidence Score: 72% (Needs improvement)",
      link: "/interview",
      icon: "🎙️",
      color: "border-yellow-500 text-yellow-400"
    },
    {
      name: "Salary Negotiator",
      status: "standby",
      last_action: "Battle Arena ready.",
      link: "/negotiator",
      icon: "💰",
      color: "border-red-500 text-red-400"
    },
    {
      name: "Skill Architect",
      status: "active",
      last_action: "New Challenge: 'Distributed Systems' generated.",
      link: "/challenge",
      icon: "⚡",
      color: "border-blue-500 text-blue-400"
    }
  ];

  useEffect(() => {
    // Simulate API Fetch
    setTimeout(() => {
      setBriefing({
        greeting: "Good Morning, Candidate.",
        messages: [
          "While you slept, the Job Hunter identified 3 new opportunities.",
          "Your 'React' skill badge was verified yesterday.",
          "Recommendation: Practice 'System Design' to boost your readiness."
        ],
        readiness_score: 78
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">Initializing Command Center...</div>;

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
        
        {/* HEADER & BRIEFING */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* WELCOME CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full" />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {briefing?.greeting}
            </h1>
            <div className="space-y-3">
              {briefing?.messages.map((msg, i) => (
                <div key={i} className="flex items-start gap-3 text-gray-400">
                  <span className="text-cyan-500 mt-1">●</span>
                  <p>{msg}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex gap-4">
               <Link href="/kanban" className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-colors">
                  View New Jobs
               </Link>
               <Link href="/challenge" className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors border border-gray-700">
                  Daily Challenge
               </Link>
            </div>
          </motion.div>

          {/* READINESS GAUGE */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col items-center justify-center relative"
          >
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Market Readiness</h3>
            
            <div className="relative w-40 h-40 flex items-center justify-center">
               {/* Background Circle */}
               <svg className="w-full h-full transform -rotate-90">
                 <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-gray-800" />
                 <circle 
                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
                    className="text-cyan-500" 
                    strokeDasharray={440}
                    strokeDashoffset={440 - (440 * (briefing?.readiness_score || 0)) / 100}
                 />
               </svg>
               <div className="absolute text-center">
                 <span className="text-4xl font-black text-white">{briefing?.readiness_score}</span>
                 <span className="text-sm text-gray-500 block">/ 100</span>
               </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              You are in the top <span className="text-white font-bold">15%</span> of candidates.
            </div>
          </motion.div>

        </section>

        {/* AGENT GRID */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Active Agents</h2>
            <span className="text-xs text-green-500 bg-green-900/30 px-3 py-1 rounded-full animate-pulse border border-green-500/30">
              ● System Operational
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link href={agent.link}>
                  <div className={`group bg-gray-900 border ${agent.status === 'active' ? agent.color : 'border-gray-800'} rounded-2xl p-6 hover:bg-gray-800 transition-all hover:scale-[1.02] cursor-pointer h-full flex flex-col justify-between`}>
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-3xl">{agent.icon}</span>
                        <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                      </div>
                      <h3 className={`font-bold text-lg mb-1 ${agent.status === 'active' ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {agent.last_action}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                      Open Console &rarr;
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
