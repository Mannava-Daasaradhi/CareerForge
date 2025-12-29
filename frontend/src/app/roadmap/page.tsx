"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES (Mirroring Backend) ---
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
  const [role, setRole] = useState("Full Stack Engineer");
  const [gaps, setGaps] = useState("React Hooks, SQL Optimization, System Design");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<CareerRoadmap | null>(null);

  const generatePlan = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const res = await fetch('http://localhost:8000/api/career/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_role: role,
          skill_gaps: gaps.split(',').map(s => s.trim())
        })
      });
      
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      setPlan(data);
    } catch (e) {
      alert("Error contacting Ghost Tech Lead. Ensure Backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-8 border-b border-purple-900 pb-4">
        <h1 className="text-3xl font-bold text-purple-400 tracking-tighter">GHOST_TECH_LEAD</h1>
        <p className="text-xs text-purple-600">STRATEGIC SKILL RECOVERY ENGINE</p>
      </div>

      {/* INPUT CONSOLE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="space-y-2">
          <label className="text-xs text-gray-500 uppercase">Target Role</label>
          <input 
            type="text" 
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-purple-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-gray-500 uppercase">Diagnosed Gaps (Comma Sep)</label>
          <input 
            type="text" 
            value={gaps}
            onChange={e => setGaps(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-purple-500 outline-none"
          />
        </div>
        <div className="flex items-end">
          <button 
            onClick={generatePlan}
            disabled={loading}
            className="w-full bg-purple-900/50 border border-purple-500 text-purple-300 p-3 font-bold hover:bg-purple-500 hover:text-black transition-all disabled:opacity-50"
          >
            {loading ? 'COMPUTING_PATH...' : 'GENERATE_PROTOCOL'}
          </button>
        </div>
      </div>

      {/* PLAN RENDERING */}
      <div className="space-y-8">
        {plan && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="border-l-2 border-purple-900 pl-6"
          >
            <div className="mb-6">
              <span className="bg-purple-900 text-purple-200 px-2 py-1 text-xs font-bold rounded">
                LEVEL: {plan.candidate_level.toUpperCase()}
              </span>
              <span className="ml-2 text-gray-500 text-sm">{plan.total_weeks} WEEK SPRINT</span>
            </div>

            {plan.roadmap.map((week, i) => (
              <div key={i} className="mb-12 relative">
                {/* Week Marker */}
                <div className="absolute -left-[33px] top-0 w-4 h-4 bg-purple-600 rounded-full border-4 border-black" />
                
                <h2 className="text-2xl font-bold text-white mb-2">WEEK {week.week_number}: {week.theme}</h2>
                <p className="text-purple-400 text-sm mb-4 border-b border-gray-800 pb-2">OBJECTIVE: {week.goal}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {week.daily_plan.map((task, j) => (
                    <motion.div 
                      key={j}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: j * 0.1 }}
                      className="bg-gray-900/40 border border-gray-800 p-4 hover:border-purple-500/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-300">{task.day_title}</h4>
                        <span className="text-xs text-gray-600">{task.estimated_hours}h</span>
                      </div>
                      <p className="text-xs text-gray-400 mb-4 h-12 overflow-hidden">{task.task_description}</p>
                      <a 
                        href={task.resource_link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300 underline"
                      >
                        ACCESS_RESOURCE &rarr;
                      </a>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}