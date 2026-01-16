'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Smartphone, ArrowRight, Loader2, MessageSquare, Send, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp' | 'email'>('phone');
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [phoneId, setPhoneId] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneId, channel }),
      });

      if (res.ok) {
        setStep('otp');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send code. Make sure you have messaged our bot first.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isSignup ? '/api/auth/email/signup' : '/api/auth/email/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Authentication failed.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneId, code: otp }),
      });

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid or expired code.');
      }
    } catch {
      setError('Verification error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center gap-3 mb-12 justify-center group">
          <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase italic">RemindAI</span>
        </Link>

        <div className="bg-slate-900/50 border border-slate-800 p-8 md:p-12 rounded-[2.5rem] backdrop-blur-xl shadow-2xl">
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tight mb-2">
            {step === 'otp' ? 'Check your Bot' : (isSignup ? 'Create Account' : 'Welcome Back')}
          </h1>
          <p className="text-slate-400 text-sm font-medium mb-8">
            {step === 'otp' 
              ? `We sent a 6-digit code to your ${channel === 'whatsapp' ? 'WhatsApp' : 'Telegram'}.`
              : (authMode === 'phone' ? 'Enter your phone number or Telegram ID.' : 'Enter your email and password.')}
          </p>

          <div className="flex gap-2 mb-8 p-1 bg-slate-950/50 rounded-2xl border border-slate-800">
            <button
              onClick={() => { setAuthMode('phone'); setStep('phone'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                authMode === 'phone' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Smartphone size={14} />
              Phone/Bot
            </button>
            <button
              onClick={() => { setAuthMode('email'); setStep('email'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                authMode === 'email' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Mail size={14} />
              Email
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <p className="text-rose-500 text-xs font-bold uppercase tracking-wider text-center">{error}</p>
            </div>
          )}

          {step === 'otp' ? (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  autoFocus
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white text-center text-2xl tracking-[0.5em] placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Verify & Login <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                Change Phone Number
              </button>
            </form>
          ) : authMode === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Choose Platform</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                      channel === 'whatsapp' 
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <MessageSquare size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('telegram')}
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                      channel === 'telegram' 
                        ? 'bg-sky-500/10 border-sky-500/40 text-sky-400' 
                        : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Telegram</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                  {channel === 'whatsapp' ? 'WhatsApp Number (with country code)' : 'Telegram ID'}
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={phoneId}
                    onChange={(e) => setPhoneId(e.target.value)}
                    placeholder={channel === 'whatsapp' ? '+919876543210' : '123456789'}
                    required
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    Send Code <Send size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    {isSignup ? 'Create Account' : 'Login Now'} <ArrowRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="w-full text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
              >
                {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
              </button>
            </form>
          )}
        </div>

        <p className="mt-12 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
          By continuing, you agree to our <Link href="/terms" className="text-slate-500 hover:text-indigo-400">Terms</Link> and <Link href="/privacy" className="text-slate-500 hover:text-indigo-400">Privacy</Link>.
        </p>
      </div>
    </div>
  );
}
