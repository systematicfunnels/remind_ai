'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Zap, MessageSquare, Smartphone, 
  Shield, Mic, Brain, Instagram,
  CheckCircle2, Star, ArrowRight,
  Clock, Bell, Sparkles
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
                href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "#"} 
                className="group relative flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-500"
              >
                <div className="p-4 bg-[#25D366]/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare size={32} className="text-[#25D366]" fill="currentColor" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">WhatsApp</span>
                <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">Chat with Bot</span>
              </Link>

              <Link 
                href={process.env.NEXT_PUBLIC_TELEGRAM_LINK || "#"} 
                className="group relative flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-sky-500/50 hover:bg-sky-500/5 transition-all duration-500"
              >
                <div className="p-4 bg-[#0088cc]/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone size={32} className="text-[#0088cc]" fill="currentColor" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">Telegram</span>
                <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">Chat with Bot</span>
              </Link>

              <Link 
                href={process.env.NEXT_PUBLIC_INSTAGRAM_LINK || "#"} 
                className="group relative flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-pink-500/50 hover:bg-pink-500/5 transition-all duration-500"
              >
                <div className="p-4 bg-pink-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Instagram size={32} className="text-pink-500" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">Instagram</span>
                <span className="text-[10px] text-emerald-500/60 mt-2 font-black uppercase tracking-widest">Live Now</span>
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

        {/* How it Works Section */}
        <section className="px-6 lg:px-12 py-24 relative overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl lg:text-5xl font-black text-white uppercase italic tracking-tighter">How it Works</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Simplicity in 3 steps</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard 
                number="01" 
                icon={<MessageSquare className="text-indigo-400" />}
                title="Send a Message"
                description="Text or record a voice note like 'Remind me to call Mom at 7 PM'."
              />
              <StepCard 
                number="02" 
                icon={<Brain className="text-emerald-400" />}
                title="AI Extraction"
                description="Our AI understands the time and task instantly, no matter how you say it."
              />
              <StepCard 
                number="03" 
                icon={<Bell className="text-sky-400" />}
                title="Get Reminded"
                description="Receive a notification back in your chat exactly when you need it."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-6 lg:px-12 py-24 bg-slate-900/20 border-y border-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl lg:text-5xl font-black text-white uppercase italic tracking-tighter">Pricing</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Straightforward plans</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PricingCard 
                title="Free"
                price="₹0"
                features={[
                  "5 Reminders per month",
                  "WhatsApp & Telegram",
                  "Basic AI support",
                  "Community Support"
                ]}
                cta="Start for Free"
                href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "#"}
              />
              <PricingCard 
                title="Premium"
                price="₹499"
                period="/mo"
                highlighted
                features={[
                  "Unlimited Reminders",
                  "Priority AI Processing",
                  "Voice Note Support",
                  "Custom Reminder Sounds",
                  "Multi-platform Sync"
                ]}
                cta="Go Premium"
                href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "#"}
              />
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="px-6 lg:px-12 py-12 border-t border-slate-900/50 text-center">
        <div className="flex items-center justify-center gap-3 mb-6 opacity-50 grayscale">
          <div className="p-1 bg-slate-800 rounded-lg">
            <Zap size={14} className="text-white fill-white" />
          </div>
          <span className="text-sm font-black tracking-tighter text-white uppercase italic">RemindAI</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
          © 2026 RemindAI. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}

function StepCard({ number, icon, title, description }: { number: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-slate-900/30 border border-slate-800/40 backdrop-blur-md relative group hover:border-indigo-500/30 transition-all">
      <span className="absolute top-8 right-8 text-4xl font-black text-slate-800 italic group-hover:text-indigo-500/10 transition-colors">{number}</span>
      <div className="p-4 bg-slate-800/50 rounded-2xl w-fit mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-4">{title}</h3>
      <p className="text-slate-400 font-medium leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function PricingCard({ title, price, period = "", features, cta, href, highlighted = false }: { title: string, price: string, period?: string, features: string[], cta: string, href: string, highlighted?: boolean }) {
  return (
    <div className={`p-10 rounded-[3rem] border backdrop-blur-md flex flex-col ${highlighted ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-slate-900/30 border-slate-800/40'}`}>
      <div className="mb-8">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-white tracking-tighter">{price}</span>
          <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{period}</span>
        </div>
      </div>
      <ul className="space-y-4 mb-10 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-300">
            <CheckCircle2 size={16} className={highlighted ? 'text-indigo-400' : 'text-slate-600'} />
            {feature}
          </li>
        ))}
      </ul>
      <Link 
        href={href} 
        className={`w-full py-4 rounded-2xl text-center text-sm font-black uppercase tracking-widest transition-all ${highlighted ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
      >
        {cta}
      </Link>
    </div>
  );
}

