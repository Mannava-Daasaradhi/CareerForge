"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/api";

// --- TYPES ---
interface WeeklyMilestone {
  week: number;
  goal: string;
  daily_tasks: string[];
  resources: string[];
}

interface RoadmapResponse {
  target_role: string;
  total_weeks: number;
  milestones: WeeklyMilestone[];
  final_outcome: string;
}

export default function RoadmapPage() {
  const [role, setRole] = useState("Full Stack Engineer");
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<WeeklyMilestone | null>(null);
  const [skillGaps, setSkillGaps] = useState<string>("Redis, Docker");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

const generateRoadmap = async () => {
    setLoading(true);
    setRoadmap(null);
    setError(null);
    setSelectedMilestone(null);

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_BASE}/career/roadmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({

          skill_gaps: skillGaps.split(",").map(s => s.trim()).filter(Boolean),
          target_role: role,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: RoadmapResponse = await res.json();
      setRoadmap(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 flex flex-col h-[90vh]">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Skill <span className="text-blue-500">Tree</span></h1>
            <p className="text-gray-400 text-sm">
              An adaptive curriculum that evolves as you learn.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="flex gap-2">
              <input 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none flex-1 md:w-64"
                placeholder="Target Role (e.g. DevOps)"
              />
            </div>
            <input
              value={skillGaps}
              onChange={(e) => setSkillGaps(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none w-full"
              placeholder="Skill gaps (comma-separated, e.g. Redis, Docker)"
            />
            <button 
              onClick={generateRoadmap}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Architecting..." : "Generate Path"}
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden relative">
          
          {/* LEFT: THE TREE VISUALIZATION */}
          <section className="lg:col-span-2 bg-gray-900/30 border border-gray-800 rounded-3xl p-8 relative overflow-y-auto">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {error && (
              <div className="text-red-400 text-sm text-center py-4">{error}</div>
            )}

            {!roadmap ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <div className="w-16 h-16 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <p>Enter your target role to sprout your skill tree.</p>
              </div>
            ) : (
              <div className="relative z-10 space-y-4">
                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">
                  {roadmap.total_weeks} week plan → <span className="text-blue-400">{roadmap.final_outcome}</span>
                </div>
                {roadmap.milestones.map((milestone) => (
                  <motion.div
                    key={milestone.week}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setSelectedMilestone(milestone)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedMilestone?.week === milestone.week
                        ? "border-blue-500 bg-blue-900/20"
                        : "border-gray-800 bg-gray-900/50 hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Week {milestone.week}</span>
                    </div>
                    <p className="text-sm font-bold text-white">{milestone.goal}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* RIGHT: NODE DETAILS SIDEBAR */}
          <AnimatePresence mode="wait">
            {selectedMilestone ? (
              <motion.section
                key={selectedMilestone.week}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col h-full shadow-2xl overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Week {selectedMilestone.week}</span>
                    <h2 className="text-xl font-bold text-white mt-1">{selectedMilestone.goal}</h2>
                  </div>
                  <button onClick={() => setSelectedMilestone(null)} className="text-gray-500 hover:text-white">✕</button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Daily Tasks</h3>
                    <ul className="space-y-2">
                      {selectedMilestone.daily_tasks.map((task, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-blue-400 mt-0.5">→</span> {task}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Resources</h3>
                    <ul className="space-y-2">
                      {selectedMilestone.resources.map((r, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-purple-400 mt-0.5">📚</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.section>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-700 bg-gray-900/20 border border-gray-800 rounded-3xl border-dashed">
                <span className="text-4xl mb-2">👆</span>
                <p>Select a week to view details.</p>
              </div>
            )}
          </AnimatePresence>

        </div>

      </main>
    </div>
  );
}



  