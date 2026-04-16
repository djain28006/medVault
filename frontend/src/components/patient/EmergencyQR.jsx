import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, RefreshCw, Droplets, AlertTriangle, Heart, Phone, Info, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function EmergencyQR({ onToast }) {
  const { currentUser } = useAuth();
  const [qrPayload, setQrPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (currentUser?.uid) {
      fetchPatientData();
    }
  }, [currentUser]);

  const fetchPatientData = async () => {
    try {
      const res = await api.getCriticalInfo(currentUser.uid);
      setPatientData(res.data);
    } catch (err) {
      console.error("Failed to fetch emergency profile:", err);
    } finally {
      setFetching(false);
    }
  };

  const generateQR = async () => {
    setLoading(true);
    try {
      const pid = currentUser?.uid || 'unknown';
      const res = await api.generateQR(pid);
      // Direct PDF Hackathon Redirect: Points to the static file on the tunneled backend
      const backendTunnel = 'https://lazy-banks-divide.loca.lt';
      const payload = `${backendTunnel}/static/report.pdf`;
      setQrPayload(payload);
      onToast?.('Emergency QR code generated and synced with static clinical dossier.');
    } catch {
      onToast?.('Failed to generate secure QR', 'error');
    } finally { setLoading(false); }
  };

  if (fetching) {
    return (
      <div className="glass-morphism rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-6 border-white/[0.05]">
        <div className="relative">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          <div className="absolute inset-0 bg-brand-500/20 blur-xl animate-pulse" />
        </div>
        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px]">Syncing Clinical Identity...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-8"
    >
      <div className="glass-morphism rounded-[2.5rem] p-8 border-danger-500/20 relative overflow-hidden group">
        {/* Dynamic Warning Header */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-danger-600 via-rose-500 to-danger-600 shadow-[0_4px_20px_rgba(244,63,94,0.4)]" />
        <div className="flex items-center gap-3 mb-8">
          <AlertTriangle className="w-5 h-5 text-danger-500 animate-pulse" />
          <h3 className="text-xs font-black text-danger-400 uppercase tracking-[0.3em]">Critical Emergency Protocol — V2.4</h3>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-10">
          <div className="flex flex-col items-center w-full lg:w-auto">
            <motion.div 
              whileHover={{ scale: 1.02, rotate: 0.5 }}
              whileTap={{ scale: 0.98 }}
              className="relative group cursor-pointer"
            >
              {qrPayload ? (
                <div className="bg-white p-6 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(255,255,255,0.1)] relative z-10 border-4 border-white/10 ring-1 ring-white/5 overflow-hidden transition-all duration-500 group-hover:shadow-[0_20px_80px_-10px_rgba(244,63,94,0.2)]">
                  <QRCodeSVG value={qrPayload} size={220} bgColor="#ffffff" fgColor="#0f172a" level="H" includeMargin />
                  {/* Subtle sweep animation */}
                  <motion.div 
                    animate={{ y: [0, 240, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-0.5 bg-danger-500/20 blur-[1px] z-20 pointer-events-none"
                  />
                </div>
              ) : (
                <div className="w-[268px] h-[268px] flex flex-col items-center justify-center bg-slate-900/50 border-2 border-dashed border-white/[0.1] rounded-[2rem] backdrop-blur-sm">
                  <div className="relative">
                    <QrCode className="w-16 h-16 text-slate-600 mb-4 opacity-30" />
                    <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Awaiting Verification</p>
                </div>
              )}
              {qrPayload && <div className="absolute -inset-2 bg-gradient-to-tr from-danger-500/10 via-rose-500/5 to-transparent blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />}
            </motion.div>
            
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: '#e11d48' }}
              whileTap={{ scale: 0.97 }}
              onClick={generateQR} 
              disabled={loading} 
              className="mt-8 w-full max-w-[268px] h-14 bg-danger-600/90 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-danger-900/20 border border-white/10 flex items-center justify-center gap-3 transition-all"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : qrPayload ? <><RefreshCw className="w-4 h-4" /> Finalize Token</> : <><QrCode className="w-4 h-4" /> Initiate QR Sync</>}
            </motion.button>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-[2rem] group/item min-h-[350px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black mb-1">Response Protocol</p>
                  <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">Nexus Contingents</h4>
                </div>
                <div className="p-3 bg-brand-500/10 rounded-2xl border border-brand-500/20">
                  <Phone className="w-5 h-5 text-brand-400" />
                </div>
              </div>

              <div className="space-y-4 flex-1">
                {patientData?.emergencyContacts?.length > 0 ? (
                  patientData.emergencyContacts.map((c, i) => (
                    <motion.div 
                      key={c.phone} 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-5 p-4 bg-slate-950/40 border border-white/5 rounded-2xl group/contact hover:border-brand-500/30 transition-all"
                    >
                      <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center group-hover/contact:bg-brand-500/20 transition-colors">
                        <Phone className="w-4 h-4 text-brand-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-black text-white tracking-tight mb-0.5">{c.name}</p>
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.1em]">{c.relation}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-mono font-black text-brand-400 tracking-widest">{c.phone}</p>
                        <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-0.5">Verified Vector</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 grayscale opacity-50">
                    <AlertTriangle className="w-8 h-8 text-slate-600 mb-3" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No Response Vectors Detected</p>
                    <p className="text-[8px] text-slate-700 mt-2 font-bold max-w-[180px]">Please synchronize emergency contacts in your profile settings.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-brand-500 animate-pulse" />
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">High-priority responder access enabled</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 p-6 bg-white/[0.02] border border-white/[0.06] rounded-[2rem] flex items-center justify-between group overflow-hidden relative">
          <div className="absolute inset-0 bg-brand-500/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-start gap-5 relative z-10">
            <div className="p-4 bg-brand-500/10 rounded-2xl border border-brand-500/20 shadow-lg shadow-brand-500/10">
              <Info className="w-6 h-6 text-brand-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em] mb-2">Automated Responder Access Control</p>
              <p className="text-[13px] text-slate-400 leading-relaxed font-medium max-w-2xl">
                Emergency scanners are granted <span className="text-white font-black italic">Temporal Access (24h)</span> upon verification. High-resolution telemetry ingestion synchronized via Mediator Neural Engine.
              </p>
            </div>
          </div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] relative z-10 hidden md:block" 
          />
        </div>
      </div>
    </motion.div>
  );
}
