// frontend/src/app/recruiter/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

interface Message {
  role: 'user' | 'twin';
  content: string;
}

export default function RecruiterPage() {
  // State
  const [targetUser, setTargetUser] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-scroll
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- ACTIONS ---

  const handleConnect = () => {
    if (!targetUser) return;
    setIsConnected(true);
    setMessages([{ 
        role: 'twin', 
        content: `[SYSTEM]: Digital Twin of @${targetUser} initialized. I have analyzed their public repositories and commit history. You may now ask me about my coding style, preferences, or technical opinions.` 
    }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // POST to /api/recruiter/ask
      const res = await fetch("http://localhost:8000/api/recruiter/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: targetUser,
          question: userMsg
        })
      });
      const data = await res.json();
      
      // The backend returns a string response (or dict depending on implementation)
      // Assuming simple string or { response: ... }
      const replyText = typeof data === 'string' ? data : data.response || JSON.stringify(data);

      setMessages(prev => [...prev, { role: 'twin', content: replyText }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'twin', content: "[ERROR]: Connection to Twin lost. Backend unavailable." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex-1 max-w-6xl mx-auto w-full p-6 flex flex-col gap-6 h-[calc(100vh-80px)]">
        
        {/* HEADER & CONFIG */}
        <div className="flex justify-between items-end border-b border-cyan-900/30 pb-4">
            <div>
                <h1 className="text-3xl font-bold text-cyan-500 mb-1">DIGITAL_TWIN_PROXY</h1>
                <p className="text-xs text-cyan-800 tracking-widest">SIMULATE CONVERSATIONS WITH TARGET PROFILES</p>
            </div>
            
            {!isConnected && (
                <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-500 mr-2">TARGET_ID:</span>
                    <input 
                        className="bg-gray-900 border border-gray-700 p-2 text-cyan-400 focus:border-cyan-500 outline-none rounded w-64 text-center font-bold"
                        placeholder="GitHub Username (e.g. torvalds)"
                        value={targetUser}
                        onChange={e => setTargetUser(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleConnect()}
                    />
                    <button 
                        onClick={handleConnect}
                        className="bg-cyan-900/20 border border-cyan-600 text-cyan-400 px-6 py-2 font-bold hover:bg-cyan-500 hover:text-white transition-all rounded"
                    >
                        INITIALIZE LINK
                    </button>
                </div>
            )}
            
            {isConnected && (
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-gray-500">CONNECTED TO</p>
                        <p className="text-xl font-bold text-white">@{targetUser}</p>
                    </div>
                    <button 
                        onClick={() => { setIsConnected(false); setMessages([]); setTargetUser(""); }}
                        className="text-xs text-red-500 hover:text-red-400 border border-red-900 px-3 py-1 rounded"
                    >
                        TERMINATE
                    </button>
                </div>
            )}
        </div>

        {/* MAIN INTERFACE */}
        <div className="flex-1 flex gap-6 overflow-hidden">
            
            {/* LEFT: VISUALIZER (Static/Decor for now) */}
            <div className="hidden md:flex w-1/4 flex-col gap-4">
                <div className="flex-1 bg-cyan-900/5 border border-cyan-900/20 rounded-lg p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
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
                            <p className="text-xs">AWAITING TARGET</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: CHAT TERMINAL */}
            <div className="flex-1 bg-black border border-gray-800 rounded-lg flex flex-col relative">
                {!isConnected && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <p className="text-gray-500 font-mono text-sm blink">_ ESTABLISH CONNECTION TO BEGIN</p>
                    </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 text-sm font-mono leading-relaxed rounded-lg ${
                                msg.role === 'user' 
                                    ? 'bg-gray-900 border border-gray-700 text-white' 
                                    : 'bg-cyan-900/10 border border-cyan-900/30 text-cyan-100'
                            }`}>
                                <span className={`block text-[10px] font-bold mb-2 uppercase ${msg.role === 'user' ? 'text-gray-500' : 'text-cyan-500'}`}>
                                    {msg.role === 'user' ? 'YOU' : `TWIN_OF_${targetUser}`}
                                </span>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                             <div className="bg-cyan-900/5 border border-cyan-900/20 p-4 rounded-lg">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
                                </div>
                             </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-800 bg-gray-900/30">
                    <div className="flex gap-4">
                        <input 
                            className="flex-1 bg-black border border-gray-700 p-4 text-white focus:border-cyan-500 outline-none rounded font-mono"
                            placeholder={isConnected ? `Ask @${targetUser} a question...` : "Enter username above first..."}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            disabled={!isConnected || loading}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!isConnected || loading || !input}
                            className="bg-cyan-700 hover:bg-cyan-600 text-white px-8 font-bold rounded disabled:opacity-50 transition-colors"
                        >
                            SEND
                        </button>
                    </div>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
}