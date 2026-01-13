'use client';

import React, { useState, useCallback } from 'react';
import { 
  Globe, MessageSquare, Smartphone, Mic, Database, AlertTriangle, HelpCircle, Activity, ShieldCheck
} from 'lucide-react';
import { Badge, Toast } from '@/components/admin/AdminUI';

const ToggleSetting = ({ title, icon: Icon, color, initialValue }: { title: string; icon: React.ElementType; color: string; initialValue?: boolean }) => {
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
             <Icon size={18} />
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

function StatusRow({ title, active }: { title: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:scale-110 transition-transform`}>
             <Activity size={18} className={active ? 'text-emerald-400' : 'text-slate-600'} />
          </div>
          <span className="text-sm font-bold text-slate-200">{title}</span>
       </div>
       <Badge variant={active ? 'success' : 'info'}>{active ? 'Active' : 'Standby'}</Badge>
    </div>
  );
}

export default function SettingsPage() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
       {toast && <Toast message={toast} onClose={() => setToast(null)} />}
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800/40 backdrop-blur-md">
             <h3 className="text-white font-black mb-6 flex items-center gap-2">
                <Globe size={18} className="text-indigo-400" /> Platform Infrastructure
             </h3>
             <div className="space-y-6">
                <StatusRow title="WhatsApp (Twilio)" active={true} />
                <StatusRow title="Telegram Bot" active={true} />
                <StatusRow title="OpenAI (Whisper)" active={true} />
                <StatusRow title="Gemini (Flash 1.5)" active={true} />
             </div>
          </div>

          <div className="bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800/40 backdrop-blur-md">
             <h3 className="text-white font-black mb-6 flex items-center gap-2">
                <Database size={18} className="text-amber-400" /> Storage Cluster
             </h3>
             <div className="space-y-4">
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Primary PostgreSQL</p>
                   <div className="text-xs font-mono text-slate-300 flex justify-between items-center">
                      <span className="opacity-70">remind-ai-db.upstash.io</span>
                      <Badge variant="success">Connected</Badge>
                   </div>
                </div>
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">BullMQ Redis</p>
                   <div className="text-xs font-mono text-slate-300 flex justify-between items-center">
                      <span className="opacity-70">redis-remind-ai.upstash.io</span>
                      <Badge variant="success">Operational</Badge>
                   </div>
                </div>
             </div>
          </div>
       </div>

       <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="flex items-center gap-5">
             <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-2xl shadow-indigo-900/40 group-hover:scale-110 transition-transform">
                <ShieldCheck size={28} />
             </div>
             <div>
                <h4 className="font-black text-xl text-white tracking-tight">Security Protocol</h4>
                <p className="text-sm text-slate-400 max-w-sm leading-relaxed">System is protected by hardware-level AES-256 encryption. All administrative actions are logged.</p>
             </div>
          </div>
          <button 
            onClick={() => showToast("Security audit initiated.")}
            className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 active:scale-95 focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none"
          >
            Audit System
          </button>
       </div>
    </div>
  );
}
