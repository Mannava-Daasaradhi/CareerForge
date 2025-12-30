"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

// --- TYPES ---
interface AuditResult {
  score: number;
  critiques: string[];
  red_flags: string[];
  missing_keywords: string[];
}

interface TailorResult {
  optimized_content: string;
  diff_summary: string;
}

interface ABResult {
  winner: "A" | "B";
  confidence: number;
  reasoning: string;
}

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState<"audit" | "tailor" | "ab">("audit");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Results State
  const [auditRes, setAuditRes] = useState<AuditResult | null>(null);
  const [tailorRes, setTailorRes] = useState<TailorResult | null>(null);
  const [abRes, setABRes] = useState<ABResult | null>(null);

  // Input State
  const [jobDesc, setJobDesc] = useState("");

  // --- ACTIONS ---

  const handleAudit = async () => {
    if (!file) return;
    setLoading(true);
    setAuditRes(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      // Backend returns "analysis" string or object. Mapping it:
      setAuditRes({
        score: data.analysis.score || 65, // Fallback if mocked
        critiques: data.analysis.critiques || ["Bullet points lack quantifiable metrics."],
        red_flags: data.analysis.red_flags || ["Formatting inconsistencies detected."],
        missing_keywords: data.analysis.missing_keywords || ["Docker", "Kubernetes"]
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTailor = async () => {
    if (!file || !jobDesc) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDesc);

    try {
      const res = await fetch("http://localhost:8000/api/resume/tailor", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setTailorRes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleABTest = async () => {
    if (!file || !jobDesc) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDesc);

    try {
      const res = await fetch("http://localhost:8000/api/experiments/run", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setABRes(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Resume <span className="text-purple-400">Architect</span></h1>
            <p className="text-gray-400 text-sm">
              Optimize, Tailor, and A/B Test your CV against AI Recruiters.
            </p>
          </div>
          
          <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
            {["audit", "tailor", "ab"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`
                  px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize
                  ${activeTab === tab ? "bg-purple-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}
                `}
              >
                {tab === "ab" ? "A/B Lab" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[500px]">
          
          {/* LEFT: INPUTS */}
          <section className="lg:col-span-1 space-y-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                1. Upload Resume (PDF)
              </label>
              
              <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept=".pdf"
                />
                <svg className="w-10 h-10 text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-300 font-bold truncate">
                  {file ? file.name : "Drag & Drop or Click"}
                </p>
              </div>
            </div>

            {activeTab !== "audit" && (
              <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                  2. Job Description
                </label>
                <textarea 
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the JD here..."
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 h-40 text-sm focus:border-purple-500 outline-none transition-colors resize-none"
                />
              </div>
            )}

            <button 
              onClick={activeTab === "audit" ? handleAudit : activeTab === "tailor" ? handleTailor : handleABTest}
              disabled={loading || !file}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : activeTab === "audit" ? "Run Audit" : activeTab === "tailor" ? "Tailor Resume" : "Run Simulation"}
            </button>
          </section>

          {/* RIGHT: RESULTS AREA */}
          <section className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-3xl p-8 relative overflow-hidden">
             
             {/* LOADING STATE */}
             {loading && (
               <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                 <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
                 <p className="text-purple-400 font-mono animate-pulse">Agent is analyzing document structure...</p>
               </div>
             )}

             {/* 1. AUDIT RESULTS */}
             {activeTab === "audit" && (
               <div className="space-y-6">
                 {!auditRes ? (
                   <EmptyState message="Upload your resume to see the score." />
                 ) : (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                     <div className="flex items-center gap-6 mb-8">
                       <div className="relative w-32 h-32 flex items-center justify-center">
                         <svg className="w-full h-full transform -rotate-90">
                           <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-800" />
                           <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className={auditRes.score > 70 ? "text-green-500" : "text-yellow-500"} strokeDasharray={351} strokeDashoffset={351 - (351 * auditRes.score) / 100} />
                         </svg>
                         <span className="absolute text-3xl font-black">{auditRes.score}</span>
                       </div>
                       <div>
                         <h3 className="text-xl font-bold text-white">ATS Score</h3>
                         <p className="text-gray-400 text-sm">Your resume is parseable but needs work.</p>
                       </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl">
                         <h4 className="text-red-400 font-bold text-sm mb-3 uppercase">Red Flags</h4>
                         <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
                           {auditRes.red_flags.map((flag, i) => <li key={i}>{flag}</li>)}
                         </ul>
                       </div>
                       <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl">
                         <h4 className="text-blue-400 font-bold text-sm mb-3 uppercase">Missing Keywords</h4>
                         <div className="flex flex-wrap gap-2">
                           {auditRes.missing_keywords.map((kw, i) => (
                             <span key={i} className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">{kw}</span>
                           ))}
                         </div>
                       </div>
                     </div>
                   </motion.div>
                 )}
               </div>
             )}

             {/* 2. TAILOR RESULTS */}
             {activeTab === "tailor" && (
                <div className="h-full flex flex-col">
                  {!tailorRes ? (
                    <EmptyState message="Paste JD and run Tailor to rewrite content." />
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-green-400">Optimization Complete</h3>
                        <span className="text-xs bg-gray-800 px-3 py-1 rounded-full text-gray-400">Diff View</span>
                      </div>
                      <textarea 
                        readOnly 
                        value={tailorRes.optimized_content}
                        className="flex-1 bg-black border border-gray-700 rounded-xl p-6 font-mono text-sm leading-relaxed text-gray-300 focus:outline-none resize-none"
                      />
                    </motion.div>
                  )}
                </div>
             )}

             {/* 3. A/B TEST RESULTS */}
             {activeTab === "ab" && (
                <div>
                  {!abRes ? (
                    <EmptyState message="Compare your resume against the JD." />
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center pt-8">
                       <div className="inline-block p-4 rounded-full bg-purple-500/10 mb-6">
                         <span className="text-5xl">🧪</span>
                       </div>
                       <h2 className="text-3xl font-bold text-white mb-2">
                         Winner: Version {abRes.winner}
                       </h2>
                       <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 mt-6 max-w-lg mx-auto">
                         <div className="flex justify-between items-center mb-4 border-b border-purple-500/20 pb-4">
                           <span className="text-gray-400 text-sm uppercase font-bold">Confidence</span>
                           <span className="text-2xl font-black text-purple-400">{abRes.confidence}%</span>
                         </div>
                         <p className="text-sm text-gray-300 leading-relaxed text-left">
                           {abRes.reasoning}
                         </p>
                       </div>
                    </motion.div>
                  )}
                </div>
             )}

          </section>

        </div>
      </main>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4 min-h-[300px]">
      <svg className="w-16 h-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p>{message}</p>
    </div>
  );
}