// frontend/src/app/outreach/page.tsx

"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function OutreachPage() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('Recruiter');
  const [context, setContext] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/network/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            username: "mannava", // Hardcoded for demo
            target_company: company,
            target_role: role,
            job_context: context
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      alert("Error generating email");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 font-mono">
      <Navbar />
      <div className="max-w-3xl mx-auto p-8 mt-10">
        
        <h1 className="text-3xl font-bold text-purple-400 mb-2">Networking Agent</h1>
        <p className="text-gray-500 mb-8">
            Don't send generic emails. Generate outreach that leverages your <span className="text-white">Verified Skill Passport</span>.
        </p>

        {/* Input Form */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Target Company</label>
                    <input 
                        className="w-full bg-gray-950 border border-gray-700 p-2 rounded" 
                        placeholder="e.g. Google"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1">Target Role</label>
                    <input 
                        className="w-full bg-gray-950 border border-gray-700 p-2 rounded" 
                        placeholder="e.g. CTO / Recruiter"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-xs text-gray-400 mb-1">Context (Optional Job Description)</label>
                <textarea 
                    className="w-full bg-gray-950 border border-gray-700 p-2 rounded h-20" 
                    placeholder="Paste a snippet of the job post here..."
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
            </div>

            <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded"
            >
                {loading ? "Drafting with Proof..." : "Generate Outreach"}
            </button>
        </div>

        {/* Output */}
        {result && (
            <div className="mt-8 space-y-4 fade-in">
                <div className="bg-gray-900 border border-purple-500/30 p-6 rounded-lg">
                    <div className="mb-4">
                        <span className="text-xs text-purple-400 uppercase font-bold">Strategy</span>
                        <p className="text-sm text-gray-300 mt-1">{result.strategy_explanation}</p>
                    </div>
                    
                    <div className="bg-white text-black p-6 rounded shadow-lg">
                        <p className="font-bold border-b border-gray-300 pb-2 mb-4">Subject: {result.subject_line}</p>
                        <p className="whitespace-pre-wrap leading-relaxed">{result.email_body}</p>
                    </div>
                    
                    <button 
                        onClick={() => navigator.clipboard.writeText(result.email_body)}
                        className="mt-4 text-xs text-purple-400 hover:text-purple-300 underline"
                    >
                        Copy to Clipboard
                    </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
}