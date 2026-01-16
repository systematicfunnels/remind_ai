'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Smartphone, ArrowRight, Loader2, MessageSquare, Send, Mail, Lock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan');
  const initialPlatform = searchParams.get('platform') as 'whatsapp' | 'telegram' | 'instagram' | null;
  
  const [authMode, setAuthMode] = useState<'email'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isSignup ? '/api/auth/email/signup' : '/api/auth/email/login';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Force a hard refresh to update session state across the app
        window.location.href = '/dashboard';
      } else {
        setError(data.error || (isSignup ? 'Failed to create account' : 'Invalid email or password'));
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
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
          {initialPlan && (
            <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
              <CheckCircle2 size={12} className="text-indigo-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                Selected Plan: {initialPlan}
              </span>
            </div>
          )}
          {initialPlatform && (
            <div className="mb-6 flex items-center gap-2 px-4 py-2 bg-slate-500/10 border border-slate-500/20 rounded-full w-fit">
              <Smartphone size={12} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Platform: {initialPlatform}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tight mb-2">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-400 text-sm font-medium mb-8">
            Enter your email and password to access your AI assistant.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
              <p className="text-rose-500 text-xs font-bold uppercase tracking-wider text-center">{error}</p>
            </div>
          )}

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
        </div>

        <p className="mt-12 text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
          By continuing, you agree to our <Link href="/terms" className="text-slate-500 hover:text-indigo-400">Terms</Link> and <Link href="/privacy" className="text-slate-500 hover:text-indigo-400">Privacy</Link>.
        </p>
      </div>
    </div>
  );
}
