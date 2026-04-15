import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function IntelligenceBanner({ summary }) {
  if (!summary) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-brand-600/20 via-slate-900/40 to-slate-950 p-8 shadow-2xl backdrop-blur-3xl"
    >
      {/* Animated Background Highlights */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px] animate-pulse" />
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px] animate-pulse" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
              <Zap className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em]">Neural Intelligence Analysis</h4>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Real-time Comparative Logic Active</p>
            </div>
          </div>
          <p className="text-xl font-bold text-white leading-snug drop-shadow-sm italic">
            "{summary.summary}"
          </p>
        </div>

        {summary.condition_tracker && (
          <div className="min-w-[320px] rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {summary.condition_tracker.conditionName} Progress
              </span>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ring-1 ${
                summary.condition_tracker.status === 'Improving' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 
                summary.condition_tracker.status === 'Stable' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20' : 
                'bg-rose-500/10 text-rose-400 ring-rose-500/20'
              }`}>
                {summary.condition_tracker.status}
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <div>
                <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Latest {summary.condition_tracker.metricName}</div>
                <div className="text-2xl font-black text-white">{summary.condition_tracker.latestValue}</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Previous Result</div>
                <div className="text-xl font-bold text-slate-400">{summary.condition_tracker.previousValue}</div>
              </div>
            </div>
            
            <p className="mt-4 text-[11px] text-slate-400 leading-relaxed font-medium">
              {summary.condition_tracker.assessment}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
