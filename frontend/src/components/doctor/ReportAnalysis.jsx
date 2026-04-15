import React from 'react';
import { FileText, Eye, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';

export default function ReportAnalysis({ report }) {
  const mockFindings = [
    { label: 'HbA1c', value: '7.2%', status: 'warning', prev: '6.8%', trend: 'rising' },
    { label: 'Hemoglobin', value: '14.0 g/dL', status: 'normal', prev: '13.5 g/dL', trend: 'stable' },
    { label: 'WBC', value: '7,000/μL', status: 'normal', prev: '6,800/μL', trend: 'stable' },
    { label: 'LDL Cholesterol', value: '145 mg/dL', status: 'danger', prev: '130 mg/dL', trend: 'rising' },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="section-title">Report Analysis</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white/[0.02] rounded-xl border border-white/[0.06] flex flex-col items-center justify-center min-h-[280px]">
          <FileText className="w-16 h-16 text-slate-600 mb-3" />
          <p className="text-sm text-slate-500 text-center">Select a report from the timeline<br/>to view the full document</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">AI-Extracted Findings</span>
          </div>
          {mockFindings.map(f => (
            <div key={f.label} className={`flex items-center justify-between p-3.5 rounded-xl border ${
              f.status === 'danger' ? 'bg-danger-500/5 border-danger-500/15' : 
              f.status === 'warning' ? 'bg-warning-500/5 border-warning-500/15' : 
              'bg-white/[0.02] border-white/[0.06]'
            }`}>
              <div>
                <p className="text-xs text-slate-500 font-semibold">{f.label}</p>
                <p className="text-lg font-display font-bold text-white">{f.value}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-semibold ${f.trend === 'rising' ? 'text-danger-400' : 'text-success-400'}`}>
                  {f.trend === 'rising' ? '↑' : '→'} {f.prev}
                </span>
                {f.status === 'danger' && <div className="flex items-center gap-1 text-xs text-danger-400 mt-1"><AlertTriangle className="w-3 h-3" /> Above Range</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
