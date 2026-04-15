import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Activity, ArrowLeft, Droplets, Phone } from 'lucide-react';
import { api } from '../services/api';
import AlertBanner from '../components/shared/AlertBanner';

export default function Emergency() {
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [criticalInfo, setCriticalInfo] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.scanQR({ qrData });
      const res = await api.getCriticalInfo('patient_123');
      setCriticalInfo(res.data);
    } catch {
      setToast({ message: 'Invalid or expired payload', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-danger-500/30">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-500 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-4 h-4" /> Exit
          </button>
          <span className="animate-pulse bg-danger-500 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">No-Auth Zone</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-black border border-danger-500/30 rounded-2xl p-8 md:p-12 text-center mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-danger-500 to-transparent animate-pulse" />
          <AlertTriangle className="w-16 h-16 text-danger-500 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
          <h1 className="text-3xl md:text-4xl font-display font-extrabold mb-2">EMERGENCY ACCESS</h1>
          <p className="text-danger-400/80 text-sm font-semibold uppercase tracking-[0.2em]">24-Hour Override Protocol</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!criticalInfo ? (
            <motion.form key="form" onSubmit={handleScan} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-black/80 border border-white/[0.08] rounded-2xl p-8">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">QR Payload Data</label>
              <textarea value={qrData} onChange={e => setQrData(e.target.value)} className="w-full h-32 bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 font-mono text-sm text-slate-300 focus:border-danger-500 focus:outline-none focus:ring-1 focus:ring-danger-500 resize-none placeholder-slate-700 transition-all" placeholder="Paste encoded payload..." required />
              <button type="submit" disabled={loading} className="w-full mt-6 bg-danger-500 hover:bg-danger-600 disabled:opacity-50 text-white font-display font-bold uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg shadow-danger-500/20">
                {loading ? 'DECODING...' : 'OVERRIDE & ACCESS'}
              </button>
            </motion.form>
          ) : (
            <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-black border border-danger-500 rounded-2xl p-8 relative shadow-[0_0_30px_rgba(239,68,68,0.08)]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-danger-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full">Authorized</div>

                <h2 className="text-xs font-bold text-danger-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2 border-b border-danger-500/20 pb-4">
                  <Activity className="w-4 h-4 animate-pulse" /> Critical Medical Dossier
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/[0.02] p-6 rounded-xl border border-white/[0.06]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Blood Type</p>
                    <div className="flex items-center gap-3">
                      <Droplets className="w-8 h-8 text-danger-400" />
                      <p className="text-5xl font-display font-black">{criticalInfo.bloodType || 'O+'}</p>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] p-6 rounded-xl border border-white/[0.06]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Severe Allergens</p>
                    <div className="flex flex-wrap gap-2">
                      {(criticalInfo.allergies || ['Penicillin']).map(a => <span key={a} className="badge badge-red text-sm">{a}</span>)}
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-white/[0.02] p-6 rounded-xl border border-white/[0.06]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Chronic Conditions</p>
                    <div className="space-y-2">
                      {(criticalInfo.chronicConditions || ['Type 2 Diabetes']).map(c => (
                        <div key={c} className="flex items-center gap-3 text-lg font-medium">
                          <div className="w-2 h-2 rounded-full bg-danger-500 animate-pulse" /> {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-danger-500/20 text-center">
                  <p className="text-sm text-danger-400 font-mono font-bold animate-pulse bg-danger-500/10 inline-block px-4 py-2 rounded-lg border border-danger-500/20">EXPIRES IN: 23:59:59</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {toast && <AlertBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
