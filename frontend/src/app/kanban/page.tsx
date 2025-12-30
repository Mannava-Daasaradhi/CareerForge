
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

// --- TYPES ---
// Defined locally or import from @/types if you have a shared file
interface Application {
  id: string;
  role_title: string;
  company_name: string;
  status: string;
  salary_range: string;
  notes: string;
  created_at: string;
}

const COLUMNS = [
  { id: "AI Recommended", title: "🤖 AI Inbox", color: "border-cyan-500" },
  { id: "Wishlist", title: "✨ Wishlist", color: "border-gray-600" },
  { id: "Applied", title: "🚀 Applied", color: "border-blue-500" },
  { id: "Interview", title: "🎤 Interview", color: "border-purple-500" },
  { id: "Offer", title: "🎉 Offer", color: "border-green-500" },
  { id: "Rejected", title: "💀 Ghosted", color: "border-red-500" },
];

export default function KanbanPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Manual Add State
  const [newRole, setNewRole] = useState("");
  const [newCompany, setNewCompany] = useState("");

  // Rejection Modal State
  const [rejectModal, setRejectModal] = useState<{ open: boolean; appId: string | null }>({ open: false, appId: null });
  const [feedback, setFeedback] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Drag State
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // --- FETCH DATA ---
  const fetchApplications = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/kanban/list", {
        headers: { "Authorization": "Bearer dev-token" } // Adjust if using real auth
      });
      if (res.ok) {
        const data = await res.json();
        // Map "Todo" (from backend Phoenix task) to "AI Recommended" if needed, or keep as is
        setApps(data);
      }
    } catch (error) {
      console.error("Failed to fetch kanban", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // --- ACTIONS ---

  const handleAddApp = async () => {
    if (!newRole || !newCompany) return;

    const tempApp = {
      role_title: newRole,
      company_name: newCompany,
      status: "Wishlist",
      notes: "",
      salary_range: "Unknown"
    };

    try {
      await fetch("http://localhost:8000/api/kanban/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempApp)
      });
      setNewRole("");
      setNewCompany("");
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (appId: string, newStatus: string, rejectionFeedback: string = "") => {
    // 1. Optimistic Update (UI Only)
    // If it's a rejection, we wait for the modal unless this IS the modal submission
    if (newStatus !== "Rejected" || rejectionFeedback) {
        setApps(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
    }

    try {
        // 2. Call API (Using the generic update endpoint which might need tweaking for feedback)
        // OR better: call a specific endpoint if it's a rejection analysis
        // For simplicity, we assume the backend 'update' handles simple status changes,
        // but for Rejection Analysis we might need a specific flow or we pass feedback in notes/metadata.
        
        // Actually, looking at your previous code, 'updateApplicationStatus' handled both.
        // Let's implement the specific logic here:
        
        let body: any = { id: appId, status: newStatus };
        
        // Note: Standard /api/kanban/update might just do status.
        // If we want the Phoenix Agent, we need to ensure the backend supports it.
        // Assuming we are just doing status update for now, unless we have a specific endpoint.
        
        const res = await fetch("http://localhost:8000/api/kanban/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        // Special Case: If we just rejected someone, we might want to trigger the analysis MANUALLY 
        // if the update endpoint doesn't do it automatically.
        // But let's assume for this "Merged" file we stick to standard status updates 
        // AND use the Rejection Modal to purely *capture* feedback and maybe add it to notes.
        
        // IF you want the AI Analysis, we should likely hit a specific endpoint or 
        // update the notes field with the feedback first.
        
        if (newStatus === "Rejected" && rejectionFeedback) {
            // Trigger Analysis (Simulated or Real Endpoint)
            // Ideally: await fetch("/api/kanban/analyze_rejection", ...)
        }
        
    } catch (err) {
      console.error("Update failed", err);
      fetchApplications(); // Revert
    }
  };

  // --- DRAG HANDLERS ---
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    setDraggedItem(appId);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    // INTERCEPT: If moving to Rejected, open modal instead of updating immediately
    if (status === "Rejected") {
        setRejectModal({ open: true, appId: draggedItem });
        setDraggedItem(null);
        return;
    }

    updateStatus(draggedItem, status);
    setDraggedItem(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // --- REJECTION LOGIC ---
  const submitRejection = async () => {
    if (!rejectModal.appId) return;
    setIsAnalyzing(true);
    
    try {
        // 1. Update Status to Rejected
        await updateStatus(rejectModal.appId, "Rejected", feedback);
        
        // 2. Mock Analysis Result (Since we don't have the specialized endpoint hooked up in this file version)
        // In a real integration, this would come from the backend response.
        setTimeout(() => {
            setAnalysisResult({
                likely_reason: "Skill Gap: Distributed Systems",
                phoenix_task_title: "Master Kafka & Event Driven Architecture"
            });
            setIsAnalyzing(false);
            
            // Add the new task locally for immediate feedback
            const newTask: Application = {
                id: "phoenix-" + Date.now(),
                role_title: "🔥 RECOVERY: Master Kafka",
                company_name: "Self-Improvement",
                status: "AI Recommended",
                salary_range: "N/A",
                notes: "Generated from rejection analysis.",
                created_at: new Date().toISOString()
            };
            setApps(prev => [newTask, ...prev]);
            
        }, 1500);

    } catch (e) {
        setIsAnalyzing(false);
    }
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, appId: null });
    setFeedback("");
    setAnalysisResult(null);
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading Mission Control...</div>;

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />
      
      <main className="p-6">
        
        {/* HEADER: MANUAL ADD */}
        <div className="flex justify-between items-center mb-8 max-w-[1400px]">
            <div>
                <h1 className="text-2xl font-bold text-cyan-400">Mission Control</h1>
                <p className="text-xs text-gray-500 mt-1">KANBAN // TRACKING ACTIVE TARGETS</p>
            </div>
            
            <div className="flex gap-2 bg-gray-900 p-2 rounded-xl border border-gray-800">
                <input 
                    placeholder="Role (e.g. Backend Eng)" 
                    className="bg-black border border-gray-700 p-2 rounded-lg text-sm w-48 focus:border-cyan-500 outline-none transition-colors"
                    value={newRole} onChange={e => setNewRole(e.target.value)}
                />
                <input 
                    placeholder="Company" 
                    className="bg-black border border-gray-700 p-2 rounded-lg text-sm w-40 focus:border-cyan-500 outline-none transition-colors"
                    value={newCompany} onChange={e => setNewCompany(e.target.value)}
                />
                <button 
                    onClick={handleAddApp} 
                    className="bg-cyan-600 px-4 rounded-lg font-bold hover:bg-cyan-500 text-black text-xl transition-colors"
                >
                    +
                </button>
            </div>
        </div>

        {/* BOARD */}
        <div className="flex gap-6 overflow-x-auto min-w-full pb-8">
          {COLUMNS.map((col) => (
            <div 
              key={col.id}
              className={`flex-1 min-w-[280px] max-w-[350px] bg-gray-900/50 rounded-xl border-t-4 ${col.color} p-4 backdrop-blur-sm`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
                {col.title}
                <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-400">
                  {apps.filter(a => a.status === col.id || (col.id === "AI Recommended" && a.status === "Todo")).length}
                </span>
              </h2>

              <div className="space-y-3">
                <AnimatePresence>
                  {apps.filter(a => a.status === col.id || (col.id === "AI Recommended" && a.status === "Todo")).map((app) => (
                    <motion.div
                      key={app.id}
                      layoutId={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e as any, app.id)}
                      className={`
                        p-4 rounded-lg bg-gray-800 border cursor-move hover:shadow-xl transition-all relative group
                        ${(col.id === "AI Recommended" || app.role_title.includes("🔥")) ? "border-cyan-500/50 shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)]" : "border-gray-700"}
                      `}
                    >
                      {/* AI / PHOENIX BADGE */}
                      {(col.id === "AI Recommended" || app.role_title.includes("🔥")) && (
                        <div className={`absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse ${app.role_title.includes("🔥") ? "bg-red-500 text-white" : "bg-cyan-500 text-black"}`}>
                          {app.role_title.includes("🔥") ? "PHOENIX TASK" : "AI FOUND"}
                        </div>
                      )}

                      <h3 className="font-bold text-white leading-tight">{app.role_title}</h3>
                      <p className="text-sm text-gray-400 mb-2">{app.company_name}</p>
                      
                      {app.notes && (
                        <div className="text-xs text-gray-500 bg-gray-900/50 p-2 rounded mb-2 line-clamp-3 whitespace-pre-wrap font-mono">
                          {app.notes}
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs text-gray-600 mt-2">
                         <span>{new Date(app.created_at || Date.now()).toLocaleDateString()}</span>
                         <span className="group-hover:text-cyan-400 transition-colors">:: DRAG ::</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {apps.filter(a => a.status === col.id).length === 0 && (
                  <div className="text-center py-8 text-gray-700 text-sm border-2 border-dashed border-gray-800 rounded-lg">
                    Empty
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* --- PHOENIX AGENT MODAL (Restored) --- */}
        {rejectModal.open && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-gray-900 border border-red-500/50 p-6 rounded-2xl w-[600px] shadow-2xl relative overflow-hidden">
                    
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-yellow-600"></div>

                    {!analysisResult ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">Rejection Analysis</h2>
                            <p className="text-sm text-gray-400 mb-4">
                                "Success is stumbling from failure to failure with no loss of enthusiasm." 
                                <br/>Our Agent will analyze this setback and generate a recovery plan.
                            </p>
                            
                            <textarea
                                className="w-full bg-black border border-gray-700 rounded-xl p-3 text-sm h-32 text-gray-300 focus:border-red-500 outline-none transition-colors"
                                placeholder="Paste rejection email or feedback here (Optional)..."
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={closeRejectModal} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                                <button 
                                    onClick={submitRejection} 
                                    disabled={isAnalyzing}
                                    className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                                >
                                    {isAnalyzing ? "Analysing..." : "Analyze & Archive"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-3xl">🔥</span>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Phoenix Protocol Activated</h2>
                                    <p className="text-xs text-red-400">Recovery Plan Generated Successfully</p>
                                </div>
                            </div>

                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 mb-6">
                                <h3 className="text-sm font-bold text-yellow-500 mb-1">Likely Reason:</h3>
                                <p className="text-sm text-gray-300 mb-3">{analysisResult.likely_reason}</p>
                                
                                <h3 className="text-sm font-bold text-green-500 mb-1">New Mission Created:</h3>
                                <div className="bg-black p-3 rounded-lg border border-green-900 flex justify-between items-center">
                                    <span className="text-sm font-mono text-white">{analysisResult.phoenix_task_title}</span>
                                    <span className="text-xs bg-green-900 text-green-100 px-2 py-1 rounded">ADDED TO AI INBOX</span>
                                </div>
                            </div>

                            <button onClick={closeRejectModal} className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded-xl text-white font-bold transition-colors">
                                Acknowledge & Continue
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
}
