"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { huntJobs, JobHuntReport } from '@/lib/api';

export default function HunterPage() {
  // State
  const [role, setRole] = useState("Software Engineer");
  const [location, setLocation] = useState("Remote");
  const [gaps, setGaps] = useState("Kubernetes, System Design"); // Default/Demo gaps
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<JobHuntReport | null>(null);

  const handleHunt = async () => {
    setLoading(true);
    try {
      // Split comma-separated gaps into an array
      const gapList = gaps.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const data = await huntJobs(role, location, gapList);
      setReport(data);
    } catch (e) {
      alert("Hunter failed. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 flex flex-col items-center">
      <div className="w-full max-w-5xl mt-8">
        <h1 className="text-3xl font-bold text-purple-500 mb-2">OPPORTUNITY_HUNTER</h1>
        <p className="text-xs text-purple-700 mb-8">AGENTIC SEARCH + SKILL GAP FILTERING</p>

        {/* CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-gray-900/10 p-6 border border-gray-800">
          <div>
            <label className="text-xs text-gray-500 block mb-2">TARGET ROLE</label>
            <input 
              value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black border border-gray-700 p-2 text-white focus:border-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-2">LOCATION</label>
            <input 
              value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-black border border-gray-700 p-2 text-white focus:border-purple-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-2">KNOWN SKILL GAPS (CSV)</label>
            <input 
              value={gaps} onChange={(e) => setGaps(e.target.value)}
              placeholder="e.g. Redux, AWS"
              className="w-full bg-black border border-red-900/50 p-2 text-red-300 focus:border-red-500 outline-none"
            />
          </div>
        </div>

        <button 
          onClick={handleHunt}
          disabled={loading}
          className="w-full bg-purple-900/20 border border-purple-600 text-purple-400 py-4 font-bold hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 mb-12"
        >
          {loading ? 'SCANNERS ACTIVE...' : 'INITIATE HUNT'}
        </button>

        {/* RESULTS */}
        {report && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            
            {/* STRATEGY CARD */}
            <div className="mb-8 p-6 border-l-4 border-blue-500 bg-blue-900/10">
              <h3 className="text-sm font-bold text-blue-400 mb-2">AGENT STRATEGY</h3>
              <p className="text-sm text-gray-300 italic">"{report.strategic_advice}"</p>
            </div>

            {/* JOB LIST */}
            <div className="space-y-4">
              {report.opportunities.map((job, idx) => (
                <div key={idx} className="border border-gray-800 p-6 hover:border-gray-600 transition-colors bg-gray-900/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">{job.role_title}</h3>
                      <p className="text-sm text-purple-400 mb-2">{job.company}</p>
                    </div>
                    <div className="text-right">
                       <span className={`text-2xl font-bold ${job.match_score > 75 ? 'text-green-500' : 'text-yellow-500'}`}>
                         {job.match_score}%
                       </span>
                       <p className="text-xs text-gray-500">MATCH</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mt-2 mb-4">{job.why_good_fit}</p>

                  {/* WARNING SECTION (The "Bodyguard" Feature) */}
                  {job.cautionary_warning && (
                    <div className="bg-red-900/10 border border-red-900/30 p-3 mb-4">
                      <p className="text-xs text-red-400 font-bold">⚠️ CAUTION</p>
                      <p className="text-xs text-red-300">{job.cautionary_warning}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-600 truncate max-w-md">{job.apply_link_guess}</p>
                    <a 
                      href={job.apply_link_guess} 
                      target="_blank" 
                      className="px-4 py-2 bg-white text-black text-xs font-bold hover:bg-gray-200"
                    >
                      APPLY NOW
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}