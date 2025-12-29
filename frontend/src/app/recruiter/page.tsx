"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function RecruiterPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{q: string, a: string}[]>([]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/recruiter/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query })
      });
      
      const data = await res.json();
      
      setHistory(prev => [...prev, { q: query, a: data.reply }]);
      setQuery("");
    } catch (err) {
      alert("Digital Twin Offline.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* HEADER - Clean, "Recruiter Friendly" UI */}
        <div className="mb-12 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
            🤖
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Digital Twin</h1>
          <p className="text-gray-500">Ask questions about the candidate's verified technical history.</p>
        </div>

        {/* CHAT DISPLAY */}
        <div className="space-y-8 mb-12">
          {history.length === 0 && (
            <div className="text-center text-gray-400 italic text-sm">
              Try asking: "How did they perform on System Design?" or "What are their Python weaknesses?"
            </div>
          )}
          
          {history.map((turn, i) => (
            <div key={i} className="space-y-4">
              {/* Recruiter Question */}
              <div className="flex justify-end">
                 <div className="bg-blue-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[80%] shadow-sm">
                   {turn.q}
                 </div>
              </div>

              {/* Twin Answer */}
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                 <div className="bg-gray-100 text-gray-800 px-5 py-3 rounded-2xl rounded-tl-sm max-w-[90%] shadow-sm border border-gray-200">
                   <p className="text-sm leading-relaxed whitespace-pre-wrap">{turn.a}</p>
                 </div>
              </motion.div>
            </div>
          ))}

          {loading && (
             <div className="flex justify-start">
               <div className="bg-gray-50 px-4 py-2 rounded-full text-xs text-gray-400 animate-pulse">
                 Consulting Memory Banks...
               </div>
             </div>
          )}
        </div>

        {/* INPUT */}
        <form onSubmit={handleAsk} className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="relative shadow-xl">
            <input 
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask about the candidate..."
              className="w-full p-4 rounded-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none pr-16"
            />
            <button 
              type="submit"
              disabled={loading || !query}
              className="absolute right-2 top-2 bg-black text-white p-2 rounded-full w-10 h-10 hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              &uarr;
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}