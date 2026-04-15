import React from 'react';
import { motion } from 'framer-motion';
import { GaugeChart, TrendLineChart } from '../shared/Chart';
import { MOCK_HEALTH_TREND } from '../../utils/constants';
import { TrendingUp, Zap, Heart, ShieldCheck } from 'lucide-react';

const getCategory = (s) => s >= 80 ? { label: 'HEALTHY', color: 'text-success-400', bg: 'bg-success-500/10' } :
  s >= 60 ? { label: 'MONITOR', color: 'text-warning-400', bg: 'bg-warning-500/10' } :
  s >= 40 ? { label: 'ATTENTION', color: 'text-orange-400', bg: 'bg-orange-500/10' } :
  { label: 'CRITICAL', color: 'text-danger-400', bg: 'bg-danger-500/10' };

const recommendations = {
  HEALTHY: 'Maintain your current lifestyle. Continue regular checkups.',
  MONITOR: 'Some metrics need attention. Review medication adherence.',
  ATTENTION: 'Schedule a consultation with your doctor soon.',
  CRITICAL: 'Seek immediate medical attention. Contact your physician.',
};

import DiseaseProgressTracker from './DiseaseProgressTracker';

// ... (previous helper functions and recommendations)

export default function HealthScoreCard({ score = 0, factors = [], summary = null, loading = false }) {
  const cat = getCategory(score);

  return (
    <div className="glass-card p-6 relative overflow-hidden h-full flex flex-col font-sans">
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl" />
      <h3 className="section-title">Health Score</h3>

      <div className="flex flex-col lg:flex-row items-center gap-8 mb-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <GaugeChart value={score} size={180} />
        </motion.div>

        <div className="flex-1 space-y-5 w-full">
          <div className="flex items-center gap-3">
            <span className={`badge ${cat.bg} ${cat.color} border-none text-sm font-bold px-3 py-1`}>{cat.label}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {factors.map((f, i) => (
              <span key={i} className="badge badge-blue">{f}</span>
            ))}
          </div>

          <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Recommendation</span>
            </div>
            <p className="text-sm text-slate-300">{recommendations[cat.label]}</p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/[0.06]">
        {loading ? (
          <div className="h-48 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
          </div>
        ) : (
          <DiseaseProgressTracker tracker={summary?.condition_tracker} />
        )}
      </div>
    </div>
  );
}


