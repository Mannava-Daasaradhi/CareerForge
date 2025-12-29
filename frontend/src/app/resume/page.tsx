"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadResume = async () => {
    if (!file) return;
    setAnalyzing(true);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Hits the OCR-Hardened Backend Endpoint
      const res = await fetch('http://localhost:8000/api/resume/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await res.json();
      
      // The backend returns a stringified JSON in 'analysis', we need to parse it if it's a string
      let parsedAnalysis = data.analysis;
      if (typeof data.analysis === 'string') {
        try {
           parsedAnalysis = JSON.parse(data.analysis);
        } catch {
           // If LLM returned raw text
           parsedAnalysis = { raw: data.analysis };
        }
      }
      setResult(parsedAnalysis);
      
    } catch (e) {
      alert("Upload failed. Ensure backend is running.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 flex flex-col items-center">
      <div className="w-full max-w-3xl mt-8">
        <h1 className="text-3xl font-bold text-yellow-500 mb-2">RESUME_AIRLOCK</h1>
        <p className="text-xs text-yellow-700 mb-8">OCR SECURITY SCAN + ATS PARSING</p>

        {/* UPLOAD ZONE */}
        <div className="border-2 border-dashed border-gray-800 rounded-lg p-12 text-center hover:border-yellow-500 transition-colors">
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange}
            className="hidden" 
            id="resume-upload"
          />
          <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">📄</span>
            </div>
            <p className="text-sm text-gray-400">
              {file ? file.name : "DROP SECURE PDF HERE"}
            </p>
          </label>
        </div>

        <button 
          onClick={uploadResume}
          disabled={!file || analyzing}
          className="w-full mt-6 bg-yellow-900/20 border border-yellow-600 text-yellow-500 py-4 font-bold hover:bg-yellow-500 hover:text-black transition-all disabled:opacity-50"
        >
          {analyzing ? 'SCANNING_PIXELS...' : 'INITIATE_SCAN'}
        </button>

        {/* RESULTS */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 border border-gray-800 bg-gray-900/10 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">ANALYSIS_REPORT</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-black border border-gray-800">
                 <p className="text-xs text-gray-500">MATCH SCORE</p>
                 <p className="text-3xl font-bold text-white">{result.match_score || 0}/100</p>
              </div>
              <div className="p-4 bg-black border border-gray-800">
                 <p className="text-xs text-gray-500">VERDICT</p>
                 <p className={`text-xl font-bold ${result.verdict === 'Pass' ? 'text-green-500' : 'text-red-500'}`}>
                   {result.verdict || "UNKNOWN"}
                 </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-red-500 uppercase mb-2">Missing Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {result.missing_keywords?.map((k: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-red-900/20 text-red-400 text-xs border border-red-900/50">
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}