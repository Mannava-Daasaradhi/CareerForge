// frontend/src/app/resume/page.tsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { uploadResume, tailorResume, auditUser, deepAudit, TailoredResume } from '@/lib/api';
import Navbar from '@/components/Navbar';

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'tailor'>('analyze');
  
  // Inputs
  const [file, setFile] = useState<File | null>(null);
  const [githubUser, setGithubUser] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  
  // State
  const [loading, setLoading] = useState(false);
  
  // Results
  const [resumeReport, setResumeReport] = useState<any>(null);
  const [githubReport, setGithubReport] = useState<any>(null);
  const [deepCode, setDeepCode] = useState<any>(null);
  const [tailorResult, setTailorResult] = useState<TailoredResume | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleAudit = async () => {
    if (!file && !githubUser) return alert("Upload a resume OR enter a GitHub username.");
    
    setLoading(true);
    try {
      // 1. Resume Audit
      if (file) {
        const data = await uploadResume(file);
        let parsed = data.analysis;
        if (typeof data.analysis === 'string') {
          try { parsed = JSON.parse(data.analysis); } catch {}
        }
        setResumeReport(parsed);
      }

      // 2. GitHub Audit (Standard + Deep)
      if (githubUser) {
        const [audit, deep] = await Promise.all([
            auditUser(githubUser),
            deepAudit(githubUser)
        ]);
        setGithubReport(audit);
        setDeepCode(deep);
      }

    } catch (e) {
      alert("Audit sequence failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleTailor = async () => {
    if (!file || !jobDesc) return;
    setLoading(true);
    try {
      const data = await tailorResume(file, jobDesc);
      setTailorResult(data);
    } catch (e) {
      alert("Tailoring failed. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono overflow-x-hidden">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-yellow-500 mb-2">IDENTITY_FORGE</h1>
            <p className="text-xs text-yellow-700">FULL SPECTRUM PROFILE ANALYSIS & OPTIMIZATION</p>
        </div>

        {/* TABS */}
        <div className="flex justify-center border-b border-gray-800 mb-12">
          <button 
            onClick={() => setActiveTab('analyze')}
            className={`px-8 py-4 text-sm font-bold transition-all ${activeTab === 'analyze' ? 'text-yellow-400 border-b-2 border-yellow-400 bg-yellow-900/10' : 'text-gray-500 hover:text-white'}`}
          >
            01_DEEP_AUDIT
          </button>
          <button 
            onClick={() => setActiveTab('tailor')}
            className={`px-8 py-4 text-sm font-bold transition-all ${activeTab === 'tailor' ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-900/10' : 'text-gray-500 hover:text-white'}`}
          >
            02_AI_TAILOR
          </button>
        </div>

        {/* --- TAB 1: AUDIT --- */}
        {activeTab === 'analyze' && (
          <div className="space-y-8">
            
            {/* INPUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Resume Upload */}
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${file ? 'border-yellow-500 bg-yellow-900/5' : 'border-gray-800 hover:border-gray-600'}`}>
                    <input 
                        type="file" accept=".pdf" 
                        onChange={handleFileChange}
                        className="hidden" id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-4">
                        <span className="text-4xl">📄</span>
                        <div className="text-left">
                            <p className="text-sm font-bold text-white">{file ? file.name : "UPLOAD RESUME (PDF)"}</p>
                            <p className="text-xs text-gray-500">Parsing Engine: Llama-3.3-70B</p>
                        </div>
                    </label>
                </div>

                {/* GitHub Input */}
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${githubUser ? 'border-purple-500 bg-purple-900/5' : 'border-gray-800 hover:border-gray-600'}`}>
                    <div className="flex flex-col items-center gap-4">
                        <span className="text-4xl">🐙</span>
                        <div className="w-full">
                            <input 
                                placeholder="ENTER GITHUB USERNAME"
                                className="w-full bg-transparent text-center border-b border-gray-700 focus:border-purple-500 outline-none text-white font-bold placeholder-gray-600 uppercase"
                                value={githubUser}
                                onChange={e => setGithubUser(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-2">Engine: Deep Code Context Auditor</p>
                        </div>
                    </div>
                </div>
            </div>

            <button 
              onClick={handleAudit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-900/50 to-purple-900/50 border border-yellow-700/50 text-white py-4 font-bold tracking-widest hover:border-yellow-500 transition-all disabled:opacity-50"
            >
              {loading ? 'RUNNING FORENSIC ANALYSIS...' : 'INITIATE DEEP SCAN'}
            </button>

            {/* REPORT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* RESUME REPORT */}
                {resumeReport && (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="border border-yellow-900/50 bg-black p-6 rounded relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl text-yellow-500 font-bold">PDF</div>
                     
                     <div className="flex justify-between items-end mb-6">
                        <h3 className="text-xl font-bold text-yellow-500">RESUME DIAGNOSTIC</h3>
                        <div className="text-right">
                             <div className="text-3xl font-bold text-white">{resumeReport.match_score}<span className="text-sm text-gray-500">/100</span></div>
                             <p className="text-[10px] text-gray-500 uppercase">ATS Score</p>
                        </div>
                     </div>
                     
                     <p className="text-gray-300 text-sm mb-6 border-l-2 border-yellow-500 pl-4 italic">
                        "{resumeReport.verdict}"
                     </p>

                     <div className="space-y-4">
                        <div className="bg-red-900/10 p-3 rounded border border-red-900/30">
                            <p className="text-[10px] text-red-500 font-bold uppercase mb-1">CRITICAL MISSING KEYWORDS</p>
                            <p className="text-xs text-gray-300">{resumeReport.missing_keywords?.join(", ") || "None Detected"}</p>
                        </div>
                        <div className="bg-yellow-900/10 p-3 rounded border border-yellow-900/30">
                            <p className="text-[10px] text-yellow-500 font-bold uppercase mb-1">DETECTED RED FLAGS</p>
                            <p className="text-xs text-gray-300">{resumeReport.red_flags || "None Detected"}</p>
                        </div>
                     </div>
                  </motion.div>
                )}

                {/* GITHUB REPORT */}
                {githubReport && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="border border-purple-900/50 bg-black p-6 rounded relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl text-purple-500 font-bold">GIT</div>
                     
                     <div className="flex justify-between items-end mb-6">
                        <h3 className="text-xl font-bold text-purple-500">CODE INTEGRITY</h3>
                        <div className="text-right">
                             <div className="text-3xl font-bold text-white">{githubReport.trust_score}<span className="text-sm text-gray-500">/100</span></div>
                             <p className="text-[10px] text-gray-500 uppercase">Trust Score</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-900 p-2 text-center rounded">
                            <p className="text-xl font-bold text-white">{githubReport.account_age_years}</p>
                            <p className="text-[10px] text-gray-500">YEARS ACTIVE</p>
                        </div>
                        <div className="bg-gray-900 p-2 text-center rounded">
                            <p className="text-xl font-bold text-white">{githubReport.recent_pushes}</p>
                            <p className="text-[10px] text-gray-500">RECENT PUSHES</p>
                        </div>
                     </div>

                     {/* Deep Code Context */}
                     {deepCode && !deepCode.error && (
                         <div className="mt-4">
                             <p className="text-[10px] text-purple-400 font-bold uppercase mb-2">TOP REPO CONTEXT ({deepCode.repo_name})</p>
                             <div className="bg-gray-900/50 border border-gray-800 p-2 rounded max-h-40 overflow-y-auto">
                                {Object.entries(deepCode.files).map(([fname, content]: any) => (
                                    <div key={fname} className="mb-2">
                                        <p className="text-[10px] text-green-500 font-mono mb-1">> {fname}</p>
                                        <pre className="text-[8px] text-gray-400 whitespace-pre-wrap font-mono opacity-60">
                                            {(content as string).substring(0, 150)}...
                                        </pre>
                                    </div>
                                ))}
                             </div>
                         </div>
                     )}
                  </motion.div>
                )}

            </div>
          </div>
        )}

        {/* --- TAB 2: TAILOR --- */}
        {activeTab === 'tailor' && (
          <div className="space-y-6">
            <div className="bg-blue-900/10 border border-blue-900/30 p-6 rounded">
                <h3 className="text-blue-400 font-bold mb-2">TARGET LOCK</h3>
                <textarea
                placeholder="Paste the Job Description here. The AI will rewrite your resume to match..."
                className="w-full h-40 bg-black border border-gray-700 text-white p-4 focus:border-blue-500 outline-none rounded"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                />
            </div>
            
            <button 
              onClick={handleTailor}
              disabled={!file || !jobDesc || loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 font-bold rounded shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50"
            >
              {loading ? 'REWRITING NARRATIVE...' : 'GENERATE TAILORED RESUME'}
            </button>

            {tailorResult && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  {/* COLD EMAIL */}
                  <div className="border border-gray-800 p-6 bg-gray-900 rounded">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-white">GENERATED COVER EMAIL</h3>
                        <button 
                            className="text-xs text-blue-400 hover:text-white"
                            onClick={() => navigator.clipboard.writeText(tailorResult.email_cover_letter_draft)}
                        >
                            COPY TEXT
                        </button>
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed border-l-2 border-blue-500 pl-4">
                        {tailorResult.email_cover_letter_draft}
                    </pre>
                  </div>

                  {/* TAILORED SECTIONS */}
                  <div className="space-y-4">
                    {tailorResult.sections.map((section, idx) => (
                        <div key={idx} className="border border-gray-800 p-6 rounded bg-black">
                            <h4 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">{section.section_name}</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">ORIGINAL</p>
                                    <div className="text-xs text-gray-400 p-3 bg-gray-900 rounded">{section.original_content}</div>
                                </div>
                                <div>
                                    <p className="text-[10px] text-blue-500 font-bold mb-2 uppercase">AI OPTIMIZED</p>
                                    <div className="text-xs text-blue-100 p-3 bg-blue-900/20 border border-blue-900/50 rounded">{section.tailored_content}</div>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-900 flex gap-2 items-start">
                                <span className="text-blue-500 text-lg">💡</span>
                                <p className="text-xs text-gray-500 italic mt-1">{section.reasoning}</p>
                            </div>
                        </div>
                    ))}
                  </div>
               </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}