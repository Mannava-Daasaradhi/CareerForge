// frontend/src/app/interview/page.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendChatMessage } from '@/lib/api';
import Navbar from '@/components/Navbar';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface VibeMetrics {
  confidence_score: number;
  clarity_score: number;
  wpm?: number;
}

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [critique, setCritique] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<VibeMetrics | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState("");
  
  // Media Recorder Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Scroll to bottom
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- VOICE HANDLERS ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        audioChunksRef.current = [];
        await handleVoiceUpload(audioBlob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceUpload = async (audioBlob: Blob) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice_input.wav");
    formData.append("history", JSON.stringify(messages));
    formData.append("topic", "System Design"); // Default for now
    formData.append("difficulty", "50");

    try {
      // Direct fetch to main.py endpoint
      const res = await fetch("http://localhost:8000/api/interview/voice-chat", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      // Update UI
      setMessages(prev => [
        ...prev, 
        { role: 'user', content: `🎤 ${data.user_text_processed}` },
        { role: 'ai', content: data.reply }
      ]);
      setCritique(data.critique);
      setMetrics(data.vibe_metrics);
    } catch (e) {
      alert("Voice processing failed.");
    } finally {
      setLoading(false);
    }
  };

  // --- TEXT HANDLER ---
  const handleTextSubmit = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    const tempText = inputText;
    setInputText("");
    
    // Optimistic Update
    setMessages(prev => [...prev, { role: 'user', content: tempText }]);

    try {
      const data = await sendChatMessage(tempText, messages);
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      setCritique(data.critique);
    } catch (e) {
      alert("Message failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono overflow-hidden flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex max-w-7xl mx-auto w-full p-6 gap-6 h-[calc(100vh-80px)]">
        
        {/* LEFT: INTERVIEW INTERFACE */}
        <div className="flex-1 flex flex-col bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden relative">
            
            {/* Live Status Header */}
            <div className="bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-400">LIVE SESSION // SYSTEM DESIGN</span>
                </div>
                {loading && <span className="text-xs text-yellow-500 animate-pulse">AI IS THINKING...</span>}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 && (
                    <div className="text-center text-gray-600 mt-20">
                        <p className="text-4xl mb-4">🎙️</p>
                        <p>Start speaking or typing to begin your mock interview.</p>
                    </div>
                )}
                
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-lg text-sm leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-blue-900/20 border border-blue-900/50 text-blue-100' 
                                : 'bg-gray-800 border border-gray-700 text-gray-200'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex gap-4">
                    <button 
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onMouseLeave={stopRecording}
                        disabled={loading}
                        className={`p-4 rounded-full transition-all border ${
                            isRecording 
                                ? 'bg-red-900/50 border-red-500 text-red-500 scale-110 shadow-[0_0_20px_rgba(220,38,38,0.5)]' 
                                : 'bg-gray-800 border-gray-600 text-gray-400 hover:text-white hover:border-gray-400'
                        }`}
                    >
                        {isRecording ? "⬛" : "🎙️"}
                    </button>
                    
                    <input 
                        className="flex-1 bg-black border border-gray-700 rounded p-4 text-white focus:border-blue-500 outline-none"
                        placeholder="Type your answer..."
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
                        disabled={loading || isRecording}
                    />
                    
                    <button 
                        onClick={handleTextSubmit}
                        disabled={loading || !inputText}
                        className="px-6 bg-blue-900/20 border border-blue-600 text-blue-400 font-bold rounded hover:bg-blue-600 hover:text-white transition-colors disabled:opacity-50"
                    >
                        SEND
                    </button>
                </div>
                <p className="text-[10px] text-gray-600 mt-2 text-center">
                    {isRecording ? "RELEASE TO SEND" : "HOLD MIC TO SPEAK"}
                </p>
            </div>
        </div>

        {/* RIGHT: SHADOW AUDITOR & METRICS */}
        <div className="w-[350px] flex flex-col gap-6">
            
            {/* 1. Vibe Metrics Card */}
            <div className="bg-black border border-gray-800 p-6 rounded-lg">
                <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-widest">Voice Analytics</h3>
                
                {metrics ? (
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Confidence</span>
                                <span className={metrics.confidence_score > 70 ? "text-green-500" : "text-red-500"}>{metrics.confidence_score}%</span>
                            </div>
                            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${metrics.confidence_score}%` }}
                                    className={`h-full ${metrics.confidence_score > 70 ? 'bg-green-500' : 'bg-red-500'}`}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Clarity</span>
                                <span className="text-blue-500">{metrics.clarity_score}%</span>
                            </div>
                            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${metrics.clarity_score}%` }}
                                    className="h-full bg-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-gray-600 italic text-center py-4">Speak to see metrics...</p>
                )}
            </div>

            {/* 2. The Shadow Auditor */}
            <div className="flex-1 bg-red-900/5 border border-red-900/20 rounded-lg p-6 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl text-red-500">👁️</div>
                
                <h3 className="text-xs font-bold text-red-500 mb-2 uppercase tracking-widest flex items-center gap-2">
                    <span>Shadow Protocol</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                </h3>
                
                <div className="flex-1 overflow-y-auto">
                    <AnimatePresence mode='wait'>
                        {critique ? (
                            <motion.div 
                                key={critique}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-sm text-gray-300 italic leading-relaxed border-l-2 border-red-800 pl-4 py-2"
                            >
                                "{critique}"
                            </motion.div>
                        ) : (
                            <p className="text-xs text-gray-700 mt-4">Monitoring interview for technical gaps and nervous tics...</p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
}