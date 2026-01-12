'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Trash2, MoreHorizontal
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Badge, Skeleton, EmptyState } from '@/components/admin/AdminUI';

export default function UserListPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error) {
        setUsers(data || []);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/30 rounded-[2.5rem] border border-slate-800/40 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-8 border-b border-slate-800/40 flex justify-between items-center bg-slate-950/20">
          <h3 className="font-black text-white flex items-center gap-3 text-lg italic uppercase tracking-tight">
            <Users size={20} className="text-indigo-400" /> Subscriber Base
          </h3>
        </div>
        <div className="overflow-x-auto min-h-[400px]">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : users.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-950/40 border-b border-slate-800/40">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Phone ID</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Count</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-indigo-500/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{user.phone_id}</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wider">{new Date(user.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-5">
                      <Badge variant={user.sub_status === 'paid' ? 'success' : 'warning'}>
                        {user.sub_status}
                      </Badge>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-slate-300 italic">{user.reminder_count}</div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                          <MoreHorizontal size={16} />
                        </button>
                        <button className="p-2.5 hover:bg-rose-500/10 rounded-xl text-slate-400 hover:text-rose-400 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState icon={<Users />} title="No subscribers" description="Your subscriber database is currently empty." />
          )}
        </div>
      </div>
    </div>
  );
}
