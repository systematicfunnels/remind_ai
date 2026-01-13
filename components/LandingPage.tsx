'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, MessageSquare, Smartphone, 
  Shield, Mic, Brain, Instagram
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
        {/* Discreet Admin Link */}
        <Link href="/admin" className="opacity-0 hover:opacity-100 transition-opacity text-[8px] font-black uppercase tracking-[0.4em] text-slate-800">
          Root Access
        </Link>
      </nav>

      <main className="flex-grow flex flex-col justify-center">
        {/* Hero Section */}
        <section className="px-6 lg:px-12 py-12 relative text-center">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tight leading-[0.9]">
                YOUR AI<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-400 to-sky-400 animate-gradient">REMINDER BOT.</span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto font-medium tracking-tight leading-relaxed">
                Just chat or record a voice note like <span className="text-indigo-400">&quot;remind me at 10pm&quot;</span>. <br className="hidden sm:block" />
                Our AI schedules it and sends the reminder back to your chat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Link 
                href="https://wa.me/YOUR_NUMBER" 
                className="group relative flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-500"
              >
                <div className="p-4 bg-[#25D366]/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare size={32} className="text-[#25D366]" fill="currentColor" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">WhatsApp</span>
                <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">Chat with Bot</span>
              </Link>

              <Link 
                href="https://t.me/YOUR_BOT" 
                className="group relative flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-sky-500/50 hover:bg-sky-500/5 transition-all duration-500"
              >
                <div className="p-4 bg-[#0088cc]/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone size={32} className="text-[#0088cc]" fill="currentColor" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">Telegram</span>
                <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">Chat with Bot</span>
              </Link>

              <Link 
                href="#" 
                className="group relative flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-pink-500/50 hover:bg-pink-500/5 transition-all duration-500"
              >
                <div className="p-4 bg-pink-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Instagram size={32} className="text-pink-500" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">Instagram</span>
                <span className="text-[10px] text-pink-500/60 mt-2 font-black uppercase tracking-widest">Coming Soon</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Minimal Feature Bar */}
        <section className="px-6 lg:px-12 py-12 border-t border-slate-900/50 bg-slate-950/20">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-x-12 gap-y-6">
            <div className="flex items-center gap-2 text-slate-500">
              <Mic size={14} className="text-indigo-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Voice Support</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Brain size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Natural AI</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Shield size={14} className="text-sky-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Encrypted</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <Zap size={14} className="text-yellow-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Zero Setup</span>
            </div>
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

