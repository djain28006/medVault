import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Droplets, 
  Phone, 
  FileText, 
  Download, 
  Printer, 
  AlertTriangle, 
  Clock, 
  Pill, 
  History, 
  Zap, 
  Stethoscope, 
  ArrowLeft, 
  Loader2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { PageLoader } from '../components/shared/LoadingSpinner';

const SectionHeader = ({ title, icon: Icon, color = "text-slate-800" }) => (
  <div className="flex items-center gap-3 mb-4 border-b pb-2">
    <Icon className={`w-5 h-5 ${color}`} />
    <h3 className={`text-sm font-black uppercase tracking-[0.2em] ${color}`}>{title}</h3>
  </div>
);

export default function EmergencyView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pid = searchParams.get('pid');

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    profile: {
      displayName: "DEMO PATIENT - MEDICAL DOSSIER",
      bloodType: "A+",
      gender: "Male",
      allergies: ["Penicillin", "Sulfonamides"],
      chronicConditions: ["Diabetes Mellitus Type 2", "Hypothyroidism"],
      emergencyContacts: [
        { name: "Sarah Miller", relation: "Spouse", phone: "+1 (555) 012-3456" },
        { name: "Dr. Robert Chen", relation: "Primary Care", phone: "+1 (555) 987-6543" }
      ]
    },
    meds: [
      { drug: "METFORMIN", dosage: "500MG", slot: "Morning", frequency: "Daily" },
      { drug: "LEVOTHYROXINE", dosage: "100MCG", slot: "Morning", frequency: "Daily" },
      { drug: "GLIPIZIDE", dosage: "5MG", slot: "Night", frequency: "Twice Daily" }
    ],
    reports: [
      { filename: "HbA1c_Analysis_Mar_2024.pdf", reportType: "Blood Test", processedDate: "2024-03-15", fileUrl: "#" },
      { filename: "Thyroid_Panel_TSH_T4.pdf", reportType: "Laboratory", processedDate: "2024-02-10", fileUrl: "#" },
      { filename: "Abdominal_Ultrasound.jpg", reportType: "Imaging", processedDate: "2023-11-20", fileUrl: "https://images.unsplash.com/photo-1576086213369-97a306dca664?auto=format&fit=crop&w=100&q=80" }
    ],
    summary: {
      clinical_summary: "Patient presents with dual endocrine metabolic syndrome. HbA1c currently stabilized at 6.8%. TSH levels normalized following adjustment of synthetic thyroid hormone levels. Vigilance required for glycemic excursions during acute stressors.",
      risks: ["Hypoglycemic Risk", "Metabolic Instability"]
    }
  });

  // No actual fetching needed for the static demo report
  useEffect(() => {
    // We stay in the hardcoded demo state
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <PageLoader />;
  
  if (!pid) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="glass-morphism p-12 rounded-[2.5rem] max-w-md w-full border-danger-500/20">
          <ShieldAlert className="w-16 h-16 text-danger-500 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Access Denied</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">Identity Vector missing. Critical emergency responder context required to decrypt dossiers.</p>
          <button onClick={() => navigate('/')} className="w-full bg-slate-900 border border-white/10 text-white rounded-xl py-4 font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">Return to Nexus</button>
        </div>
      </div>
    );
  }

  const { profile, meds, reports, summary } = data;

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 selection:bg-brand-500/30 font-sans print:bg-white print:p-0">
      {/* Action Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between print:hidden">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Terminate Session
        </button>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 px-3 py-1.5 bg-danger-500/10 border border-danger-500/20 rounded-full text-[10px] text-danger-500 font-black uppercase tracking-widest animate-pulse">
            Secure Live Override
          </span>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl border border-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <Printer className="w-4 h-4" /> Export Clinical Record
          </button>
        </div>
      </div>

      {/* The Report (Paper View) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto bg-white text-slate-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden relative print:shadow-none print:w-full"
      >
        {/* PDF Style Header Accents */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 print:hidden" />
        
        {/* Main Header */}
        <div className="p-8 md:p-12 border-b-2 border-slate-100 bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center text-white font-black text-xl italic tracking-tighter shadow-lg shadow-brand-500/20">M</div>
                <h1 className="text-2xl font-black tracking-tighter uppercase">MediAgent <span className="text-slate-400">Clinical Record</span></h1>
              </div>
              <div className="pt-4">
                <h2 className="text-5xl font-black tracking-tighter text-slate-900 mb-1 leading-none break-words max-w-[500px]">
                  {profile?.displayName || "UNIDENTIFIED PATIENT"}
                </h2>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Global Medical Identifier: {pid.slice(0, 12).toUpperCase()}</p>
              </div>
            </div>
            
            <div className="text-right space-y-4 min-w-[200px]">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Official Documentation</div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date Generated</p>
                <p className="text-sm font-black">{new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="pt-4">
                <div className="inline-block px-6 py-4 bg-danger-600 text-white rounded-lg shadow-xl mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 leading-none text-center">Blood Type</p>
                  <p className="text-5xl font-black leading-none text-center">{profile?.bloodType || "O+"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-12 space-y-12">
          
          {/* Section 1: Demographic Summary */}
          <section>
            <SectionHeader title="01. Demographic Evidence" icon={Activity} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Biological Sex</p>
                <p className="text-sm font-black text-slate-900 capitalize">{profile?.gender || "Not Specified"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinical Age</p>
                <p className="text-sm font-black text-slate-900">32 Standard Years</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Physicality</p>
                <p className="text-sm font-black text-slate-900 uppercase">Static Observation • Stable</p>
              </div>
            </div>
            
            <div className="mt-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Rescue Contingency (Emergency Contacts)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile?.emergencyContacts?.length > 0 ? profile.emergencyContacts.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm border-slate-200">
                    <div>
                      <p className="text-sm font-black text-slate-900">{c.name}</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{c.relation}</p>
                    </div>
                    <p className="text-xs font-mono font-black text-brand-600">{c.phone}</p>
                  </div>
                )) : (
                  <p className="text-xs italic text-slate-400">No emergency contacts synchronized with clinical record.</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 2: Critical Alerts */}
          <section className="bg-danger-50/30 p-8 rounded-2xl border-2 border-danger-100">
            <SectionHeader title="02. Critical Biometric Alerts" icon={AlertTriangle} color="text-danger-600" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <p className="text-[10px] font-black text-danger-600/60 uppercase tracking-widest mb-4">Immunological Conflicts (Allergies)</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.allergies?.length > 0 ? profile.allergies.map(a => (
                    <span key={a} className="px-3 py-1.5 bg-danger-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                      {a}
                    </span>
                  )) : (
                    <span className="text-xs font-bold text-slate-400 italic">None Documented</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-danger-600/60 uppercase tracking-widest mb-4">Active Pathologies (Chronic Conditions)</p>
                <div className="space-y-2">
                  {profile?.chronicConditions?.length > 0 ? profile.chronicConditions.map(c => (
                    <div key={c} className="flex items-center gap-3 text-sm font-black text-slate-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-danger-600" /> {c}
                    </div>
                  )) : (
                    <p className="text-xs font-bold text-slate-400 italic">No chronic pathologies registered</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Medication Evidence */}
          <section>
            <SectionHeader title="03. Pharmacological Dossier" icon={Pill} color="text-brand-600" />
            <div className="border rounded-2xl overflow-hidden border-slate-200 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Compound Name</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Dosage</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Timeline</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Cadence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {meds?.length > 0 ? meds.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-black text-slate-900 uppercase">{m.drug}</td>
                      <td className="px-6 py-4 font-bold text-slate-600">{m.dosage}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-slate-900 text-white rounded text-[8px] font-black uppercase tracking-tighter">
                          {m.slot} Window
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-500">
                          <Clock className="w-3 h-3 text-brand-500" /> {m.frequency}
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-xs font-bold text-slate-400 italic">No medication dossiers synchronized</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4/5: History & Reports Scans */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <SectionHeader title="04. Temporal Pathologies" icon={History} />
              <div className="space-y-4">
                {profile?.chronicConditions?.slice(0, 3).map((c, i) => (
                  <div key={i} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50">
                    <p className="text-xs font-black text-slate-800 uppercase mb-1">{c}</p>
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase">Long-term observation required. Monitoring for acute exacerbations verified.</p>
                  </div>
                ))}
                {!profile?.chronicConditions?.length && (
                  <p className="text-xs italic text-slate-400">No past pathology history recorded.</p>
                )}
              </div>
            </div>
            
            <div>
              <SectionHeader title="05. Clinical Scans & Reports" icon={FileText} />
              <div className="space-y-3">
                {reports?.length > 0 ? reports.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm border-slate-200 group">
                    <div className="flex items-center gap-4 group">
                      {r.fileUrl && /\.(jpg|jpeg|png|webp)$/i.test(r.fileUrl) && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                          <img src={r.fileUrl} alt="Scan Preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-900 uppercase truncate">{r.filename || "Diagnostic Record"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-black bg-brand-500/10 text-brand-600 px-1.5 py-0.5 rounded uppercase">{r.reportType}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                            {new Date(r.processedDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {r.fileUrl && (
                      <a href={r.fileUrl} target="_blank" rel="noreferrer" className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )) : (
                  <p className="text-xs italic text-slate-400">No external diagnostic records available.</p>
                )}
              </div>
            </div>
          </section>

          {/* Section 6: AI Health Summary */}
          <section className="p-8 bg-slate-900 text-white rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none" />
            <SectionHeader title="06. Neural Intelligence Summary" icon={Zap} color="text-brand-400" />
            <div className="relative z-10">
              {summary ? (
                <div className="space-y-6">
                  <p className="text-sm font-medium leading-relaxed italic text-slate-300 border-l-2 border-brand-500 pl-6 py-2">
                    {summary.clinical_summary || "Automated clinical insight engine awaiting data ingestion from primary vector."}
                  </p>
                  {summary.risks && (
                     <div className="flex gap-4">
                       {summary.risks.map(r => (
                         <div key={r} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {r}
                         </div>
                       ))}
                     </div>
                  )}
                </div>
              ) : (
                <p className="text-xs italic text-slate-500">Synthetic intelligence analysis currently offline for this node.</p>
              )}
            </div>
          </section>

          {/* Section 7: Final Prescriptions */}
          <section className="pb-8">
            <SectionHeader title="07. Authorized Prescriptions" icon={Stethoscope} />
            <div className="space-y-4">
              {meds?.length > 0 ? meds.slice(0, 2).map((m, i) => (
                <div key={i} className="p-6 border-2 border-dashed border-slate-200 rounded-2xl relative">
                  <div className="absolute top-4 right-4 text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] rotate-12">Electronic Auth</div>
                  <h4 className="text-lg font-black text-slate-900 uppercase flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-900" /> {m.drug}
                  </h4>
                  <div className="flex items-center gap-8 mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <div>Refill Protocol: <span className="text-slate-900">Valid</span></div>
                    <div>Authorized by: <span className="text-slate-900">Nexus Med-Bot</span></div>
                  </div>
                </div>
              )) : (
                 <p className="text-xs italic text-slate-400">No structured prescriptions detected in the current clinical cycle.</p>
              )}
            </div>
          </section>

        </div>

        {/* Report Footer */}
        <div className="p-12 bg-slate-50 border-t border-slate-100 flex flex-col items-center text-center space-y-4">
          <ShieldAlert className="w-8 h-8 text-slate-300" />
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Emergency Read-Only Protocol</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest max-w-lg leading-relaxed">
              This dossier is authorized for 0.001 clinical level emergency responders only. Unauthorized access or reproduction is logged via Mediator Node {pid.slice(-6).toUpperCase()}.
            </p>
          </div>
          <div className="pt-6">
            <div className="p-2 border border-slate-200 rounded-lg inline-block grayscale opacity-20">
               <QRCodeSVG value={`EMERGENCY_DOCKET_RECOVERY_${pid}`} size={60} />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Disclaimer (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mt-12 text-center print:hidden">
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] opacity-40">MediAgent Intelligence Systems • Clinical Node V4.2.1</p>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background-color: white !important; }
          .print\\:hidden { display: none !important; }
          .glass-morphism { border: none !important; box-shadow: none !important; }
        }
      `}} />
    </div>
  );
}
