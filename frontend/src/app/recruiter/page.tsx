"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

// --- TYPES ---
interface CandidatePreview {
  id: string;
  username: string;
  role: string;
  trust_score: number;
  top_skills: string[];
  recent_proof: string;
  status: "Available" | "Interviewing" | "Hired";
  avatar_color: string;
}

interface Message {
  role: 'user' | 'twin';
  content: string;
}

export default function RecruiterPage() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"scout" | "terminal">("scout");

  // --- SCOUT STATE ---
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // --- TERMINAL STATE ---
  const [targetUser, setTargetUser] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-scroll for Chat
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeTab === "terminal") {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // --- MOCK DATA FOR SCOUT ---
  const candidates: CandidatePreview[] = [
    {
      id: "c1",
      username: "dev_wizard",
      role: "Full Stack Engineer",
      trust_score: 94,
      top_skills: ["React", "Node.js", "PostgreSQL"],
      recent_proof: "Minted 'System Design' Badge (2h ago)",
      status: "Available",
      avatar_color: "bg-purple-500"
    },
    {
      id: "c2",
      username: "rust_ace",
      role: "Systems Engineer",
      trust_score: 88,
      top_skills: ["Rust", "WebAssembly", "C++"],
      recent_proof: "Passed 'Memory Safety' Challenge",
      status: "Interviewing",
      avatar_color: "bg-orange-500"
    },
    {
      id: "c3",
      username: "ai_architect",
      role: "ML Engineer",
      trust_score: 91,
      top_skills: ["Python", "PyTorch", "LangChain"],
      recent_proof: "Built 'Custom LLM Agent' Project",
      status: "Available",
      avatar_color: "bg-cyan-500"
    }
  ];

  const filteredCandidates = candidates.filter(c => 
    (filter === "All" || c.status === filter) &&
    (c.role.toLowerCase().includes(search.toLowerCase()) || c.top_skills.some(s => s.toLowerCase().includes(search.toLowerCase())) || c.username.includes(search))
  );

  // --- ACTIONS ---

  const handleConnect = (username: string = targetUser) => {
    if (!username) return;
    setTargetUser(username);
    setIsConnected(true);
    setMessages([{ 
        role: 'twin', 
        content: `[SYSTEM]: Digital Twin of @${username} initialized. I have analyzed their public repositories and commit history. You may now ask me about my coding style, preferences, or technical opinions.` 
    }]);
  };

  const jumpToChat = (username: string) => {
      setTargetUser(username);
      setActiveTab("terminal");
      handleConnect(username);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/recruiter/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: targetUser,
          question: userMsg
        })
      });
      const data = await res.json();
      const replyText = typeof data === 'string' ? data : data.response || JSON.stringify(data);
      setMessages(prev => [...prev, { role: 'twin', content: replyText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'twin', content: "[ERROR]: Connection to Twin lost. Backend unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans selection:bg-cyan-500 selection:text-black flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 flex flex-col gap-6">
        
        {/* HEADER & TABS */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white">Recruiter <span className="text-cyan-500">OS</span></h1>
                <p className="text-xs text-gray-500 tracking-widest mt-1">VERIFIED TALENT ACQUISITION TERMINAL</p>
            </div>
            
            <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
                <button
                    onClick={() => setActiveTab("scout")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "scout" ? "bg-cyan-600 text-black shadow-lg shadow-cyan-900/50" : "text-gray-400 hover:text-white"}`}
                >
                    Talent Scout
                </button>
                <button
                    onClick={() => setActiveTab("terminal")}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "terminal" ? "bg-cyan-600 text-black shadow-lg shadow-cyan-900/50" : "text-gray-400 hover:text-white"}`}
                >
                    Terminal Link
                </button>
            </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 relative min-h-[600px]">
            
            {/* --- TAB 1: SCOUT (The New Dashboard) --- */}
            {activeTab === "scout" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-3.5 text-gray-500">🔍</span>
                            <input 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-gray-900 border border-gray-700 rounded-xl pl-10 p-3 text-sm text-white w-full focus:border-cyan-500 outline-none"
                                placeholder="Search candidates by skill, role, or name..."
                            />
                        </div>
                        <select 
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="bg-gray-900 border border-gray-700 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none cursor-pointer"
                        >
                            <option value="All">All Status</option>
                            <option value="Available">Available</option>
                            <option value="Interviewing">Interviewing</option>
                        </select>
                    </div>

                    {/* Candidate Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCandidates.map((c) => (
                            <motion.div
                                key={c.id}
                                whileHover={{ y: -5 }}
                                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 group hover:border-cyan-500/50 transition-all shadow-xl"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full ${c.avatar_color} flex items-center justify-center text-black font-bold text-lg`}>
                                            {c.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white leading-tight">{c.username}</h3>
                                            <p className="text-xs text-gray-400">{c.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">{c.trust_score}</div>
                                        <div className="text-[10px] font-bold text-gray-500 uppercase">Trust Score</div>
                                    </div>
                                </div>

                                <div className="bg-black/50 border border-gray-800 rounded-lg p-3 mb-4 flex items-start gap-2">
                                    <span className="text-green-500 text-lg">✓</span>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Verified Proof</p>
                                        <p className="text-xs text-gray-300">{c.recent_proof}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    {c.top_skills.map(skill => (
                                        <span key={skill} className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 border border-gray-700">{skill}</span>
                                    ))}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Link href={`/candidate/${c.username}`} className="bg-white text-black font-bold py-2 rounded-lg text-center text-sm hover:bg-gray-200 transition-colors">
                                        Profile
                                    </Link>
                                    <button 
                                        onClick={() => jumpToChat(c.username)}
                                        className="bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 font-bold py-2 rounded-lg text-center text-sm hover:bg-cyan-900/50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span>💬</span> Twin Chat
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* --- TAB 2: TERMINAL (RESTORED FULL UI) --- */}
            {activeTab === "terminal" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex gap-6 overflow-hidden">
                    
                    {/* LEFT PANEL: VISUALIZER (Restored) */}
                    <div className="hidden md:flex w-1/4 flex-col gap-4">
                        <div className="flex-1 bg-cyan-900/5 border border-cyan-900/20 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                            
                            {isConnected ? (
                                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                    <div className="w-32 h-32 rounded-full border-4 border-cyan-500/30 bg-gray-900 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)] relative">
                                        <span className="text-4xl">👤</span>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black animate-pulse"></div>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">@{targetUser}</h3>
                                    <p className="text-xs text-cyan-400">Digital Twin Active</p>
                                    
                                    <div className="mt-8 text-left space-y-2 w-full">
                                        <div className="h-1 w-full bg-gray-800 rounded overflow-hidden">
                                            <div className="h-full bg-cyan-600 w-[75%] animate-pulse"></div>
                                        </div>
                                        <p className="text-[10px] text-gray-500">ANALYZING CODE PATTERNS...</p>
                                        <div className="h-1 w-full bg-gray-800 rounded overflow-hidden">
                                            <div className="h-full bg-purple-600 w-[45%]"></div>
                                        </div>
                                        <p className="text-[10px] text-gray-500">SYNTHESIZING PERSONA...</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-gray-600">
                                    <p className="text-4xl mb-4 opacity-50">🔒</p>
                                    <p className="text-xs tracking-widest">AWAITING TARGET</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL: CHAT TERMINAL */}
                    <div className="flex-1 bg-black border border-gray-800 rounded-2xl flex flex-col relative shadow-2xl">
                        {/* Status Header */}
                        <div className="bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center rounded-t-2xl">
                             <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"/>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                                <div className="w-3 h-3 rounded-full bg-green-500"/>
                                <span className="ml-3 text-xs font-mono text-gray-400">root@careerforge:~/twin_proxy</span>
                            </div>
                            {isConnected && (
                                 <button onClick={() => {setIsConnected(false); setTargetUser("");}} className="text-xs text-red-500 hover:text-red-400 font-mono">[TERMINATE_SESSION]</button>
                            )}
                        </div>

                        {/* Lock Screen */}
                        {!isConnected && (
                            <div className="absolute inset-0 bg-black/90 z-10 flex flex-col items-center justify-center backdrop-blur-sm rounded-b-2xl mt-12">
                                <p className="text-cyan-500 text-lg mb-4 animate-pulse font-mono">_ INITIALIZE CONNECTION</p>
                                <div className="flex gap-2">
                                    <input 
                                        className="bg-gray-900 border border-gray-700 p-2 text-white focus:border-cyan-500 outline-none rounded w-64 text-center font-mono"
                                        placeholder="Enter GitHub Username..."
                                        value={targetUser}
                                        onChange={e => setTargetUser(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleConnect()}
                                    />
                                    <button 
                                        onClick={() => handleConnect()}
                                        className="bg-cyan-700 hover:bg-cyan-600 text-white px-4 font-bold rounded transition-colors"
                                    >
                                        CONNECT
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-800">
                            {messages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 text-sm rounded-lg font-mono ${
                                        msg.role === 'user' 
                                            ? 'bg-gray-800 border border-gray-700 text-gray-200' 
                                            : 'bg-cyan-900/10 border border-cyan-500/20 text-cyan-400'
                                    }`}>
                                        <span className="block text-[10px] font-bold opacity-50 mb-1">
                                            {msg.role === 'user' ? 'USR' : `TWIN<${targetUser}>`}
                                        </span>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="text-cyan-500 text-xs animate-pulse pl-4 font-mono">_ thinking...</div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-gray-900/30 border-t border-gray-800 rounded-b-2xl flex gap-4">
                            <span className="text-cyan-500 py-3 font-mono">{'>'}</span>
                            <input 
                                className="flex-1 bg-transparent text-white outline-none font-mono"
                                placeholder="Execute command or ask question..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                disabled={!isConnected || loading}
                                autoFocus
                            />
                        </div>

                    </div>
                </motion.div>
            )}

        </div>

      </main>
    </div>
  );
}