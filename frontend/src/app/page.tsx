
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500 selection:text-black overflow-x-hidden">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-900/10 backdrop-blur-md">
              <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">
                ● System Online
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
              Stop Applying. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                Start Commanding.
              </span>
            </h1>
            
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              CareerForge isn't a job board. It's a suite of 
              <span className="text-white font-bold"> Autonomous AI Agents </span> 
              that hunt jobs, tailor resumes, and negotiate salaries while you sleep.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Launch Console
              </Link>
              <Link 
                href="/resume"
                className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-bold rounded-xl border border-gray-800 hover:bg-gray-800 transition-colors"
              >
                Upload Resume
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* AGENT SHOWCASE (BENTO GRID) */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Hunter (Large) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden group hover:border-gray-700 transition-colors"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-green-900/30 rounded-xl flex items-center justify-center text-2xl mb-4 border border-green-500/20">
                🦅
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">The Job Hunter</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                A background agent that scans 50+ job boards 24/7. It filters out "ghost jobs" and only alerts you to 90%+ matches.
              </p>
              <div className="bg-black/50 border border-gray-800 rounded-xl p-4 font-mono text-xs text-green-400">
                {'>'} Found: Senior React Dev @ Vercel (98% Match)<br/>
                {'>'} Status: Auto-Added to Kanban
              </div>
            </div>
          </motion.div>

          {/* Card 2: Negotiator */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden group hover:border-gray-700 transition-colors"
          >
             <div className="w-12 h-12 bg-red-900/30 rounded-xl flex items-center justify-center text-2xl mb-4 border border-red-500/20">
                💰
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Salary Dojo</h3>
              <p className="text-gray-400 text-sm mb-4">
                Practice negotiating against a stingy AI Recruiter. Learn to counter "lowball" offers.
              </p>
          </motion.div>

          {/* Card 3: Resume Architect */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-900 border border-gray-800 rounded-3xl p-8 relative overflow-hidden group hover:border-gray-700 transition-colors"
          >
             <div className="w-12 h-12 bg-purple-900/30 rounded-xl flex items-center justify-center text-2xl mb-4 border border-purple-500/20">
                📄
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Resume Architect</h3>
              <p className="text-gray-400 text-sm mb-4">
                Auto-tailors your bullet points to the JD. "A/B Test" two versions to see which wins.
              </p>
          </motion.div>

          {/* Card 4: Network Sniper (Large) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 relative overflow-hidden group hover:border-gray-700 transition-colors"
          >
             <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
               <div className="flex-1">
                 <div className="w-12 h-12 bg-cyan-900/30 rounded-xl flex items-center justify-center text-2xl mb-4 border border-cyan-500/20">
                    🎯
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Network Sniper</h3>
                  <p className="text-gray-400">
                    Don't send generic spam. Our agent analyzes the hiring manager's LinkedIn and writes a hyper-personalized "Hook" that gets replies.
                  </p>
               </div>
               
               {/* Visual Mockup */}
               <div className="w-full md:w-1/2 bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-2xl transform rotate-2 group-hover:rotate-0 transition-transform">
                 <div className="flex gap-2 mb-3">
                   <div className="w-3 h-3 rounded-full bg-red-500"/>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"/>
                   <div className="w-3 h-3 rounded-full bg-green-500"/>
                 </div>
                 <div className="space-y-2">
                   <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                   <div className="h-2 bg-gray-700 rounded w-full"></div>
                   <div className="h-2 bg-gray-700 rounded w-5/6"></div>
                   <div className="mt-4 inline-block bg-cyan-600 text-[10px] text-black font-bold px-2 py-1 rounded">
                     Reply Probability: 92%
                   </div>
                 </div>
               </div>
             </div>
          </motion.div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-900 py-12 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} CareerForge AI. Built for the ambitious.</p>
      </footer>
    </div>
  );
}
