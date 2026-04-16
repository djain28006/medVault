import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle2, Stethoscope, Activity, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AlertBanner from '../components/shared/AlertBanner';

export default function Login() {
  const location = useLocation();
  const isDoctor = location.pathname.includes('doctor');
  const navigate = useNavigate();
  const { login, signup, loginWithGoogle, setRole } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState(1);
  const [bloodType, setBloodType] = useState('O+');
  const [contacts, setContacts] = useState([
    { name: '', relation: '', phone: '' },
    { name: '', relation: '', phone: '' }
  ]);

  const role = isDoctor ? 'doctor' : 'patient';
  const dashboardPath = isDoctor ? '/doctor/dashboard' : '/patient/dashboard';
  const Icon = isDoctor ? Stethoscope : UserCircle2;

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isSignup && step === 1 && !isDoctor) {
      setStep(2);
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password, role, { 
          bloodType, 
          emergencyContacts: contacts.filter(c => c.name && c.phone) 
        });
      } else {
        await login(email, password);
        setRole(role); 
      }
      navigate(dashboardPath);
    } catch (err) {
      const msg = err.message?.replace('Firebase: ', '').replace(/\(auth\/.*\)/, '').trim();
      setToast({ message: msg || 'Authentication failed', type: 'error' });
      if (isSignup) setStep(1); 
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
      setRole(role);
      navigate(dashboardPath);
    } catch (err) {
      setToast({ message: 'Google Sign-In failed', type: 'error' });
    }
  };

  const updateContact = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full blur-[120px] ${isDoctor ? 'bg-success-500/5' : 'bg-brand-500/5'}`} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.5, ease: "easeOut" }} 
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-morphism p-8 rounded-[2.5rem] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500/20 to-transparent" />
          
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg relative ${isDoctor ? 'bg-success-500/10 shadow-success-500/5' : 'bg-brand-500/10 shadow-brand-500/5'}`}
            >
              <div className={`absolute inset-0 rounded-3xl blur-xl opacity-20 ${isDoctor ? 'bg-success-500' : 'bg-brand-500'}`} />
              <Icon className={`w-10 h-10 relative z-10 ${isDoctor ? 'text-success-400' : 'text-brand-400'}`} />
            </motion.div>
            <h1 className="text-2xl font-display font-black text-white uppercase tracking-[0.2em]">{isDoctor ? 'Clinical' : 'Patient'} Portal</h1>
            <p className="text-xs text-slate-500 mt-2 font-bold tracking-widest uppercase opacity-60">
              {isSignup ? (step === 1 ? 'Step 01: Credentials' : 'Step 02: Bio-Profile') : 'Neural Sync Required'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="label ml-1">Identity Vector (Email)</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="input-field smooth-transition focus:shadow-[0_0_20px_rgba(14,165,233,0.1)]" 
                      placeholder="root@mediagent.io" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label ml-1">Access Key (Password)</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="input-field smooth-transition focus:shadow-[0_0_20px_rgba(14,165,233,0.1)]" 
                      placeholder="••••••••" 
                      required 
                      minLength={6} 
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="label ml-1 text-danger-400 font-bold">Bio-Group (Blood Type)</label>
                    <select 
                      value={bloodType} 
                      onChange={e => setBloodType(e.target.value)} 
                      className="input-field bg-slate-900 border-danger-500/30 text-white smooth-transition"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-4">
                    {contacts.map((contact, idx) => (
                      <div key={idx} className="p-5 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-4 smooth-transition hover:border-white/[0.12]">
                        <p className="text-[9px] uppercase font-black text-slate-600 tracking-[.25em]">Emergency Node {idx + 1}</p>
                        <input type="text" placeholder="Full Name" value={contact.name} onChange={e => updateContact(idx, 'name', e.target.value)} className="input-field py-2 text-sm" required={idx === 0} />
                        <div className="grid grid-cols-2 gap-3">
                           <input type="text" placeholder="Relation" value={contact.relation} onChange={e => updateContact(idx, 'relation', e.target.value)} className="input-field py-2 text-sm" required={idx === 0} />
                           <input type="tel" placeholder="Phone" value={contact.phone} onChange={e => updateContact(idx, 'phone', e.target.value)} className="input-field py-2 text-sm" required={idx === 0} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              type="submit" 
              disabled={loading} 
              className={`w-full py-4 font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl transition-all duration-300 disabled:opacity-50 ${
                isDoctor ? 'bg-success-500 hover:bg-success-600 text-white shadow-success-500/20' : 'btn-primary'
              }`}
            >
              {loading ? 'Processing Sync...' : isSignup ? (step === 1 && !isDoctor ? 'Next: Bio-Setup' : 'Initialize Account') : 'Establish Connection'}
            </motion.button>
            
            {isSignup && step === 2 && (
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-[10px] text-slate-500 hover:text-white transition-colors uppercase font-black tracking-[0.3em]"
              >
                Return to Step 01
              </button>
            )}
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Global Auth</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleGoogle} 
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 px-4 rounded-2xl transition-colors text-sm"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </motion.button>

          <div className="mt-8 text-center space-y-4">
            <button 
              onClick={() => { setIsSignup(!isSignup); setStep(1); }} 
              className="text-xs text-slate-500 hover:text-brand-400 transition-colors font-bold uppercase tracking-widest"
            >
              {isSignup ? 'Switch to Connection Sync' : "New Identity? Begin Signup"}
            </button>
            <div>
              <Link 
                to="/" 
                className="text-[10px] font-black text-slate-700 hover:text-white transition-colors uppercase tracking-[0.3em] flex items-center justify-center gap-2 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> Reset Role Selection
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {toast && <AlertBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
