'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Smartphone, Mic, AlertTriangle, ShieldCheck, Loader2
} from 'lucide-react';
import { Toast } from '@/components/admin/AdminUI';
import { updateSetting, getAllSettings } from '@/lib/configActions';

const ToggleSetting = ({ 
  title, 
  icon: Icon, 
  color, 
  settingKey,
  initialValue,
  onUpdate
}: { 
  title: string; 
  icon: React.ElementType; 
  color: string; 
  settingKey: string;
  initialValue: boolean;
  onUpdate: (key: string, value: boolean) => Promise<void>;
}) => {
  const [enabled, setEnabled] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  
  const colorStyles: Record<string, string> = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/10',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/10',
  };

  const handleToggle = async () => {
    setLoading(true);
    const newValue = !enabled;
    try {
      await onUpdate(settingKey, newValue);
      setEnabled(newValue);
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between group">
       <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl ${colorStyles[color]} group-hover:scale-110 transition-transform border shadow-sm`}>
             <Icon size={18} />
          </div>
          <span className="text-sm font-bold text-slate-200">{title}</span>
       </div>
       <button 
        onClick={handleToggle}
        disabled={loading}
        className={`w-11 h-6 rounded-full transition-all duration-300 relative focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 outline-none ${enabled ? 'bg-indigo-600' : 'bg-slate-800 shadow-inner'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-pressed={enabled}
       >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${enabled ? 'left-6' : 'left-1'}`}>
            {loading && <Loader2 size={10} className="animate-spin text-indigo-600 absolute inset-0 m-auto" />}
          </div>
       </button>
    </div>
  );
};

export default function SettingsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getAllSettings();
      setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = async (key: string, value: boolean) => {
    const success = await updateSetting(key, value.toString());
    if (success) {
      showToast(`${key.replace(/_/g, ' ')} updated`);
    } else {
      showToast('Failed to update setting');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
       {toast && <Toast message={toast} onClose={() => setToast(null)} />}
       
       <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4 bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800/40 backdrop-blur-md">
             <h3 className="text-white font-black mb-6 flex items-center gap-2">
                <Smartphone size={18} className="text-indigo-400" /> WhatsApp API
             </h3>
             <ToggleSetting 
              title="Inbound Processing" 
              icon={MessageSquare} 
              color="emerald" 
              settingKey="inbound_processing"
              initialValue={settings['inbound_processing'] === 'true'} 
              onUpdate={handleUpdate}
             />
          </div>
          <div className="col-span-12 md:col-span-4 bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800/40 backdrop-blur-md">
             <h3 className="text-white font-black mb-6 flex items-center gap-2">
                <Mic size={18} className="text-sky-400" /> Voice Recognition
             </h3>
             <ToggleSetting 
              title="Whisper V3 Large" 
              icon={Mic} 
              color="sky" 
              settingKey="voice_recognition_model"
              initialValue={settings['voice_recognition_model'] === 'whisper-1'} 
              onUpdate={async (key, val) => handleUpdate(key, val)}
             />
          </div>
          <div className="col-span-12 md:col-span-4 bg-slate-900/30 p-8 rounded-[2rem] border border-slate-800/40 backdrop-blur-md">
             <h3 className="text-white font-black mb-6 flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-400" /> Error Reporting
             </h3>
             <ToggleSetting 
              title="Sentry Webhooks" 
              icon={AlertTriangle} 
              color="violet" 
              settingKey="error_reporting"
              initialValue={settings['error_reporting'] === 'true'} 
              onUpdate={handleUpdate}
             />
          </div>
       </div>

       <div className="bg-indigo-600/5 border border-indigo-500/20 p-12 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 group">
          <div className="flex items-center gap-6">
             <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-900/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="text-white" size={32} />
             </div>
             <div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">Security Hardening</h3>
                <p className="text-slate-500 text-sm font-medium">Manage access keys and API restrictions</p>
             </div>
          </div>
          <button 
            onClick={() => {
              getAllSettings().then(setSettings);
              showToast('Configuration synchronized');
            }}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-900/20 active:scale-95 uppercase tracking-widest text-xs italic"
          >
             Sync Config
          </button>
       </div>
    </div>
  );
}
