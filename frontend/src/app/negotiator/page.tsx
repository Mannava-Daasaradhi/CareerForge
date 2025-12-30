// frontend/src/app/negotiator/page.tsx

"use client";
import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function NegotiatorPage() {
  const [started, setStarted] = useState(false);
  const [role, setRole] = useState('Senior Backend Engineer');
  
  // State for the "Game"
  const [offer, setOffer] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [critique, setCritique] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const startScenario = async () => {
    setLoading(true);
    const res = await fetch('http://127.0.0.1:8000/api/negotiator/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, location: "New York" })
    });
    const data = await res.json();
    setOffer(data);
    setHistory([{ role: 'assistant', content: data.hr_comment }]);
    setStarted(true);
    setLoading(false);
  };

  const sendReply = async () => {
    if(!input) return;
    setLoading(true);
    
    // Optimistic Update
    const newHistory = [...history, { role: 'user', content: input }];
    setHistory(newHistory);
    setInput('');

    const res = await fetch('http://127.0.0.1:8000/api/negotiator/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            history: newHistory,
            current_offer: offer
        })
    });
    const data = await res.json();
    
    setOffer(data.new_offer);
    setHistory([...newHistory, { role: 'assistant', content: data.reply }]);
    setCritique(data.critique);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-mono">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: THE CONTRACT (Offer Details) */}
        <div className="lg:col-span-1 space-y-4">
            <div className="bg-white text-black p-6 rounded shadow-xl border-t-8 border-green-600">
                <h2 className="text-2xl font-bold mb-4">EMPLOYMENT OFFER</h2>
                {!offer ? (
                   <div className="text-center py-10">
                      <p className="text-gray-500 mb-4">Configuring Role...</p>
                      <input 
                        value={role} 
                        onChange={(e)=>setRole(e.target.value)}
                        className="border p-2 w-full mb-2"
                      />
                      <button 
                        onClick={startScenario}
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded w-full font-bold"
                      >
                        {loading ? "Generating Lowball..." : "BEGIN SIMULATION"}
                      </button>
                   </div>
                ) : (
                    <div className="space-y-4 animate-pulse-once">
                        <div>
                            <span className="block text-xs font-bold text-gray-500 uppercase">Base Salary</span>
                            <span className="text-3xl font-bold tracking-tighter">${offer.base_salary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">Signing Bonus</span>
                                <span className="text-xl font-bold">${offer.sign_on.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-gray-500 uppercase">Equity</span>
                                <span className="text-xl font-bold">{offer.equity}</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                             <span className="block text-xs font-bold text-gray-500 uppercase">HR Mood</span>
                             <span className={`badge ${offer.hr_mood === 'Annoyed' ? 'text-red-600' : 'text-blue-600'} font-bold`}>
                                {offer.hr_mood}
                             </span>
                        </div>
                    </div>
                )}
            </div>

            {/* CRITIQUE BOX */}
            {critique && (
                <div className="bg-purple-900/50 border border-purple-500 p-4 rounded text-sm">
                    <h3 className="text-purple-300 font-bold mb-2">⚡ COACHING TIP</h3>
                    <p className="mb-2"><span className="text-gray-400">Detected:</span> {critique.tactic_detected}</p>
                    <p className="mb-2"><span className="text-red-400">Mistake:</span> {critique.mistake}</p>
                    <p><span className="text-green-400">Try Saying:</span> "{critique.better_response}"</p>
                </div>
            )}
        </div>

        {/* RIGHT: THE NEGOTIATION CHAT */}
        <div className="lg:col-span-2 flex flex-col h-[600px] bg-black border border-gray-800 rounded">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {history.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded ${
                            msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                        }`}>
                            <p className="text-sm">{msg.content}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            {started && (
                <div className="p-4 border-t border-gray-800 bg-gray-900 flex gap-2">
                    <input 
                        className="flex-1 bg-black border border-gray-700 p-3 rounded text-white focus:border-green-500 outline-none"
                        placeholder="Counter offer... (e.g. 'I have a competing offer for $180k')"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                    />
                    <button 
                        onClick={sendReply}
                        disabled={loading}
                        className="bg-green-600 px-6 rounded font-bold hover:bg-green-500 disabled:opacity-50"
                    >
                        SEND
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}