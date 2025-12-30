// frontend/src/app/kanban/page.tsx
"use client";
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

const COLUMNS = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];

export default function KanbanPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');

  // Fetch on load
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/kanban/list')
      .then(res => res.json())
      .then(data => setApps(data));
  }, []);

  const addApp = async () => {
    if(!newRole || !newCompany) return;
    const body = { role_title: newRole, company_name: newCompany, status: 'Wishlist' };
    
    // Optimistic Update
    setApps([...apps, { ...body, id: 'temp-' + Date.now() }]);
    setNewRole(''); setNewCompany('');

    await fetch('http://127.0.0.1:8000/api/kanban/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });
    // Re-fetch to sync IDs
    const res = await fetch('http://127.0.0.1:8000/api/kanban/list');
    setApps(await res.json());
  };

  const moveCard = async (id: string, newStatus: string) => {
    const updated = apps.map(a => a.id === id ? { ...a, status: newStatus } : a);
    setApps(updated);
    await fetch('http://127.0.0.1:8000/api/kanban/update', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ id, status: newStatus })
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono overflow-x-auto">
      <Navbar />
      <div className="p-8 w-full min-w-[1200px]">
        
        {/* Header / Add New */}
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-yellow-500">Mission Control</h1>
            <div className="flex gap-2">
                <input 
                    placeholder="Role (e.g. Backend Dev)" 
                    className="bg-black border border-gray-700 p-2 rounded"
                    value={newRole} onChange={e => setNewRole(e.target.value)}
                />
                <input 
                    placeholder="Company (e.g. Acme)" 
                    className="bg-black border border-gray-700 p-2 rounded"
                    value={newCompany} onChange={e => setNewCompany(e.target.value)}
                />
                <button onClick={addApp} className="bg-yellow-600 px-4 rounded font-bold hover:bg-yellow-500">+</button>
            </div>
        </div>

        {/* Board */}
        <div className="grid grid-cols-5 gap-4">
            {COLUMNS.map(col => (
                <div key={col} className="bg-gray-800/50 p-4 rounded-lg min-h-[500px] border border-gray-700">
                    <h2 className="text-center font-bold mb-4 uppercase text-xs tracking-widest text-gray-400 border-b border-gray-700 pb-2">{col}</h2>
                    <div className="space-y-3">
                        {apps.filter(a => a.status === col).map(app => (
                            <div key={app.id} className="bg-gray-900 p-4 rounded shadow border border-gray-800 hover:border-yellow-500 transition-colors cursor-pointer group relative">
                                <h3 className="font-bold text-sm">{app.role_title}</h3>
                                <p className="text-xs text-gray-500">{app.company_name}</p>
                                
                                {/* Quick Move Actions */}
                                <div className="hidden group-hover:flex absolute top-1 right-1 gap-1">
                                    {COLUMNS.indexOf(col) < 4 && (
                                        <button onClick={()=>moveCard(app.id, COLUMNS[COLUMNS.indexOf(col)+1])} className="text-[10px] bg-green-700 px-1 rounded">→</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}