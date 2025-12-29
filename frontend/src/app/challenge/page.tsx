"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
interface TestCase {
  input_val: string;
  expected_output: string;
}

interface CursedChallenge {
  title: string;
  scenario: string;
  broken_code: string;
  constraint: string;
  test_cases: TestCase[];
  solution_summary: string;
}

interface VerifyResult {
  status: 'PASS' | 'FAIL' | 'ERROR';
  output: string;
}

export default function ChallengePage() {
  const [topic, setTopic] = useState("Python Concurrency");
  const [difficulty, setDifficulty] = useState(70);
  const [challenge, setChallenge] = useState<CursedChallenge | null>(null);
  const [userCode, setUserCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  // 1. GENERATE THE CURSE
  const spawnChallenge = async () => {
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
      setUserCode(data.broken_code); // Pre-fill with the buggy code
    } catch (e) {
      alert("Failed to summon the challenge.");
    } finally {
      setLoading(false);
    }
  };

  // 2. ATTEMPT THE FIX
  const verifySolution = async () => {
    if (!challenge) return;
    setVerifying(true);
    setResult(null);

    try {
      const res = await fetch('http://localhost:8000/api/challenge/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_code: userCode,
          language: "python", // Hardcoded for now, can be dynamic
          test_cases: challenge.test_cases
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Verification system offline.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 md:p-8 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full max-w-5xl mb-8 flex justify-between items-end border-b border-red-900 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-red-500 tracking-tighter">THE_GAUNTLET</h1>
          <p className="text-xs text-red-700">LIVE FIRE EXERCISE // FAILURE IS EXPECTED</p>
        </div>
        <div className="text-right space-y-1">
          <input 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="bg-red-900/10 border border-red-900 text-red-300 text-xs p-1 outline-none text-right"
            placeholder="Topic (e.g. Async)"
          />
        </div>
      </div>

      {!challenge && (
        <div className="text-center mt-20">
          <p className="text-red-800 mb-4">SELECT_PROTOCOL</p>
          <button 
            onClick={spawnChallenge}
            disabled={loading}
            className="bg-red-900/20 border border-red-600 text-red-500 px-8 py-4 font-bold text-xl hover:bg-red-600 hover:text-black transition-all disabled:opacity-50"
          >
            {loading ? 'SUMMONING...' : 'INITIATE_CHALLENGE'}
          </button>
        </div>
      )}

      {/* THE ARENA */}
      {challenge && (
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* LEFT: SCENARIO */}
          <div className="space-y-6">
            <div className="border border-red-900/50 p-6 bg-red-900/5">
              <h2 className="text-xl font-bold text-red-400 mb-2">{challenge.title}</h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">{challenge.scenario}</p>
              
              <div className="p-3 bg-black border border-red-900/30">
                <p className="text-xs text-red-600 uppercase mb-1">Constraint</p>
                <p className="text-sm text-red-300">{challenge.constraint}</p>
              </div>
            </div>

            {/* RESULTS PANEL */}
            <AnimatePresence>
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 border-l-4 ${result.status === 'PASS' ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'}`}
                >
                  <h3 className={`font-bold text-lg mb-2 ${result.status === 'PASS' ? 'text-green-400' : 'text-red-400'}`}>
                    {result.status === 'PASS' ? '>>> SYSTEM PASS' : '>>> CRITICAL FAILURE'}
                  </h3>
                  <pre className="text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
                    {result.output}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: EDITOR */}
          <div className="flex flex-col h-[600px]">
            <div className="bg-gray-900 border-t border-l border-r border-gray-700 p-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">main.py</span>
              <button 
                onClick={verifySolution}
                disabled={verifying}
                className={`text-xs px-3 py-1 font-bold ${verifying ? 'text-gray-500' : 'bg-red-600 text-black hover:bg-white'}`}
              >
                {verifying ? 'RUNNING...' : 'EXECUTE_FIX'}
              </button>
            </div>
            <textarea 
              value={userCode}
              onChange={(e) => setUserCode(e.target.value)}
              className="flex-1 w-full bg-black border border-gray-700 p-4 font-mono text-sm text-gray-300 outline-none resize-none focus:border-red-500 transition-colors"
              spellCheck={false}
            />
          </div>

        </div>
      )}
    </div>
  );
}