import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md">
        <div className="glass-card p-8">
          <div className="flex flex-col items-center mb-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${isDoctor ? 'bg-success-500/10 shadow-success-500/10' : 'bg-brand-500/10 shadow-brand-500/10'}`}>
              <Icon className={`w-8 h-8 ${isDoctor ? 'text-success-400' : 'text-brand-400'}`} />
            </div>
            <h1 className="text-xl font-display font-bold text-white uppercase tracking-[0.15em]">{isDoctor ? 'Doctor' : 'Patient'} Portal</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isSignup ? (step === 1 ? 'Step 1: Create Account' : 'Step 2: Emergency Profile') : 'Authenticate to continue'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="label">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="••••••••" required minLength={6} />
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="label text-danger-400 font-bold">Blood Type</label>
                  <select value={bloodType} onChange={e => setBloodType(e.target.value)} className="input-field bg-slate-900 border-danger-500/30 text-white">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                
                {contacts.map((contact, idx) => (
                  <div key={idx} className="p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl space-y-3">
                    <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Emergency Contact {idx + 1}</p>
                    <input type="text" placeholder="Full Name" value={contact.name} onChange={e => updateContact(idx, 'name', e.target.value)} className="input-field py-2 text-sm" required={idx === 0} />
                    <div className="grid grid-cols-2 gap-2">
                       <input type="text" placeholder="Relation (e.g. Spouse)" value={contact.relation} onChange={e => updateContact(idx, 'relation', e.target.value)} className="input-field py-2 text-sm" required={idx === 0} />
                       <input type="tel" placeholder="Phone Number" value={contact.phone} onChange={e => updateContact(idx, 'phone', e.target.value)} className="input-field py-2 text-sm underline decoration-brand-500/30" required={idx === 0} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button type="submit" disabled={loading} className={`w-full py-3 font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
              isDoctor ? 'bg-success-500 hover:bg-success-600 text-white shadow-success-500/20' : 'btn-primary'
            }`}>
              {loading ? 'Authenticating...' : isSignup ? (step === 1 && !isDoctor ? 'Next: Emergency Setup' : 'Create Account') : 'Access Dashboard'}
            </button>
            
            {isSignup && step === 2 && (
              <button type="button" onClick={() => setStep(1)} className="w-full text-xs text-slate-500 hover:text-white transition-colors uppercase font-bold tracking-widest">
                Go Back
              </button>
            )}
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-slate-800 font-semibold py-3 px-4 rounded-xl transition-colors">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>

          <div className="mt-6 text-center space-y-3">
            <button onClick={() => setIsSignup(!isSignup)} className="text-sm text-slate-400 hover:text-brand-400 transition-colors">
              {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
            <div>
              <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-brand-400 transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Change Role
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {toast && <AlertBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
