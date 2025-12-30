// frontend/src/components/Navbar.tsx
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path ? "text-green-400 font-bold" : "text-gray-400 hover:text-white";

  return (
    <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tighter text-white">
              Career<span className="text-green-500">Forge</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6 text-sm">
              <Link href="/dashboard" className={isActive("/dashboard")}>Dashboard</Link>
              <Link href="/roadmap" className={isActive("/roadmap")}>Roadmap</Link>
              <Link href="/interview" className={isActive("/interview")}>Interview</Link>
              
              {/* NEW AGENTIC FEATURES */}
              <Link href="/kanban" className={isActive("/kanban")}>Mission Control</Link>
              <Link href="/negotiator" className={isActive("/negotiator")}>Negotiator</Link>
              <Link href="/outreach" className={isActive("/outreach")}>Network</Link>
              <Link href="/experiments" className={isActive("/experiments")}>A/B Test</Link>
              <Link href="/recruiter" className={isActive("/recruiter")}>Twin</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}