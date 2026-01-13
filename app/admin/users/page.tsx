'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Trash2, MoreHorizontal, ShieldCheck, RefreshCw
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Badge, Skeleton, EmptyState } from '@/components/admin/AdminUI';
import { getAllUsers, blockUser, resetUserUsage, deleteUser } from '@/lib/adminActions';

interface UserData {
  id: string;
  phone_id: string;
  channel: string | null;
  sub_status: string | null;
  reminder_count: number | null;
  is_blocked: boolean | null;
  payment_id: string | null;
  last_active_at: Date | null;
  created_at: Date | null;
}

export default function UserListPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data as any);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleBlock = async (id: string, currentlyBlocked: boolean) => {
    await blockUser(id, !currentlyBlocked);
    fetchUsers();
  };

  const handleReset = async (id: string) => {
    if (confirm('Reset usage for this user?')) {
      await resetUserUsage(id);
      fetchUsers();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
      fetchUsers();
    }
  };

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
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">User / Channel</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Count</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {users.map((user) => (
                  <tr key={user.id} className={`hover:bg-indigo-500/[0.02] transition-colors group ${user.is_blocked ? 'opacity-50' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{user.phone_id}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{user.channel || 'unknown'}</span>
                            <span className="text-[10px] text-slate-600">•</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Active {user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : 'Never'}</span>
                            {user.payment_id && (
                              <>
                                <span className="text-[10px] text-slate-600">•</span>
                                <span className="text-[10px] text-emerald-500/80 font-mono font-medium">{user.payment_id}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <Badge variant={user.sub_status === 'paid' ? 'success' : 'warning'}>
                          {user.sub_status}
                        </Badge>
                        {user.is_blocked && (
                          <Badge variant="danger">BLOCKED</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-slate-300 italic">{user.reminder_count}</div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleReset(user.id)}
                          className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-amber-400 title='Reset Usage'"
                        >
                          <RefreshCw size={14} />
                        </button>
                        <button 
                          onClick={() => handleBlock(user.id, !!user.is_blocked)}
                          className={`p-2 hover:bg-slate-800 rounded-lg ${user.is_blocked ? 'text-emerald-400' : 'text-rose-400'}`}
                          title={user.is_blocked ? 'Unblock' : 'Block'}
                        >
                          <ShieldCheck size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-500"
                        >
                          <Trash2 size={14} />
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
