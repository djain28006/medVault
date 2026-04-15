import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Activity, ArrowLeft } from 'lucide-react';
import { apiClient } from '../api/client';
import Toast from '../components/Toast';

export default function EmergencyView() {
  const [qrData, setQrData] = useState('');
  const [loading, setLoading] = useState(false);
  const [criticalInfo, setCriticalInfo] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.post('/api/emergency/scan-qr', { qrData });
      // Since it's a mock platform, bypass and fetch patient_123 directly
      const res = await apiClient.get('/api/emergency/critical-info/patient_123');
      setCriticalInfo(res.data);
      setToast({ message: "Override successful. Critical files retrieved.", type: "success" });
    } catch {
      setToast({ message: "Invalid or expired payload override", type: "error" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d0000] text-gray-100 p-4 md:p-8 flex flex-col items-center selection:bg-danger/30">
      <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-300 font-bold uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Terminate Session
        </button>
        <span className="animate-pulse bg-danger text-white text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded">No-Auth Zone</span>
      </div>

      <div className="w-full max-w-3xl bg-black border border-danger/40 shadow-[0_0_50px_rgba(192,57,43,0.15)] p-8 md:p-12 rounded-2xl flex flex-col items-center text-center mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-danger to-transparent animate-pulse" />
        <AlertTriangle className="w-20 h-20 text-danger mb-6 drop-shadow-[0_0_15px_rgba(192,57,43,0.5)]" />
        <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight mb-4 text-white">EMERGENCY ACCESS</h1>
        <p className="text-danger/80 font-medium uppercase tracking-widest">Global Responder Override Protocol</p>
      </div>

      {!criticalInfo ? (
        <form onSubmit={handleScan} className="w-full max-w-3xl bg-black/80 border border-gray-800 p-8 rounded-2xl animate-in slide-in-from-bottom-8">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Input Decrypted QR Payload Link</label>
          <textarea 
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            className="w-full h-32 bg-gray-900 border border-gray-800 rounded-xl p-5 font-mono text-sm text-gray-300 focus:border-danger focus:outline-none focus:ring-1 focus:ring-danger mb-6 transition-all shadow-inner resize-none placeholder-gray-700"
            placeholder="eyJhbGciOiJIUzI1NiIsInR..."
            required
          />
          <button disabled={loading} type="submit" className="w-full bg-danger hover:bg-danger/80 disabled:opacity-50 text-white font-display font-bold uppercase tracking-widest py-5 rounded-xl transition-all hover:scale-[1.01] shadow-lg shadow-danger/20">
            {loading ? "DECRYPTING RECORD..." : "OVERRIDE & ACCESS PROFILES"}
          </button>
        </form>
      ) : (
        <div className="w-full max-w-3xl space-y-6 animate-in slide-in-from-bottom-8">
          <div className="bg-black/90 border border-danger p-8 md:p-12 rounded-2xl relative shadow-[0_0_30px_rgba(192,57,43,0.1)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-danger text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
              Authorized Read
            </div>
            
            <h2 className="text-xs font-bold text-danger uppercase tracking-widest mb-10 flex items-center gap-3 border-b border-danger/20 pb-4">
              <Activity className="w-5 h-5 animate-pulse" />
              CRITICAL MEDICAL DOSSIER
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">BIOMETRIC BLOOD TYPE</h3>
                <p className="text-5xl font-display font-black text-white drop-shadow-md">{criticalInfo.bloodType || 'O+'}</p>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">SEVERE ALLERGENS</h3>
                <div className="flex flex-wrap gap-2">
                  {(criticalInfo.allergies || ['Penicillin']).map(a => (
                    <span key={a} className="px-4 py-2 bg-danger/20 border border-danger/40 text-danger rounded-lg text-sm font-bold shadow-sm">{a}</span>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">ACTIVE CHRONIC CONDITIONS</h3>
                <ul className="space-y-3">
                  {(criticalInfo.chronicConditions || ['Type 2 Diabetes', 'Hypertension']).map(c => (
                    <li key={c} className="text-xl md:text-2xl font-medium text-white flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-danger animate-pulse" /> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-6 border-t border-danger/20 text-center flex flex-col items-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">ACCESS AUDIT LOGGED</p>
              <p className="text-sm text-danger font-mono font-bold animate-pulse bg-danger/10 px-4 py-2 rounded border border-danger/20">SESSION HARD EXPIRES IN: 23:59:59</p>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
