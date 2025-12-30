// frontend/src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { getApplications, getPassport, Application } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ applied: 0, interviews: 0, offers: 0, rejected: 0 });
  const [passport, setPassport] = useState<any>(null);
  const [username, setUsername] = useState("mannava"); // Default for demo
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Parallel Fetch
      const [apps, pass] = await Promise.all([
        getApplications().catch(() => []), 
        getPassport(username).catch(() => null)
      ]);

      // Process Kanban Stats
      const counts = { applied: 0, interviews: 0, offers: 0, rejected: 0 };
      (apps as Application[]).forEach(app => {
        if (app.status === 'Applied') counts.applied++;
        if (app.status === 'Interview') counts.interviews++;
        if (app.status === 'Offer') counts.offers++;
        if (app.status === 'Rejected') counts.rejected++;
      });
      setStats(counts);

      // Set Passport
      setPassport(pass);
    } catch (e) {
      console.error("Dashboard Load Failed", e);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { title: "JOB_HUNTER", path: "/hunter", icon: "📡", color: "text-purple-400", border: "border-purple-500/30", desc: "Agentic Search & Market Analysis" },
    { title: "RESUME_FORGE", path: "/resume", icon: "📄", color: "text-yellow-400", border: "border-yellow-500/30", desc: "Deep Audit & AI Tailoring" },
    { title: "KANBAN_OPS", path: "/kanban", icon: "🏗️", color: "text-blue-400", border: "border-blue-500/30", desc: "Mission Control & Recovery Agents" },
    { title: "INTERVIEW_SIM", path: "/interview", icon: "🎙️", color: "text-red-400", border: "border-red-500/30", desc: "Voice Analysis & Shadow Auditor" },
    { title: "RECRUITER_TWIN", path: "/recruiter", icon: "👤", color: "text-cyan-400", border: "border-cyan-500/30", desc: "Simulate Specific Interviewers" },
    { title: "NETWORK_NEXUS", path: "/outreach", icon: "🤝", color: "text-green-400", border: "border-green-500/30", desc: "Proof-Based Cold Outreach" },
  ];

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-12 border-b border-gray-800 pb-6">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">COMMAND_CENTER</h1>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    SYSTEM ONLINE // USER: {username.toUpperCase()}
                </div>
            </div>
            <div className="text-right hidden md:block">
                <p className="text-3xl font-bold text-gray-700">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <p className="text-xs text-gray-600">LOCAL_TIME</p>
            </div>
        </div>

        {/* TOP ROW: STATS & PASSPORT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            
            {/* 1. KANBAN STATUS */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-lg text-center">
                    <p className="text-3xl font-bold text-white mb-1">{stats.applied}</p>
                    <p className="text-[10px] text-gray-500 uppercase">Active Applications</p>
                </div>
                <div className="bg-blue-900/10 border border-blue-900/30 p-6 rounded-lg text-center">
                    <p className="text-3xl font-bold text-blue-400 mb-1">{stats.interviews}</p>
                    <p className="text-[10px] text-blue-300/70 uppercase">Interviews Pending</p>
                </div>
                <div className="bg-green-900/10 border border-green-900/30 p-6 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-400 mb-1">{stats.offers}</p>
                    <p className="text-[10px] text-green-300/70 uppercase">Offers Received</p>
                </div>
                <div className="bg-red-900/10 border border-red-900/30 p-6 rounded-lg text-center">
                    <p className="text-3xl font-bold text-red-400 mb-1">{stats.rejected}</p>
                    <p className="text-[10px] text-red-300/70 uppercase">Recovery Tasks</p>
                </div>
            </div>

            {/* 2. PASSPORT MINI-VIEW */}
            <div className="bg-black border border-gray-800 p-6 rounded-lg relative overflow-hidden flex flex-col justify-between group hover:border-gray-600 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🛡️</div>
                <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Identity Matrix</h3>
                    <div className="flex items-end gap-2 mb-2">
                        <span className={`text-4xl font-bold ${passport ? 'text-white' : 'text-gray-700'}`}>
                            {passport ? passport.github_trust_score : '--'}
                        </span>
                        <span className="text-sm text-gray-500 mb-1">/ 100</span>
                    </div>
                    <p className="text-xs text-gray-400">GitHub Trust Score</p>
                </div>
                <Link href="/passport" className="mt-4 text-xs text-blue-500 hover:text-white flex items-center gap-1">
                    VIEW FULL PASSPORT &rarr;
                </Link>
            </div>
        </div>

        {/* MODULE GRID */}
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 border-l-4 border-gray-700 pl-4">Operational Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, idx) => (
                <Link href={item.path} key={idx}>
                    <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className={`bg-gray-900/30 border ${item.border} p-6 rounded-lg h-full flex flex-col justify-between hover:bg-gray-800 transition-colors cursor-pointer group`}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-3xl bg-black p-3 rounded-lg border border-gray-800 group-hover:border-gray-600 transition-colors">{item.icon}</span>
                                <span className="text-[10px] text-gray-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">LAUNCH &rarr;</span>
                            </div>
                            <h3 className={`text-xl font-bold ${item.color} mb-2`}>{item.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>

      </div>
    </div>
  );
}