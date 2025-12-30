
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

// --- TYPES ---
interface Offer {
  base_salary: number;
  equity: string;
  sign_on: number;
  hr_comment: string;
  hr_mood: string; // "Annoyed", "Firm", "Flexible", "Impressed"
}

interface ChatMessage {
  role: "user" | "hr";
  content: string;
}

interface Critique {
  tactic_detected: string;
  mistake: string;
  better_response: string;
}

export default function NegotiatorPage() {
  // Setup State
  const [setup, setSetup] = useState({ role: "", location: "" });
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  // Arena State
  const [offer, setOffer] = useState<Offer | null>(null);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [critique, setCritique] = useState<Critique | null>(null);
  const [inputMsg, setInputMsg] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // --- ACTIONS ---

  const startBattle = async () => {
    if (!setup.role || !setup.location) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/negotiator/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(setup)
      });
      const data = await res.json();
      
      setOffer(data);
      setHistory([{ role: "hr", content: `Hello. We're excited to offer you the ${setup.role} position. Based on our bands in ${setup.location}, here is our initial proposal.` }]);
      setIsActive(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const sendTurn = async () => {
    if (!inputMsg.trim()) return;
    const userMsg = inputMsg;
    setInputMsg("");
    
    // Add User Message
    const newHistory = [...history, { role: "user", content: userMsg } as ChatMessage];
    setHistory(newHistory);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/negotiator/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: newHistory,
          current_offer: offer
        })
      });
      const data = await res.json();

      // Update State
      setOffer(data.new_offer);
      setHistory([...newHistory, { role: "hr", content: data.reply }]);
      setCritique(data.critique);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "Annoyed": return "text-red-500";
      case "Firm": return "text-yellow-500";
      case "Flexible": return "text-blue-400";
      case "Impressed": return "text-green-400";
      default: return "text-gray-400";
    }
  };

  if (!isActive) {
    return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-600"></div>
            <h1 className="text-3xl font-bold mb-2">Salary Dojo</h1>
            <p className="text-gray-400 mb-8">
              Practice negotiating with a stingy AI Recruiter. 
              <br/>Can you increase the offer?
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Target Role</label>
                <input 
                  value={setup.role}
                  onChange={(e) => setSetup({ ...setup, role: e.target.value })}
                  placeholder="e.g. Senior React Dev"
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-cyan-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location</label>
                <input 
                  value={setup.location}
                  onChange={(e) => setSetup({ ...setup, location: e.target.value })}
                  placeholder="e.g. San Francisco (Remote)"
                  className="w-full bg-black border border-gray-700 rounded-lg p-3 focus:border-cyan-500 outline-none transition-colors"
                />
              </div>
              
              <button 
                onClick={startBattle}
                disabled={loading || !setup.role}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-4 rounded-lg transition-all mt-4"
              >
                {loading ? "Generating Offer..." : "Enter Negotiation"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col h-screen overflow-hidden">
      <Navbar />
      
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 p-4 lg:p-8 overflow-hidden max-w-7xl mx-auto w-full">
        
        {/* LEFT: THE OFFER TICKET */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <motion.div 
            layout
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl relative"
          >
            <div className="absolute top-4 right-4 text-xs font-mono text-gray-500">OFFER_V{history.length + 1}</div>
            
            <div className="mb-6">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Compensation</h3>
              <div className="text-4xl font-black text-white">
                ${((offer?.base_salary || 0) + (offer?.sign_on || 0)).toLocaleString()}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-gray-400">Base Salary</span>
                <span className="font-mono font-bold text-cyan-400">${offer?.base_salary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-gray-400">Sign-on Bonus</span>
                <span className="font-mono font-bold text-green-400">${offer?.sign_on.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <span className="text-gray-400">Equity</span>
                <span className="font-mono font-bold text-purple-400">{offer?.equity}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-black/50 rounded-lg border border-gray-800">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-500">HR NOTE</span>
                <span className={`text-xs font-bold uppercase ${getMoodColor(offer?.hr_mood || "")}`}>
                  MOOD: {offer?.hr_mood}
                </span>
              </div>
              <p className="text-sm text-gray-300 italic">"{offer?.hr_comment}"</p>
            </div>
          </motion.div>

          {/* CRITIQUE CARD (THE COACH) */}
          <AnimatePresence>
            {critique && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6"
              >
                <h4 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  COACH WHISPER
                </h4>
                <p className="text-sm font-bold text-white mb-1">Detected: {critique.tactic_detected}</p>
                <p className="text-xs text-gray-400 mb-3">{critique.mistake}</p>
                <div className="text-sm text-blue-200 bg-blue-900/40 p-3 rounded border border-blue-500/20">
                  "Try saying: {critique.better_response}"
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* RIGHT: CHAT ARENA */}
        <section className="lg:col-span-8 flex flex-col h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
            {history.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user' ? 'bg-cyan-900 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}
                `}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
               <div className="flex justify-start">
                 <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none text-gray-500 text-xs italic animate-pulse">
                   HR is thinking...
                 </div>
               </div>
            )}
          </div>

          <div className="p-4 bg-black border-t border-gray-800">
            <div className="flex gap-2">
              <input
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendTurn()}
                placeholder="Make your counter-offer..."
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                disabled={loading}
              />
              <button 
                onClick={sendTurn}
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold px-6 rounded-xl transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>

        </section>

      </main>
    </div>
  );
}
