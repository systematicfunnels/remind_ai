import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-6 lg:p-12">
      <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-black uppercase tracking-widest">Back to Home</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl">
              <FileText size={32} className="text-white" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase italic">Terms of Service</h1>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last Updated: January 13, 2026</p>
        </header>

        <main className="space-y-12 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">1. Acceptance of Terms</h2>
            <p>
              By using RemindAI via WhatsApp or Telegram, you agree to these terms. If you do not agree, please stop using the service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">2. Service Usage</h2>
            <p>
              RemindAI provides automated reminders. While we strive for 100% uptime, we are not responsible for missed reminders 
              due to technical failures or API limitations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">3. Subscription & Payments</h2>
            <p>
              Free users are limited to 5 reminders per month. Premium users get unlimited reminders. Subscriptions are billed 
              monthly and can be cancelled at any time.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">4. Prohibited Content</h2>
            <p>
              You may not use RemindAI to store illegal content or harass others. We reserve the right to block users who 
              violate these rules.
            </p>
          </section>
        </main>

        <footer className="pt-12 border-t border-slate-900/50 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            © 2026 RemindAI. All Rights Reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
