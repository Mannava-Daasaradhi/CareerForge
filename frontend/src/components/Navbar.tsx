"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;
  
  // Helper to stylize active links
  const linkClass = (path: string, colorClass: string) => `
    px-3 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all
    ${isActive(path) ? `${colorClass} bg-white/10` : "text-gray-500 hover:text-white hover:bg-white/5"}
  `;

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-gray-800 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <Link href="/dashboard" className="font-bold text-xl tracking-tighter text-white">
              CAREER_FORGE<span className="text-green-500">_</span>
            </Link>
          </div>

          {/* Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              
              <Link href="/dashboard" className={linkClass("/dashboard", "text-white")}>
                Mission_Control
              </Link>

              <Link href="/roadmap" className={linkClass("/roadmap", "text-purple-400")}>
                Roadmap
              </Link>

              <Link href="/challenge" className={linkClass("/challenge", "text-red-500")}>
                Gauntlet
              </Link>

              <Link href="/interview" className={linkClass("/interview", "text-blue-400")}>
                Voice_Uplink
              </Link>

              <Link href="/resume" className={linkClass("/resume", "text-yellow-400")}>
                Resume_Airlock
              </Link>

            </div>
          </div>
          
          {/* Status */}
          <div className="text-xs text-gray-600 font-mono">
             SYS: <span className="text-green-600">ONLINE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}