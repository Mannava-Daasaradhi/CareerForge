
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";

// --- TYPES ---
interface SkillPassport {
  candidate_id: string;
  interview_readiness_score: number;
  github_trust_score: number;
  verified_skills: string[];
  recent_achievements: {
    challenge_title: string;
    status: string;
    timestamp: string;
  }[];
}

interface ChatMessage {
  role: "recruiter" | "twin";
  content: string;
}

export default function CandidateProfilePage() {
  const params = useParams();
  
  // ROBUST PARAM HANDLING:
  // This allows the folder to be named either [username] OR [public] without breaking.
  // It grabs the first available parameter.
  // Example URL: localhost:3000/candidate/jdoe -> username = "jdoe"
  const rawUsername = params?.username || params?.public;
  const username = Array.isArray(rawUsername) ? rawUsername[0] : rawUsername;

  const [passport, setPassport] = useState<SkillPassport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recruiterName, setRecruiterName] = useState("Visitor");

  // Fetch Passport on Mount
  useEffect(() => {
    if (!username) return;

    // Call the Public API we created in backend/public_routes.py
    fetch(`http://localhost:8000/api/public/profile/${username}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Candidate not found (or API offline)");
        return res.json();
      })
      .then((data) => {
        setPassport(data);
        setLoading(false);
        // Initial Greeting from the AI Agent
        setChatHistory([
          { 
            role: "twin", 
            content: `Hi! I'm ${data.candidate_id}'s Digital Twin. I can answer questions about their coding skills, verify their GitHub history, or schedule a meeting. What would you like to know?` 
          }
        ]);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  // Handle Chat
  const sendMessage = async () => {
    if (!inputMsg.trim()) return;

    // 1. Add Recruiter's Message to UI immediately
    const newHistory = [...chatHistory, { role: "recruiter", content: inputMsg } as ChatMessage];
    setChatHistory(newHistory);
    setInputMsg("");
    setIsTyping(true);

    try {
      // 2. Send to Backend Agent
      const res = await fetch(`http://localhost:8000/api/public/twin/${username}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recruiter_name: recruiterName,
          question: inputMsg
        })
      });
      
      const data = await res.json();
      
      // 3. Add AI Response
      setChatHistory([...newHistory, { role: "twin", content: data.reply }]);
    } catch (err) {
      setChatHistory([...newHistory, { role: "twin", content: "I'm having trouble connecting to the candidate's database right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-cyan-400 font-mono">Loading Digital Twin protocol...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-black text-red-500 font-mono">System Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* HEADER */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-black">
              {username ? username[0].toUpperCase() : "?"}
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-wide">{passport?.candidate_id}</h1>
              <span className="text-xs text-green-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Verified Candidate
              </span>
            </div>
          </div>
          <button className="bg-white text-black px-5 py-2 rounded-full font-bold hover:bg-cyan-400 transition-colors text-sm">
            Book Meeting
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* LEFT COL: PROOF & STATS */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* TRUST SCORE CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gray-900 border border-gray-800 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl" />
            <h2 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">CareerForge Trust Score</h2>
            <div className="flex items-end gap-2">
              <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {passport?.interview_readiness_score}
              </span>
              <span className="text-xl text-gray-500 mb-2">/ 100</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Based on {passport?.github_trust_score}% GitHub activity and {passport?.recent_achievements.length} verified technical challenges.
            </p>
          </motion.div>

          {/* VERIFIED SKILLS */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {passport?.verified_skills.length === 0 && <span className="text-gray-500 italic">No verified skills yet.</span>}
              {passport?.verified_skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 rounded-md bg-gray-800 border border-gray-700 text-sm text-cyan-300">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* RECENT CHALLENGES */}
          <div className="space-y-4">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Recent Sandbox Logs</h3>
            {passport?.recent_achievements.map((ach, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800/50">
                <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center text-green-400">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-sm">{ach.challenge_title}</p>
                  <p className="text-xs text-gray-500">{new Date(ach.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* RIGHT COL: DIGITAL TWIN CHAT */}
        <div className="lg:col-span-7">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-[600px] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_40px_-10px_rgba(6,182,212,0.15)]"
          >
            {/* Chat Header */}
            <div className="bg-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center text-cyan-400">
                    AI
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Digital Twin</h3>
                  <p className="text-xs text-cyan-400">Powered by CareerForge</p>
                </div>
              </div>
              <input 
                type="text" 
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded px-3 py-1 text-xs text-right focus:outline-none focus:border-cyan-500 transition-colors w-32"
                placeholder="Your Name"
              />
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-900/80 p-6 overflow-y-auto space-y-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'recruiter' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'recruiter' 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-700 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="bg-gray-800 p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about my experience with Python, System Design..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all"
                />
                <button 
                  onClick={sendMessage}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold p-3 rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </div>
            </div>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
