import React, { useState } from 'react';
import { Send, Key, ShieldCheck, Loader2 } from 'lucide-react';
import Modal from '../shared/Modal';
import { api, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AccessRequest({ onToast }) {
  const { currentUser } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [otp, setOtp] = useState(['','','','','','']);
  const [verifying, setVerifying] = useState(false);
  const refs = Array.from({ length: 6 }, () => React.createRef());

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const doctorId = currentUser?.uid || 'unknown';
      const res = await api.requestAccess({ doctorId, patientId });
      setRequestId(res.data.request?.requestId);
      setOtpOpen(true);
      onToast?.('Access request sent. Enter the OTP from the patient.');
    } catch (err) { onToast?.(getErrorMessage(err), 'error'); }
    finally { setLoading(false); }
  };

  const handleOtp = (val, i) => {
    if (isNaN(val)) return;
    const n = [...otp]; n[i] = val; setOtp(n);
    if (val && i < 5) refs[i + 1].current.focus();
  };

  const verifyOtp = async () => {
    setVerifying(true);
    try {
      await api.verifyOtp({ otp: otp.join(''), requestId });
      setOtpOpen(false); setOtp(['','','','','','']); setPatientId('');
      onToast?.('OTP verified – record access granted!');
    } catch (err) { onToast?.(getErrorMessage(err) || 'Invalid OTP. Please try again.', 'error'); }
    finally { setVerifying(false); }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="section-title">Request Patient Access</h3>
      <form onSubmit={handleRequest} className="flex gap-3">
        <input type="text" value={patientId} onChange={e => setPatientId(e.target.value)} placeholder="Enter Patient ID (e.g. patient_123)" className="input-field flex-1" required />
        <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Send Request
        </button>
      </form>

      <Modal isOpen={otpOpen} onClose={() => setOtpOpen(false)} title="Patient OTP Verification">
        <div className="flex items-center gap-3 mb-6 p-3 bg-brand-500/5 rounded-xl border border-brand-500/15">
          <Key className="w-5 h-5 text-brand-400" />
          <p className="text-sm text-slate-300">The patient must share their 6-digit OTP from the MediAgent app.</p>
        </div>
        <div className="flex justify-between gap-2 mb-6">
          {otp.map((d, i) => (
            <input key={i} ref={refs[i]} type="text" maxLength={1} value={d} onChange={e => handleOtp(e.target.value, i)}
              onKeyDown={e => { if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current.focus(); }}
              className="w-12 h-14 text-center text-xl font-display font-bold input-field" />
          ))}
        </div>
        <button onClick={verifyOtp} disabled={otp.join('').length < 6 || verifying} className="btn-success w-full">
          {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {verifying ? 'Verifying...' : 'Verify & Unlock Records'}
        </button>
      </Modal>
    </div>
  );
}
