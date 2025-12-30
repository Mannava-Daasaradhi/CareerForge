"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

// --- TYPES ---
interface JobOpportunity {
  id: string;
  role_title: string;
  company: string;
  location: string;
  match_score: number;
  salary_range: string;
  why_good_fit: string;
  cautionary_warning: string | null;
  link: string;
}

export default function HunterPage() {
  // Search State
  const [criteria, setCriteria] = useState({
    role: "Full Stack Engineer",
    location: "Remote",
    gaps: "" // CSV string for simplicity in UI
  });
  
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  // --- ACTIONS ---

  const huntJobs = async () => {
    setLoading(true);
    setJobs([]); // Clear previous

    try {
      // Convert comma-separated gaps string to array
      const gapList = criteria.gaps.split(",").map(s => s.trim()).filter(Boolean);

      const res = await fetch("http://localhost:8000/api/career/hunt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target_role: criteria.role,
          location: criteria.location,
          current_skill_gaps: gapList
        })
      });

      const data = await res.json();
      
      // Backend returns { opportunities: [...] }
      // We map it to ensure IDs exist (mocking ID if missing from scraper)
      const mappedJobs = (data.opportunities || []).map((job: any, index: number) => ({
        ...job,
        id: job.id || `job-${index}-${Date.now()}`
      }));
      
      setJobs(mappedJobs);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const trackJob = async (job: JobOpportunity) => {
    // Optimistic UI update
    const newSet = new Set(trackedIds);
    newSet.add(job.id);
    setTrackedIds(newSet);

    try {
        await fetch("http://localhost:8000/api/kanban/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                role_title: job.role_title,
                company_name: job.company,
                status: "Wishlist",
                salary_range: job.salary_range || "Unknown",
                notes: `Match Score: ${job.match_score}%\n\nWhy: ${job.why_good_fit}\n\nWarning: ${job.cautionary_warning || "None"}`
            })
        });
    } catch (e) {
        console.error("Failed to track job", e);
        // Revert optimistic update? For now, we assume success or user retries.
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* HEADER & CONTROLS */}
        <section className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-cyan-500" />
            
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Job <span className="text-green-400">Hunter</span></h1>
                    <p className="text-gray-400 text-sm max-w-xl">
                        This isn't a standard search. Our agent analyzes job descriptions against your profile,
                        filters out low-relevance roles, and highlights "Best Fit" opportunities.
                    </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="flex-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Target Role</label>
                        <input 
                            value={criteria.role}
                            onChange={e => setCriteria({...criteria, role: e.target.value})}
                            className="bg-black border border-gray-700 rounded-lg p-3 text-sm text-white w-full focus:border-green-500 outline-none"
                            placeholder="e.g. Backend Engineer"
                        />
                    </div>
                    <div className="w-full sm:w-32">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Location</label>
                        <input 
                            value={criteria.location}
                            onChange={e => setCriteria({...criteria, location: e.target.value})}
                            className="bg-black border border-gray-700 rounded-lg p-3 text-sm text-white w-full focus:border-green-500 outline-none"
                            placeholder="Remote"
                        />
                    </div>
                    <button 
                        onClick={huntJobs}
                        disabled={loading}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold px-8 py-3 rounded-lg transition-all shadow-lg shadow-green-900/20 flex items-center justify-center self-end"
                    >
                        {loading ? "Scouting..." : "Hunt"}
                    </button>
                </div>
            </div>
            
            {/* ADVANCED FILTER (Visual Only for Demo) */}
            <div className="mt-6 pt-6 border-t border-gray-800 flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-2">
                    <input type="checkbox" checked readOnly className="accent-green-500" /> 
                    Ignore "Ghost" Jobs (Active > 30 days)
                </span>
                <span className="flex items-center gap-2">
                    <input type="checkbox" checked readOnly className="accent-green-500" /> 
                    Highlight Salary Transparency
                </span>
            </div>
        </section>

        {/* RESULTS GRID */}
        <section className="min-h-[500px]">
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-gray-900/50 rounded-2xl h-64 animate-pulse" />
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-gray-600 border-2 border-dashed border-gray-800 rounded-3xl">
                    <span className="text-4xl mb-4">🦅</span>
                    <p>Ready to hunt. Configure criteria and press start.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {jobs.map((job) => (
                            <motion.div
                                key={job.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`
                                    bg-gray-900 border rounded-2xl p-6 relative group overflow-hidden flex flex-col justify-between
                                    ${job.match_score >= 80 ? "border-green-500/30" : "border-gray-800"}
                                `}
                            >
                                {/* MATCH BADGE */}
                                <div className="absolute top-4 right-4 flex flex-col items-end">
                                    <div className={`text-xl font-black ${job.match_score >= 80 ? "text-green-400" : "text-yellow-500"}`}>
                                        {job.match_score}%
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase">Fit Score</div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-lg text-white pr-12 leading-tight mb-1">{job.role_title}</h3>
                                    <p className="text-sm text-gray-400 mb-4">{job.company} • {job.location}</p>

                                    {/* AI INSIGHTS */}
                                    <div className="space-y-3 mb-6">
                                        <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                                            <span className="text-[10px] font-bold text-green-400 uppercase block mb-1">Why it fits</span>
                                            <p className="text-xs text-gray-300 leading-relaxed">{job.why_good_fit}</p>
                                        </div>
                                        
                                        {job.cautionary_warning && (
                                            <div className="bg-red-900/10 p-3 rounded-lg border border-red-500/20">
                                                <span className="text-[10px] font-bold text-red-400 uppercase block mb-1">Gap Detected</span>
                                                <p className="text-xs text-gray-300 leading-relaxed">{job.cautionary_warning}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ACTION FOOTER */}
                                <div className="flex items-center gap-3 mt-auto">
                                    <button 
                                        onClick={() => trackJob(job)}
                                        disabled={trackedIds.has(job.id)}
                                        className={`
                                            flex-1 py-3 rounded-lg font-bold text-sm transition-all
                                            ${trackedIds.has(job.id) 
                                                ? "bg-gray-800 text-gray-500 cursor-default" 
                                                : "bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20"}
                                        `}
                                    >
                                        {trackedIds.has(job.id) ? "✓ Tracked" : "+ Add to Board"}
                                    </button>
                                    <a 
                                        href={job.link || "#"} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                                    >
                                        ↗
                                    </a>
                                </div>

                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </section>

      </main>
    </div>
  );
}