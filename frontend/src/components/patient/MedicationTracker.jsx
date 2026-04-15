import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Play, 
  AlertCircle,
  Database,
  ArrowRight,
  RefreshCcw 
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../shared/NotificationCenter';
import MedicationCard from './MedicationCard';

export default function MedicationTracker() {
  const { currentUser } = useAuth();
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);

  useEffect(() => {
    fetchMeds();
    
    // Listen for report upload events to auto-refresh
    const handleRefresh = () => fetchMeds();
    window.addEventListener('refresh-meds', handleRefresh);
    return () => window.removeEventListener('refresh-meds', handleRefresh);
  }, [currentUser]);

  const fetchMeds = async () => {
    try {
      setLoading(true);
      const res = await api.getMedications(currentUser.uid);
      setMeds(res.data.medications || []);
    } catch (err) {
      console.error('Failed to fetch meds:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMed = async (med) => {
    const newStatus = !med.taken;
    try {
      // Optimistic update
      setMeds(prev => prev.map(m => m.id === med.id ? { ...m, taken: newStatus } : m));
      
      await api.updateMedStatus(currentUser.uid, med.medId, med.slot, newStatus);
      
      if (newStatus) {
        notify({
          title: 'Dosage Recorded',
          message: `${med.drug} (${med.slot}) has been marked as taken.`,
          category: 'ADHERENCE',
          type: 'info'
        });
      }
    } catch (err) {
      // Rollback
      setMeds(prev => prev.map(m => m.id === med.id ? { ...m, taken: !newStatus } : m));
      notify({
        title: 'Update Failed',
        message: 'Could not sync medication status with database.',
        type: 'critical'
      });
    }
  };

  const handleFinalize = async () => {
    const missed = meds.filter(m => !m.taken);
    setIsFinalizing(true);
    
    try {
      if (missed.length > 0) {
        notify({
          title: 'Adherence Alert Triggered',
          message: `Sending real-time clinical outreach for ${missed.length} missed doses.`,
          category: 'CRITICAL',
          type: 'critical'
        });
        
        await api.triggerAdherenceAlert(currentUser.uid, missed.map(m => m.drug));
      } else {
        notify({
          title: 'Perfect Adherence',
          message: 'All scheduled dosages for today have been confirmed.',
          category: 'SUCCESS',
          type: 'info'
        });
      }
    } catch (err) {
      console.error('Finalize failed:', err);
    } finally {
      setIsFinalizing(false);
    }
  };

  // Group medications by slot for the timeline
  const slots = ['Morning', 'Afternoon', 'Night'];
  const progress = meds.length > 0 ? Math.round((meds.filter(m => m.taken).length / meds.length) * 100) : 0;

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-emerald-500" />
      <p className="mt-4 text-slate-500">Retrieving intelligence baseline...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-2 flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/40 p-8 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="mb-2 flex items-center gap-2 text-emerald-400">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Daily Schedule</span>
              </div>
              <button 
                onClick={fetchMeds}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
                title="Refresh Pipeline"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <h2 className="text-3xl font-black text-white">Medication Pipeline</h2>
            <p className="mt-2 text-slate-400">Automated adherence tracking synchronized with clinical records.</p>
          </div>

          <div className="mt-8 flex items-end gap-6">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase text-slate-500">
                <span>Daily Adherence</span>
                <span className="text-emerald-400">{progress}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-800 ring-4 ring-slate-900/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center">
              <div className="text-2xl font-black text-white">{meds.filter(m => m.taken).length}/{meds.length}</div>
              <div className="text-[10px] font-bold uppercase text-slate-500">Doses Taken</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 backdrop-blur-md">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-white">Outreach Protocol</h3>
            <p className="text-sm text-slate-400 leading-relaxed mt-2">
              If dosages are missed, the Medication Agent will autonomously trigger professional clinical reminders via Resend.
            </p>
          </div>
          <button
            onClick={handleFinalize}
            disabled={isFinalizing || meds.length === 0}
            className="group mt-6 flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-900 transition-all hover:bg-emerald-400 disabled:opacity-50"
          >
            {isFinalizing ? 'SYNCING AGENTS...' : 'FINALIZE ADHERENCE'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      {/* Timeline Sections */}


      <div className="space-y-12">
        {slots.map((slot, index) => {
          const slotMeds = meds.filter(m => m.slot.toLowerCase() === slot.toLowerCase());
          if (slotMeds.length === 0) return null;

          return (
            <div key={slot} className="relative">
              {/* Timeline Connector */}
              {index < slots.length - 1 && (
                <div className="absolute left-[23px] top-12 bottom-[-48px] w-0.5 bg-gradient-to-b from-slate-800 to-transparent" />
              )}

              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 font-black text-slate-100 shadow-xl">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{slot} Window</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    {slotMeds.length} Active Dossiers
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pl-16">
                <AnimatePresence mode="popLayout">
                  {slotMeds.map(med => (
                    <MedicationCard key={med.id} med={med} onToggle={toggleMed} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}

        {meds.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-800 py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-slate-700">
              <Activity className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-400">No Active Medications Found</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-slate-600">
              Upload a medical report or prescription to automatically extract and schedule your medication pipeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
