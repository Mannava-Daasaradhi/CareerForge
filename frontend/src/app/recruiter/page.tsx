"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function RecruiterPage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askTwin = async () => {
    if (!question) return;
    setLoading(true);
    setAnswer("");

    try {
      const res = await fetch('http://localhost:8000/api/recruiter/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await res.json();
      setAnswer(data.reply || data.error);
    } catch (e) {
      setAnswer("Error: Digital Twin unresponsive.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans p-8 flex flex-col items-center">
      {/* HEADER */}
      <div className="w-full max-w-2xl mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Talent Verification Portal</h1>
        <p className="text-gray-500 mt-2">
          Securely querying the <span className="font-bold text-blue-600">Digital Twin</span> of Candidate #DEV-001.
        </p>
      </div>

      {/* CHAT INTERFACE */}
      <div className="w-full max-w-2xl bg-gray-50 border border-gray-200 rounded-xl p-8 shadow-sm">
        
        {/* INPUT */}
        <div className="flex gap-4 mb-8">
          <input 
            type="text" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ex: How did they handle the deadlock challenge?"
            className="flex-1 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            onKeyDown={(e) => e.key === 'Enter' && askTwin()}
          />
          <button 
            onClick={askTwin}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Querying..." : "Verify"}
          </button>
        </div>

        {/* RESPONSE */}
        {answer && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border-l-4 border-blue-600 p-6 shadow-md"
          >
            <p className="text-xs text-blue-600 font-bold uppercase mb-2">Verified Memory Retrieval</p>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{answer}</p>
          </motion.div>
        )}

        {/* DISCLAIMER */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Powered by CareerForge W3C Verifiable Credentials. <br/>
            All answers are cryptographically signed by the candidate's execution logs.
          </p>
        </div>

      </div>
    </div>
  );
}