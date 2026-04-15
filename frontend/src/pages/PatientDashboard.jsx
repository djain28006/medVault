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
import IntelligenceBanner from '../components/patient/IntelligenceBanner';

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

    // Lazy sync profile to ensure email lookup works for doctors
    const syncProfile = async () => {
      try {
        await api.register('patient', currentUser?.email);
      } catch (e) {
        console.warn("Profile sync failed:", e);
      }
    };
    
    syncProfile();
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
                <IntelligenceBanner summary={summary} />

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
