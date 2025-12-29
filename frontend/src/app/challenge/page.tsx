"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

// --- TYPES ---
interface Challenge {
  title: string;
  description: string;
  template_code: string;
  difficulty: number;
  test_cases: any[]; // Hidden from UI in a real app, but we store here to send back for verification
}

export default function ChallengePage() {
  const [topic, setTopic] = useState("Python Memory Management");
  const [difficulty, setDifficulty] = useState(70);
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  
  // Editor State
  const [userCode, setUserCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 1. GENERATE CHALLENGE
  const handleGenerate = async () => {
    setLoading(true);
    setChallenge(null);
    setResult(null);
    try {
      const res = await fetch('http://localhost:8000/api/challenge/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty })
      });
      const data = await res.json();
      setChallenge(data);
      setUserCode(data.template_code);
    } catch (e) {
      alert("Generator Failed. Backend Offline?");
    } finally {
      setLoading(false);
    }
  };

  // 2. VERIFY SOLUTION
  const handleVerify = async () => {
    if (!challenge) return;
    setVerifying(true);
    try {
      const res = await fetch('http://localhost:8000/api/challenge/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_code: userCode,
          language: "python", // Defaulting to Python for this demo
          test_cases: challenge.test_cases
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Verification Failed.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-red-600 mb-2">CURSED_ARENA</h1>
        <p className="text-xs text-red-800 mb-8">LIVE EXECUTION ENVIRONMENT</p>

        {/* CONTROLS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-gray-900/20 p-6 border border-red-900/30">
          <div>
            <label className="text-xs text-gray-500 block mb-2">TOPIC</label>
            <input 
              value={topic} onChange={e => setTopic(e.target.value)}
              className="w-full bg-black border border-gray-700 p-2 text-white outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-2">DIFFICULTY (0-100)</label>
            <input 
              type="number"
              value={difficulty} onChange={e => setDifficulty(Number(e.target.value))}
              className="w-full bg-black border border-gray-700 p-2 text-white outline-none focus:border-red-500"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-red-900/20 border border-red-600 text-red-500 py-2 font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
            >
              {loading ? 'SPAWNING...' : 'SPAWN CHALLENGE'}
            </button>
          </div>
        </div>

        {/* WORKSPACE */}
        {challenge && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT: INSTRUCTIONS */}
            <div className="border border-gray-800 p-6 bg-gray-900/5">
              <h2 className="text-xl font-bold text-white mb-4">{challenge.title}</h2>
              <div className="prose prose-invert prose-sm mb-6">
                <p>{challenge.description}</p>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Test Cases (Hidden)</h3>
                <div className="flex gap-2">
                  {challenge.test_cases.map((_: any, i: number) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-gray-700" title="Hidden Case" />
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: CODE EDITOR */}
            <div className="flex flex-col gap-4">
              <textarea
                value={userCode}
                onChange={e => setUserCode(e.target.value)}
                className="flex-1 h-96 bg-gray-900 font-mono text-sm p-4 border border-gray-700 outline-none focus:border-red-500 text-gray-300 resize-none"
                spellCheck={false}
              />
              
              <button 
                onClick={handleVerify}
                disabled={verifying}
                className="bg-white text-black font-bold py-3 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {verifying ? 'COMPILING & RUNNING...' : 'EXECUTE SOLUTION'}
              </button>

              {/* CONSOLE OUTPUT */}
              {result && (
                <div className={`p-4 border ${result.status === 'PASS' ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold ${result.status === 'PASS' ? 'text-green-500' : 'text-red-500'}`}>
                      {result.status}
                    </span>
                  </div>
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                    {result.output}
                  </pre>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}