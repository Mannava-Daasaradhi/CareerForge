"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/api";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
    checkSession();
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-cyan-400 font-mono text-lg animate-pulse">
        Initializing CareerForge...
      </div>
    </div>
  );
}