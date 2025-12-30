// frontend/src/app/outreach/page.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

export default function OutreachPage() {
  // Inputs
  const [username, setUsername] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Hiring Manager');
  const [context, setContext] = useState('');
  
  // State
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!username || !company) return alert("Username and Company are required.");
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/network/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username,
            target_company: company,
            target_role: role,
            job_context: context
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Agent failed to connect. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-purple-500 mb-2">NETWORK_NEXUS</h1>
            <p className="text-xs text-purple-800 tracking-widest">PROOF-BASED OUTREACH GENERATOR</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* LEFT: INPUTS */}
            <div className="space-y-6">
                <div className="bg-gray-900/30 border border-purple-900/30 p-6 rounded-lg">
                    <h3 className="text-sm font-bold text-purple-400 mb-4 uppercase">Target Parameters</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Your GitHub Identity</label>
                            <input 
                                className="w-full bg-black border border-gray-700 p-3 text-white focus:border-purple-500 outline-none rounded"
                                placeholder="e.g. torvalds (Used for Verification)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <p className="text-[10px] text-gray-600 mt-1">
                                * The Agent will fetch your "Skill Passport" to prove you're qualified.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Target Company</label>
                                <input 
                                    className="w-full bg-black border border-gray-700 p-3 text-white focus:border-purple-500 outline-none rounded"
                                    placeholder="e.g. Anthropic"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Recipient Role</label>
                                <input 
                                    className="w-full bg-black border border-gray-700 p-3 text-white focus:border-purple-500 outline-none rounded"
                                    placeholder="e.g. CTO"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-gray-500 uppercase font-bold block mb-1">Context / Job Snippet</label>
                            <textarea 
                                className="w-full bg-black border border-gray-700 p-3 text-white focus:border-purple-500 outline-none rounded h-32 text-sm"
                                placeholder="Paste the job description or a recent news article about them..."
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 font-bold rounded shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all disabled:opacity-50"
                >
                    {loading ? 'ANALYZING SKILL PASSPORT...' : 'GENERATE VERIFIED OUTREACH'}
                </button>
            </div>

            {/* RIGHT: OUTPUT */}
            <div className="relative">
                {/* Placeholder */}
                {!result && !loading && (
                    <div className="h-full border-2 border-dashed border-gray-800 rounded-lg flex flex-col items-center justify-center text-gray-600 p-12 text-center">
                        <span className="text-4xl mb-4">📧</span>
                        <p className="text-sm">Configure parameters to generate a high-conversion cold email.</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="h-full border border-purple-900/30 bg-purple-900/5 rounded-lg flex flex-col items-center justify-center text-purple-400 p-12">
                        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-mono animate-pulse">FETCHING PROOF OF WORK...</p>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        
                        {/* Strategy Card */}
                        <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-l-4 border-purple-500 p-4 rounded-r">
                            <h3 className="text-xs font-bold text-purple-400 mb-1 uppercase">Agent Strategy</h3>
                            <p className="text-sm text-gray-300 italic">"{result.strategy_explanation}"</p>
                        </div>

                        {/* Email Client UI */}
                        <div className="bg-white text-black rounded-lg overflow-hidden shadow-2xl">
                            <div className="bg-gray-100 p-4 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(result.email_body)}
                                    className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                                >
                                    <span>COPY TEXT</span>
                                </button>
                            </div>
                            
                            <div className="p-8">
                                <div className="mb-6 pb-6 border-b border-gray-100">
                                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Subject</p>
                                    <p className="text-lg font-bold text-gray-800">{result.subject_line}</p>
                                </div>
                                
                                <div className="whitespace-pre-wrap leading-relaxed text-gray-700 font-sans">
                                    {result.email_body}
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 p-4 border-t border-gray-200 text-right">
                                <span className="text-[10px] text-gray-400 font-mono">POWERED BY CAREERFORGE AGENT</span>
                            </div>
                        </div>

                    </motion.div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
}