"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
interface Message {
  role: 'user' | 'ai';
  content: string;
  metrics?: {
    confidence_score: number;
    clarity_score: number;
    detected_fillers: number;
  };
}

export default function InterviewPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "I am your Lead Interviewer. I'm listening. Tell me about a time you optimized a slow database query." }
  ]);
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  
  // Refs for Audio Capture
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 1. START RECORDING
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

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Chrome/Firefox standard
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        // Auto-send after stop (Optional, but smoother)
        handleSubmission(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      alert("Microphone Access Denied. Please enable permissions.");
    }
  };

  // 2. STOP RECORDING
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // 3. SEND TO BACKEND
  const handleSubmission = async (audioBlob: Blob) => {
    setProcessing(true);
    
    const formData = new FormData();
    // Rename to .webm so backend Whisper knows how to handle it
    formData.append("audio", audioBlob, "input.webm"); 
    formData.append("topic", "System Design"); // Hardcoded for demo
    formData.append("difficulty", "75");
    
    // Convert history to string for FormData
    const historyPayload = JSON.stringify(messages.map(m => ({
      role: m.role,
      content: m.content
    })));
    formData.append("history", historyPayload);

    try {
      const res = await fetch('http://localhost:8000/api/interview/voice-chat', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error("Voice uplink failed");

      const data = await res.json();
      
      // Update Chat
      setMessages(prev => [
        ...prev,
        { role: 'user', content: data.user_text_processed }, // The text transcribed from voice
        { 
          role: 'ai', 
          content: data.reply,
          metrics: data.vibe_metrics // Attach the Vibe Check data
        }
      ]);

    } catch (e) {
      alert("Error processing voice. Check backend console.");
    } finally {
      setProcessing(false);
      setAudioURL(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 flex flex-col items-center">
      
      {/* HEADER */}
      <div className="w-full max-w-2xl border-b border-gray-800 pb-4 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-blue-500 tracking-tight">VOICE_UPLINK_V3</h1>
          <p className="text-xs text-blue-800">AUDIO FORENSICS ACTIVE</p>
        </div>
        <div className="text-xs text-right">
          {processing ? <span className="text-yellow-500 animate-pulse">PROCESSING...</span> : <span className="text-green-500">READY</span>}
        </div>
      </div>

      {/* CHAT STREAM */}
      <div className="flex-1 w-full max-w-2xl overflow-y-auto space-y-6 mb-24 pr-2">
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: msg.role === 'ai' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex flex-col ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}
          >
            <div className={`max-w-[85%] p-4 rounded-sm border ${
              msg.role === 'ai' 
                ? 'border-blue-900 bg-blue-900/10 text-blue-100' 
                : 'border-gray-700 bg-gray-900 text-gray-300'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
            </div>

            {/* VIBE HUD (Only for AI responses) */}
            {msg.metrics && (
              <div className="mt-2 flex gap-4 text-xs font-bold uppercase tracking-wider">
                <div className={`${msg.metrics.confidence_score > 70 ? 'text-green-500' : 'text-red-500'}`}>
                  Confidence: {msg.metrics.confidence_score}%
                </div>
                <div className="text-gray-500">
                  Fillers: {msg.metrics.detected_fillers}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* CONTROLS */}
      <div className="fixed bottom-8 w-full max-w-2xl flex gap-4 justify-center">
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          disabled={processing}
          className={`
            w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all
            ${recording 
              ? 'border-red-500 bg-red-500/20 scale-110 shadow-[0_0_30px_rgba(255,0,0,0.5)]' 
              : 'border-gray-700 bg-gray-900 hover:border-blue-500 hover:bg-blue-900/20'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {recording ? (
            <div className="w-8 h-8 bg-red-500 rounded-sm animate-pulse" />
          ) : (
            <div className="w-0 h-0 border-l-[15px] border-l-gray-400 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1" />
          )}
        </button>
      </div>

      <div className="fixed bottom-2 text-[10px] text-gray-600">
        HOLD SPACEBAR OR CLICK TO RECORD
      </div>
    </div>
  );
}