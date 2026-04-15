import React, { useState } from 'react';
import { Shield, ShieldCheck, ShieldOff, Clock, Lock, Unlock, Loader2 } from 'lucide-react';
import { MOCK_ACCESS_GRANTS } from '../../utils/constants';
import Modal from '../shared/Modal';
import { api, getErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AccessControl({ onToast }) {
  const { currentUser } = useAuth();
  const [grants, setGrants] = useState(MOCK_ACCESS_GRANTS);
  const [otpModal, setOtpModal] = useState(false);
  const [doctorIdInput, setDoctorIdInput] = useState('');
  const [otp, setOtp] = useState(['','','','','','']);
  const [revokeConfirm, setRevokeConfirm] = useState(null);
  const [granting, setGranting] = useState(false);
  const otpRefs = Array.from({ length: 6 }, () => React.createRef());

  const handleOtpChange = (val, idx) => {
    if (isNaN(val)) return;
    const n = [...otp]; n[idx] = val; setOtp(n);
    if (val && idx < 5) otpRefs[idx + 1].current.focus();
  };

  const handleGrantAccess = async () => {
    setGranting(true);
    try {
      const patientId = currentUser?.uid || 'unknown';
      await api.grantAccess(patientId, doctorIdInput);
      setOtpModal(false);
      setOtp(['','','','','','']);
      setDoctorIdInput('');
      onToast?.('Access granted successfully');
    } catch (err) {
      onToast?.(getErrorMessage(err), 'error');
    } finally { setGranting(false); }
  };

  const handleRevokeAccess = (id) => {
    setGrants(grants.filter(g => g.id !== id));
    setRevokeConfirm(null);
    onToast?.('Access revoked successfully');
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="section-title mb-0">Access Control</h3>
        <button onClick={() => setOtpModal(true)} className="btn-primary text-sm py-2">
          <Lock className="w-4 h-4" /> Grant New Access
        </button>
      </div>

      {grants.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No active access grants</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grants.map((g) => (
            <div key={g.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-success-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-success-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{g.doctorName}</p>
                  <p className="text-xs text-slate-500">{g.permission}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="w-3.5 h-3.5" /> Expires {new Date(g.expiry).toLocaleDateString()}</span>
                <button onClick={() => setRevokeConfirm(g.id)} className="btn-ghost text-xs text-danger-400 hover:bg-danger-500/10 py-1.5 px-3">
                  <ShieldOff className="w-3.5 h-3.5" /> Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Grant Access Modal */}
      <Modal isOpen={otpModal} onClose={() => setOtpModal(false)} title="Grant Doctor Access">
        <div className="space-y-4 mb-6">
          <div>
            <label className="label">Doctor ID</label>
            <input type="text" value={doctorIdInput} onChange={e => setDoctorIdInput(e.target.value)} className="input-field" placeholder="Enter requesting doctor's ID" />
          </div>
          <p className="text-sm text-slate-400">Enter the 6-digit OTP code shared by the doctor to authorize record access.</p>
        </div>
        <div className="flex justify-between gap-2 mb-6">
          {otp.map((d, i) => (
            <input key={i} ref={otpRefs[i]} type="text" maxLength={1} value={d} onChange={(e) => handleOtpChange(e.target.value, i)}
              onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs[i - 1].current.focus(); }}
              className="w-12 h-14 text-center text-xl font-display font-bold input-field" />
          ))}
        </div>
        <button onClick={handleGrantAccess} disabled={otp.join('').length < 6 || !doctorIdInput || granting} className="btn-primary w-full">
          {granting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
          {granting ? 'Processing...' : 'Verify & Grant'}
        </button>
      </Modal>

      {/* Revoke Confirmation */}
      <Modal isOpen={!!revokeConfirm} onClose={() => setRevokeConfirm(null)} title="Confirm Revocation">
        <p className="text-sm text-slate-400 mb-6">This will immediately terminate the doctor's access to your records. This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={() => setRevokeConfirm(null)} className="btn-ghost flex-1">Cancel</button>
          <button onClick={() => handleRevokeAccess(revokeConfirm)} className="btn-danger flex-1">Revoke Access</button>
        </div>
      </Modal>
    </div>
  );
}
