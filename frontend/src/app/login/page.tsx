"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
type AuditState = 'IDLE' | 'SCANNING' | 'COMPLETE' | 'ERROR';

interface AuditResult {
  username: string;
  trust_score: number;
  verdict: string;
  account_age_years: number;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<AuditState>('IDLE');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Simulate a terminal-style scan
  const runAudit = async () => {
    if (!username) return;
    setStatus('SCANNING');
    setLogs([]);
    
    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    try {
      addLog(`> CONNECTING TO GITHUB_API [Target: ${username}]...`);
      await new Promise(r => setTimeout(r, 800)); // Fake network delay for effect
      
      // CALL YOUR BACKEND (Adjust URL as needed)
      const res = await fetch(`http://localhost:8000/api/audit/${username}`);
      if (!res.ok) throw new Error("User not found or API error");
      
      const data = await res.json();
      
      addLog(`> ANALYZING COMMIT ENTROPY...`);
      await new Promise(r => setTimeout(r, 600));
      addLog(`> CALCULATING TRUST PROTOCOL...`);
      
      setResult(data);
      setStatus('COMPLETE');
    } catch (err) {
      addLog(`> ERROR: TARGET_NOT_FOUND OR CONNECTION_REFUSED`);
      setStatus('ERROR');
    }
  };

  const handleLogin = () => {
    // In a real app, this would redirect to OAuth or Registration
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center p-4 selection:bg-green-900">
      
      {/* BACKGROUND GRID EFFECT */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,50,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,50,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-2xl border border-green-800 bg-black/90 shadow-[0_0_50px_rgba(0,255,0,0.1)] p-8 rounded-sm backdrop-blur"
      >
        {/* HEADER */}
        <div className="flex justify-between items-end border-b border-green-800 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter">CAREER_FORGE v1.0</h1>
            <p className="text-xs text-green-600">PROFESSIONAL INTELLIGENCE ENGINE</p>
          </div>
          <div className="text-xs text-right space-y-1">
            <p>SYS: <span className="text-green-300">ONLINE</span></p>
            <p>LATENCY: <span className="text-green-300">12ms</span></p>
          </div>
        </div>

        {/* INPUT SECTION */}
        <div className="space-y-4">
          <p className="text-sm text-gray-400 uppercase tracking-widest">
            Identity Verification Required
          </p>
          
          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <span className="absolute left-3 top-3 text-green-700 select-none">gh_user@root:~$</span>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runAudit()}
                className="w-full bg-black border border-green-700 text-green-400 p-3 pl-32 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all placeholder-green-900"
                placeholder="torvalds"
                autoComplete="off"
              />
            </div>
            <button 
              onClick={runAudit}
              disabled={status === 'SCANNING'}
              className="bg-green-900/20 border border-green-700 text-green-400 px-6 py-2 hover:bg-green-500 hover:text-black transition-colors disabled:opacity-50 uppercase text-sm font-bold tracking-wider"
            >
              {status === 'SCANNING' ? 'Running...' : 'Run_Audit'}
            </button>
          </div>
        </div>

        {/* TERMINAL LOGS */}
        <div className="mt-8 min-h-[150px] font-mono text-sm space-y-1 p-4 bg-green-950/10 border-l-2 border-green-800">
          <AnimatePresence>
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-green-300/80"
              >
                {log}
              </motion.div>
            ))}
            {status === 'IDLE' && logs.length === 0 && (
              <span className="text-green-900 italic">Waiting for input...</span>
            )}
          </AnimatePresence>
        </div>

        {/* RESULTS PANEL */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 border-t border-green-800 pt-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-green-800 bg-green-900/5">
                <p className="text-xs text-green-600 uppercase">Trust Score</p>
                <p className="text-4xl font-bold text-green-400">{result.trust_score}/100</p>
              </div>
              <div className="p-4 border border-green-800 bg-green-900/5">
                <p className="text-xs text-green-600 uppercase">Verdict</p>
                <p className={`text-xl font-bold ${result.trust_score > 70 ? 'text-green-400' : 'text-red-400'}`}>
                  {result.verdict}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={handleLogin}
                className="bg-green-500 text-black px-8 py-3 font-bold hover:bg-green-400 transition-all flex items-center gap-2"
              >
                <span>INITIALIZE_AGENT_PROXY</span>
                <span className="text-xl">→</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}