'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, Activity, Bell
} from 'lucide-react';
import { Badge, Skeleton } from '@/components/admin/AdminUI';
import { getAdminStats } from '@/lib/adminActions';
import AdminChart from '@/components/admin/AdminChart';

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalUsers: number, totalReminders: number, mrr: number } | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats({
          totalUsers: data.totalUsers,
          totalReminders: data.totalReminders,
          mrr: data.paidUsers * 500
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={<Users />} 
          trend="Active" 
          color="indigo" 
        />
        <StatCard 
          title="Total Reminders" 
          value={stats.totalReminders.toLocaleString()} 
          icon={<Bell />} 
          trend="Processed" 
          color="amber" 
        />
        <StatCard 
          title="Monthly Revenue (MRR)" 
          value={`₹${stats.mrr.toLocaleString()}`} 
          icon={<CreditCard />} 
          trend="Subscribed" 
          color="emerald" 
        />
      </div>

      <div className="bg-slate-900/30 p-8 rounded-[3rem] border border-slate-800/40 backdrop-blur-md">
        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3 italic uppercase tracking-tight">
          <Activity size={20} className="text-indigo-400" /> System Velocity
        </h3>
        <AdminChart />
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
