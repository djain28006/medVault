import React, { useState, useEffect } from 'react';
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
      setQrPayload(res.data.qrCodePayload);
      onToast?.('Emergency QR code generated and synced with identity.');
    } catch {
      onToast?.('Failed to generate secure QR', 'error');
    } finally { setLoading(false); }
  };

  if (fetching) {
    return (
      <div className="glass-card p-12 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-slate-500 font-medium">Syncing emergency profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-danger-500/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger-500 to-danger-600 rounded-t-2xl" />
        <h3 className="section-title text-danger-400">Emergency Protocol & QR</h3>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex flex-col items-center">
            <div className="relative group">
              {qrPayload ? (
                <div className="bg-white p-6 rounded-2xl shadow-2xl transition-transform group-hover:scale-[1.02]">
                  <QRCodeSVG value={qrPayload} size={200} bgColor="#ffffff" fgColor="#0f172a" level="H" includeMargin />
                </div>
              ) : (
                <div className="w-[248px] h-[248px] flex flex-col items-center justify-center bg-white/[0.03] border-2 border-dashed border-white/[0.1] rounded-2xl">
                  <QrCode className="w-16 h-16 text-slate-600 mb-3 opacity-20" />
                  <p className="text-sm text-slate-500">Awaiting Generation</p>
                </div>
              )}
              {qrPayload && <div className="absolute inset-0 bg-danger-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />}
            </div>
            
            <button onClick={generateQR} disabled={loading} className="btn-danger mt-6 w-full max-w-[248px] h-12">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : qrPayload ? <><RefreshCw className="w-4 h-4" /> Refresh Token</> : <><QrCode className="w-4 h-4" /> Generate QR</>}
            </button>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="p-4 bg-danger-500/5 border border-danger-500/15 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Droplets className="w-6 h-6 text-danger-400" />
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Blood Type</p>
                  <p className="text-3xl font-display font-black text-white">{patientData?.bloodType || 'Not Set'}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-3">Critical Allergies</p>
              <div className="flex flex-wrap gap-2">
                {patientData?.allergies?.length > 0 ? (
                  patientData.allergies.map(a => <span key={a} className="px-3 py-1.5 bg-danger-500/10 border border-danger-500/20 text-danger-400 rounded-lg text-xs font-bold uppercase tracking-wider">{a}</span>)
                ) : <span className="text-slate-500 text-xs italic">No allergies registered</span>}
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-3">Chronic Conditions</p>
              <div className="flex flex-wrap gap-2">
                {patientData?.chronicConditions?.length > 0 ? (
                  patientData.chronicConditions.map(c => <span key={c} className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-bold uppercase tracking-wider">{c}</span>)
                ) : <span className="text-slate-500 text-xs italic">No chronic conditions registered</span>}
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-3">Emergency Contacts</p>
              {patientData?.emergencyContacts?.length > 0 ? (
                patientData.emergencyContacts.map(c => (
                  <div key={c.phone} className="flex items-center gap-3 text-sm py-1">
                    <Phone className="w-3.5 h-3.5 text-brand-400" />
                    <span className="text-white font-bold">{c.name}</span>
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">({c.relation})</span>
                    <span className="text-brand-400 font-mono ml-auto">{c.phone}</span>
                  </div>
                ))
              ) : <span className="text-slate-500 text-xs italic">No contacts added</span>}
            </div>
          </div>
        </div>

        <div className="mt-8 p-5 bg-brand-500/5 border border-brand-500/15 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-brand-500/10 rounded-xl">
            <Info className="w-5 h-5 text-brand-400" />
          </div>
          <div className="text-sm text-slate-400">
            <p className="font-bold text-brand-300 mb-1 uppercase tracking-widest text-[10px]">Security Protocol</p>
            <p className="leading-relaxed">Emergency responders receive <span className="text-white font-bold">24-hour read-only access</span> to this dashboard upon scanning. All access logs are timestamped and visible in your primary security audit log.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
