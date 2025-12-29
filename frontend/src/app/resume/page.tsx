"use client";

import React, { useState } from "react";
import { uploadResume } from "../../lib/api";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await uploadResume(file);
      setResult(data.analysis);
    } catch (err) {
      console.error(err);
      setResult("❌ Error: Could not analyze resume. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4 font-mono">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Header */}
        <div className="border-b border-gray-800 pb-4">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Resume_Sniper
          </h1>
          <p className="text-gray-500 mt-2">
            AI-Powered ATS Auditor. Target Role: <span className="text-white">Software Engineer</span>.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-8 text-center border-dashed hover:border-purple-500 transition-colors">
          <input 
            type="file" 
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden" 
            id="resume-upload"
          />
          <label 
            htmlFor="resume-upload" 
            className="cursor-pointer flex flex-col items-center gap-4"
          >
            <div className="text-6xl">📄</div>
            <span className="text-xl text-gray-300">
              {file ? file.name : "Click to Upload PDF Resume"}
            </span>
            <span className="text-xs text-gray-600">
              (PDF Only. Max 5MB)
            </span>
          </label>
        </div>

        {/* Action Button */}
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="w-full py-4 rounded-lg bg-purple-700 hover:bg-purple-600 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? "SCANNING DOCUMENT..." : "INITIATE ANALYSIS"}
        </button>

        {/* Results Area */}
        {result && (
          <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 mt-8 animate-fade-in">
            <h3 className="text-purple-400 mb-4 text-sm uppercase tracking-widest">
              Analysis Report
            </h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono leading-relaxed">
              {result}
            </pre>
          </div>
        )}
        
      </div>
    </main>
  );
}