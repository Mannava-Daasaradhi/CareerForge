
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

// --- TYPES ---
interface Message {
  role: "user" | "ai";
  content: string;
  critique?: string; // The "Shadow Auditor" feedback
}

interface VibeMetrics {
  confidence_score: number;
  clarity_score: number;
  detected_fillers: number;
}

export default function InterviewPage() {
  // Session State
  const [sessionId, setSessionId] = useState<string>("");
  const [setup, setSetup] = useState({ topic: "System Design", difficulty: 50 });
  const [hasStarted, setHasStarted] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vibe, setVibe] = useState<VibeMetrics | null>(null);

  // Audio Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize Session
  useEffect(() => {
    // Check if we have an existing session, else create one
    let storedSession = localStorage.getItem("careerforge_session");
    if (!storedSession) {
      storedSession = crypto.randomUUID();
      localStorage.setItem("careerforge_session", storedSession);
    }
    setSessionId(storedSession);
  }, []);

  // --- ACTIONS ---

  const startInterview = async () => {
    setHasStarted(true);
    // Send a "warmup" ping to the backend to initialize the graph
    // We send a hidden system start message
    await sendMessage("READY_TO_START", true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic Error:", err);
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    const formData = new FormData();
    formData.append("audio", audioBlob, "input.webm");
    formData.append("topic", setup.topic);
    formData.append("difficulty", setup.difficulty.toString());
    formData.append("session_id", sessionId); // CRITICAL: Persistence
    formData.append("history", JSON.stringify([])); // Backend now handles history via graph memory, but we pass empty for compat

    try {
      const res = await fetch("http://localhost:8000/api/interview/voice-chat", {
        method: "POST",
        headers: {
             // "Authorization": "Bearer ..." // If using Auth
        },
        body: formData,
      });

      const data = await res.json();
      
      // Update UI
      if (data.user_text_processed) {
        setMessages(prev => [...prev, { role: "user", content: data.user_text_processed }]);
      }
      
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: data.reply,
        critique: data.critique !== "None" ? data.critique : undefined
      }]);

      if (data.vibe_metrics) {
        setVibe(data.vibe_metrics);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendMessage = async (text: string, isSystem = false) => {
    if (!text.trim()) return;
    
    if (!isSystem) {
        setMessages(prev => [...prev, { role: "user", content: text }]);
        setIsProcessing(true);
    }

    try {
      const res = await fetch("http://localhost:8000/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          topic: setup.topic,
          difficulty: setup.difficulty,
          session_id: sessionId,
          history: [] // Backend state handles this
        })
      });

      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: data.reply,
        critique: data.critique !== "None" ? data.critique : undefined
      }]);

    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- RENDER ---

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh] px-4">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-lg w-full bg-gray-900 border border-gray-800 p-8 rounded-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full" />
                <h1 className="text-3xl font-bold mb-6">Simulation Setup</h1>
                
                <div className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Topic</label>
                        <select 
                            value={setup.topic}
                            onChange={(e) => setSetup({ ...setup, topic: e.target.value })}
                            className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                        >
                            <option>System Design</option>
                            <option>React & Frontend</option>
                            <option>Python Backend</option>
                            <option>Behavioral</option>
                            <option>Algorithm (LeetCode)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                            Difficulty: {setup.difficulty}%
                        </label>
                        <input 
                            type="range" 
                            min="10" max="100" 
                            value={setup.difficulty}
                            onChange={(e) => setSetup({ ...setup, difficulty: parseInt(e.target.value) })}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                    </div>

                    <button 
                        onClick={startInterview}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-cyan-900/20"
                    >
                        Enter Interview Room
                    </button>
                </div>
            </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: VISUALIZATION & VIBE */}
        <section className="lg:col-span-1 space-y-6">
            
            {/* AVATAR / MICROPHONE */}
            <div className="aspect-square bg-gray-900 rounded-3xl border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden group">
                {isRecording && (
                    <div className="absolute inset-0 bg-red-500/10 animate-pulse" />
                )}
                
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording ? "scale-110 bg-red-500/20" : "bg-cyan-500/10"}`}>
                    <button 
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={`w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all ${isRecording ? "bg-red-500 shadow-red-500/50" : "bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/30"}`}
                    >
                        <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    </button>
                </div>
                <p className="mt-6 text-xs text-gray-500 uppercase tracking-widest font-bold">
                    {isRecording ? "Listening..." : "Hold to Speak"}
                </p>
            </div>

            {/* VIBE CHECK METRICS */}
            <AnimatePresence>
                {vibe && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900 rounded-2xl border border-gray-800 p-6"
                    >
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Voice Analytics</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Confidence</span>
                                    <span className={vibe.confidence_score < 60 ? "text-red-400" : "text-green-400"}>{vibe.confidence_score}%</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${vibe.confidence_score < 60 ? "bg-red-500" : "bg-green-500"}`}
                                        style={{ width: `${vibe.confidence_score}%` }} 
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm border-t border-gray-800 pt-4">
                                <span className="text-gray-400">Filler Words</span>
                                <span className={`font-mono font-bold ${vibe.detected_fillers > 2 ? "text-yellow-500" : "text-gray-200"}`}>
                                    {vibe.detected_fillers} detected
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </section>

        {/* RIGHT: CHAT STREAM */}
        <section className="lg:col-span-2 flex flex-col h-[80vh] bg-gray-900/50 rounded-3xl border border-gray-800 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-cyan-900 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none'}`}>
                            {msg.content}
                        </div>

                        {/* SHADOW CRITIQUE (The Unique Feature) */}
                        {msg.critique && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-2 mr-2 max-w-[80%] bg-orange-900/20 border border-orange-500/30 text-orange-200 text-xs p-3 rounded-lg flex gap-2 items-start"
                            >
                                <span className="text-orange-500 text-base">⚠</span>
                                <div>
                                    <span className="font-bold uppercase text-[10px] tracking-wider text-orange-500 block mb-1">Feedback</span>
                                    {msg.critique}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ))}
                
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-100" />
                            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-200" />
                        </div>
                    </div>
                )}
            </div>

            {/* TEXT INPUT FALLBACK */}
            <div className="p-4 bg-black border-t border-gray-800">
                <input 
                    type="text"
                    placeholder="Type if you can't speak..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 transition-colors"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage(e.currentTarget.value);
                            e.currentTarget.value = "";
                        }
                    }}
                />
            </div>
        </section>

      </main>
    </div>
  );
}
