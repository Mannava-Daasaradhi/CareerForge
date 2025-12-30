"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/api'; // Integrated your real backend

export default function LoginPage() {
  const router = useRouter();
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // UI State
  const [status, setStatus] = useState<"idle" | "authenticating" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [decryptedPass, setDecryptedPass] = useState("");

  // --- DECRYPTION EFFECT ---
  // Simulates password decrypting characters as you type
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*";
    let iterations = 0;
    const interval = setInterval(() => {
      setDecryptedPass(password.split("").map((char, index) => {
        if (index < iterations) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join(""));
      
      if (iterations >= password.length) clearInterval(interval);
      iterations += 1 / 3;
    }, 30);
    return () => clearInterval(interval);
  }, [password]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  const handleAuth = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) {
        setStatus("error");
        addLog("ERROR: MISSING CREDENTIALS");
        return;
    }

    setStatus("authenticating");
    setLogs([]);
    addLog(`INITIATING ${isSignUp ? 'REGISTRATION' : 'LOGIN'} PROTOCOL...`);
    addLog(`TARGET IDENTITY: ${email}`);

    try {
        // Aesthetic Delay
        await new Promise(r => setTimeout(r, 800)); 
        
        let error = null;
        
        if (isSignUp) {
            const res = await supabase.auth.signUp({
                email,
                password,
                options: { data: { username: email.split('@')[0] } }
            });
            error = res.error;
            if (!error) addLog("USER_CREATED. CHECK VERIFICATION LINK.");
        } else {
            const res = await supabase.auth.signInWithPassword({
                email,
                password
            });
            error = res.error;
        }

        if (error) throw error;

        setStatus("success");
        addLog("AUTHENTICATION SUCCESSFUL.");
        addLog("BIOMETRIC HANDSHAKE COMPLETE.");
        
        setTimeout(() => router.push('/dashboard'), 1500);

    } catch (err: any) {
        setStatus("error");
        addLog(`FATAL ERROR: ${err.message || "CONNECTION REFUSED"}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-mono flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-cyan-500 selection:text-black">
      
      {/* BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-md bg-gray-900/80 backdrop-blur-xl border border-gray-800 p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.1)] relative overflow-hidden"
      >
        {/* PROGRESS BAR LINE */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-800">
             {status === "authenticating" && (
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" 
                />
             )}
             {status === "success" && <div className="h-full w-full bg-green-500" />}
             {status === "error" && <div className="h-full w-full bg-red-500" />}
        </div>

        {/* HEADER */}
        <div className="mb-8 text-center">
            <div className="w-12 h-12 bg-cyan-900/30 rounded-xl flex items-center justify-center text-cyan-400 font-black text-xl mx-auto mb-4 border border-cyan-500/30">
                CF
            </div>
            <h1 className="text-xl font-bold tracking-widest text-white mb-1">SYSTEM ACCESS</h1>
            <p className="text-[10px] text-cyan-500 uppercase tracking-[0.2em]">Secure Node v5.4</p>
        </div>

        {/* SUCCESS STATE (BIOMETRIC) */}
        {status === "success" ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 text-center">
                <div className="w-20 h-20 mx-auto border-4 border-green-500 rounded-full flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-green-400 font-bold text-lg tracking-widest">IDENTITY VERIFIED</h2>
                <p className="text-xs text-gray-500 mt-2">Redirecting to Command Center...</p>
             </motion.div>
        ) : (
            /* FORM */
            <form onSubmit={handleAuth} className="space-y-6 relative z-20">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Agent ID</label>
                    <div className="relative group">
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-gray-700 text-white p-3 pl-10 rounded-lg focus:border-cyan-500 outline-none transition-all font-mono group-hover:border-gray-600"
                            placeholder="agent@careerforge.io"
                            disabled={status === "authenticating"}
                        />
                        <span className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyan-500 transition-colors">✉️</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Passkey</label>
                    <div className="relative group">
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-gray-700 text-white p-3 pl-10 rounded-lg focus:border-cyan-500 outline-none transition-all font-mono group-hover:border-gray-600 tracking-widest"
                            placeholder="••••••••"
                            disabled={status === "authenticating"}
                        />
                        <span className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-cyan-500 transition-colors">🔑</span>
                        
                        {/* DECRYPTION VISUAL OVERLAY (Optional fancy effect) */}
                        {password.length > 0 && (
                             <div className="absolute right-3 top-3.5 text-[10px] text-cyan-500/50 pointer-events-none hidden sm:block">
                                {decryptedPass.substring(0, 8)}
                             </div>
                        )}
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={status === "authenticating"}
                    className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
                >
                    {status === "authenticating" ? (
                        <>
                           <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                           Decyphering...
                        </>
                    ) : isSignUp ? "INITIALIZE AGENT" : "AUTHENTICATE"}
                </button>
                
                <div className="text-center pt-2">
                    <button 
                        type="button"
                        onClick={() => { setIsSignUp(!isSignUp); setLogs([]); setStatus("idle"); }}
                        className="text-xs text-gray-500 hover:text-cyan-400 transition-colors"
                    >
                        {isSignUp ? "Already have an ID? Login" : "New Agent? Register"}
                    </button>
                </div>
            </form>
        )}

        {/* TERMINAL LOGS */}
        <div className="mt-8 bg-black/50 border-t border-gray-800 p-4 h-24 overflow-y-auto font-mono text-[10px] rounded-b-xl">
            {logs.length === 0 && <span className="text-gray-700 italic">_ waiting for input...</span>}
            {logs.map((log, i) => (
                <div key={i} className="text-cyan-500/80 mb-1">{log}</div>
            ))}
        </div>

      </motion.div>

      <footer className="absolute bottom-4 text-[10px] text-gray-700 font-mono">
        ENCRYPTED CONNECTION // SHA-256
      </footer>

    </div>
  );
}