"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

// --- TYPES ---
interface SkillNode {
  id: string;
  title: string;
  status: "locked" | "available" | "in-progress" | "verified";
  dependencies: string[]; // IDs of prerequisite skills
  description: string;
  project_idea: string;
}

interface RoadmapResponse {
  target_role: string;
  nodes: SkillNode[];
  progress: number;
}

export default function RoadmapPage() {
  const [role, setRole] = useState("Full Stack Engineer");
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);
  const [loading, setLoading] = useState(false);

  // --- MOCK DATA GENERATOR (Simulating Backend Logic) ---
  // In production, fetch from /api/career/roadmap
  const generateRoadmap = async () => {
    setLoading(true);
    setRoadmap(null);
    
    // Simulating API delay
    await new Promise(r => setTimeout(r, 1500));

    const mockNodes: SkillNode[] = [
      {
        id: "git",
        title: "Git & Version Control",
        status: "verified",
        dependencies: [],
        description: "Mastery of branching, merging, and PR workflows.",
        project_idea: "Create a repo, simulate a merge conflict, and resolve it via CLI."
      },
      {
        id: "html-css",
        title: "Semantic HTML & CSS",
        status: "verified",
        dependencies: [],
        description: "Accessibility standards and Flexbox/Grid layouts.",
        project_idea: "Clone the Google homepage using only Flexbox."
      },
      {
        id: "js-core",
        title: "JavaScript ES6+",
        status: "in-progress",
        dependencies: ["html-css"],
        description: "Closures, Async/Await, and DOM manipulation.",
        project_idea: "Build a 'Weather Dashboard' fetching data from a public API."
      },
      {
        id: "react-basics",
        title: "React Fundamentals",
        status: "available",
        dependencies: ["js-core"],
        description: "Components, Props, and State Management.",
        project_idea: "Build a 'Todo List' with add/delete/edit functionality."
      },
      {
        id: "backend-api",
        title: "RESTful APIs (Node/Python)",
        status: "locked",
        dependencies: ["js-core"],
        description: "HTTP verbs, status codes, and JSON handling.",
        project_idea: "Build a simple API that returns a list of users."
      },
      {
        id: "db-sql",
        title: "SQL Databases",
        status: "locked",
        dependencies: ["backend-api"],
        description: "Relational modeling and complex queries.",
        project_idea: "Design a schema for an E-commerce store."
      }
    ];

    setRoadmap({
      target_role: role,
      nodes: mockNodes,
      progress: 35
    });
    setLoading(false);
  };

  // --- HELPERS ---
  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-500 border-green-400 text-black";
      case "in-progress": return "bg-cyan-600 border-cyan-400 text-white animate-pulse-slow";
      case "available": return "bg-gray-800 border-gray-600 text-white hover:border-cyan-500";
      case "locked": return "bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed opacity-50";
      default: return "bg-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 flex flex-col h-[90vh]">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Skill <span className="text-blue-500">Tree</span></h1>
            <p className="text-gray-400 text-sm">
              An adaptive curriculum that evolves as you learn.
            </p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <input 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none flex-1 md:w-64"
              placeholder="Target Role (e.g. DevOps)"
            />
            <button 
              onClick={generateRoadmap}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Architecting..." : "Generate Path"}
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden relative">
          
          {/* LEFT: THE TREE VISUALIZATION */}
          <section className="lg:col-span-2 bg-gray-900/30 border border-gray-800 rounded-3xl p-8 relative overflow-y-auto">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {!roadmap ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-600">
                <div className="w-16 h-16 border-2 border-dashed border-gray-700 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <p>Enter your target role to sprout your skill tree.</p>
              </div>
            ) : (
              <div className="relative z-10 space-y-12">
                {/* PROGRESS BAR */}
                <div className="absolute top-0 right-0 bg-gray-900 border border-gray-700 px-4 py-2 rounded-full text-xs font-bold text-gray-300 z-20">
                   Progress: <span className="text-green-400">{roadmap.progress}%</span>
                </div>

                {/* LEVELS (Grouped for visuals, normally a DAG layout lib would be used) */}
                <div className="flex flex-col items-center gap-12">
                   {/* Level 1 */}
                   <div className="flex gap-8">
                      {roadmap.nodes.filter(n => n.dependencies.length === 0).map(node => (
                        <NodeCard key={node.id} node={node} onClick={() => setSelectedNode(node)} />
                      ))}
                   </div>
                   
                   {/* Connector Line */}
                   <div className="w-px h-12 bg-gray-700"></div>

                   {/* Level 2 */}
                   <div className="flex gap-8">
                      {roadmap.nodes.filter(n => n.dependencies.length > 0 && n.status !== 'locked').map(node => (
                        <NodeCard key={node.id} node={node} onClick={() => setSelectedNode(node)} />
                      ))}
                   </div>

                   {/* Connector Line */}
                   <div className="w-px h-12 bg-gray-700 border-l border-dashed border-gray-500 opacity-30"></div>

                   {/* Level 3 (Locked) */}
                   <div className="flex gap-8 opacity-60">
                      {roadmap.nodes.filter(n => n.status === 'locked').map(node => (
                        <NodeCard key={node.id} node={node} onClick={() => setSelectedNode(node)} />
                      ))}
                   </div>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT: NODE DETAILS SIDEBAR */}
          <AnimatePresence mode="wait">
            {selectedNode ? (
              <motion.section 
                key={selectedNode.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col h-full shadow-2xl"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{selectedNode.title}</h2>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      selectedNode.status === 'verified' ? 'bg-green-900 text-green-400' : 
                      selectedNode.status === 'locked' ? 'bg-red-900 text-red-400' : 'bg-blue-900 text-blue-400'
                    }`}>
                      {selectedNode.status}
                    </span>
                  </div>
                  <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">✕</button>
                </div>

                <div className="space-y-6 overflow-y-auto flex-1">
                  
                  {/* DESCRIPTION */}
                  <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Objective</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedNode.description}</p>
                  </div>

                  {/* PROJECT SPEC */}
                  <div className="bg-black border border-gray-800 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />
                    <h3 className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                       <span>⚡</span> Micro-Project
                    </h3>
                    <p className="text-sm text-gray-300 font-mono">{selectedNode.project_idea}</p>
                  </div>

                  {/* DEPENDENCIES */}
                  {selectedNode.dependencies.length > 0 && (
                     <div>
                       <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Prerequisites</h3>
                       <div className="flex flex-wrap gap-2">
                         {selectedNode.dependencies.map(dep => (
                           <span key={dep} className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400 border border-gray-700">
                             {dep}
                           </span>
                         ))}
                       </div>
                     </div>
                  )}

                </div>

                {/* ACTIONS */}
                <div className="pt-6 mt-6 border-t border-gray-800 space-y-3">
                   {selectedNode.status === 'in-progress' && (
                     <button className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-colors">
                       Mark Complete & Verify
                     </button>
                   )}
                   {selectedNode.status === 'available' && (
                     <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-colors">
                       Start Module
                     </button>
                   )}
                   {selectedNode.status === 'verified' && (
                     <div className="text-center text-green-500 font-bold text-sm flex items-center justify-center gap-2">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                       Badge Minted
                     </div>
                   )}
                   {selectedNode.status === 'locked' && (
                     <div className="text-center text-gray-500 text-sm italic">
                       Complete prerequisites to unlock.
                     </div>
                   )}
                </div>

              </motion.section>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-700 bg-gray-900/20 border border-gray-800 rounded-3xl border-dashed">
                <span className="text-4xl mb-2">👆</span>
                <p>Select a node to view details.</p>
              </div>
            )}
          </AnimatePresence>

        </div>

      </main>
    </div>
  );
}

function NodeCard({ node, onClick }: { node: SkillNode; onClick: () => void }) {
  const getStatusClasses = (status: string) => {
    switch (status) {
      case "verified": return "bg-green-900/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]";
      case "in-progress": return "bg-cyan-900/20 border-cyan-500 text-cyan-400 animate-pulse";
      case "available": return "bg-gray-800 border-gray-600 text-gray-200 hover:border-gray-400 hover:bg-gray-700 cursor-pointer";
      case "locked": return "bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed";
      default: return "";
    }
  };

  return (
    <motion.div
      whileHover={node.status !== 'locked' ? { scale: 1.05 } : {}}
      onClick={node.status !== 'locked' ? onClick : undefined}
      className={`
        w-40 h-24 rounded-2xl border-2 flex flex-col items-center justify-center text-center p-2 transition-all relative
        ${getStatusClasses(node.status)}
      `}
    >
      {node.status === 'locked' && <div className="absolute top-2 right-2 text-xs">🔒</div>}
      {node.status === 'verified' && <div className="absolute -top-2 -right-2 bg-green-500 text-black rounded-full p-1 text-[10px]">✓</div>}
      
      <span className="font-bold text-sm leading-tight">{node.title}</span>
    </motion.div>
  );
}