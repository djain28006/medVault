import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Key, FilePlus, Activity, ClipboardList, BarChart3 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import PatientSearch from '../components/doctor/PatientSearch';
import PatientTimeline from '../components/doctor/PatientTimeline';
import AccessRequest from '../components/doctor/AccessRequest';
import PrescriptionForm from '../components/doctor/PrescriptionForm';
import ReportAnalysis from '../components/doctor/ReportAnalysis';
import DashboardStats from '../components/patient/DashboardStats';
import AlertBanner from '../components/shared/AlertBanner';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'patients', label: 'My Patients', icon: Users },
  { id: 'access', label: 'Request Access', icon: Key },
  { id: 'prescriptions', label: 'Prescriptions', icon: FilePlus },
  { id: 'analysis', label: 'Report Analysis', icon: ClipboardList },
];

export default function DoctorDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const handlePatientSelect = async (patientId) => {
    setSelectedPatient(patientId);
    setLoadingSummary(true);
    try {
      const res = await api.getPatientSummary(patientId);
      setSummary(res.data);
    } catch { showToast('Failed to load patient summary', 'error'); }
    finally { setLoadingSummary(false); }
  };

  const statCards = [
    { label: 'Active Patients', value: 3, icon: Users, iconBg: 'bg-brand-500/10', iconColor: 'text-brand-400' },
    { label: 'Prescriptions Issued', value: 12, icon: FilePlus, iconBg: 'bg-success-500/10', iconColor: 'text-success-400' },
    { label: 'Pending Requests', value: 1, icon: Key, iconBg: 'bg-warning-500/10', iconColor: 'text-warning-400' },
    { label: 'Reports Analyzed', value: 28, icon: Activity, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar items={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} role="doctor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 pt-16 lg:pl-60">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <DashboardStats stats={statCards} />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <PatientSearch onSelect={handlePatientSelect} />
                  {loadingSummary ? (
                    <div className="glass-card p-6 flex items-center justify-center min-h-[300px]">
                      <div className="flex flex-col items-center gap-3 text-slate-500">
                        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm font-medium">Analyzing patient data...</p>
                      </div>
                    </div>
                  ) : summary ? (
                    <div className="glass-card p-6 relative overflow-hidden">
                      <div className="absolute -right-12 -top-12 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl" />
                      <h3 className="section-title">Clinical Summary</h3>
                      <h4 className="text-xl font-display font-bold text-white mb-4">{summary.patientId}</h4>
                      <p className="text-sm text-slate-300 leading-relaxed p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] mb-4">{summary.summary}</p>
                      <div className="flex gap-2 flex-wrap">
                        {summary.trends?.map((t, i) => <span key={i} className="badge badge-blue">{t}</span>)}
                      </div>
                    </div>
                  ) : (
                    <div className="glass-card p-6 flex items-center justify-center text-center min-h-[300px]">
                      <div className="text-slate-500">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="font-medium">Select a patient to view their clinical summary</p>
                      </div>
                    </div>
                  )}
                </div>
                <PatientTimeline />
              </div>
            )}

            {activeTab === 'patients' && (
              <div className="space-y-6">
                <PatientSearch onSelect={handlePatientSelect} />
                <PatientTimeline />
              </div>
            )}

            {activeTab === 'access' && <AccessRequest onToast={showToast} />}
            {activeTab === 'prescriptions' && <PrescriptionForm patientId={selectedPatient || 'patient_123'} onToast={showToast} />}
            {activeTab === 'analysis' && <ReportAnalysis />}
          </motion.div>
        </div>
        <Footer />
      </main>

      {toast && <AlertBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
