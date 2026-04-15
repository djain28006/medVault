import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';
import FilePreview from '../shared/FilePreview';
import { REPORT_TYPES } from '../../utils/constants';
import { api, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const stages = ['Uploading file...', 'Scanning document...', 'Extracting metrics via OCR...', 'Categorizing report...', 'Complete!'];

export default function ReportUpload({ onSuccess, onError }) {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState('blood_test');
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((accepted) => {
    if (accepted.length) { setFile(accepted[0]); setResult(null); setProgress(0); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }, maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file || !currentUser) return;
    setUploading(true); setStage(0); setResult(null); setProgress(0);
    const interval = setInterval(() => setStage((s) => Math.min(s + 1, 4)), 800);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('patientId', currentUser.uid); // Use actual Firebase UID
      fd.append('reportType', reportType);
      
      const res = await api.uploadReport(fd, (event) => {
        const pct = Math.round((event.loaded * 100) / event.total);
        setProgress(pct);
      });
      
      clearInterval(interval); setStage(4); setProgress(100);
      setResult(res.data.report || res.data);
      const msg = res.data.message || 'Report processed successfully';
      onSuccess?.(msg);
      // Trigger global refresh for medications
      window.dispatchEvent(new CustomEvent('refresh-meds'));
      setFile(null); // Clear form after success
    } catch (e) {
      clearInterval(interval);
      onError?.(getErrorMessage(e));
    } finally { setUploading(false); }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="section-title">Upload Medical Report</h3>

      <div {...getRootProps()} className={`relative w-full h-44 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
        isDragActive ? 'border-brand-500 bg-brand-500/5' : 'border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.15]'
      }`}>
        <input {...getInputProps()} />
        {file ? <FilePreview file={file} /> : (
          <>
            <UploadCloud className={`w-10 h-10 mb-3 ${isDragActive ? 'text-brand-400' : 'text-slate-500'}`} />
            <p className="text-sm font-medium text-slate-300">Drag & drop your report here, or click to browse</p>
            <p className="text-xs text-slate-500 mt-1.5">PDF, PNG, JPG up to 10MB</p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <div>
          <label className="label">Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="input-field">
            {REPORT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={handleUpload} disabled={!file || uploading} className="btn-primary w-full">
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : <><UploadCloud className="w-4 h-4" /> Upload Report</>}
          </button>
        </div>
      </div>

      {/* Upload progress bar */}
      <AnimatePresence>
        {uploading && progress > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div className="h-full bg-brand-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing stages */}
      <AnimatePresence>
        {uploading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-5 space-y-2 overflow-hidden">
            {stages.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 text-sm transition-colors duration-300 ${i <= stage ? 'text-brand-400' : 'text-slate-600'}`}>
                {i < stage ? <CheckCircle className="w-4 h-4 text-success-400" /> : i === stage ? <Loader2 className="w-4 h-4 animate-spin" /> : <div className="w-4 h-4 rounded-full border border-slate-700" />}
                {s}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-4 bg-success-500/5 border border-success-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-success-400" />
              <span className="text-sm font-bold text-success-400">Successfully Processed</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Report ID:</span> <span className="text-white font-mono">{result.reportId}</span></div>
              <div><span className="text-slate-500">Type:</span> <span className="badge badge-blue">{result.reportType}</span></div>
              {result.extractedData && Object.entries(result.extractedData).map(([k, v]) => (
                <div key={k}><span className="text-slate-500">{k}:</span> <span className="text-white font-semibold">{v}</span></div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
