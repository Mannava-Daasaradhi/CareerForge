"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock User State (In prod, use AuthContext)
  const userScore = 78; 

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Command Center", href: "/dashboard", icon: "📊" },
    { name: "Job Hunter", href: "/hunter", icon: "🦅" },
    { name: "Mission Control", href: "/kanban", icon: "🚀" },
    { name: "Skill Tree", href: "/roadmap", icon: "🌳" },
  ];

  const toolsLinks = [
    { name: "Resume Architect", href: "/resume", icon: "📄" },
    { name: "Interview Sim", href: "/interview", icon: "🎙️" },
    { name: "Salary Dojo", href: "/negotiator", icon: "💰" },
    { name: "Network Sniper", href: "/outreach", icon: "🎯" },
    { name: "Proving Ground", href: "/challenge", icon: "⚡" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
          scrolled ? "bg-black/80 backdrop-blur-md border-gray-800 py-3" : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-black font-black text-lg group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              C
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Career<span className="text-cyan-400">Forge</span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`
                  px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                  ${isActive(link.href) 
                    ? "bg-gray-800 text-cyan-400 shadow-inner" 
                    : "text-gray-400 hover:text-white hover:bg-gray-900"}
                `}
              >
                <span>{link.icon}</span>
                {link.name}
              </Link>
            ))}

            {/* TOOLS DROPDOWN TRIGGER (Simple Hover for Demo) */}
            <div className="relative group ml-2">
              <button className="px-4 py-2 rounded-lg text-sm font-bold text-gray-400 hover:text-white hover:bg-gray-900 flex items-center gap-2">
                <span>🛠️</span> Tools ▾
              </button>
              
              {/* DROPDOWN MENU */}
              <div className="absolute top-full right-0 pt-2 w-56 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden">
                   {toolsLinks.map((tool) => (
                     <Link 
                       key={tool.href}
                       href={tool.href}
                       className="px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-black hover:text-cyan-400 transition-colors flex items-center gap-3"
                     >
                       <span className="opacity-70">{tool.icon}</span>
                       {tool.name}
                     </Link>
                   ))}
                </div>
              </div>
            </div>
          </nav>

          {/* RIGHT: STATUS & PROFILE */}
          <div className="hidden lg:flex items-center gap-6">
            
            {/* AGENT STATUS */}
            <div className="flex items-center gap-2 bg-gray-900/50 border border-gray-800 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">
                Systems Online
              </span>
            </div>

            {/* PROFILE BADGE */}
            <Link href="/passport" className="flex items-center gap-3 pl-6 border-l border-gray-800 hover:opacity-80 transition-opacity">
              <div className="text-right hidden xl:block">
                <div className="text-xs text-gray-400">Readiness Score</div>
                <div className="text-sm font-bold text-cyan-400">{userScore}/100</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-white">
                ME
              </div>
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button 
            className="lg:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black pt-24 px-6 pb-6 lg:hidden overflow-y-auto"
          >
             <div className="flex flex-col gap-2">
                {[...navLinks, ...toolsLinks].map(link => (
                  <Link 
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xl font-bold text-gray-300 py-4 border-b border-gray-900 flex items-center gap-4"
                  >
                    <span className="text-2xl">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}
             </div>
             
             <button 
               onClick={() => setMobileMenuOpen(false)}
               className="mt-8 w-full py-4 bg-gray-900 rounded-xl text-white font-bold"
             >
               Close Menu
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-20" />
    </>
  );
}