// FILE: frontend/src/app/interview/page.tsx
"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { sendChatMessage, Message, startTelemetry, trackKeystroke } from "../../lib/api";

function InterviewContent() {
  const searchParams = useSearchParams();
  const username = searchParams.get("user") || "Candidate";
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  // Trust Engine State
  const [trustScore, setTrustScore] = useState(50);
  const [difficulty, setDifficulty] = useState("Standard");
  const [redTeamAlert, setRedTeamAlert] = useState<string | null>(null);
  const [pivotTriggered, setPivotTriggered] = useState(false);

  // Twin Mode State (Post-Interview)
  const [showTwin, setShowTwin] = useState(false);
  const [twinQuery, setTwinQuery] = useState("");
  const [twinResponse, setTwinResponse] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    startTelemetry(); // Start tracking forensics on load/update
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setRedTeamAlert(null); // Clear previous alerts

    try {
      const response = await sendChatMessage(input, messages, sessionId);
      
      // Update Session
      if (!sessionId) setSessionId(response.session_id);

      const aiMsg: Message = { role: "ai", content: response.reply };
      setMessages((prev) => [...prev, aiMsg]);
      
      // Update HUD
      setTrustScore(response.trust_score);
      setDifficulty(response.difficulty);
      setPivotTriggered(response.pivot_triggered);
      
      // Handle Red Team Flags (Engine 4)
      if (response.red_team_flag && response.red_team_flag !== "None") {
        setRedTeamAlert(response.red_team_flag);
      }
      
      // Reset Forensics
      startTelemetry();
      
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "ai", content: "⚠️ Connection Lost to CareerForge Engine." }]);
    } finally {
      setLoading(false);
    }
  };

  // Engine 6: Chat with Digital Twin
  const handleTwinChat = async () => {
    if (!twinQuery || !sessionId) return;
    try {
      const res = await fetch("http://localhost:8000/twin-chat?query=" + twinQuery + "&session_id=" + sessionId, {
        method: "POST"
      });
      const data = await res.json();
      setTwinResponse(data.reply);
    } catch (e) {
      setTwinResponse("Error contacting Digital Twin.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    trackKeystroke();
    if (e.key === "Enter") handleSend();
  };

  // Visual Styles based on "Hardcore" mode
  const isHardcore = difficulty === "Hardcore";
  const scoreColor = trustScore > 70 ? "text-emerald-400" : trustScore < 40 ? "text-red-500" : "text-yellow-500";
  const borderColor = isHardcore ? "border-red-900 bg-red-950/20" : "border-emerald-500/30 bg-emerald-900/20";

  return (
    <main className={`flex flex-col h-screen font-mono text-gray-200 bg-black transition-colors duration-500 ${isHardcore ? 'selection:bg-red-900' : ''}`}>
      
      {/* --- HUD HEADER --- */}
      <div className={`border-b p-4 flex justify-between items-center bg-gray-900/50 ${isHardcore ? 'border-red-600' : 'border-gray-800'}`}>
        <div>
           <h1 className="text-xl font-bold flex items-center gap-2">
            CareerForge_<span className="text-white">Terminal</span>
            {isHardcore && <span className="text-xs bg-red-600 text-black px-2 py-1 rounded animate-pulse">HARDCORE MODE</span>}
          </h1>
          <p className="text-xs text-gray-500">Subject: {username} | Session: {sessionId ? sessionId.slice(0,8) : "Initializing..."}</p>
        </div>
       
        <div className="flex gap-6 text-right">
           <button onClick={() => setShowTwin(!showTwin)} className="text-xs border border-gray-600 px-3 py-1 rounded hover:bg-gray-800 transition">
             {showTwin ? "RETURN TO INTERVIEW" : "OPEN DIGITAL TWIN"}
           </button>
          <div>
            <div className="text-xs text-gray-500">TRUST SCORE</div>
            <div className={`text-3xl font-bold ${scoreColor}`}>
              {trustScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* --- ALERTS AREA (Engine 3 & 4) --- */}
      {redTeamAlert && (
        <div className="bg-red-900/50 border-b border-red-500 p-2 text-center text-red-200 text-sm font-bold animate-pulse">
          🚨 RED TEAM ALERT: {redTeamAlert}
        </div>
      )}
      {pivotTriggered && !redTeamAlert && (
        <div className="bg-yellow-900/50 border-b border-yellow-500 p-2 text-center text-yellow-200 text-sm">
          ⚠️ PIVOT DETECTED: The Auditor is challenging your depth.
        </div>
      )}

      {/* --- MAIN INTERFACE --- */}
      {showTwin ? (
        // ENGINE 6: TWIN INTERFACE
        <div className="flex-1 p-10 flex flex-col items-center justify-center space-y-6">
           <h2 className="text-2xl text-emerald-400 font-bold">Verified Digital Twin</h2>
           <p className="text-gray-400 text-center max-w-lg">
             This agent represents the candidate's verified knowledge from the interview session.
             Recruiters can query it to check depth without calling the candidate.
           </p>
           <div className="w-full max-w-2xl bg-gray-900 p-6 rounded-lg border border-gray-700">
             {twinResponse && (
               <div className="mb-4 p-4 bg-black border-l-4 border-emerald-500 text-gray-300">
                 {twinResponse}
               </div>
             )}
             <div className="flex gap-2">
               <input 
                 className="flex-1 bg-black border border-gray-600 p-2 text-white"
                 placeholder="Ask the Twin (e.g., 'How do you handle API errors?')"
                 value={twinQuery}
                 onChange={(e) => setTwinQuery(e.target.value)}
               />
               <button onClick={handleTwinChat} className="bg-emerald-600 text-black font-bold px-4 rounded">ASK</button>
             </div>
           </div>
        </div>
      ) : (
        // STANDARD INTERVIEW INTERFACE
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20 opacity-50">
              <p>System Initialized.</p>
              <p>Type "Ready" to begin the verification protocol.</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-3 rounded-lg border ${
                  msg.role === "user" ? borderColor : "bg-gray-900 border-gray-700 text-gray-300"
                }`}>
                <strong className="block text-xs mb-1 opacity-50">{msg.role === "user" ? "YOU" : "AI_INTERVIEWER"}</strong>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-pulse">
              <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg text-emerald-500 text-sm">
                Analysing Behavioral Metrics...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* --- INPUT AREA --- */}
      {!showTwin && (
        <div className="p-4 border-t border-gray-800 bg-gray-900/30">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isHardcore ? "Prove your logic. Code required." : "Type your answer here..."}
              className={`flex-1 bg-black border rounded-md p-3 text-white focus:outline-none transition-colors ${
                  isHardcore ? "border-red-500 focus:border-red-400 placeholder-red-900" : "border-gray-700 focus:border-emerald-500"
              }`}
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading} className={`font-bold px-6 py-2 rounded-md transition-colors disabled:opacity-50 ${
                isHardcore ? "bg-red-600 hover:bg-red-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-black"
            }`}>
              SEND
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Initializing Engines...</div>}>
      <InterviewContent />
    </Suspense>
  );
}