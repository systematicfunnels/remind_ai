'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, Activity, Bell
} from 'lucide-react';
import { Badge, Skeleton, Tooltip, Card } from '@/components/admin/AdminUI';
import { getAdminStats } from '@/lib/adminActions';
import AdminChart from '@/components/admin/AdminChart';

export default function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ totalUsers: number, totalReminders: number, mrr: number, chartData: any[] } | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats({
          totalUsers: data.totalUsers,
          totalReminders: data.totalReminders,
          mrr: data.paidUsers * 500,
          chartData: data.chartData
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
      <div className="space-y-12 animate-in fade-in duration-500">
        <div className="grid grid-cols-12 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="col-span-12 md:col-span-4 lg:col-span-4">
              <Skeleton className="h-48" />
            </div>
          ))}
        </div>
        <Skeleton className="h-[500px] rounded-[3rem]" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-4 lg:col-span-4">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers.toLocaleString()} 
            icon={<Users />} 
            trend="Active" 
            color="indigo" 
          />
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-4">
          <StatCard 
            title="Total Reminders" 
            value={stats.totalReminders.toLocaleString()} 
            icon={<Bell />} 
            trend="Processed" 
            color="amber" 
          />
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-4">
          <Tooltip text="Estimated based on Paid Users × ₹499" visible={true} className="w-full">
            <StatCard 
              title="Estimated MRR" 
              value={`₹${stats.mrr.toLocaleString()}`} 
              icon={<CreditCard />} 
              trend="Subscribed" 
              color="emerald" 
            />
          </Tooltip>
        </div>
      </div>

      <Card className="p-8">
        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4 italic uppercase tracking-tight">
          <Activity size={24} className="text-indigo-400" /> System Velocity
        </h3>
        <AdminChart data={stats.chartData} />
      </Card>
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
    <Card className="p-8 group">
      <div className="flex justify-between items-start mb-8">
        <div className={`p-4 rounded-2xl text-white shadow-xl ${colorStyles[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <Badge variant="info">{trend}</Badge>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{title}</p>
        <h4 className="text-4xl font-black text-white tracking-tighter italic">{value}</h4>
      </div>
    </Card>
  );
}
