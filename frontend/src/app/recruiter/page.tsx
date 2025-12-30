// frontend/src/app/recruiter/page.tsx

"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function RecruiterPage() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  // In a real app, this would come from the URL (e.g., /recruiter/mannava)
  // For demo, we hardcode 'mannava' or allow input
  const [targetUser, setTargetUser] = useState('mannava'); 

  const handleAsk = async () => {
    if (!question) return;
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/recruiter/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: targetUser, question }),
      });
      const data = await res.json();
      setResponse(data.reply);
    } catch (err) {
      setResponse("Error connecting to Digital Twin.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-mono">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 mt-10">
        
        {/* Header Section */}
        <div className="border-b border-gray-800 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-green-400">
            Digital Twin Interface <span className="text-sm text-gray-500">v4.0</span>
          </h1>
          <p className="text-gray-400 mt-2">
            You are speaking to the AI agent representing <span className="text-white font-bold">{targetUser}</span>.
            It answers based on <span className="italic">verified cryptographic proofs</span>, not just claims.
          </p>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Chat */}
          <div className="md:col-span-2 space-y-4">
             <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg min-h-[300px]">
                {response ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{response}</p>
                ) : (
                  <p className="text-gray-600 italic">Waiting for recruiter inquiry...</p>
                )}
             </div>

             <div className="flex gap-2">
               <input 
                 type="text" 
                 value={question}
                 onChange={(e) => setQuestion(e.target.value)}
                 placeholder="e.g., Does he truly understand System Design?"
                 className="flex-1 bg-gray-900 border border-gray-700 p-3 rounded focus:outline-none focus:border-green-500"
               />
               <button 
                 onClick={handleAsk}
                 disabled={loading}
                 className="bg-green-600 hover:bg-green-500 px-6 py-3 rounded font-bold disabled:opacity-50"
               >
                 {loading ? "Thinking..." : "ASK TWIN"}
               </button>
             </div>
          </div>

          {/* Side Panel: Suggested Questions */}
          <div className="space-y-4">
             <div className="bg-gray-900 p-4 rounded border border-gray-800">
               <h3 className="text-gray-400 text-sm font-bold uppercase mb-3">Verification Data</h3>
               <div className="space-y-2 text-sm text-gray-500">
                 <p>• GitHub Trust Score: <span className="text-green-400">Locked</span></p>
                 <p>• Skill Passport: <span className="text-green-400">Verified</span></p>
                 <p>• Identity: <span className="text-green-400">Confirmed</span></p>
               </div>
             </div>
             
             <div className="bg-gray-900 p-4 rounded border border-gray-800">
               <h3 className="text-gray-400 text-sm font-bold uppercase mb-3">Try Asking:</h3>
               <ul className="space-y-2 text-sm text-blue-400 cursor-pointer">
                 <li onClick={() => setQuestion("What are your verified backend skills?")}>"What are your verified skills?"</li>
                 <li onClick={() => setQuestion("Tell me about a time you failed a challenge.")}>"Tell me about a failure."</li>
                 <li onClick={() => setQuestion("Why should I hire you over a Senior Dev?")}>"Why hire you?"</li>
               </ul>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}