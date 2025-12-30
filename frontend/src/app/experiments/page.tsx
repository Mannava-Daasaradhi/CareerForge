// frontend/src/app/experiments/page.tsx
"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function ExperimentsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!file || !jd) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_description', jd);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/experiments/run', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      alert("Experiment failed.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6 mt-6">
        <h1 className="text-3xl font-bold text-pink-500 mb-6">Resume A/B Laboratory</h1>
        
        {/* INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-900 p-6 rounded border border-gray-800">
                <label className="block mb-2 text-sm text-gray-400">1. Upload Base Resume</label>
                <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-400 file:bg-pink-600 file:border-0 file:text-white file:px-4 file:py-2 file:rounded"
                />
            </div>
            <div className="bg-gray-900 p-6 rounded border border-gray-800">
                <label className="block mb-2 text-sm text-gray-400">2. Job Description</label>
                <textarea 
                    value={jd}
                    onChange={(e) => setJd(e.target.value)}
                    className="w-full h-20 bg-black border border-gray-700 rounded p-2 text-sm"
                    placeholder="Paste the JD here..."
                />
            </div>
        </div>

        <button 
            onClick={handleRun} 
            disabled={loading}
            className="w-full bg-pink-600 hover:bg-pink-500 py-4 rounded font-bold text-xl mb-10"
        >
            {loading ? "Simulating Recruiter Reaction..." : "RUN A/B EXPERIMENT"}
        </button>

        {/* RESULTS */}
        {result && !result.error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* VARIANT A */}
                <div className="border border-blue-500 rounded p-4 bg-gray-900/50">
                    <h2 className="text-xl font-bold text-blue-400 mb-2">Variant A: {result.variant_a.variant_name}</h2>
                    <p className="text-sm text-gray-400 mb-4 h-12">{result.variant_a.strategy_explanation}</p>
                    <div className="bg-white text-black p-4 rounded h-96 overflow-y-auto whitespace-pre-wrap text-xs">
                        {result.variant_a.tailored_content}
                    </div>
                </div>

                {/* VARIANT B */}
                <div className="border border-purple-500 rounded p-4 bg-gray-900/50">
                    <h2 className="text-xl font-bold text-purple-400 mb-2">Variant B: {result.variant_b.variant_name}</h2>
                    <p className="text-sm text-gray-400 mb-4 h-12">{result.variant_b.strategy_explanation}</p>
                    <div className="bg-white text-black p-4 rounded h-96 overflow-y-auto whitespace-pre-wrap text-xs">
                        {result.variant_b.tailored_content}
                    </div>
                </div>
                
                <div className="md:col-span-2 bg-green-900/30 border border-green-500 p-4 rounded text-center">
                    <h3 className="text-green-400 font-bold uppercase tracking-widest">AI Recommendation</h3>
                    <p className="text-xl mt-2">{result.recommendation}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}