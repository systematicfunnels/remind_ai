'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Zap, MessageSquare, Smartphone, 
  Shield, Mic, Brain, Instagram,
  CheckCircle2, Bell, Globe
} from 'lucide-react';

const translations = {
  en: {
    heroTitle: "YOUR AI",
    heroHighlight: "REMINDER BOT.",
    heroSub: "Just chat or record a voice note like \"remind me at 10pm\". Our AI schedules it and sends the reminder back to your chat.",
    whatsapp: "WhatsApp",
    telegram: "Telegram",
    instagram: "Instagram",
    chatBot: "Chat with Bot",
    liveNow: "Live Now",
    howItWorks: "How it Works",
    simplicity: "Simplicity in 3 steps",
    step1Title: "Send a Message",
    step1Desc: "Text or record a voice note like 'Remind me to call Mom at 7 PM'.",
    step2Title: "AI Extraction",
    step2Desc: "Our AI understands the time and task instantly, no matter how you say it.",
    step3Title: "Get Reminded",
    step3Desc: "Receive a notification back in your chat exactly when you need it.",
    pricing: "Pricing",
    plans: "Straightforward plans",
    free: "Free",
    premium: "Premium",
    startFree: "Start for Free",
    goPremium: "Go Premium",
    legal: "Legal",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    platforms: "Platforms",
    support: "Support",
    contact: "Contact Us",
    help: "Help Center",
    systemOperational: "System Operational",
    rootAccess: "Root Access",
  },
  hi: {
    heroTitle: "आपका AI",
    heroHighlight: "रिमाइंडर बॉट।",
    heroSub: "बस चैट करें या वॉइस नोट रिकॉर्ड करें जैसे \"रात 10 बजे याद दिलाना\"। हमारा AI इसे शेड्यूल करता है और आपकी चैट पर रिमाइंडर भेजता है।",
    whatsapp: "व्हाट्सएप",
    telegram: "टेलीग्राम",
    instagram: "इंस्टाग्राम",
    chatBot: "बॉट के साथ चैट करें",
    liveNow: "अभी लाइव है",
    howItWorks: "यह कैसे काम करता है",
    simplicity: "3 आसान चरणों में",
    step1Title: "संदेश भेजें",
    step1Desc: "टेक्स्ट या वॉइस नोट रिकॉर्ड करें जैसे 'शाम 7 बजे मम्मी को कॉल करने की याद दिलाना'।",
    step2Title: "AI एक्सट्रैक्शन",
    step2Desc: "हमारा AI समय और कार्य को तुरंत समझ जाता है, चाहे आप इसे कैसे भी कहें।",
    step3Title: "रिमाइंडर प्राप्त करें",
    step3Desc: "ठीक उसी समय अपनी चैट पर वापस नोटिफिकेशन प्राप्त करें जब आपको इसकी आवश्यकता हो।",
    pricing: "कीमत",
    plans: "सीधी योजनाएं",
    free: "मुफ्त",
    premium: "प्रीमियम",
    startFree: "मुफ्त में शुरू करें",
    goPremium: "प्रीमियम लें",
    legal: "कानूनी",
    privacy: "गोपनीयता नीति",
    terms: "सेवा की शर्तें",
    platforms: "प्लेटफ़ॉर्म",
    support: "सहायता",
    contact: "संपर्क करें",
    help: "सहायता केंद्र",
    systemOperational: "सिस्टम चालू है",
    rootAccess: "रूट एक्सेस",
  }
};

export default function LandingPage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = translations[lang];

  return (
    <div className="relative isolate bg-[#020617] selection:bg-indigo-500/30 overflow-x-hidden min-h-screen flex flex-col">
      {/* Dynamic Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] opacity-50" />
      </div>

      <nav className="flex items-center justify-between p-6 lg:px-12 backdrop-blur-xl sticky top-0 z-[100] border-b border-slate-800/40 bg-slate-950/50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase italic">RemindAI</span>
        </div>
        
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all group outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <Globe size={14} className="text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </span>
          </button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col justify-center">
        {/* Hero Section */}
        <section className="px-6 lg:px-12 py-24 relative text-center max-w-[1440px] mx-auto w-full">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="space-y-8">
              <h1 className="text-6xl lg:text-[120px] font-black text-white tracking-tight leading-[0.85]">
                {t.heroTitle}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-400 to-sky-400 animate-gradient">{t.heroHighlight}</span>
              </h1>
              <p className="text-lg lg:text-2xl text-slate-200 max-w-2xl mx-auto font-medium tracking-tight leading-relaxed">
                {t.heroSub}
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8 max-w-3xl mx-auto">
              <a 
                href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "https://wa.me/your-number?text=Hi!%20I'd%20like%20to%20set%20a%20reminder."} 
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-12 sm:col-span-4 group relative flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-500"
              >
                <div className="p-4 bg-emerald-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <MessageSquare size={32} className="text-emerald-500" fill="currentColor" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">{t.whatsapp}</span>
                <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">{t.chatBot}</span>
              </a>

              <a 
                href={process.env.NEXT_PUBLIC_TELEGRAM_LINK || "https://t.me/heybirdy_bot"} 
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-12 sm:col-span-4 group relative flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-sky-500/50 hover:bg-sky-500/5 transition-all duration-500"
              >
                <div className="p-4 bg-sky-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Smartphone size={32} className="text-sky-500" fill="currentColor" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">{t.telegram}</span>
                <span className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-tighter">{t.chatBot}</span>
              </a>

              <a 
                href={process.env.NEXT_PUBLIC_INSTAGRAM_LINK || "https://instagram.com/remindai"} 
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-12 sm:col-span-4 group relative flex flex-col items-center justify-center p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-pink-500/50 hover:bg-pink-500/5 transition-all duration-500"
              >
                <div className="p-4 bg-pink-500/10 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <Instagram size={32} className="text-pink-500" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">{t.instagram}</span>
                <span className="text-[10px] text-emerald-500/60 mt-2 font-black uppercase tracking-widest">{t.liveNow}</span>
              </a>
            </div>
          </div>
        </section>

        {/* Minimal Feature Bar */}
        <section className="px-6 lg:px-12 py-16 border-t border-slate-900/50 bg-slate-950/20 max-w-[1440px] mx-auto w-full">
          <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-x-16 gap-y-8">
            <div className="flex items-center gap-3 text-slate-400 group cursor-default">
              <Mic size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Voice Support</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 group cursor-default">
              <Brain size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Natural AI</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 group cursor-default">
              <Shield size={18} className="text-sky-500 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Encrypted</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 group cursor-default">
              <Zap size={18} className="text-yellow-500 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors">Zero Setup</span>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="px-6 lg:px-12 py-32 relative overflow-hidden max-w-[1440px] mx-auto w-full">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter">{t.howItWorks}</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t.simplicity}</p>
            </div>
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-4">
                <StepCard 
                  number="01" 
                  icon={<MessageSquare className="text-indigo-400" />}
                  title={t.step1Title}
                  description={t.step1Desc}
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <StepCard 
                  number="02" 
                  icon={<Brain className="text-emerald-400" />}
                  title={t.step2Title}
                  description={t.step2Desc}
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <StepCard 
                  number="03" 
                  icon={<Bell className="text-sky-400" />}
                  title={t.step3Title}
                  description={t.step3Desc}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-6 lg:px-12 py-32 bg-slate-900/20 border-y border-slate-900/50 max-w-[1440px] mx-auto w-full">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter">{t.pricing}</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">{t.plans}</p>
            </div>
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-12 md:col-span-6">
                <PricingCard 
                  title={t.free}
                  price="₹0"
                  features={[
                    "5 Reminders per month",
                    "WhatsApp & Telegram",
                    "Basic AI support",
                    "Community Support"
                  ]}
                  cta={t.startFree}
                  href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "https://wa.me/your-number?text=Hi!%20I'd%20like%20to%20start%20for%20free."}
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <PricingCard 
                  title={t.premium}
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
                  cta={t.goPremium}
                  href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "https://wa.me/your-number?text=Hi!%20I'd%20like%20to%20upgrade%20to%20Premium."}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="px-6 lg:px-12 py-12 border-t border-slate-900/50 bg-slate-950/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Zap size={16} className="text-white fill-white" />
              </div>
              <span className="text-lg font-black tracking-tighter text-white uppercase italic">RemindAI</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">{t.systemOperational}</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.legal}</span>
              <Link href="/privacy" className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-colors">{t.privacy}</Link>
              <Link href="/terms" className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-colors">{t.terms}</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.platforms}</span>
              <a 
                href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "https://wa.me/your-number"} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-colors"
              >
                {t.whatsapp}
              </a>
              <a 
                href={process.env.NEXT_PUBLIC_TELEGRAM_LINK || "https://t.me/heybirdy_bot"} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-colors"
              >
                {t.telegram}
              </a>
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.support}</span>
              <a href="mailto:support@remindai.com" className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-colors">{t.contact}</a>
              <a 
                href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || "https://wa.me/your-number"} 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-slate-400 hover:text-indigo-400 transition-colors"
              >
                {t.help}
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
              © 2026 RemindAI. All Rights Reserved.
            </p>
            <Link 
              href="/admin" 
              className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800 hover:text-indigo-400 focus:text-indigo-400 transition-colors outline-none border border-slate-800/40 px-4 py-2 rounded-md"
            >
              {t.rootAccess}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-white">W</div>
              <div className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-white">T</div>
              <div className="w-6 h-6 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[8px] font-bold text-white">I</div>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">Multi-Channel Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, icon, title, description }: { number: string, icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 rounded-[3rem] bg-slate-900/30 border border-slate-800/40 backdrop-blur-md relative group hover:border-indigo-500/30 transition-all">
      <span className="absolute top-10 right-10 text-4xl font-black text-slate-800 italic group-hover:text-indigo-500/10 transition-colors">{number}</span>
      <div className="p-4 bg-slate-800/50 rounded-2xl w-fit mb-8">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-4">{title}</h3>
      <p className="text-slate-200 font-medium leading-relaxed text-sm">{description}</p>
    </div>
  );
}

function PricingCard({ title, price, period = "", features, cta, href, highlighted = false }: { title: string, price: string, period?: string, features: string[], cta: string, href: string, highlighted?: boolean }) {
  return (
    <div className={`p-12 rounded-[3rem] border backdrop-blur-md flex flex-col ${highlighted ? 'bg-indigo-600/10 border-indigo-500/40' : 'bg-slate-900/30 border-slate-800/40'}`}>
      <div className="mb-12">
        <h3 className="text-2xl font-black text-white uppercase italic tracking-tight mb-2">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-white tracking-tighter">{price}</span>
          <span className="text-slate-500 font-bold uppercase tracking-widest text-[11px]">{period}</span>
        </div>
      </div>
      <ul className="space-y-8 mb-12 flex-grow">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-4 text-sm font-medium text-slate-300">
            <CheckCircle2 size={18} className={highlighted ? 'text-indigo-400' : 'text-slate-600'} />
            {feature}
          </li>
        ))}
      </ul>
      <a 
        href={href} 
        target="_blank"
        rel="noopener noreferrer"
        className={`w-full py-4 rounded-2xl text-center text-sm font-black uppercase tracking-widest transition-all ${highlighted ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
      >
        {cta}
      </a>
    </div>
  );
}

