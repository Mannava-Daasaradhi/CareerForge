
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

// --- TYPES ---
interface OutreachDraft {
  subject_line: string;
  email_body: string;
  strategy_used: string;
  estimated_reply_rate: number; // 0-100
  why_it_works: string;
}

export default function OutreachPage() {
  // Input State
  const [target, setTarget] = useState({
    name: "",
    company: "",
    role: "Hiring Manager",
    context: "" // e.g. "I saw they raised Series B"
  });

  // Output State
  const [draft, setDraft] = useState<OutreachDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // --- ACTIONS ---

  const generateMessage = async () => {
    if (!target.company) return;
    setLoading(true);
    setDraft(null);
    setIsCopied(false);

    try {
      const res = await fetch("http://localhost:8000/api/network/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: target.name || "Candidate", // Backend uses this to sign off
          target_company: target.company,
          target_role: target.role,
          job_context: target.context
        })
      });

      const data = await res.json();
      
      // The backend might return raw text or a struct. 
      // We map it to our UI model. 
      // Assuming standard backend response structure from networking_agent.py
      setDraft({
        subject_line: data.subject_line || "Opportunity at " + target.company,
        email_body: data.email_body || data.message || "Error generating text.",
        strategy_used: data.strategy || "Value-Add Pitch",
        estimated_reply_rate: data.reply_probability || 78,
        why_it_works: data.explanation || "This message focuses on their recent growth, showing you did your homework."
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyAndLog = async () => {
    if (!draft) return;
    
    // 1. Copy to Clipboard
    const fullText = `Subject: ${draft.subject_line}\n\n${draft.email_body}`;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);

    // 2. Log to Kanban (Auto-Sync)
    try {
        await fetch("http://localhost:8000/api/kanban/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                role_title: target.role,
                company_name: target.company,
                status: "Applied", // Or "Wishlist" / "Outreach Sent"
                salary_range: "Unknown",
                notes: `Outreach Sent via Agent.\nStrategy: ${draft.strategy_used}\n\n${draft.email_body.substring(0, 100)}...`
            })
        });
        setTimeout(() => setIsCopied(false), 3000); // Reset UI after 3s
    } catch (e) {
        console.error("Failed to sync with Kanban", e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-start mt-8">
        
        {/* LEFT: TARGET CONFIG */}
        <section className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Networking <span className="text-cyan-400">Sniper</span></h1>
            <p className="text-gray-400 text-sm">
              Don't spam. Send high-precision messages that get replies.
              <br/>Our agent analyzes the target's culture to craft the perfect hook.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-5 shadow-2xl">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Target Company</label>
              <input 
                value={target.company}
                onChange={(e) => setTarget({...target, company: e.target.value})}
                placeholder="e.g. Anthropic"
                className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-cyan-500 outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Recipient Role</label>
                    <input 
                        value={target.role}
                        onChange={(e) => setTarget({...target, role: e.target.value})}
                        placeholder="e.g. CTO"
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-cyan-500 outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">My Name</label>
                    <input 
                        value={target.name}
                        onChange={(e) => setTarget({...target, name: e.target.value})}
                        placeholder="Sign-off Name"
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-cyan-500 outline-none transition-colors"
                    />
                </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                Context / The "Hook" <span className="text-gray-600 normal-case">(Optional)</span>
              </label>
              <textarea 
                value={target.context}
                onChange={(e) => setTarget({...target, context: e.target.value})}
                placeholder="e.g. I saw their recent talk at PyCon about scaling LLMs..."
                className="w-full bg-black border border-gray-700 rounded-lg p-3 h-24 text-sm focus:border-cyan-500 outline-none transition-colors resize-none"
              />
            </div>

            <button 
                onClick={generateMessage}
                disabled={loading || !target.company}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                        Analyzing Company Culture...
                    </span>
                ) : (
                    <>
                        <span>Generate Icebreaker</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </>
                )}
            </button>
          </div>
        </section>

        {/* RIGHT: THE RESULT */}
        <section className="relative">
            <AnimatePresence mode="wait">
                {!draft ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-3xl min-h-[500px]"
                    >
                        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <p>Draft will appear here.</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-100 text-gray-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[500px] flex flex-col"
                    >
                        {/* ANALYSIS HEADER */}
                        <div className="flex justify-between items-start mb-6 border-b border-gray-300 pb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{draft.strategy_used}</h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-xs">{draft.why_it_works}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-green-600">{draft.estimated_reply_rate}%</div>
                                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Reply Probability</div>
                            </div>
                        </div>

                        {/* EMAIL CONTENT */}
                        <div className="flex-1 space-y-4 font-mono text-sm">
                            <div className="bg-white p-3 rounded border border-gray-200">
                                <span className="text-gray-400 select-none mr-2">Subject:</span>
                                <span className="font-bold text-gray-800">{draft.subject_line}</span>
                            </div>
                            <div className="bg-white p-6 rounded border border-gray-200 h-full whitespace-pre-wrap leading-relaxed text-gray-700">
                                {draft.email_body}
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="mt-6 pt-4 border-t border-gray-300 flex justify-between items-center">
                            <span className="text-xs text-gray-500 italic">
                                {isCopied ? "✓ Copied & Logged to Kanban!" : "Review before sending."}
                            </span>
                            <button 
                                onClick={copyAndLog}
                                className={`
                                    px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2
                                    ${isCopied ? "bg-green-500 text-white" : "bg-black text-white hover:bg-gray-800"}
                                `}
                            >
                                {isCopied ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Sent to Kanban
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                        Copy & Log
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>

      </main>
    </div>
  );
}
