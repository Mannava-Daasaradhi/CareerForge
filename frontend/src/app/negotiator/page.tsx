// frontend/src/app/negotiator/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';

interface Message {
  role: 'user' | 'agent';
  content: string;
}

interface Offer {
  base_salary: number;
  equity: string;
  sign_on: number;
  benefits: string;
}

export default function NegotiatorPage() {
  // Setup State
  const [role, setRole] = useState("Senior Software Engineer");
  const [location, setLocation] = useState("New York, NY");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [input, setInput] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- API HANDLERS ---

  const startScenario = async () => {
    if (!role || !location) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/negotiator/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, location })
      });
      const data = await res.json();
      
      setIsActive(true);
      setCurrentOffer(data.initial_offer);
      setMessages([{ role: 'agent', content: data.intro_message }]);
    } catch (e) {
      alert("Failed to start negotiation. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const sendCounter = async () => {
    if (!input.trim() || !currentOffer) return;
    const userMsg = input;
    setInput("");
    
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/negotiator/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: messages.map(m => ({ role: m.role, content: m.content })).concat({ role: 'user', content: userMsg }),
          current_offer: currentOffer
        })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { role: 'agent', content: data.reply }]);
      if (data.new_offer) setCurrentOffer(data.new_offer);
      
      // Check for Deal/Walkaway in response text (Logic can be enhanced)
      if (data.reply.includes("ACCEPTED")) alert("DEAL CLOSED! 🎉");
      if (data.reply.includes("WALK AWAY")) alert("NEGOTIATION FAILED. 💀");

    } catch (e) {
      alert("Negotiation Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono flex flex-col overflow-hidden">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto w-full p-6 flex gap-8 h-[calc(100vh-80px)]">
        
        {/* LEFT: WAR ROOM (OFFER TRACKER) */}
        <div className="w-[350px] flex flex-col gap-6">
            
            {/* Config Panel */}
            <div className={`p-6 rounded-lg border transition-colors ${isActive ? 'bg-gray-900/30 border-gray-800' : 'bg-green-900/10 border-green-500/50'}`}>
                <h3 className="text-xs font-bold text-green-500 mb-4 uppercase tracking-widest">Scenario Config</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase block mb-1">Target Role</label>
                        <input 
                            className="w-full bg-black border border-gray-700 p-2 text-white rounded disabled:opacity-50"
                            value={role} onChange={e => setRole(e.target.value)} disabled={isActive}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-gray-500 uppercase block mb-1">Market Location</label>
                        <input 
                            className="w-full bg-black border border-gray-700 p-2 text-white rounded disabled:opacity-50"
                            value={location} onChange={e => setLocation(e.target.value)} disabled={isActive}
                        />
                    </div>
                    {!isActive && (
                        <button 
                            onClick={startScenario} disabled={loading}
                            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded mt-2"
                        >
                            ENTER NEGOTIATION
                        </button>
                    )}
                </div>
            </div>

            {/* Live Offer Board */}
            {currentOffer && (
                <div className="flex-1 bg-black border border-green-900/50 p-6 rounded-lg relative overflow-hidden flex flex-col justify-center">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                    
                    <h3 className="text-center text-lg text-white font-bold mb-6 border-b border-gray-800 pb-4">CURRENT TERM SHEET</h3>
                    
                    <div className="space-y-6 relative z-10">
                        <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase mb-1">Base Salary</p>
                            <p className="text-4xl font-bold text-green-400">${currentOffer.base_salary.toLocaleString()}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Sign-On</p>
                                <p className="text-xl font-bold text-white">${currentOffer.sign_on.toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase mb-1">Equity</p>
                                <p className="text-xl font-bold text-white">{currentOffer.equity}</p>
                            </div>
                        </div>
                        <div className="bg-gray-900 p-3 rounded text-center">
                            <p className="text-[10px] text-gray-500 uppercase mb-1">Benefits Package</p>
                            <p className="text-xs text-gray-300">{currentOffer.benefits}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT: NEGOTIATION TABLE (CHAT) */}
        <div className="flex-1 bg-gray-900/50 border border-gray-800 rounded-lg flex flex-col relative overflow-hidden">
            {!isActive && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                    <div className="text-center">
                        <p className="text-6xl mb-4">🤝</p>
                        <h2 className="text-2xl font-bold text-white mb-2">THE WAR ROOM</h2>
                        <p className="text-gray-500">Configure the simulation to begin.</p>
                    </div>
                </div>
            )}

            {/* Chat Log */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-4 rounded-lg leading-relaxed text-sm shadow-lg ${
                            msg.role === 'user' 
                                ? 'bg-blue-900/20 border border-blue-900/50 text-blue-100' 
                                : 'bg-gray-800 border border-gray-700 text-white'
                        }`}>
                            {msg.role === 'agent' && <p className="text-[10px] font-bold text-green-500 mb-2 uppercase">Recruiter</p>}
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && <div className="text-xs text-green-500 animate-pulse p-8">Recruiter is reviewing terms...</div>}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-gray-900 border-t border-gray-800">
                <div className="flex gap-4">
                    <input 
                        className="flex-1 bg-black border border-gray-700 p-4 text-white focus:border-green-500 outline-none rounded"
                        placeholder="Type your counter-offer (e.g. 'I appreciate the offer, but given my experience...')"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendCounter()}
                        disabled={loading || !isActive}
                    />
                    <button 
                        onClick={sendCounter}
                        disabled={loading || !isActive || !input}
                        className="bg-green-700 hover:bg-green-600 text-white px-8 font-bold rounded disabled:opacity-50 transition-colors"
                    >
                        COUNTER
                    </button>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}