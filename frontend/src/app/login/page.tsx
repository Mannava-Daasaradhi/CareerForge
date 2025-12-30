// frontend/src/app/login/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/api'; // Uses the client we initialized in api.ts

export default function LoginPage() {
  const router = useRouter();
  
  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login/Register
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  const handleAuth = async () => {
    if (!email || !password) {
        addLog("ERROR: MISSING CREDENTIALS");
        return;
    }

    setLoading(true);
    setLogs([]); // Clear previous logs
    addLog(`INITIATING ${isSignUp ? 'REGISTRATION' : 'LOGIN'} SEQUENCE...`);
    addLog(`TARGET: ${email}`);

    try {
        await new Promise(r => setTimeout(r, 500)); // Dramatic pause
        
        let error = null;
        
        if (isSignUp) {
            // REGISTER
            const res = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username: email.split('@')[0] } // Default username from email
                }
            });
            error = res.error;
            if (!error) addLog("USER_CREATED. CHECK EMAIL FOR VERIFICATION (IF ENABLED).");
        } else {
            // LOGIN
            const res = await supabase.auth.signInWithPassword({
                email,
                password
            });
            error = res.error;
        }

        if (error) {
            throw error;
        }

        addLog("AUTHENTICATION SUCCESSFUL.");
        addLog("HANDSHAKE COMPLETE. TOKEN ACQUIRED.");
        addLog("REDIRECTING TO COMMAND_CENTER...");
        
        // Wait a moment so user sees the success message
        setTimeout(() => {
            router.push('/dashboard');
        }, 1000);

    } catch (err: any) {
        addLog(`FATAL ERROR: ${err.message || "CONNECTION REFUSED"}`);
        addLog("ACCESS DENIED.");
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col items-center justify-center p-4 selection:bg-green-900 overflow-hidden">
      
      {/* MATRIX BACKGROUND GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,50,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,50,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* FLOATING PARTICLES (Simple CSS animation) */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
         <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-green-500 rounded-full animate-ping delay-700"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-lg border border-green-800 bg-black/90 shadow-[0_0_50px_rgba(0,255,0,0.1)] p-8 rounded-sm backdrop-blur relative"
      >
        {/* CORNER DECORATIONS */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>

        {/* HEADER */}
        <div className="mb-8 text-center border-b border-green-900 pb-4">
          <h1 className="text-3xl font-bold tracking-tighter text-white mb-1">CAREER_FORGE <span className="text-green-500 text-xs align-top">v5.3</span></h1>
          <p className="text-xs text-green-700 uppercase tracking-[0.2em]">Secure Access Portal</p>
        </div>

        {/* FORM */}
        <div className="space-y-5 relative z-20">
            
            <div className="space-y-1">
                <label className="text-[10px] uppercase text-green-600 font-bold">User Identity (Email)</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-green-900/10 border border-green-800 text-white p-3 focus:border-green-400 outline-none transition-all placeholder-green-900/50"
                    placeholder="agent@careerforge.io"
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] uppercase text-green-600 font-bold">Access Key (Password)</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                    className="w-full bg-green-900/10 border border-green-800 text-white p-3 focus:border-green-400 outline-none transition-all placeholder-green-900/50"
                    placeholder="••••••••••••"
                />
            </div>

            {/* ACTION BUTTON */}
            <button 
                onClick={handleAuth}
                disabled={loading}
                className={`w-full py-4 font-bold uppercase tracking-widest text-sm transition-all border ${
                    loading 
                    ? 'bg-green-900/20 border-green-800 text-green-700 cursor-wait' 
                    : 'bg-green-600 hover:bg-green-500 text-black border-transparent hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                }`}
            >
                {loading ? 'Processing Handshake...' : isSignUp ? 'Initialize_Account' : 'Authenticate_Session'}
            </button>
            
            {/* TOGGLE MODE */}
            <div className="text-center pt-2">
                <button 
                    onClick={() => { setIsSignUp(!isSignUp); setLogs([]); }}
                    className="text-xs text-green-600 hover:text-green-400 underline decoration-green-800 underline-offset-4"
                >
                    {isSignUp ? "Already have an identity? Login" : "Need credentials? Register New Agent"}
                </button>
            </div>

        </div>

        {/* TERMINAL OUTPUT */}
        <div className="mt-8 bg-black border border-green-900/50 p-4 h-32 overflow-y-auto font-mono text-xs shadow-inner">
            <div className="text-green-800 mb-2 select-none">--- SYSTEM LOGS ---</div>
            <AnimatePresence>
                {logs.length === 0 && <span className="text-green-900/50 italic">Waiting for input...</span>}
                {logs.map((log, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-green-400/90 mb-1"
                    >
                        {log}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>

      </motion.div>
      
      {/* FOOTER */}
      <div className="fixed bottom-4 text-[10px] text-green-900">
        ENCRYPTED CONNECTION // NODE_ID: CF-520-SECURE
      </div>

    </div>
  );
}