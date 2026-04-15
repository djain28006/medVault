import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye } from 'lucide-react';

export default function ReportsList({ reports = [], loading }) {
  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="section-title">My Reports</h3>
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-white/[0.04] rounded-xl animate-pulse" />)}</div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h3 className="section-title">My Reports</h3>
      {reports.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No reports uploaded yet</p>
          <p className="text-sm mt-1">Upload your first medical report above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r, i) => (
            <motion.div key={r.reportId || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{r.filename || 'Medical Report'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="badge badge-blue">{r.reportType || 'document'}</span>
                    <span className="text-xs text-slate-500">{r.processedDate ? new Date(r.processedDate).toLocaleDateString() : ''}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {r.fileUrl && r.fileUrl !== 'mock_url_since_firebase_not_configured' && (
                  <a href={r.fileUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors text-slate-400 hover:text-brand-400" aria-label="View file">
                    <Eye className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
