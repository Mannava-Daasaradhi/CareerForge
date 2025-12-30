
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

// --- TYPES ---
interface TestCase {
  input_val: any;
  expected_output: any;
}

interface Challenge {
  title: string;
  description: string;
  difficulty: number;
  starter_code: string;
  test_cases: TestCase[];
}

export default function ChallengePage() {
  const router = useRouter();

  // State
  const [topic, setTopic] = useState("Python");
  const [difficulty, setDifficulty] = useState(50);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  
  const [userCode, setUserCode] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<"IDLE" | "RUNNING" | "PASS" | "FAIL">("IDLE");
  const [loading, setLoading] = useState(false);

  // --- ACTIONS ---

  const generateChallenge = async () => {
    setLoading(true);
    setChallenge(null);
    setStatus("IDLE");
    setOutput("");

    try {
      const res = await fetch("http://localhost:8000/api/challenge/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, difficulty })
      });
      const data = await res.json();
      
      // The backend returns a JSON string in some cases, parse if needed
      // Assuming standard structure for now
      setChallenge(data);
      setUserCode(data.starter_code || "# Write your solution here\n");
    } catch (e) {
      console.error(e);
      setOutput("Error contacting the Challenge Architect.");
    } finally {
      setLoading(false);
    }
  };

  const runCode = async () => {
    if (!challenge) return;
    setStatus("RUNNING");
    setOutput("Compiling & verifying against hidden test cases...");

    try {
      const res = await fetch("http://localhost:8000/api/challenge/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_code: userCode,
          language: "python", // Hardcoded for this demo, can be dynamic
          test_cases: challenge.test_cases
        })
      });
      
      const data = await res.json();
      setOutput(data.output);
      
      if (data.status === "PASS") {
        setStatus("PASS");
        // Trigger "Minting" effect logic here
      } else {
        setStatus("FAIL");
      }

    } catch (e) {
      console.error(e);
      setStatus("FAIL");
      setOutput("System Error during execution.");
    }
  };

  // --- RENDER ---

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-[90vh]">
        
        {/* LEFT: CONFIG & DESCRIPTION */}
        <section className="flex flex-col gap-6">
          
          {/* CONTROL PANEL */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
            <h1 className="text-2xl font-bold mb-4 text-cyan-400">Skill Proving Ground</h1>
            <div className="flex gap-4 mb-4">
              <select 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-black border border-gray-700 rounded-lg p-2 flex-1 focus:border-cyan-500 outline-none"
              >
                <option>Python Arrays</option>
                <option>Recursion</option>
                <option>Dynamic Programming</option>
                <option>System Design (Text)</option>
              </select>
              <select 
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="bg-black border border-gray-700 rounded-lg p-2 w-32 focus:border-cyan-500 outline-none"
              >
                <option value={30}>Easy</option>
                <option value={50}>Medium</option>
                <option value={80}>Hard</option>
                <option value={100}>Insane</option>
              </select>
              <button 
                onClick={generateChallenge}
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-6 rounded-lg transition-colors"
              >
                {loading ? "Generating..." : "New Challenge"}
              </button>
            </div>
          </div>

          {/* PROBLEM DESCRIPTION */}
          <div className="flex-1 bg-gray-900 border border-gray-800 p-6 rounded-2xl overflow-y-auto relative">
            {!challenge ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <p>Select a topic and generate a challenge to begin.</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-bold text-white">{challenge.title}</h2>
                <div className="prose prose-invert max-w-none text-sm text-gray-300">
                  <p>{challenge.description}</p>
                </div>
                
                <div className="mt-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Examples</h3>
                    {challenge.test_cases.slice(0, 2).map((tc, i) => (
                        <div key={i} className="bg-black p-3 rounded border border-gray-800 font-mono text-xs mb-2">
                            <span className="text-purple-400">Input:</span> {JSON.stringify(tc.input_val)} <br/>
                            <span className="text-green-400">Output:</span> {JSON.stringify(tc.expected_output)}
                        </div>
                    ))}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* RIGHT: EDITOR & TERMINAL */}
        <section className="flex flex-col gap-4">
            
            {/* EDITOR */}
            <div className="flex-1 bg-[#1e1e1e] rounded-2xl border border-gray-800 overflow-hidden flex flex-col relative">
                <div className="bg-[#252526] px-4 py-2 text-xs text-gray-400 flex justify-between items-center border-b border-[#333]">
                    <span>main.py</span>
                    {status === "PASS" && <span className="text-green-400 font-bold animate-pulse">VERIFIED</span>}
                </div>
                <textarea 
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="flex-1 bg-transparent text-gray-200 font-mono p-4 resize-none focus:outline-none leading-relaxed"
                    spellCheck={false}
                />
                
                {/* SUCCESS OVERLAY (MINTING) */}
                <AnimatePresence>
                    {status === "PASS" && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
                        >
                            <motion.div 
                                initial={{ scale: 0.5, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", bounce: 0.5 }}
                                className="w-32 h-32 bg-gradient-to-br from-green-400 to-cyan-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.5)] mb-6"
                            >
                                <svg className="w-16 h-16 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                            <h2 className="text-3xl font-bold text-white mb-2">Skill Verified!</h2>
                            <p className="text-gray-400 mb-6">Badge minted to your Digital Passport.</p>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setStatus("IDLE")}
                                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold"
                                >
                                    Review Code
                                </button>
                                <button 
                                    onClick={() => router.push("/passport")}
                                    className="px-6 py-2 bg-green-500 hover:bg-green-400 text-black rounded-lg font-bold"
                                >
                                    View Passport
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* TERMINAL */}
            <div className="h-48 bg-black rounded-2xl border border-gray-800 p-4 font-mono text-sm overflow-y-auto relative">
                <div className="absolute top-2 right-2">
                    <button 
                        onClick={runCode}
                        disabled={status === "RUNNING" || !challenge}
                        className={`
                            px-4 py-1.5 rounded text-xs font-bold transition-all
                            ${status === "RUNNING" ? "bg-gray-700 text-gray-500 cursor-not-allowed" : "bg-green-600 hover:bg-green-500 text-white"}
                        `}
                    >
                        {status === "RUNNING" ? "Running..." : "Run Tests >_"}
                    </button>
                </div>
                
                <div className="text-gray-500 mb-2">Output Log:</div>
                <pre className={`whitespace-pre-wrap ${status === "FAIL" ? "text-red-400" : "text-gray-300"}`}>
                    {output || "Ready to execute..."}
                </pre>
            </div>

        </section>

      </main>
    </div>
  );
}
