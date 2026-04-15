import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Download, RefreshCw, Droplets, AlertTriangle, Heart, Phone, Info } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const criticalInfo = {
  bloodType: 'O+', allergies: ['Penicillin', 'Sulfa Drugs'],
  conditions: ['Type 2 Diabetes', 'Hypertension'],
  contacts: [{ name: 'Jane Doe', relation: 'Spouse', phone: '+91-9876543210' }],
};

export default function EmergencyQR({ onToast }) {
  const { currentUser } = useAuth();
  const [qrPayload, setQrPayload] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    setLoading(true);
    try {
      const pid = currentUser?.uid || 'unknown';
      const res = await api.generateQR(pid);
      setQrPayload(res.data.qrCodePayload || 'emergency_payload_' + pid);
      onToast?.('Emergency QR code generated');
    } catch {
      onToast?.('Failed to generate QR');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6 border-danger-500/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger-500 to-danger-600 rounded-t-2xl" />
        <h3 className="section-title text-danger-400">Emergency QR Code</h3>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="flex flex-col items-center">
            {qrPayload ? (
              <div className="bg-white p-6 rounded-2xl shadow-glass-lg">
                <QRCodeSVG value={qrPayload} size={200} bgColor="#ffffff" fgColor="#0f172a" level="H" includeMargin />
              </div>
            ) : (
              <div className="w-[248px] h-[248px] flex flex-col items-center justify-center bg-white/[0.03] border-2 border-dashed border-white/[0.1] rounded-2xl">
                <QrCode className="w-16 h-16 text-slate-600 mb-3" />
                <p className="text-sm text-slate-500">Not yet generated</p>
              </div>
            )}
            <button onClick={generateQR} disabled={loading} className="btn-danger mt-4 w-full max-w-[248px]">
              {qrPayload ? <><RefreshCw className="w-4 h-4" /> Regenerate</> : <><QrCode className="w-4 h-4" /> Generate QR Code</>}
            </button>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="p-4 bg-danger-500/5 border border-danger-500/15 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <Droplets className="w-6 h-6 text-danger-400" />
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Blood Type</p>
                  <p className="text-3xl font-display font-black text-white">{criticalInfo.bloodType}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Known Allergies</p>
              <div className="flex flex-wrap gap-2">
                {criticalInfo.allergies.map(a => <span key={a} className="badge badge-red">{a}</span>)}
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Chronic Conditions</p>
              <div className="flex flex-wrap gap-2">
                {criticalInfo.conditions.map(c => <span key={c} className="badge badge-yellow">{c}</span>)}
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-2">Emergency Contacts</p>
              {criticalInfo.contacts.map(c => (
                <div key={c.phone} className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-brand-400" />
                  <span className="text-white font-medium">{c.name}</span>
                  <span className="text-slate-500">({c.relation})</span>
                  <span className="text-brand-400 font-mono">{c.phone}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-brand-500/5 border border-brand-500/15 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-400">
            <p className="font-semibold text-brand-300 mb-1">What happens when scanned?</p>
            <p>Emergency responders will receive instant read-only access to your critical medical information for 24 hours without needing OTP verification. All access is logged and auditable.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
