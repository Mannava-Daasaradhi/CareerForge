// frontend/src/app/hunter/page.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { huntJobs, getMarketDemand, JobHuntReport } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function HunterPage() {
  // Tabs
  const [activeTab, setActiveTab] = useState<'hunt' | 'market'>('hunt');

  // Shared State
  const [role, setRole] = useState("Full Stack Engineer");
  const [location, setLocation] = useState("Remote");
  const [loading, setLoading] = useState(false);

  // Hunter State
  const [gaps, setGaps] = useState(""); 
  const [huntReport, setHuntReport] = useState<JobHuntReport | null>(null);

  // Market State
  const [marketData, setMarketData] = useState<any>(null);

  // --- ACTIONS ---

  const handleHunt = async () => {
    setLoading(true);
    try {
      const gapList = gaps.split(',').map(s => s.trim()).filter(s => s.length > 0);
      const data = await huntJobs(role, location, gapList);
      setHuntReport(data);
    } catch (e) {
      alert("Hunter failed. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarketCheck = async () => {
    setLoading(true);
    try {
      const data = await getMarketDemand(role, location);
      setMarketData(data);
    } catch (e) {
      alert("Market analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-8">
        
        {/* HEADER */}
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-purple-500 mb-2 tracking-tighter">CAREER_RADAR_SYSTEM</h1>
            <p className="text-xs text-purple-800 tracking-widest">DETECTING OPPORTUNITIES & MARKET SIGNALS</p>
        </div>

        {/* TABS */}
        <div className="flex justify-center mb-12 border-b border-gray-800">
            <button 
                onClick={() => setActiveTab('hunt')}
                className={`px-8 py-4 text-sm font-bold transition-all ${activeTab === 'hunt' ? 'text-purple-400 border-b-2 border-purple-500 bg-purple-900/10' : 'text-gray-600 hover:text-white'}`}
            >
                01_JOB_HUNTER
            </button>
            <button 
                onClick={() => setActiveTab('market')}
                className={`px-8 py-4 text-sm font-bold transition-all ${activeTab === 'market' ? 'text-green-400 border-b-2 border-green-500 bg-green-900/10' : 'text-gray-600 hover:text-white'}`}
            >
                02_MARKET_PULSE
            </button>
        </div>

        {/* --- TAB 1: JOB HUNTER --- */}
        {activeTab === 'hunt' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* CONTROLS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-900/30 p-6 border border-gray-800 rounded-lg">
                    <div>
                        <label className="text-[10px] text-gray-500 block mb-2 font-bold">TARGET ROLE</label>
                        <input 
                            value={role} onChange={(e) => setRole(e.target.value)}
                            className="w-full bg-black border border-gray-700 p-3 text-white focus:border-purple-500 outline-none rounded"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 block mb-2 font-bold">LOCATION</label>
                        <input 
                            value={location} onChange={(e) => setLocation(e.target.value)}
                            className="w-full bg-black border border-gray-700 p-3 text-white focus:border-purple-500 outline-none rounded"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 block mb-2 font-bold">KNOWN SKILL GAPS (CSV)</label>
                        <input 
                            value={gaps} onChange={(e) => setGaps(e.target.value)}
                            placeholder="e.g. Redux, AWS"
                            className="w-full bg-black border border-red-900/30 p-3 text-red-200 focus:border-red-500 outline-none rounded placeholder-gray-800"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleHunt}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 font-bold tracking-widest rounded shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'SCANNING NETWORKS...' : 'INITIATE AGENTIC SEARCH'}
                </button>

                {/* RESULTS */}
                {huntReport && (
                    <div className="space-y-6">
                        {/* STRATEGY */}
                        <div className="bg-purple-900/10 border-l-4 border-purple-500 p-6 rounded-r">
                            <h3 className="text-xs font-bold text-purple-400 mb-2">TACTICAL BRIEF</h3>
                            <p className="text-sm text-gray-300 italic">"{huntReport.strategic_advice}"</p>
                        </div>

                        {/* LIST */}
                        <div className="grid gap-4">
                            {huntReport.opportunities.map((job, idx) => (
                                <div key={idx} className="bg-gray-900/40 border border-gray-800 p-6 rounded hover:border-purple-500/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{job.role_title}</h3>
                                            <p className="text-sm text-gray-500">{job.company}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">{job.match_score}<span className="text-sm text-gray-600">%</span></div>
                                            <div className="text-[10px] text-gray-600 uppercase">Fit Score</div>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-400 mb-4 leading-relaxed">{job.why_good_fit}</p>
                                    
                                    {job.cautionary_warning && (
                                        <div className="mb-4 bg-red-900/10 border border-red-900/30 p-3 rounded flex gap-3 items-center">
                                            <span className="text-xl">🛡️</span>
                                            <p className="text-xs text-red-300">{job.cautionary_warning}</p>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-800">
                                        <span className="text-xs text-gray-600 font-mono truncate max-w-xs">{job.apply_link_guess}</span>
                                        <a href={job.apply_link_guess} target="_blank" className="px-6 py-2 bg-white text-black text-xs font-bold rounded hover:bg-gray-200">
                                            APPLY
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        )}

        {/* --- TAB 2: MARKET PULSE (NEW) --- */}
        {activeTab === 'market' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 
                 <div className="flex gap-4">
                    <input 
                        value={role} onChange={(e) => setRole(e.target.value)}
                        className="flex-1 bg-black border border-gray-700 p-4 text-white focus:border-green-500 outline-none rounded"
                        placeholder="Role to Analyze..."
                    />
                     <input 
                        value={location} onChange={(e) => setLocation(e.target.value)}
                        className="w-1/3 bg-black border border-gray-700 p-4 text-white focus:border-green-500 outline-none rounded"
                        placeholder="Market Region..."
                    />
                    <button 
                        onClick={handleMarketCheck}
                        disabled={loading}
                        className="px-8 bg-green-900/20 border border-green-600 text-green-400 font-bold hover:bg-green-500 hover:text-white transition-all rounded disabled:opacity-50"
                    >
                        {loading ? 'ANALYZING...' : 'GET DATA'}
                    </button>
                 </div>

                 {marketData && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* 1. SALARY & DEMAND CARD */}
                        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl text-green-500 font-bold">$</div>
                            <h3 className="text-lg font-bold text-white mb-6">COMPENSATION & DEMAND</h3>
                            
                            <div className="space-y-6 relative z-10">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 uppercase">Estimated Salary Range</p>
                                    <p className="text-3xl font-bold text-green-400">{marketData.salary_range}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 uppercase">Market Temperature</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${marketData.demand_score > 70 ? 'bg-red-500' : 'bg-green-500'}`} 
                                                style={{ width: `${marketData.demand_score}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold text-white">{marketData.demand_level}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. SKILL CLOUD */}
                        <div className="bg-gray-900/50 border border-gray-800 p-8 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-6">HOT SKILLS</h3>
                            <div className="flex flex-wrap gap-2">
                                {marketData.top_skills.map((skill: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-black border border-gray-700 text-gray-300 text-sm rounded hover:border-green-500 hover:text-green-500 cursor-default transition-colors">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 3. AI STRATEGY */}
                        <div className="col-span-1 md:col-span-2 bg-black border border-green-900/30 p-8 rounded-lg">
                            <h3 className="text-sm font-bold text-green-500 mb-2 uppercase">Market Entry Strategy</h3>
                            <p className="text-gray-300 leading-relaxed">
                                {marketData.market_outlook}
                            </p>
                        </div>

                     </div>
                 )}

            </motion.div>
        )}

      </div>
    </div>
  );
}