'use client';

import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

/* ======================================================
   ATOMS & UI COMPONENTS
====================================================== */

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'danger';
}

export const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  const styles = {
    default: 'bg-slate-800 text-slate-400 border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    info: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-slate-800/30 animate-pulse rounded-xl ${className}`} {...props} />
);

export const Tooltip = ({ text, children, visible, ...props }: { text: string; children: React.ReactNode; visible: boolean } & React.HTMLAttributes<HTMLDivElement>) => (
  <div className="relative group inline-block w-full" {...props}>
    {children}
    {visible && (
      <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-xl border border-slate-700 whitespace-nowrap z-[100] pointer-events-none animate-in fade-in slide-in-from-left-1">
        {text}
      </div>
    )}
  </div>
);

export const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-700">
    <div className="p-5 bg-slate-900/50 rounded-3xl border border-slate-800 mb-6 text-slate-600 shadow-inner">
      <Icon size={40} />
    </div>
    <h4 className="text-white font-black text-lg mb-2 tracking-tight">{title}</h4>
    <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">{description}</p>
  </div>
);

export const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-6 right-6 z-[100] bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 duration-300">
    <CheckCircle2 size={18} className="text-emerald-300" />
    <span className="font-bold text-sm tracking-tight">{message}</span>
    <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-md transition-colors"><X size={14} /></button>
  </div>
);
