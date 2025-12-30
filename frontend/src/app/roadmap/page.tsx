// frontend/src/app/roadmap/page.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

// Types based on Backend Model
interface DailyTask {
  day_title: string;
  task_description: string;
  resource_link: string;
  estimated_hours: number;
}

interface WeeklyMilestone {
  week_number: number;
  theme: string;
  goal: string;
  daily_plan: DailyTask[];
}

interface CareerRoadmap {
  candidate_level: string;
  total_weeks: number;
  roadmap: WeeklyMilestone[];
}

export default function RoadmapPage() {
  // Input State
  const [role, setRole] = useState("Full Stack Engineer");
  const [gaps, setGaps] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Result State
  const [plan, setPlan] = useState<CareerRoadmap | null>(null);

  const handleGenerate = async () => {
    if (!gaps.trim()) return alert("Please list at least one skill gap.");
    
    setLoading(true);
    try {
      const gapList = gaps.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const res = await fetch("http://localhost:8000/api/career/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            target_role: role,
            skill_gaps: gapList
        })
      });
      const data = await res.json();
      setPlan(data);
    } catch (e) {
      alert("Failed to generate roadmap. Backend may be offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-8">
        
        {/* HEADER */}
        <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-orange-500 mb-2">STRATEGIC_ROADMAP_GENERATOR</h1>
            <p className="text-xs text-orange-800 tracking-widest">GHOST TECH LEAD // SKILL RECOVERY PROTOCOL</p>
        </div>

        {/* INPUT SECTION */}
        <div className="bg-gray-900/30 border border-orange-900/30 p-8 rounded-lg mb-12 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Target Role</label>
                    <input 
                        className="w-full bg-black border border-gray-700 p-3 text-white focus:border-orange-500 outline-none rounded"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    />
                </div>
                <div>
                    <label className="text-[10px] text-gray-500 uppercase font-bold block mb-2">Diagnosed Gaps (CSV)</label>
                    <input 
                        className="w-full bg-black border border-red-900/50 p-3 text-red-200 focus:border-red-500 outline-none rounded placeholder-red-900/50"
                        placeholder="e.g. System Design, Kubernetes, Recursion"
                        value={gaps}
                        onChange={(e) => setGaps(e.target.value)}
                    />
                </div>
            </div>
            
            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white py-4 font-bold rounded shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all disabled:opacity-50"
            >
                {loading ? 'COMPILING LEARNING PROTOCOL...' : 'GENERATE RECOVERY PLAN'}
            </button>
        </div>

        {/* ROADMAP DISPLAY */}
        {plan && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 relative">
                
                {/* Timeline Line (Visual Only) */}
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-800 hidden md:block"></div>

                {/* Meta Info */}
                <div className="text-center mb-8 relative z-10">
                    <span className="bg-black border border-orange-500 text-orange-500 px-4 py-1 rounded-full text-xs font-bold uppercase">
                        Protocol Length: {plan.total_weeks} Weeks
                    </span>
                    <span className="ml-4 bg-black border border-gray-700 text-gray-400 px-4 py-1 rounded-full text-xs font-bold uppercase">
                        Level: {plan.candidate_level}
                    </span>
                </div>

                {/* Weekly Milestones */}
                {plan.roadmap.map((week, idx) => (
                    <div key={idx} className={`relative flex flex-col md:flex-row gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                        
                        {/* Empty Space for alignment */}
                        <div className="flex-1 hidden md:block"></div>

                        {/* Center Node */}
                        <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black border-4 border-orange-600 z-10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">{week.week_number}</span>
                        </div>

                        {/* Content Card */}
                        <div className="flex-1 pl-12 md:pl-0">
                            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg hover:border-orange-500/50 transition-colors group">
                                <h3 className="text-xl font-bold text-white mb-1">WEEK {week.week_number}: {week.theme.toUpperCase()}</h3>
                                <p className="text-xs text-orange-400 font-bold mb-4 uppercase tracking-widest">GOAL: {week.goal}</p>

                                <div className="space-y-3">
                                    {week.daily_plan.map((day, dIdx) => (
                                        <div key={dIdx} className="bg-black/50 p-3 rounded border border-gray-800 flex gap-4 items-start">
                                            <div className="min-w-[40px] text-center">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">Day</p>
                                                <p className="text-lg font-bold text-white">{dIdx + 1}</p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-200">{day.day_title}</p>
                                                <p className="text-xs text-gray-400 mb-2">{day.task_description}</p>
                                                <div className="flex justify-between items-center">
                                                    <a href={day.resource_link} target="_blank" className="text-[10px] text-blue-400 hover:text-white underline">
                                                        VIEW RESOURCE &rarr;
                                                    </a>
                                                    <span className="text-[10px] text-gray-600">{day.estimated_hours}h Est.</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                ))}

            </motion.div>
        )}

      </div>
    </div>
  );
}