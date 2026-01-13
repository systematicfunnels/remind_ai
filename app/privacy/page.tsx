import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
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
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase italic">Privacy Policy</h1>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last Updated: January 13, 2026</p>
        </header>

        <main className="space-y-12 leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">1. Data Collection</h2>
            <p>
              RemindAI collects minimal data necessary to provide our reminder service. This includes your phone ID (WhatsApp/Telegram), 
              the content of your reminders, and your preferred timezone.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">2. AI Processing</h2>
            <p>
              We use third-party AI services (OpenAI, Google Gemini) to parse your messages. Your messages are sent to these 
              providers only for processing and are not used for training their models by default.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">3. Data Retention</h2>
            <p>
              Reminders are stored in our secure database until they are completed or deleted. You can request a full data erasure 
              at any time by messaging &quot;ERASE&quot; to the bot.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-white uppercase tracking-tight">4. Contact</h2>
            <p>
              For privacy-related inquiries, please contact us at privacy@remindai.com.
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
