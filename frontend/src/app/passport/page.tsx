"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getPassport, SkillPassport } from '@/lib/api';

export default function PassportPage() {
  const [username, setUsername] = useState("");
  const [passport, setPassport] = useState<SkillPassport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const data = await getPassport(username);
      setPassport(data);
    } catch (e) {
      alert("Passport not found or User invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 flex flex-col items-center">
      <div className="w-full max-w-3xl mt-12">
        <h1 className="text-3xl font-bold text-blue-500 mb-2">SKILL_PASSPORT</h1>
        <p className="text-xs text-blue-700 mb-8">VERIFIABLE ON-CHAIN RECORD</p>

        {/* SEARCH */}
        <div className="flex gap-4 mb-12">
          <input 
            placeholder="Enter GitHub Username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 p-4 text-white focus:border-blue-500 outline-none"
          />
          <button 
            onClick={handleFetch}
            disabled={loading}
            className="px-8 bg-blue-900/20 border border-blue-600 text-blue-400 font-bold hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? 'VERIFYING...' : 'FETCH RECORD'}
          </button>
        </div>

        {/* CERTIFICATE */}
        {passport && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative border-2 border-gray-700 bg-gray-900/10 p-8 md:p-12 shadow-2xl"
          >
            {/* WATERMARK */}
            <div className="absolute top-4 right-4 text-6xl opacity-10 grayscale">🛡️</div>

            {/* HEADER */}
            <div className="border-b border-gray-700 pb-6 mb-6 flex justify-between items-end">
              <div>
                 <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">CANDIDATE IDENTITY</p>
                 <h2 className="text-4xl font-bold text-white">{passport.candidate_id}</h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">GENERATED AT</p>
                <p className="text-xs text-gray-300">{new Date(passport.generated_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* SCORES */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 bg-black border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">GITHUB TRUST SCORE</p>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-green-500">{passport.github_trust_score}</span>
                   <span className="text-xs text-gray-600 mb-1">/ 100</span>
                </div>
              </div>
              <div className="p-4 bg-black border border-gray-800">
                <p className="text-xs text-gray-500 mb-1">INTERVIEW READINESS</p>
                <div className="flex items-end gap-2">
                   <span className="text-3xl font-bold text-blue-500">{passport.interview_readiness_score}</span>
                   <span className="text-xs text-gray-600 mb-1">/ 100</span>
                </div>
              </div>
            </div>

            {/* VERIFIED SKILLS */}
            <div className="mb-8">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">VERIFIED CAPABILITIES</p>
              <div className="flex flex-wrap gap-2">
                {passport.verified_skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-900/20 text-blue-300 text-sm border border-blue-900/50 rounded-full">
                    ✓ {skill}
                  </span>
                ))}
                {passport.verified_skills.length === 0 && <span className="text-gray-600 text-sm">No verified skills yet.</span>}
              </div>
            </div>

            {/* RECENT ACHIEVEMENTS (TABLE) */}
            <div className="mb-8">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">PROOF OF WORK</p>
              <div className="border border-gray-800 bg-black/50 text-sm">
                {passport.recent_achievements.map((ach, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 p-3 border-b border-gray-800 last:border-0 hover:bg-gray-900">
                    <div className="col-span-4 text-white font-bold">{ach.challenge_title}</div>
                    <div className="col-span-2 text-green-500 text-xs mt-1">{ach.status}</div>
                    <div className="col-span-6 text-right text-xs text-gray-600 font-mono truncate">
                       HASH: {ach.verification_hash}
                    </div>
                  </div>
                ))}
                 {passport.recent_achievements.length === 0 && (
                   <div className="p-4 text-center text-gray-600 italic">No recent challenges completed.</div>
                 )}
              </div>
            </div>

            {/* FOOTER / SIGNATURE */}
            <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="text-xs text-gray-600 font-mono break-all max-w-md">
                 DIGITAL_SIGNATURE: {passport.passport_signature}
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-xs text-green-500 font-bold">CRYPTOGRAPHICALLY VALID</span>
               </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}