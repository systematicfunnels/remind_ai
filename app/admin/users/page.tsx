'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Trash2, ShieldCheck, RefreshCw
} from 'lucide-react';
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

function ActionButton({ icon: Icon, onClick, color, label }: { icon: React.ElementType, onClick: () => void, color: string, label: string }) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (confirming) {
      const timer = setTimeout(() => setConfirming(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirming]);

  const colorStyles: Record<string, string> = {
    red: confirming ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10',
    amber: confirming ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'text-slate-500 hover:text-amber-400 hover:bg-amber-500/10',
  };

  return (
    <button 
        onClick={(e) => {
          e.stopPropagation();
          if (confirming) {
            onClick();
            setConfirming(false);
          } else {
            setConfirming(true);
          }
        }}
        className={`p-2 rounded-xl transition-all duration-300 flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500/40 ${colorStyles[color]}`}
      >
      <Icon size={16} />
      {confirming && <span>{label}?</span>}
    </button>
  );
}

export default function UserListPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserData[]>([]);
  
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data as UserData[]);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBlock = async (id: string, currentlyBlocked: boolean) => {
    await blockUser(id, !currentlyBlocked);
    fetchUsers();
  };

  const handleReset = async (id: string) => {
    await resetUserUsage(id);
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    await deleteUser(id);
    fetchUsers();
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12">
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
                        <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">User / Channel</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Status</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Count</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {users.map((user) => (
                        <tr key={user.id} className={`hover:bg-indigo-500/[0.02] transition-colors group ${user.is_blocked ? 'opacity-50' : ''}`}>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{user.phone_id}</div>
                                <div className="flex items-center gap-2 mt-2">
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
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <Badge variant={user.sub_status === 'paid' ? 'success' : 'warning'}>
                          {user.sub_status}
                        </Badge>
                        {user.is_blocked && (
                          <Badge variant="danger">BLOCKED</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-black text-slate-300 italic">{user.reminder_count}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleBlock(user.id, !!user.is_blocked)}
                          className={`p-2 rounded-xl transition-all duration-300 outline-none focus:ring-2 focus:ring-indigo-500/40 ${user.is_blocked ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'}`}
                          title={user.is_blocked ? 'Unblock' : 'Block'}
                        >
                          <ShieldCheck size={16} />
                        </button>
                        <ActionButton 
                          icon={RefreshCw} 
                          onClick={() => handleReset(user.id)} 
                          color="amber" 
                          label="Reset" 
                        />
                        <ActionButton 
                          icon={Trash2} 
                          onClick={() => handleDelete(user.id)} 
                          color="red" 
                          label="Delete" 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState icon={Users} title="No subscribers" description="Your subscriber database is currently empty." />
          )}
        </div>
      </div>
    </div>
  </div>
</div>
);
}
