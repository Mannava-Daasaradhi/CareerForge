"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { uploadResume, tailorResume, ResumeAnalysis, TailoredResume } from '@/lib/api';

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'tailor'>('analyze');
  const [file, setFile] = useState<File | null>(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Results
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [tailorResult, setTailorResult] = useState<TailoredResume | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await uploadResume(file);
      // Parse if string
      let parsed = data.analysis;
      if (typeof data.analysis === 'string') {
        try { parsed = JSON.parse(data.analysis); } catch {}
      }
      setAnalysisResult(parsed);
    } catch (e) {
      alert("Analysis failed.");
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
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl mt-8">
        <h1 className="text-3xl font-bold text-yellow-500 mb-2">RESUME_FORGE</h1>
        <p className="text-xs text-yellow-700 mb-8">SECURE PARSING & AGENTIC REWRITING</p>

        {/* TABS */}
        <div className="flex border-b border-gray-800 mb-8">
          <button 
            onClick={() => setActiveTab('analyze')}
            className={`px-6 py-3 text-sm font-bold ${activeTab === 'analyze' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500'}`}
          >
            01_AUDIT
          </button>
          <button 
            onClick={() => setActiveTab('tailor')}
            className={`px-6 py-3 text-sm font-bold ${activeTab === 'tailor' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-500'}`}
          >
            02_TAILOR (AI)
          </button>
        </div>

        {/* FILE UPLOAD (SHARED) */}
        <div className="border-2 border-dashed border-gray-800 rounded-lg p-8 text-center hover:border-yellow-500 transition-colors mb-8">
          <input 
            type="file" accept=".pdf" 
            onChange={handleFileChange}
            className="hidden" id="resume-upload"
          />
          <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-4">
            <span className="text-2xl">📄</span>
            <p className="text-sm text-gray-400">{file ? file.name : "UPLOAD PDF BASE"}</p>
          </label>
        </div>

        {/* --- MODE 1: ANALYZE --- */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            <button 
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="w-full bg-yellow-900/20 border border-yellow-600 text-yellow-500 py-4 font-bold hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-50"
            >
              {loading ? 'AUDITING...' : 'RUN AUDIT'}
            </button>

            {analysisResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-gray-800 p-6">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-white">AUDIT REPORT</h3>
                    <span className="text-3xl font-bold text-yellow-500">{analysisResult.match_score}/100</span>
                 </div>
                 <p className="text-gray-400 text-sm mb-4">{analysisResult.verdict}</p>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-red-900/10 p-4 border border-red-900/30">
                        <p className="text-xs text-red-500 uppercase mb-2">Missing Keywords</p>
                        <p className="text-sm text-gray-300">{analysisResult.missing_keywords?.join(", ")}</p>
                    </div>
                    <div className="bg-yellow-900/10 p-4 border border-yellow-900/30">
                        <p className="text-xs text-yellow-500 uppercase mb-2">Red Flags</p>
                        <p className="text-sm text-gray-300">{analysisResult.red_flags}</p>
                    </div>
                 </div>
              </motion.div>
            )}
          </div>
        )}

        {/* --- MODE 2: TAILOR --- */}
        {activeTab === 'tailor' && (
          <div className="space-y-6">
            <textarea
              placeholder="Paste Job Description Here..."
              className="w-full h-40 bg-gray-900 border border-gray-700 text-white p-4 focus:border-yellow-500 outline-none"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
            
            <button 
              onClick={handleTailor}
              disabled={!file || !jobDesc || loading}
              className="w-full bg-yellow-900/20 border border-yellow-600 text-yellow-500 py-4 font-bold hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-50"
            >
              {loading ? 'REWRITING HISTORY...' : 'GENERATE TAILORED RESUME'}
            </button>

            {tailorResult && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  {/* COLD EMAIL */}
                  <div className="border border-gray-800 p-6 bg-gray-900/20">
                    <h3 className="text-sm font-bold text-yellow-500 mb-2">GENERATED COLD EMAIL</h3>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans">{tailorResult.email_cover_letter_draft}</pre>
                  </div>

                  {/* SECTIONS */}
                  {tailorResult.sections.map((section, idx) => (
                    <div key={idx} className="border border-gray-800 p-6">
                        <h4 className="text-lg font-bold text-white mb-2">{section.section_name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="text-xs text-gray-500">
                                <p className="mb-2 font-bold">ORIGINAL</p>
                                {section.original_content}
                            </div>
                            <div className="text-xs text-yellow-100 bg-yellow-900/10 p-2 border border-yellow-900/20">
                                <p className="mb-2 font-bold text-yellow-500">TAILORED</p>
                                {section.tailored_content}
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-400 italic">" {section.reasoning} "</p>
                    </div>
                  ))}
               </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}