'use client';

import React, { useState } from 'react';
import { Megaphone, Send, Users, CreditCard, Info } from 'lucide-react';
import { broadcastMessage } from '@/lib/adminActions';
import { Toast } from '@/components/admin/AdminUI';

export default function BroadcastPage() {
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<'all' | 'paid' | 'free'>('all');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const result = await broadcastMessage(message, target);
      setToast(`Broadcast sent! Success: ${result.successCount}, Failed: ${result.failureCount}`);
      setMessage('');
    } catch (error) {
      console.error('Broadcast failed:', error);
      setToast('Broadcast failed to send. Check logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      <div className="bg-slate-900/30 rounded-[2.5rem] border border-slate-800/40 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-8 border-b border-slate-800/40 flex justify-between items-center bg-slate-950/20">
          <h3 className="font-black text-white flex items-center gap-3 text-lg italic uppercase tracking-tight">
            <Megaphone size={20} className="text-indigo-400" /> Global Broadcast
          </h3>
        </div>

        <form onSubmit={handleBroadcast} className="p-8 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
              Select Audience
            </label>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setTarget('all')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                  target === 'all'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800/40 bg-slate-950/20 text-slate-400 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <Users size={24} className={target === 'all' ? 'text-indigo-400' : ''} />
                <span className="font-black text-xs uppercase tracking-tighter">All Users</span>
              </button>
              <button
                type="button"
                onClick={() => setTarget('paid')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                  target === 'paid'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800/40 bg-slate-950/20 text-slate-400 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <CreditCard size={24} className={target === 'paid' ? 'text-emerald-400' : ''} />
                <span className="font-black text-xs uppercase tracking-tighter">Paid Only</span>
              </button>
              <button
                type="button"
                onClick={() => setTarget('free')}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                  target === 'free'
                    ? 'border-amber-500 bg-amber-500/10 text-white shadow-lg shadow-amber-500/10'
                    : 'border-slate-800/40 bg-slate-950/20 text-slate-400 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <Info size={24} className={target === 'free' ? 'text-amber-400' : ''} />
                <span className="font-black text-xs uppercase tracking-tighter">Free Only</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
              Broadcast Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your announcement here... (Markdown supported in Telegram)"
              className="w-full bg-slate-950/50 border-2 border-slate-800/40 rounded-[2rem] p-6 text-slate-200 focus:border-indigo-500 outline-none transition-all min-h-[200px] font-medium placeholder:text-slate-600"
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className={`
                px-10 py-5 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3 transition-all
                ${loading || !message.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900/40 active:scale-95'}
              `}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Broadcasting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Transmit Message
                </>
              )}
            </button>
          </div>
        </form>

        <div className="p-8 bg-indigo-500/5 border-t border-slate-800/40">
          <div className="flex gap-4 items-start">
            <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400 mt-1">
              <Info size={16} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-200">Broadcast Guidelines</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Messages will be sent immediately to all users on their preferred platform (WhatsApp or Telegram). 
                Avoid sending multiple broadcasts in a short period to prevent bot rate-limiting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
