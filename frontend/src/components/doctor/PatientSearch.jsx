import React, { useState } from 'react';
import { Search, Eye, User } from 'lucide-react';

export default function PatientSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const mockPatients = [
    { id: 'patient_123', name: 'John Doe', age: 45, condition: 'Type 2 Diabetes' },
    { id: 'patient_456', name: 'Sarah Miller', age: 32, condition: 'Hypertension' },
    { id: 'patient_789', name: 'Raj Patel', age: 58, condition: 'Cardiac Arrhythmia' },
  ];
  const filtered = query ? mockPatients.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.id.includes(query)) : mockPatients;

  return (
    <div className="glass-card p-6">
      <h3 className="section-title">Active Patients</h3>
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or ID..." className="input-field pl-10" />
      </div>
      <div className="space-y-2">
        {filtered.map((p) => (
          <div key={p.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                <User className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-slate-500">{p.id} · {p.condition}</p>
              </div>
            </div>
            <button onClick={() => onSelect?.(p.id)} className="btn-ghost text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-400">
              <Eye className="w-3.5 h-3.5" /> View Summary
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
