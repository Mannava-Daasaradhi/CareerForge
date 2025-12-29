"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-gray-800 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl tracking-tighter text-white">
              CareerForge<span className="text-emerald-500">_</span>
            </Link>
          </div>

          {/* Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/") 
                    ? "text-emerald-400 bg-emerald-900/20" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                Home / Audit
              </Link>

              <Link
                href="/resume"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/resume") 
                    ? "text-purple-400 bg-purple-900/20" 
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                Resume Sniper
              </Link>

              <span className="text-gray-600 text-xs">|</span>

              <span className="text-gray-500 text-xs uppercase tracking-widest">
                v0.4.0-BETA
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}