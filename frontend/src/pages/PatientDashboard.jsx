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
import EmergencyContactModal from '../components/patient/EmergencyContactModal';
import AlertBanner from '../components/shared/AlertBanner';
import HackathonNudgeSystem from '../components/shared/HackathonNudgeSystem';
import { api } from '../services/api';
import IntelligenceBanner from '../components/patient/IntelligenceBanner';
import ClinicalNotes from '../components/shared/ClinicalNotes';

import { useAuth } from '../context/AuthContext';

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'access', label: 'Access Control', icon: Shield },
  { id: 'emergency', label: 'Emergency QR', icon: QrCode },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

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
  const [doctorNotes, setDoctorNotes] = useState([]);
  const [loadingScore, setLoadingScore] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [profile, setProfile] = useState(null);


  useEffect(() => {
    console.log("PatientDashboard: Initializing with patientId:", patientId);
    if (!patientId) {
      console.warn("PatientDashboard: No patientId available. Auth state:", currentUser);
      return;
    }
    
    // Lazy sync profile to ensure email lookup works for doctors
    const syncProfile = async () => {
      try {
        console.log("PatientDashboard: Syncing profile...");
        await api.register('patient', currentUser?.email);
      } catch (e) {
        console.warn("Profile sync failed:", e);
      }
    };
    
    syncProfile();
    refreshData();
  }, [patientId]);

  const refreshData = async () => {
    console.log("PatientDashboard: refreshData triggered for:", patientId);
    setLoadingScore(true);
    setLoadingReports(true);
    setLoadingSummary(true);
    setLoadingNotes(true);

    try {
      // Parallel fetch for speed
      console.log("PatientDashboard: Starting parallel fetch...");
      const [scoreRes, reportsRes, medsRes, summaryRes, vitalsRes, profileRes, notesRes] = await Promise.all([
        api.getHealthScore(patientId),
        api.getMyReports(patientId),
        api.getMedications(patientId),
        api.getPatientSummary(patientId),
        api.getVitals(patientId),
        api.getProfile(patientId),
        api.getPatientDoctorNotes(patientId)
      ]);
      
      console.log("PatientDashboard: Fetch success. Results:", { 
        score: scoreRes.data, 
        reports: reportsRes.data.reports?.length, 
        meds: medsRes.data.medications?.length,
        notes: notesRes.data.notes?.length,
        profileFound: !!profileRes.data
      });

      setHealthScore(scoreRes.data);
      setReports(reportsRes.data.reports || []);
      setMedications(medsRes.data.medications || []);
      setSummary(summaryRes.data);
      setVitals(vitalsRes.data || []);
      setProfile(profileRes.data);
      setDoctorNotes(notesRes.data.notes || []);

      // MANDATORY CHECK: Show modal if < 2 contacts
      if (profileRes.data && (!profileRes.data.emergencyContacts || profileRes.data.emergencyContacts.length < 2)) {
        setShowEmergencyModal(true);
      } else {
        setShowEmergencyModal(false);
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoadingScore(false);
      setLoadingReports(false);
      setLoadingSummary(false);
      setLoadingVitals(false);
      setLoadingNotes(false);
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

      <main className="flex-1 pt-16 lg:pl-64">
        <div className="p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
          <motion.div 
            key={activeTab} 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">
                {/* ROW 1: STATS */}
                <motion.div variants={itemVariants} className="w-full">
                  <DashboardStats stats={statCards} />
                </motion.div>
                
                {/* ROW 2: MAIN CONTENT SPLIT (60/40) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT COLUMN (60%) - Intelligence & Notes */}
                <div className="lg:col-span-7 space-y-6 flex flex-col h-full">
                  {/* Intelligence Panel */}
                  <motion.div variants={itemVariants} className="flex-1">
                    <IntelligenceBanner summary={summary} />
                  </motion.div>

                  {/* Clinical History & Notes */}
                  <motion.div variants={itemVariants} className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl shadow-brand-500/5">
                    <ClinicalNotes 
                      notes={doctorNotes} 
                      loading={loadingNotes} 
                      canAdd={false} 
                    />
                  </motion.div>
                </div>

                {/* RIGHT COLUMN (40%) - Score, Upload, Archives */}
                <div className="lg:col-span-5 space-y-6 flex flex-col">
                  {/* Health Score Gauge */}
                  <motion.div variants={itemVariants}>
                    <HealthScoreCard 
                      score={healthScore?.score || 0} 
                      factors={healthScore?.factors || []} 
                      summary={summary} 
                      loading={loadingSummary} 
                    />
                  </motion.div>
                  
                  {/* Data Ingestion (Upload) */}
                  <motion.div variants={itemVariants}>
                    <ReportUpload 
                      onSuccess={(msg) => { showToast(msg); refreshData(); }} 
                      onError={(msg) => showToast(msg, 'error')} 
                    />
                  </motion.div>

                  {/* Clinical Archives */}
                  <motion.div variants={itemVariants} className="flex-1">
                    <ReportsList reports={reports.slice(0, 5)} loading={loadingReports} />
                  </motion.div>
                </div>
              </div>
            </div>
          )}

            {activeTab === 'reports' && (
              <div className="space-y-8">
                <motion.div variants={itemVariants}>
                  <ReportUpload onSuccess={(msg) => { showToast(msg); refreshData(); }} onError={(msg) => showToast(msg, 'error')} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <ReportsList reports={reports} loading={loadingReports} />
                </motion.div>
              </div>
            )}

            {activeTab === 'medications' && (
              <motion.div variants={itemVariants}>
                <MedicationTracker />
              </motion.div>
            )}
            
            {activeTab === 'access' && (
              <motion.div variants={itemVariants}>
                <AccessControl onToast={(msg) => showToast(msg)} />
              </motion.div>
            )}

            {activeTab === 'emergency' && (
              <motion.div variants={itemVariants}>
                <EmergencyQR onToast={(msg) => showToast(msg)} />
              </motion.div>
            )}
          </motion.div>
        </div>
        <Footer />
      </main>


      {toast && <AlertBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <HackathonNudgeSystem healthScore={healthScore} />
      
      {/* Mandatory Emergency Contacts Modal */}
      {showEmergencyModal && (
        <EmergencyContactModal 
          patientId={patientId} 
          onSuccess={() => {
            setShowEmergencyModal(false);
            showToast("Emergency vectors synchronized successfully.");
            refreshData(); // Re-verify and update profile state
          }} 
        />
      )}
    </div>

  );
}
