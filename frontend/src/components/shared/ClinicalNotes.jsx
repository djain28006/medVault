import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  User, 
  Calendar, 
  Tag, 
  Plus, 
  Send,
  AlertCircle,
  Stethoscope,
  Pill,
  ClipboardList,
  Search,
  MessageSquare,
  Loader2
} from 'lucide-react';

const CATEGORIES = {
  allergy: { label: 'Allergy', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: AlertCircle },
  medication: { label: 'Medication', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: Pill },
  observation: { label: 'Observation', color: 'bg-brand-500/10 text-brand-400 border-brand-500/20', icon: Stethoscope },
  diagnosis: { label: 'Diagnosis', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: ClipboardList },
  'follow-up': { label: 'Follow-up', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Calendar },
  warning: { label: 'Warning', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertCircle },
};

const DEMO_NOTES = [
  {
    noteId: 'demo-1',
    category: 'warning',
    title: 'Critical Penicillin Sensitivity',
    doctorName: 'Dr. Sharma',
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    content: 'Patient exhibits severe Type I hypersensitivity to Penicillin-G. Cross-reactivity with cephalosporins suspected. Strictly avoid all beta-lactam vectors.',
    tags: ['allergy', 'high-risk', 'penicillin']
  },
  {
    noteId: 'demo-2',
    category: 'diagnosis',
    title: 'Type 2 Diabetes Mellitus',
    doctorName: 'Dr. Sharma',
    timestamp: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
    content: 'Long-standing T2DM with recent HbA1c elevation (8.5%). Requires aggressive metabolic stabilization and continuous glucose monitoring.',
    tags: ['diabetes', 'metabolic', 'chronic']
  },
  {
    noteId: 'demo-3',
    category: 'observation',
    title: 'Subclinical Hypothyroidism',
    doctorName: 'Dr. Sharma',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    content: 'TSH levels trending upward (6.5 mIU/L). T4 remains within low-normal range. Recommend endocrine evaluation if symptoms persist.',
    tags: ['thyroid', 'endocrine']
  },
  {
    noteId: 'demo-4',
    category: 'follow-up',
    title: 'Metformin Optimization',
    doctorName: 'Dr. Sharma',
    timestamp: new Date().toISOString(),
    content: 'Dosage increased to 1000mg BID to address postprandial spikes. Patient educated on gastrointestinal side effects. Review in 14 days.',
    tags: ['titration', 'medication']
  }
];

export default function ClinicalNotes({ notes = [], onAddNote, canAdd = false, loading = false }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'observation', tags: '' });
  const [submitting, setSubmitting] = useState(false);

  // Use demo data only if real data is empty
  const activeNotes = notes.length > 0 ? notes : DEMO_NOTES;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;
    
    setSubmitting(true);
    try {
      const tagsArray = newNote.tags.split(',').map(t => t.trim()).filter(t => t);
      await onAddNote({ ...newNote, tags: tagsArray });
      setNewNote({ title: '', content: '', category: 'observation', tags: '' });
      setIsAdding(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-500/10 rounded-lg">
            <MessageSquare className="w-4 h-4 text-brand-400" />
          </div>
          <div>
            <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Clinical History & Notes</h3>
            {notes.length === 0 && <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Presentation Data Active</p>}
          </div>
        </div>
        
        {canAdd && !isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/30 rounded-xl text-[10px] font-black text-brand-400 uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Append Note
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] space-y-5 overflow-hidden shadow-2xl shadow-brand-500/5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject</label>
                <input 
                  autoFocus
                  required
                  placeholder="e.g. Post-Procedure Evaluation"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none transition-all"
                  value={newNote.title}
                  onChange={e => setNewNote({...newNote, title: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Clinical Category</label>
                <select 
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-500/50 focus:outline-none transition-all cursor-pointer"
                  value={newNote.category}
                  onChange={e => setNewNote({...newNote, category: e.target.value})}
                >
                  {Object.entries(CATEGORIES).map(([id, { label }]) => (
                    <option key={id} value={id}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Observation Details</label>
              <textarea 
                required
                placeholder="Document clinical findings, recommended adjustments, or immediate concerns..."
                className="w-full h-24 bg-slate-900/50 border border-white/5 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none transition-all resize-none"
                value={newNote.content}
                onChange={e => setNewNote({...newNote, content: e.target.value})}
              />
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex-1 space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Tags (comma separated)</label>
                <input 
                  placeholder="e.g. high-risk, chronic"
                  className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] text-white placeholder:text-slate-700 focus:border-brand-500/50 focus:outline-none transition-all"
                  value={newNote.tags}
                  onChange={e => setNewNote({...newNote, tags: e.target.value})}
                />
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors px-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                >
                  {submitting ? 'Syncing...' : <><Send className="w-3.5 h-3.5" /> Authorize Note</>}
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4 relative">
        {activeNotes.length > 1 && (
          <div className="absolute left-[19px] top-8 bottom-8 w-[1px] bg-gradient-to-b from-brand-500/30 via-slate-800 to-transparent pointer-events-none" />
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-600 italic">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Streaming dossier history...</p>
          </div>
        ) : (
          activeNotes.map((note, i) => {
            const Cat = CATEGORIES[note.category] || CATEGORIES.observation;
            const Icon = Cat.icon;
            
            return (
              <motion.div 
                key={note.noteId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative pl-10"
              >
                {/* Timeline Dot */}
                <div className="absolute left-0 top-1.5 w-10 h-10 flex items-center justify-center z-10">
                   <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-slate-950 transition-all group-hover:scale-125 ${Cat.color.split(' ')[0]}`} />
                </div>

                <div className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.05] hover:border-brand-500/20 p-5 rounded-[1.5rem] transition-all duration-300">
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-widest ${Cat.color}`}>
                        {Cat.label}
                      </span>
                      <div className="flex items-center gap-2 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                        <Calendar className="w-3 h-3" />
                        {new Date(note.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-[14px] font-black text-white tracking-tight leading-tight">{note.title}</h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-bold">
                        <Stethoscope className="w-3.5 h-3.5 text-brand-400" />
                        {note.doctorName}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4 line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                    {note.content}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {note.tags?.map(tag => (
                      <div key={tag} className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950/50 border border-white/5 rounded-md text-[8px] font-bold text-slate-600 uppercase tracking-tighter">
                        #{tag}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
