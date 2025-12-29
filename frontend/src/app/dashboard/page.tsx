"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// --- TYPES ---
interface MarketPulse {
  role: string;
  demand_score: number;
  saturation_warning: boolean;
  salary_range_insight: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [pulse, setPulse] = useState<MarketPulse | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch "Sniper" Data on Mount
  useEffect(() => {
    async function loadMarketIntel() {
      try {
        // We default to "Software Engineer" for the dashboard pulse check
        const res = await fetch(`http://localhost:8000/api/career/market-pulse?role=Software%20Engineer`);
        if (res.ok) {
          const data = await res.json();
          setPulse(data);
        }
      } catch (e) {
        console.error("Market Intel Offline");
      } finally {
        setLoading(false);
      }
    }
    loadMarketIntel();
  }, []);

  const ActionCard = ({ title, desc, link, color, delay }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => router.push(link)}
      className={`p-6 border border-${color}-800 bg-${color}-900/10 hover:bg-${color}-900/20 cursor-pointer group transition-all`}
    >
      <h3 className={`text-xl font-bold text-${color}-400 group-hover:text-${color}-300 mb-2`}>
        {title} &rarr;
      </h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-8">
      {/* HEADER */}
      <header className="flex justify-between items-center border-b border-gray-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">MISSION_CONTROL</h1>
          <p className="text-xs text-green-500">SYSTEM STATUS: OPTIMAL</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">AGENT ID</p>
          <p className="text-xl font-bold text-green-400">#DEV-001</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: MARKET INTEL (THE SNIPER) */}
        <div className="col-span-1 border border-gray-800 p-6 bg-gray-900/5">
          <h2 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">
            Live Market Intel
          </h2>
          
          {loading ? (
            <div className="text-xs text-blue-300 animate-pulse">SCANNING JOB BOARDS...</div>
          ) : pulse ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs text-gray-500">ROLE DEMAND (Soft. Eng)</p>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-white">{pulse.demand_score}</span>
                  <span className="text-sm text-gray-400 mb-1">/ 100</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500">SATURATION ALERT</p>
                <p className={`text-lg font-bold ${pulse.saturation_warning ? 'text-red-400' : 'text-green-400'}`}>
                  {pulse.saturation_warning ? 'HIGH COMPETITION' : 'LOW BARRIER'}
                </p>
              </div>

              <div className="p-3 bg-blue-900/10 border border-blue-900/30 text-xs text-blue-300">
                "{pulse.salary_range_insight}"
              </div>
            </div>
          ) : (
            <div className="text-red-500 text-xs">OFFLINE</div>
          )}
        </div>

        {/* RIGHT COL: ACTION DECK */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. INTERVIEW SIMULATOR (Voice) */}
          <ActionCard 
            title="SIMULATION_MODE" 
            desc="Enter the 'Universal Gauntlet'. Voice-enabled technical interview with real-time anxiety analysis."
            link="/interview"
            color="green"
            delay={0.1}
          />

          {/* 2. ROADMAP GENERATOR (Ghost Tech Lead) */}
          <ActionCard 
            title="PI_ROADMAP" 
            desc="Generate a 'Ghost Tech Lead' recovery plan based on your skill gaps."
            link="/roadmap" // We will build this page next
            color="purple"
            delay={0.2}
          />

          {/* 3. RESUME AUDIT (Existing) */}
          <ActionCard 
            title="RESUME_AIRLOCK" 
            desc="OCR-hardened resume parser. Check for ATS failures and keyword stuffing."
            link="/resume"
            color="yellow"
            delay={0.3}
          />

          {/* 4. AUDIT LOGS */}
          <div className="border border-gray-800 bg-black p-6 flex items-center justify-center opacity-50">
            <p className="text-xs text-gray-500 text-center">
              HISTORY LOGS<br/>(COMING SOON)
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}