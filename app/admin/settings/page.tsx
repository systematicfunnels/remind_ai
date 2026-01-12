'use client';

import React, { useState, useCallback } from 'react';
import { 
  Globe, MessageSquare, Smartphone, Mic, Database, AlertTriangle, HelpCircle
} from 'lucide-react';
import { Badge, Toast } from '@/components/admin/AdminUI';

const ToggleSetting = ({ title, icon, color, initialValue }: { title: string; icon: React.ReactElement<any>; color: string; initialValue?: boolean }) => {
  const [enabled, setEnabled] = useState(initialValue || false);
  
  // Dynamic class construction for Tailwind colors
  const colorStyles: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/10',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/10',
  };

  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-xl ${colorStyles[color]} group-hover:scale-110 transition-transform border shadow-sm`}>
             {React.cloneElement(icon, { size: 18 })}
          </div>
          <span className="text-sm font-bold text-slate-200">{title}</span>
       </div>
       <button 
        onClick={() => setEnabled(!enabled)}
        className={`w-11 h-6 rounded-full transition-all duration-300 relative focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none ${enabled ? 'bg-indigo-600' : 'bg-slate-800 shadow-inner'}`}
        aria-pressed={enabled}
       >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${enabled ? 'left-6' : 'left-1'}`} />
       </button>
    </div>
  );
};

export default function SettingsPage() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReset = useCallback(() => {
    if (confirm("FACTORY RESET: All mock signals, jobs, and subscribers will be wiped. Proceed?")) {
      localStorage.clear();
      showToast("System Purged. Re-initializing...");
      setTimeout(() => window.location.reload(), 1200);
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
       {toast && <Toast message={toast} onClose={() => setToast(null)} />}
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800/40 backdrop-blur-md">
             <h3 className="text-white font-black mb-6 flex items-center gap-2">
                <Globe size={18} className="text-indigo-400" /> Platform Integration
             </h3>
             <div className="space-y-6">
                <ToggleSetting title="WhatsApp Signal Node" icon={<MessageSquare />} color="emerald" initialValue={true} />
                <ToggleSetting title="Telegram Signal Node" icon={<Smartphone />} color="sky" initialValue={true} />
                <ToggleSetting title="AI Voice Transceiver" icon={<Mic />} color="violet" initialValue={true} />
             </div>
          </div>

          <div className="bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800/40 backdrop-blur-md">
             <h3 className="text-white font-black mb-6 flex items-center gap-2">
                <Database size={18} className="text-amber-400" /> Cluster Configuration
             </h3>
             <div className="space-y-4">
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Gemini 1.5 Pro Cluster</p>
                   <div className="text-xs font-mono text-slate-300 flex justify-between items-center">
                      <span className="tracking-widest opacity-50">••••••••••••••••••••••••</span>
                      <Badge variant="success">Authenticated</Badge>
                   </div>
                </div>
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Dispatch Secret</p>
                   <div className="text-xs font-mono text-slate-300 flex justify-between items-center">
                      <span className="opacity-70">wh_sec_v3_8b21...</span>
                      <button 
                        onClick={() => showToast("Secret regenerated.")} 
                        className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors text-[10px] uppercase tracking-wider focus:ring-1 focus:ring-indigo-500/50 outline-none rounded px-1"
                      >
                        Rotate
                      </button>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div className="bg-rose-950/20 border border-rose-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="flex items-center gap-5">
             <div className="p-4 bg-rose-600 rounded-2xl text-white shadow-2xl shadow-rose-900/40 group-hover:scale-110 transition-transform">
                <AlertTriangle size={28} />
             </div>
             <div>
                <h4 className="font-black text-xl text-white tracking-tight">System Maintenance</h4>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">Instantly purge all local signal data and reset the simulation environment to factory defaults.</p>
             </div>
          </div>
          <button 
            onClick={handleReset}
            className="w-full md:w-auto px-8 py-4 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-500 transition-all shadow-xl shadow-rose-900/20 active:scale-95 focus:ring-2 focus:ring-rose-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none"
          >
            Purge Cluster
          </button>
       </div>

       <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
             <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-900/20">
                <HelpCircle size={28} />
             </div>
             <div>
                <h4 className="font-black text-xl text-white tracking-tight">Developer Support</h4>
                <p className="text-sm text-slate-400">Our engineering core is available for Tier-1 infrastructure integration support.</p>
             </div>
          </div>
          <button className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none">Technical Desk</button>
       </div>
    </div>
  );
}
