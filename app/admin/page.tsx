'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, Activity, Bell, AlertTriangle, ArrowRight
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Badge, Skeleton } from '@/components/admin/AdminUI';
import { getStats } from '@/services/storageService';

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalUsers: number, totalReminders: number, mrr: number } | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      if (!isSupabaseConfigured) {
        // Fallback to local storage stats for demo purposes
        const localStats = getStats();
        setStats({
          totalUsers: localStats.totalUsers,
          totalReminders: localStats.activeReminders + localStats.completedReminders,
          mrr: localStats.mrr
        });
        setLoading(false);
        return;
      }

      try {
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: reminderCount } = await supabase.from('reminders').select('*', { count: 'exact', head: true });
        const { data: paidUsers } = await supabase.from('users').select('id').eq('sub_status', 'paid');
        
        const mrr = (paidUsers?.length || 0) * 500; 

        setStats({
          totalUsers: userCount || 0,
          totalReminders: reminderCount || 0,
          mrr: mrr
        });
      } catch (error) {
        console.error('Failed to fetch stats from Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-[400px] rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {!isSupabaseConfigured && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/20 p-3 rounded-2xl text-amber-500">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white">Supabase Not Configured</h4>
              <p className="text-sm text-slate-400">The dashboard is currently running in <b>Demo Mode</b> with local data.</p>
            </div>
          </div>
          <a 
            href="https://supabase.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-3 bg-white text-black font-bold rounded-2xl flex items-center gap-2 hover:bg-slate-200 transition-colors text-sm"
          >
            Get Keys <ArrowRight size={16} />
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={<Users />} 
          trend="+10%" 
          color="indigo" 
        />
        <StatCard 
          title="Total Reminders" 
          value={stats.totalReminders.toLocaleString()} 
          icon={<Bell />} 
          trend="+25%" 
          color="amber" 
        />
        <StatCard 
          title="Monthly Revenue (MRR)" 
          value={`₹${stats.mrr.toLocaleString()}`} 
          icon={<CreditCard />} 
          trend="+₹500" 
          color="emerald" 
        />
      </div>

      <div className="bg-slate-900/30 p-8 rounded-[3rem] border border-slate-800/40 backdrop-blur-md">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 italic uppercase tracking-tight">
          <Activity size={20} className="text-indigo-400" /> System Velocity
        </h3>
        <div className="h-[300px] flex items-center justify-center border border-dashed border-slate-800 rounded-3xl text-slate-500 font-bold uppercase tracking-widest text-xs">
          Pipeline Analytics Ready
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: { title: string, value: string, icon: React.ReactNode, trend: string, color: string }) {
  const colorStyles: Record<string, string> = {
    indigo: 'bg-indigo-600 shadow-indigo-500/20',
    amber: 'bg-amber-500 shadow-amber-500/20',
    emerald: 'bg-emerald-500 shadow-emerald-500/20',
  };

  return (
    <div className="p-8 rounded-[2.5rem] bg-slate-900/30 border border-slate-800/40 backdrop-blur-md group hover:border-indigo-500/30 transition-all">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3.5 rounded-2xl text-white shadow-xl ${colorStyles[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <Badge variant="info">{trend}</Badge>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">{title}</p>
        <h4 className="text-3xl font-black text-white tracking-tighter italic">{value}</h4>
      </div>
    </div>
  );
}
