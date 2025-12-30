// frontend/src/app/kanban/page.tsx
"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getApplications, addApplication, updateApplicationStatus, Application } from '@/lib/api';

// We add "Todo" for the AI-generated recovery tasks
const COLUMNS = ["Todo", "Wishlist", "Applied", "Interview", "Offer", "Rejected"];

export default function KanbanPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [loading, setLoading] = useState(true);

  // --- REJECTION MODAL STATE ---
  const [rejectModal, setRejectModal] = useState<{ open: boolean, appId: string | null }>({ open: false, appId: null });
  const [feedback, setFeedback] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Load Initial Data
  useEffect(() => {
    loadBoard();
  }, []);

  const loadBoard = async () => {
    const data = await getApplications();
    setApps(data);
    setLoading(false);
  };

  const handleAddApp = async () => {
    if (!newRole || !newCompany) return;
    
    // Optimistic UI update
    const tempApp: Application = { 
        role_title: newRole, 
        company_name: newCompany, 
        status: 'Wishlist',
        notes: '' 
    };
    
    setApps([...apps, { ...tempApp, id: 'temp' }]); // Temp visual
    setNewRole(''); 
    setNewCompany('');

    await addApplication(tempApp);
    loadBoard(); // Refresh for real ID
  };

  const handleMoveCard = async (id: string, newStatus: string) => {
    // INTERCEPT: If moving to Rejected, stop and ask for feedback
    if (newStatus === "Rejected") {
        setRejectModal({ open: true, appId: id });
        return;
    }

    // Standard Move
    performUpdate(id, newStatus);
  };

  const performUpdate = async (id: string, status: string, rejectionFeedback: string = "") => {
    // Optimistic update
    setApps(apps.map(a => a.id === id ? { ...a, status: status as any } : a));
    
    const res = await updateApplicationStatus(id, status, rejectionFeedback);
    
    // If AI Agent Triggered (Phoenix Protocol)
    if (res.analysis) {
        setAnalysisResult(res.analysis);
        // Do not close modal yet, let them see the analysis
        await loadBoard(); // Reload to see the new "Recovery Task" card
    } else {
       // Normal update
       if (rejectModal.open) closeRejectModal();
    }
  };

  const submitRejection = async () => {
    if (!rejectModal.appId) return;
    setIsAnalyzing(true);
    await performUpdate(rejectModal.appId, "Rejected", feedback);
    setIsAnalyzing(false);
  };

  const closeRejectModal = () => {
    setRejectModal({ open: false, appId: null });
    setFeedback('');
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono overflow-x-auto">
      <Navbar />
      <div className="p-8 w-full min-w-[1400px]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-yellow-500">Mission Control</h1>
                <p className="text-xs text-gray-500 mt-1">KANBAN-500 // TRACKING ACTIVE TARGETS</p>
            </div>
            
            <div className="flex gap-2 bg-gray-800 p-2 rounded border border-gray-700">
                <input 
                    placeholder="Role (e.g. Backend Engineer)" 
                    className="bg-black border border-gray-600 p-2 rounded text-sm w-48 focus:border-yellow-500 outline-none"
                    value={newRole} onChange={e => setNewRole(e.target.value)}
                />
                <input 
                    placeholder="Company (e.g. Google)" 
                    className="bg-black border border-gray-600 p-2 rounded text-sm w-40 focus:border-yellow-500 outline-none"
                    value={newCompany} onChange={e => setNewCompany(e.target.value)}
                />
                <button onClick={handleAddApp} className="bg-yellow-600 px-4 rounded font-bold hover:bg-yellow-500 text-black text-xl">+</button>
            </div>
        </div>

        {/* Board */}
        <div className="grid grid-cols-6 gap-4">
            {COLUMNS.map(col => (
                <div key={col} className={`p-4 rounded-lg min-h-[600px] border border-gray-700/50 ${col === 'Rejected' ? 'bg-red-900/10' : col === 'Todo' ? 'bg-blue-900/10' : 'bg-gray-800/50'}`}>
                    <h2 className={`text-center font-bold mb-4 uppercase text-xs tracking-widest pb-2 border-b ${col === 'Rejected' ? 'text-red-500 border-red-900' : col === 'Todo' ? 'text-blue-400 border-blue-900' : 'text-gray-400 border-gray-700'}`}>
                        {col}
                    </h2>
                    
                    <div className="space-y-3">
                        {apps.filter(a => a.status === col).map(app => (
                            <div key={app.id} className="bg-gray-900 p-4 rounded shadow-lg border border-gray-800 hover:border-yellow-500 transition-all cursor-pointer group relative">
                                
                                {/* Recovery Badge */}
                                {app.role_title.startsWith("🔥") && (
                                    <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                                        PHOENIX TASK
                                    </div>
                                )}

                                <h3 className="font-bold text-sm text-gray-200">{app.role_title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{app.company_name}</p>
                                
                                {app.notes && (
                                    <div className="mt-2 text-[10px] text-gray-600 bg-black/50 p-1 rounded truncate">
                                        {app.notes}
                                    </div>
                                )}

                                {/* Quick Actions */}
                                <div className="hidden group-hover:flex absolute bottom-2 right-2 gap-1">
                                    {COLUMNS.indexOf(col) < 5 && (
                                        <button 
                                            onClick={() => handleMoveCard(app.id!, COLUMNS[COLUMNS.indexOf(col) + 1])} 
                                            className="text-[10px] bg-gray-700 hover:bg-green-600 text-white px-2 py-1 rounded"
                                        >
                                            Next &rarr;
                                        </button>
                                    )}
                                    {col !== "Rejected" && (
                                        <button 
                                            onClick={() => handleMoveCard(app.id!, "Rejected")} 
                                            className="text-[10px] bg-gray-700 hover:bg-red-600 text-white px-2 py-1 rounded"
                                        >
                                            Reject
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

        {/* --- PHOENIX AGENT MODAL --- */}
        {rejectModal.open && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
                <div className="bg-gray-900 border border-red-500/50 p-6 rounded-lg w-[600px] shadow-2xl relative overflow-hidden">
                    
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
                                className="w-full bg-black border border-gray-700 rounded p-3 text-sm h-32 text-gray-300 focus:border-red-500 outline-none"
                                placeholder="Paste rejection email or feedback here (Optional)..."
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                            />

                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={closeRejectModal} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                                <button 
                                    onClick={submitRejection} 
                                    disabled={isAnalyzing}
                                    className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2"
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

                            <div className="bg-gray-800/50 p-4 rounded border border-gray-700 mb-6">
                                <h3 className="text-sm font-bold text-yellow-500 mb-1">Likely Reason:</h3>
                                <p className="text-sm text-gray-300 mb-3">{analysisResult.likely_reason}</p>
                                
                                <h3 className="text-sm font-bold text-green-500 mb-1">New Mission Created:</h3>
                                <div className="bg-black p-3 rounded border border-green-900 flex justify-between items-center">
                                    <span className="text-sm font-mono text-white">{analysisResult.phoenix_task_title}</span>
                                    <span className="text-xs bg-green-900 text-green-100 px-2 py-1 rounded">ADDED TO TODO</span>
                                </div>
                            </div>

                            <button onClick={closeRejectModal} className="w-full bg-gray-700 hover:bg-gray-600 py-3 rounded text-white font-bold">
                                Acknowledge & Continue
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}