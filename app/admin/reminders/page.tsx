'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell
} from 'lucide-react';
import { Reminder } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Skeleton, EmptyState } from '@/components/admin/AdminUI';
import { getAppData } from '@/services/storageService';

interface ReminderWithUser {
  id: string;
  task: string;
  scheduled_at: string;
  status: string;
  users?: {
    phone_id: string;
  };
}

export default function ReminderListPage() {
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<ReminderWithUser[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'done'>('all');

  useEffect(() => {
    const fetchReminders = async () => {
      if (!isSupabaseConfigured) {
        // Fallback for demo
        const appData = getAppData();
        let filtered = appData.reminders.map((r: Reminder) => ({
          ...r,
          scheduled_at: r.scheduledAt,
          users: { phone_id: appData.users.find(u => u.id === r.userId)?.phone || 'Unknown' }
        }));
        
        if (statusFilter !== 'all') {
          filtered = filtered.filter(r => r.status === (statusFilter === 'done' ? 'completed' : 'pending'));
        }
        
        setReminders(filtered.map(r => ({
          ...r,
          status: r.status === 'completed' ? 'done' : r.status
        })));
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('reminders')
          .select('*, users(phone_id)')
          .order('scheduled_at', { ascending: false });
        
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        
        if (!error) {
          setReminders(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch reminders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/30 rounded-[2.5rem] border border-slate-800/40 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-8 border-b border-slate-800/40 flex justify-between items-center bg-slate-950/20">
          <h3 className="font-black text-white flex items-center gap-3 text-lg italic uppercase tracking-tight">
            <Bell size={20} className="text-amber-500" /> Dispatch Pipeline
          </h3>
          <div className="flex items-center gap-4">
             <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
                {(['all', 'pending', 'done'] as const).map((s) => (
                   <button 
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                      {s}
                   </button>
                ))}
             </div>
          </div>
        </div>
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-20 rounded-2xl" />)}
            </div>
          ) : reminders.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-950/40 border-b border-slate-800/40">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Job Payload</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Target User</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Schedule</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {reminders.map((rem) => (
                  <tr key={rem.id} className="hover:bg-indigo-500/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform">
                          <Bell size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{rem.task}</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wider italic">ID: {rem.id.split('-')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-slate-300 italic">{rem.users?.phone_id || 'Unknown'}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        {new Date(rem.scheduled_at).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-1 font-bold uppercase tracking-wider">{new Date(rem.scheduled_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${rem.status === 'pending' ? 'bg-amber-400 animate-pulse shadow-lg shadow-amber-400/20' : 'bg-emerald-500 shadow-lg shadow-emerald-500/20'}`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${rem.status === 'pending' ? 'text-amber-400' : 'text-emerald-500'}`}>{rem.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState icon={<Bell />} title="Pipeline standby" description="No active jobs are currently scheduled in the dispatcher." />
          )}
        </div>
      </div>
    </div>
  );
}
