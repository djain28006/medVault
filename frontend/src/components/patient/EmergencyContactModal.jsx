import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  UserPlus, 
  Phone, 
  Link2, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';

const ContactSlot = ({ 
  index, 
  data, 
  onChange, 
  isMandatory, 
  error 
}) => {
  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      error ? 'bg-danger-500/5 border-danger-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
          isMandatory ? 'bg-brand-500 text-white' : 'bg-slate-700 text-slate-400'
        }`}>
          {index + 1}
        </div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Emergency Contact {index + 1} {isMandatory && <span className="text-danger-500 ml-1">*</span>}
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter ml-1">Full Name</label>
          <input
            type="text"
            placeholder="e.g. Sarah Miller"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter ml-1">Relationship</label>
          <input
            type="text"
            placeholder="e.g. Spouse"
            value={data.relation}
            onChange={(e) => onChange('relation', e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-tighter ml-1">Contact Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="98765-43210"
              value={data.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none transition-all font-mono"
            />
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-3 flex items-center gap-1.5 text-[9px] font-black text-danger-500 uppercase tracking-widest animate-pulse">
          <AlertCircle className="w-3 h-3" /> {error}
        </div>
      )}
    </div>
  );
};

export default function EmergencyContactModal({ patientId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([
    { name: '', relation: '', phone: '' },
    { name: '', relation: '', phone: '' },
    { name: '', relation: '', phone: '' }
  ]);
  const [errors, setErrors] = useState({});

  const handleUpdate = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
    // Clear error when typing
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors = {};
    let isValid = true;

    // Validate first 2 mandatory contacts
    [0, 1].forEach(i => {
      const c = contacts[i];
      if (!c.name.trim() || !c.relation.trim() || !c.phone.trim()) {
        newErrors[i] = "All fields required for mandatory contact";
        isValid = false;
      } else if (c.phone.trim().length < 8) {
        newErrors[i] = "Invalid contact number length";
        isValid = false;
      }
    });

    // Light validation for Contact 3 if any field is filled
    const c3 = contacts[2];
    if (c3.name.trim() || c3.relation.trim() || c3.phone.trim()) {
      if (!c3.name.trim() || !c3.relation.trim() || !c3.phone.trim()) {
        newErrors[2] = "Complete all fields for optional contact";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Filter out empty optional contact if present
      const validContacts = contacts
        .map(c => ({
          name: c.name.trim(),
          relation: c.relation.trim(),
          phone: c.phone.trim()
        }))
        .filter(c => c.name && c.relation && c.phone);

      await api.updateProfile(patientId, { emergencyContacts: validContacts });
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save emergency contacts:", err);
    } finally {
      setLoading(false);
    }
  };

  const isFormPartiallyValid = 
    contacts[0].name && contacts[0].phone && 
    contacts[1].name && contacts[1].phone;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl selection:bg-brand-500/30">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-3xl w-full bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-danger-500/10 rounded-2xl">
                  <ShieldAlert className="w-6 h-6 text-danger-500" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Emergency Protocol <span className="text-danger-500">Required</span></h2>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                MedVault requires at least <span className="text-white font-bold underline underline-offset-4 decoration-danger-500/50">two active emergency vectors</span> to stabilize your Clinical Identity.
              </p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950/50 border border-white/5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-danger-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Verification</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {contacts.map((contact, i) => (
                <ContactSlot
                  key={i}
                  index={i}
                  data={contact}
                  isMandatory={i < 2}
                  onChange={(field, val) => handleUpdate(i, field, val)}
                  error={errors[i]}
                />
              ))}
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-slate-500">
                <CheckCircle2 className={`w-5 h-5 transition-colors ${isFormPartiallyValid ? 'text-brand-500' : 'text-slate-700'}`} />
                <p className="text-[10px] font-black uppercase tracking-widest">Structure requirements verified</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`relative group overflow-hidden px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${
                  loading 
                    ? 'bg-slate-800 text-white/50 cursor-wait' 
                    : 'bg-white text-slate-900 hover:scale-105 active:scale-95 shadow-xl shadow-brand-500/10'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-brand-400/0 via-white/5 to-brand-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Finalize Response Vectors
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="bg-slate-950/50 px-8 py-4 flex items-center justify-center border-t border-white/5">
           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Secure clinical synchronization • MedVault V4.2</p>
        </div>
      </motion.div>
    </div>
  );
}
