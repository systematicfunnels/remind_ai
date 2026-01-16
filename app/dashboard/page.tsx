import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { 
  Zap, MessageSquare, Smartphone, 
  Clock, CheckCircle2, Calendar,
  CreditCard, ExternalLink, LogOut
} from 'lucide-react';
import Link from 'next/link';
import RazorpayButton from '@/components/payment/RazorpayButton';
import BotNameForm from '@/components/dashboard/BotNameForm';

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const reminders = await db.getPendingReminders(user.id);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Sidebar / Topbar */}
      <nav className="border-b border-slate-800/40 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="text-lg font-black tracking-tighter text-white uppercase italic">RemindAI</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logged in as</span>
              <span className="text-xs font-bold text-white">{user.phone_id}</span>
            </div>
            <form action="/api/auth/logout" method="POST">
               <button type="submit" className="p-2 text-slate-500 hover:text-rose-400 transition-colors outline-none">
                 <LogOut size={20} />
               </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-12 gap-8">
          
          {/* Left Column: Stats & Platform */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Subscription Card */}
            <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <CreditCard size={80} className="text-indigo-400" />
              </div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Account Status</h3>
              <div className="flex items-baseline gap-3 mb-6">
                <span className={`text-3xl font-black uppercase italic tracking-tight ${user.sub_status === 'paid' ? 'text-emerald-400' : 'text-white'}`}>
                  {user.sub_status === 'paid' ? 'Premium' : 'Free Trial'}
                </span>
              </div>
              <p className="text-sm text-slate-400 font-medium mb-8">
                {user.sub_status === 'paid' 
                  ? "You have unlimited reminders and priority AI support." 
                  : `You've used ${user.reminder_count}/5 free reminders.`}
              </p>
              {user.sub_status !== 'paid' && (
                <RazorpayButton 
                  amount={499} 
                  label="Upgrade Now" 
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
                />
              )}
            </div>

            {/* Platform Shortcuts */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-6">Open your bot</h3>
              
              <div className="p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-[2rem] mb-6">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">Active Bot</span>
                <p className="text-xl font-black text-white uppercase italic tracking-tight mb-4">{(user as any).bot_name || 'My Bot'}</p>
                <a 
                  href={user.channel === 'telegram' ? (process.env.NEXT_PUBLIC_TELEGRAM_LINK || "https://t.me/heybirdy_bot") : (process.env.NEXT_PUBLIC_WHATSAPP_LINK || `https://wa.me/${process.env.TWILIO_WHATSAPP_NUMBER}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 group"
                >
                  Go to App <ExternalLink size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              <a 
                href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || `https://wa.me/${process.env.TWILIO_WHATSAPP_NUMBER}`} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl hover:bg-emerald-500/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500 rounded-2xl text-white">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-white uppercase tracking-widest">WhatsApp</span>
                    <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-tighter">
                      {user.channel === 'whatsapp' ? 'Connected' : 'Available'}
                    </span>
                  </div>
                </div>
                <ExternalLink size={20} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
              </a>

              <a 
                href={process.env.NEXT_PUBLIC_TELEGRAM_LINK || "https://t.me/heybirdy_bot"} 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-6 bg-sky-500/10 border border-sky-500/20 rounded-3xl hover:bg-sky-500/20 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sky-500 rounded-2xl text-white">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <span className="block text-sm font-black text-white uppercase tracking-widest">Telegram</span>
                    <span className="text-[10px] font-bold text-sky-400/80 uppercase tracking-tighter">
                      {user.channel === 'telegram' ? 'Connected' : 'Available'}
                    </span>
                  </div>
                </div>
                <ExternalLink size={20} className="text-sky-500/40 group-hover:text-sky-500 transition-colors" />
              </a>
            </div>
          </div>

          {/* Right Column: Reminder List */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-8 md:p-12 min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-12">
                <BotNameForm initialName={(user as any).bot_name || 'My Bot'} />
                <div className="p-2 bg-slate-950/50 border border-slate-800 rounded-xl">
                   <Clock size={20} className="text-indigo-400" />
                </div>
              </div>

              {reminders.length > 0 ? (
                <div className="space-y-4">
                  {reminders.map((r) => (
                    <div key={r.id} className="group p-6 bg-slate-950/50 border border-slate-800/60 rounded-[2rem] hover:border-indigo-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-900 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-white font-bold text-lg tracking-tight mb-1">{r.task}</p>
                          <div className="flex items-center gap-2 text-slate-500">
                             <Clock size={12} />
                             <span className="text-[10px] font-black uppercase tracking-widest">
                               {new Date(r.scheduled_at).toLocaleString('en-US', { 
                                 month: 'short', 
                                 day: 'numeric', 
                                 hour: 'numeric', 
                                 minute: '2-digit' 
                               })}
                             </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {r.recurrence !== 'none' && (
                          <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-500/20">
                            {r.recurrence}
                          </span>
                        )}
                        <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pending</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6">
                  <div className="p-8 bg-slate-950/50 rounded-full border border-slate-800">
                    <CheckCircle2 size={48} className="text-slate-800" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">No pending tasks</h4>
                    <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">
                      All caught up! Send a message to your bot to set a new reminder.
                    </p>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-12 h-1 border-t border-slate-800 mt-4" />
                     <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2">Ready to work</span>
                     <div className="w-12 h-1 border-t border-slate-800 mt-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-900/50 text-center">
         <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
           © 2026 RemindAI · Pure Productivity
         </p>
      </footer>
    </div>
  );
}
