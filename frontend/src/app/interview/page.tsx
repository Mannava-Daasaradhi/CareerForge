"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { sendChatMessage, Message } from "../../lib/api";

function InterviewContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("user") || "Candidate";
  const trustScore = searchParams.get("score") || "0";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage(input, messages);
      const aiMsg: Message = { role: "ai", content: response.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(Chat Error: ${error});
      const errorMsg: Message = { role: "ai", content: "⚠️ Connection Lost." };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <main className="flex flex-col h-screen bg-black text-gray-200 font-mono">
      {/* Dynamic Header */}
      <div className="border-b border-gray-800 p-4 bg-gray-900/50 flex justify-between items-center">
        <div>
           <h1 className="text-xl font-bold text-emerald-500">
            CareerForge_<span className="text-white">Terminal</span>
          </h1>
          <p className="text-xs text-gray-500">User: {username}</p>
        </div>
       
        <div className="text-right">
          <div className="text-xs text-gray-500">TRUST SCORE</div>
          <div className={`text-xl font-bold ${parseInt(trustScore) > 70 ? 'text-emerald-400' : 'text-yellow-500'}`}>
            {trustScore}/100
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="mb-2">System initialized for {username}.</p>
            <p>Trust Level: {parseInt(trustScore) > 70 ? "HIGH - Standard Protocol" : "LOW - Sandboxed Mode"}</p>
            <p className="mt-4">Type "Ready" to begin.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-lg border ${
                msg.role === "user" ? "bg-emerald-900/20 border-emerald-500/30 text-emerald-100" : "bg-gray-900 border-gray-700 text-gray-300"
              }`}>
              <strong className="block text-xs mb-1 opacity-50">{msg.role === "user" ? "YOU" : "AI_INTERVIEWER"}</strong>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg text-emerald-500 text-sm">
              Analyzing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/30">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here..."
            className="flex-1 bg-black border border-gray-700 rounded-md p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            disabled={loading}
          />
          <button onClick={handleSend} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-6 py-2 rounded-md transition-colors disabled:opacity-50">
            SEND
          </button>
        </div>
      </div>
    </main>
  );
}

// Wrap in Suspense for Next.js 13+ SearchParams support
export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Loading Terminal...</div>}>
      <InterviewContent />
    </Suspense>
  );
}