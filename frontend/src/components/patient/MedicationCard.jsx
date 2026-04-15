import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle } from 'lucide-react';

export default function MedicationCard({ med, onToggle }) {
  const isTaken = med.taken;
  
  // Define colors based on status
  const getStatusColors = () => {
    if (isTaken) return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400';
    // Logic for 'missed' could go here if we had a 'missed' flag from backend
    return 'border-slate-800 bg-slate-900/50 text-slate-400';
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${getStatusColors()}`}
    >
      {/* Background Glow */}
      {isTaken && (
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isTaken ? 'text-emerald-400' : 'text-slate-500'}`}>
              {med.slot}
            </span>
            <div className={`h-1 w-1 rounded-full ${isTaken ? 'bg-emerald-500' : 'bg-slate-700'}`} />
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {med.time}
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-slate-100">{med.drug}</h3>
          <p className="text-sm text-slate-400">{med.dosage} • {med.frequency}</p>
        </div>

        <button
          onClick={() => onToggle(med)}
          className={`group flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all duration-300 ${
            isTaken 
              ? 'bg-emerald-500 border-emerald-400 text-slate-900 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
              : 'border-slate-700 bg-slate-800 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-400'
          }`}
        >
          {isTaken ? (
            <Check className="h-6 w-6 stroke-[3px]" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-slate-600 transition-all group-hover:scale-150 group-hover:bg-emerald-500" />
          )}
        </button>
      </div>

      {/* Progress Line */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-800/50 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: isTaken ? '100%' : '0%' }}
          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
        />
      </div>
    </motion.div>
  );
}
