"use client";

import React, { useState } from "react";
import { uploadResume } from "../../lib/api";

// Define the shape of the analysis object
interface AnalysisResult {
  raw_text: string;
  skills_detected: string[];
  red_flags: string[];
}

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // Change state type to match the object or null
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await uploadResume(file);
      // The backend returns { filename: "...", analysis: { ... } }
      // So we set result to data.analysis
      setResult(data.analysis);
    } catch (err) {
      console.error(err);
      setError("❌ Error: Could not analyze resume. Ensure backend is running.");
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

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Results Area (Correctly Rendering the Object) */}
        {result && (
          <div className="bg-gray-900 border border-purple-500/30 rounded-lg p-6 mt-8 animate-fade-in space-y-6">
            
            {/* 1. Skills Section */}
            <div>
              <h3 className="text-purple-400 mb-2 text-sm uppercase tracking-widest font-bold">
                Skills Detected
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.skills_detected && result.skills_detected.length > 0 ? (
                  result.skills_detected.map((skill, idx) => (
                    <span key={idx} className="bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">No specific keywords found.</span>
                )}
              </div>
            </div>

            {/* 2. Red Flags Section */}
            {result.red_flags && result.red_flags.length > 0 && (
               <div>
                <h3 className="text-red-400 mb-2 text-sm uppercase tracking-widest font-bold">
                  Red Flags Detected
                </h3>
                <ul className="list-disc list-inside text-red-300/80 space-y-1">
                  {result.red_flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. Raw Text Preview */}
            <div>
              <h3 className="text-gray-500 mb-2 text-xs uppercase tracking-widest">
                Raw Extraction Preview
              </h3>
              <div className="bg-black p-4 rounded border border-gray-800 h-48 overflow-y-auto text-xs text-gray-400">
                 {result.raw_text}
              </div>
            </div>

          </div>
        )}
        
      </div>
    </main>
  );
}