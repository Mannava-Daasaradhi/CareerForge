// frontend/src/app/challenge/page.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Confetti from 'react-confetti'; // Optional, but we'll simulate the effect with Framer if package missing

// Types matching Backend
interface TestCase {
  input_val: string;
  expected_output: string;
}

interface Challenge {
  title: string;
  description: string;
  difficulty: number;
  function_signature: string; // e.g. "def solve(n):"
  test_cases: TestCase[];
}

export default function ChallengePage() {
  // Config State
  const [topic, setTopic] = useState("Python Algorithms");
  const [difficulty, setDifficulty] = useState(5); // 1-10
  const [loading, setLoading] = useState(false);

  // Arena State
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'PASS' | 'FAIL' | 'ERROR'>('IDLE');

  // --- ACTIONS ---

  const generateChallenge = async () => {
    setLoading(true);
    setChallenge(null);
    setStatus('IDLE');
    setOutput("");
    
    try {
      const res = await fetch("http://localhost:8000/api/challenge/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty })
      });
      const data = await res.json();
      
      // Safety check if backend returns error string
      if (data.error) throw new Error(data.error);

      setChallenge(data);
      setCode(data.function_signature + "\n    # Write your code here\n    pass");
    } catch (e) {
      alert("Failed to generate challenge. Backend agent may be busy.");
    } finally {
      setLoading(false);
    }
  };

  const runCode = async () => {
    if (!challenge) return;
    setStatus('RUNNING');
    
    try {
      const res = await fetch("http://localhost:8000/api/challenge/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_code: code,
          language: "python", // Default for now
          test_cases: challenge.test_cases
        })
      });
      const data = await res.json();
      
      setOutput(data.output);
      if (data.status === "PASS") {
        setStatus('PASS');
      } else {
        setStatus('FAIL');
      }
    } catch (e) {
      setStatus('ERROR');
      setOutput("Execution Error: Sandbox Unreachable");
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono overflow-x-hidden">
      <Navbar />
      
      {status === 'PASS' && <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"><h1 className="text-9xl opacity-10 font-bold text-green-500 animate-pulse">VERIFIED</h1></div>}

      <div className="max-w-7xl mx-auto p-6 h-[calc(100vh-80px)] flex flex-col">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-6 border-b border-gray-800 pb-4">
            <div>
                <h1 className="text-3xl font-bold text-green-500 mb-1">SKILL_VERIFICATION_ARENA</h1>
                <p className="text-xs text-green-800 tracking-widest">PROOF OF WORK PROTOCOL</p>
            </div>
            
            {/* CONFIG BAR */}
            <div className="flex gap-4 items-center bg-gray-900/50 p-2 rounded border border-gray-800">
                <input 
                    className="bg-black border border-gray-700 p-2 text-white text-xs rounded w-48 focus:border-green-500 outline-none"
                    value={topic} onChange={e => setTopic(e.target.value)}
                    placeholder="Topic (e.g. Recursion)"
                />
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500 uppercase">Diff</span>
                    <input 
                        type="number" min="1" max="10"
                        className="bg-black border border-gray-700 p-2 text-white text-xs rounded w-16 focus:border-green-500 outline-none"
                        value={difficulty} onChange={e => setDifficulty(parseInt(e.target.value))}
                    />
                </div>
                <button 
                    onClick={generateChallenge}
                    disabled={loading}
                    className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 text-xs font-bold rounded disabled:opacity-50 transition-colors"
                >
                    {loading ? "GENERATING..." : "NEW CHALLENGE"}
                </button>
            </div>
        </div>

        {/* MAIN ARENA */}
        <div className="flex-1 flex gap-6 overflow-hidden">
            
            {/* LEFT: PROBLEM STATEMENT */}
            <div className="w-1/3 flex flex-col gap-6">
                <div className="flex-1 bg-gray-900/30 border border-gray-800 rounded-lg p-6 overflow-y-auto relative">
                    {!challenge ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                            <span className="text-4xl mb-4">⚡</span>
                            <p className="text-sm">Initialize sequence to begin.</p>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">{challenge.title}</h2>
                                <span className="bg-green-900/20 text-green-400 border border-green-900/50 text-[10px] px-2 py-1 rounded">
                                    DIFFICULTY: {challenge.difficulty}/10
                                </span>
                            </div>
                            
                            <div className="text-sm text-gray-300 leading-relaxed border-l-2 border-green-500 pl-4">
                                {challenge.description}
                            </div>

                            <div className="bg-black p-4 rounded border border-gray-800">
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">Test Case Preview</p>
                                <div className="space-y-2">
                                    {challenge.test_cases.slice(0, 2).map((tc, i) => (
                                        <div key={i} className="flex justify-between text-xs font-mono">
                                            <span className="text-gray-400">In: {tc.input_val}</span>
                                            <span className="text-gray-400">Out: {tc.expected_output}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* RIGHT: EDITOR & CONSOLE */}
            <div className="flex-1 flex flex-col gap-4">
                
                {/* Code Editor */}
                <div className="flex-1 bg-gray-900 rounded-lg border border-gray-700 flex flex-col overflow-hidden relative group">
                    <div className="bg-gray-950 p-2 border-b border-gray-800 flex justify-between items-center">
                        <span className="text-[10px] text-gray-500 font-mono">main.py</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                        </div>
                    </div>
                    <textarea 
                        className="flex-1 bg-black p-4 text-sm font-mono text-green-300 focus:outline-none resize-none leading-relaxed"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        spellCheck={false}
                        disabled={!challenge || status === 'RUNNING'}
                    />
                    
                    {/* Run Button Overlay */}
                    <div className="absolute bottom-4 right-4">
                         <button 
                            onClick={runCode}
                            disabled={!challenge || status === 'RUNNING'}
                            className={`px-6 py-3 font-bold rounded shadow-lg transition-all flex items-center gap-2 ${
                                status === 'RUNNING' ? 'bg-gray-700 text-gray-400 cursor-wait' : 'bg-green-600 hover:bg-green-500 text-white'
                            }`}
                         >
                            {status === 'RUNNING' ? (
                                <><span>EXECUTING</span><span className="animate-spin">⚙️</span></>
                            ) : (
                                <><span>SUBMIT SOLUTION</span><span>▶</span></>
                            )}
                         </button>
                    </div>
                </div>

                {/* Console Output */}
                <div className={`h-40 bg-black border rounded-lg p-4 font-mono text-xs overflow-y-auto transition-colors ${
                    status === 'PASS' ? 'border-green-500/50 bg-green-900/10' : 
                    status === 'FAIL' ? 'border-red-500/50 bg-red-900/10' : 
                    'border-gray-800'
                }`}>
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2">/var/log/sandbox_output</p>
                    {output ? (
                        <pre className={`whitespace-pre-wrap ${status === 'FAIL' ? 'text-red-400' : 'text-gray-300'}`}>
                            {output}
                        </pre>
                    ) : (
                        <p className="text-gray-700 italic">Ready to capture stdout/stderr...</p>
                    )}
                    
                    {status === 'PASS' && (
                        <div className="mt-4 flex items-center gap-2 text-green-500 font-bold">
                             <span>✔ ALL TEST CASES PASSED</span>
                             <span className="text-[10px] bg-green-900 px-2 py-0.5 rounded text-green-200">SKILL VERIFIED</span>
                        </div>
                    )}
                </div>

            </div>

        </div>

      </div>
    </div>
  );
}