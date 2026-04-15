import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Activity, QrCode, Shield, Pill, Zap } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import DashboardStats from '../components/patient/DashboardStats';
import HealthScoreCard from '../components/patient/HealthScoreCard';
import ReportUpload from '../components/patient/ReportUpload';
import ReportsList from '../components/patient/ReportsList';
import MedicationTracker from '../components/patient/MedicationTracker';
import AccessControl from '../components/patient/AccessControl';
import EmergencyQR from '../components/patient/EmergencyQR';
import AlertBanner from '../components/shared/AlertBanner';
import HackathonNudgeSystem from '../components/shared/HackathonNudgeSystem';
import { api } from '../services/api';

import { useAuth } from '../context/AuthContext';

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'access', label: 'Access Control', icon: Shield },
  { id: 'emergency', label: 'Emergency QR', icon: QrCode },
];

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const patientId = currentUser?.uid;

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [reports, setReports] = useState([]);
  const [medications, setMedications] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingScore, setLoadingScore] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingVitals, setLoadingVitals] = useState(true);


  useEffect(() => {
    if (!patientId) return;
    refreshData();
  }, [patientId]);

  const refreshData = async () => {
    setLoadingScore(true);
    setLoadingReports(true);
    setLoadingSummary(true);

    try {
      // Parallel fetch for speed
      const [scoreRes, reportsRes, medsRes, summaryRes, vitalsRes] = await Promise.all([
        api.getHealthScore(patientId),
        api.getMyReports(patientId),
        api.getMedications(patientId),
        api.getPatientSummary(patientId),
        api.getVitals(patientId)
      ]);
      setHealthScore(scoreRes.data);
      setReports(reportsRes.data.reports || []);
      setMedications(medsRes.data.medications || []);
      setSummary(summaryRes.data);
      setVitals(vitalsRes.data || []);
    } catch (err) {

      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoadingScore(false);
      setLoadingReports(false);
      setLoadingSummary(false);
      setLoadingVitals(false);
    }

  };

  const statCards = [
    { label: 'Total Reports', value: reports.length, icon: FileText, iconBg: 'bg-brand-500/10', iconColor: 'text-brand-400' },
    { label: 'Health Score', value: healthScore?.score ?? '—', icon: Activity, iconBg: 'bg-success-500/10', iconColor: 'text-success-400', sub: healthScore?.category },
    { label: 'Active Meds', value: medications.length, icon: Pill, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400' },
    { label: 'Access Grants', value: 2, icon: Shield, iconBg: 'bg-warning-500/10', iconColor: 'text-warning-400' },
  ];

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar items={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} role="patient" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 pt-16 lg:pl-60">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <DashboardStats stats={statCards} />
                
                {/* PREMIUM AI INSIGHTS BANNER */}
                {summary && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-brand-600/20 via-slate-900/40 to-slate-950 p-8 shadow-2xl backdrop-blur-3xl"
                  >
                    {/* Animated Background Highlights */}
                    <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand-500/10 blur-[100px] animate-pulse" />
                    <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[100px] animate-pulse" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md">
                            <Zap className="w-5 h-5 text-brand-400" />
                          </div>
                          <div>
                            <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em]">Neural Intelligence Analysis</h4>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Real-time Comparative Logic Active</p>
                          </div>
                        </div>
                        <p className="text-xl font-bold text-white leading-snug drop-shadow-sm italic">
                          "{summary.summary}"
                        </p>
                      </div>

                      {summary.condition_tracker && (
                        <div className="min-w-[320px] rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {summary.condition_tracker.conditionName} Progress
                            </span>
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ring-1 ${
                              summary.condition_tracker.status === 'Improving' ? 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' : 
                              summary.condition_tracker.status === 'Stable' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20' : 
                              'bg-rose-500/10 text-rose-400 ring-rose-500/20'
                            }`}>
                              {summary.condition_tracker.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div>
                              <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Latest {summary.condition_tracker.metricName}</div>
                              <div className="text-2xl font-black text-white">{summary.condition_tracker.latestValue}</div>
                            </div>
                            <div className="h-8 w-px bg-white/10" />
                            <div>
                              <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Previous Result</div>
                              <div className="text-xl font-bold text-slate-400">{summary.condition_tracker.previousValue}</div>
                            </div>
                          </div>
                          
                          <p className="mt-4 text-[11px] text-slate-400 leading-relaxed font-medium">
                            {summary.condition_tracker.assessment}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <HealthScoreCard 
                    score={healthScore?.score || 0} 
                    factors={healthScore?.factors || []} 
                    summary={summary} 
                    loading={loadingSummary} 
                  />
                  <div className="space-y-6">

                    <ReportUpload onSuccess={(msg) => { showToast(msg); refreshData(); }} onError={(msg) => showToast(msg, 'error')} />
                    <ReportsList reports={reports.slice(0, 3)} loading={loadingReports} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <ReportUpload onSuccess={(msg) => { showToast(msg); refreshReports(); }} onError={(msg) => showToast(msg, 'error')} />
                <ReportsList reports={reports} loading={loadingReports} />
              </div>
            )}

            {activeTab === 'medications' && <MedicationTracker />}
            {activeTab === 'access' && <AccessControl onToast={(msg) => showToast(msg)} />}
            {activeTab === 'emergency' && <EmergencyQR onToast={(msg) => showToast(msg)} />}
          </motion.div>
        </div>
        <Footer />
      </main>

      {toast && <AlertBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <HackathonNudgeSystem healthScore={healthScore} />
    </div>

  );
}
