'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, MessageSquare, Smartphone, 
  ArrowRight, Github, Sparkles,
  CheckCircle2, Shield, Mic, Brain
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative isolate bg-[#020617] selection:bg-indigo-500/30 overflow-x-hidden min-h-screen flex flex-col">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] opacity-50" />
      </div>

      <nav className="flex items-center justify-between p-6 lg:px-12 backdrop-blur-xl sticky top-0 z-[100] border-b border-slate-800/40 bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">RemindAI</span>
        </div>
        <Link href="/admin" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Admin Console</Link>
      </nav>

      <main className="flex-grow">
        {/* Hero Section - 300px target height (using py to control) */}
        <section className="px-6 lg:px-12 py-20 lg:py-32 relative text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
              AI Reminders in <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-400 to-sky-400 animate-gradient">WhatsApp & Telegram</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium">
              Never miss a beat. Send a simple text or voice message to your favorite messaging app and let AI handle the rest.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link 
                href="https://wa.me/YOUR_NUMBER" 
                className="w-full sm:w-auto px-8 py-4 bg-[#25D366] text-black font-black rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-xl shadow-emerald-500/20"
              >
                <MessageSquare size={20} fill="currentColor" />
                WhatsApp Bot
              </Link>
              <Link 
                href="https://t.me/YOUR_BOT" 
                className="w-full sm:w-auto px-8 py-4 bg-[#0088cc] text-white font-black rounded-2xl hover:scale-105 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm shadow-xl shadow-sky-500/20"
              >
                <Smartphone size={20} fill="currentColor" />
                Telegram Bot
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Bullets (Exactly 4 as per SOW) */}
        <section className="px-6 lg:px-12 py-20 bg-slate-950/40 border-y border-slate-900/50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureBullet 
              icon={<Brain className="text-indigo-400" />}
              title="Natural Language"
              desc="Just say 'remind me tomorrow 7pm' - AI handles the parsing."
            />
            <FeatureBullet 
              icon={<Zap className="text-emerald-400" />}
              title="Instant Setup"
              desc="Connect in seconds. No apps to download, no accounts to create."
            />
            <FeatureBullet 
              icon={<Shield className="text-sky-400" />}
              title="Secure Nodes"
              desc="Your personal data is encrypted and handled with military-grade security."
            />
            <FeatureBullet 
              icon={<Mic className="text-purple-400" />}
              title="Voice Notes"
              desc="Send a voice message and let our AI transcribe and schedule it for you."
            />
          </div>
        </section>
      </main>

      <footer className="px-6 lg:px-12 py-10 border-t border-slate-900/50 bg-slate-950/50 text-center">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
          Built in India • © 2026 REMINDAI NEXUS
        </p>
      </footer>
    </div>
  );
}

function FeatureBullet({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-4 group">
      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors shadow-lg">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

