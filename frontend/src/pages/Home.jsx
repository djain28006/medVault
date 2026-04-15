import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, UserCircle2, Stethoscope, ArrowRight, ShieldAlert, FileText, Lock, Zap, BarChart3 } from 'lucide-react';

function AnimatedCounter({ target, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

const features = [
  { icon: FileText, title: 'Smart OCR Processing', desc: 'Upload PDFs and images — AI automatically extracts and categorizes medical data.' },
  { icon: Lock, title: 'Zero-Trust Security', desc: 'Granular OTP-based access control with full audit trails and emergency overrides.' },
  { icon: Zap, title: 'Real-Time Health Scores', desc: 'Rule-based health scoring engine with medication adherence monitoring.' },
  { icon: BarChart3, title: 'Clinical Intelligence', desc: 'AI-powered cross-report analysis with trend detection and anomaly flagging.' },
];

const stats = [
  { value: 12500, label: 'Patients Monitored', suffix: '+' },
  { value: 48000, label: 'Reports Processed', suffix: '+' },
  { value: 320, label: 'Doctors Connected', suffix: '' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-brand-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-600/5 rounded-full blur-[100px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-success-500/10 border border-success-500/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span className="text-xs font-bold text-success-400 tracking-[0.15em] uppercase">System Operational</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6">
              <span className="text-white">The Future of</span><br />
              <span className="text-gradient">Healthcare AI</span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-lg mb-10">
              MediAgent orchestrates 7 autonomous AI agents to manage your entire healthcare journey — from OCR-powered report extraction to emergency QR-based triage.
            </p>

            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/login/patient')} className="btn-primary text-base py-3.5 px-8">
                <UserCircle2 className="w-5 h-5" /> Get Started
              </button>
              <button onClick={() => navigate('/login/doctor')} className="btn-ghost text-base py-3.5 px-8 border border-white/[0.08]">
                <Stethoscope className="w-5 h-5" /> Doctor Portal
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="flex-1 max-w-md w-full">
            <div className="glass-card p-8 space-y-5">
              {[
                { icon: UserCircle2, title: "I'm a Patient", desc: 'Upload reports, track health, manage access', path: '/login/patient', color: 'text-brand-400' },
                { icon: Stethoscope, title: "I'm a Doctor", desc: 'View patients, write prescriptions, analyze', path: '/login/doctor', color: 'text-success-400' },
              ].map((card) => (
                <button key={card.path} onClick={() => navigate(card.path)}
                  className="w-full flex items-center gap-4 p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.05] hover:border-brand-500/30 transition-all group text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-brand-500/10 transition-colors">
                    <card.icon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-white">{card.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{card.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <p className="text-4xl font-display font-black text-white"><AnimatedCounter target={s.value} />{s.suffix}</p>
              <p className="text-sm text-slate-500 font-semibold uppercase tracking-widest mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-display font-bold text-white text-center mb-4">Powered by 7 Autonomous Agents</h2>
          <p className="text-center text-slate-400 max-w-2xl mx-auto mb-16">Each agent specializes in a specific healthcare domain, working together to deliver a seamless end-to-end platform.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card p-7 group">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-5 group-hover:bg-brand-500/20 transition-colors">
                <f.icon className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="py-12 max-w-6xl mx-auto px-6">
        <div className="glass-card p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-danger-500/15">
          <div className="flex items-center gap-4">
            <ShieldAlert className="w-8 h-8 text-danger-400" />
            <div>
              <p className="text-white font-display font-bold">Emergency Responder?</p>
              <p className="text-sm text-slate-500">Access critical patient data instantly via QR scan</p>
            </div>
          </div>
          <button onClick={() => navigate('/emergency')} className="btn-danger whitespace-nowrap">
            <ShieldAlert className="w-4 h-4" /> Emergency Access
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Activity className="w-4 h-4 text-brand-500" />
          <span className="font-display font-semibold">MediAgent</span> · AI-Powered Healthcare Platform
        </div>
      </footer>
    </div>
  );
}
