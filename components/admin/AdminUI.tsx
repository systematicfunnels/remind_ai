'use client';

import React from 'react';
import { CheckCircle2, X, ChevronRight } from 'lucide-react';

/* ======================================================
   ATOMS & UI COMPONENTS
====================================================== */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-widest transition-all rounded-2xl outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617] disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-900/20 focus:ring-indigo-500',
    secondary: 'bg-slate-800 text-slate-200 hover:bg-slate-700 focus:ring-slate-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-500 shadow-xl shadow-rose-900/20 focus:ring-rose-500',
    ghost: 'bg-transparent text-slate-400 hover:bg-slate-900 hover:text-white focus:ring-slate-500',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px] gap-2',
    md: 'px-6 py-4 text-xs gap-4',
    lg: 'px-8 py-4 text-sm gap-4',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
};

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-slate-900/30 border border-slate-800/40 backdrop-blur-md rounded-[2.5rem] p-8 hover:border-indigo-500/30 transition-all ${className}`}>
    {children}
  </div>
);

export const Breadcrumbs = ({ items }: { items: { label: string; href?: string }[] }) => (
  <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">
    {items.map((item, i) => (
      <React.Fragment key={item.label}>
        {i > 0 && <ChevronRight size={12} className="text-slate-700" />}
        {item.href ? (
          <a href={item.href} className="hover:text-indigo-400 transition-colors">{item.label}</a>
        ) : (
          <span className="text-slate-300">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

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
    <span className={`px-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[variant]}`}>
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
      <div className="absolute left-full ml-4 px-2 py-2 bg-slate-800 text-white text-[10px] font-bold uppercase tracking-widest rounded shadow-xl border border-slate-700 whitespace-nowrap z-[100] pointer-events-none animate-in fade-in slide-in-from-left-1">
        {text}
      </div>
    )}
  </div>
);

export const EmptyState = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in duration-700">
    <div className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 mb-6 text-slate-600 shadow-inner">
      <Icon size={40} />
    </div>
    <h4 className="text-white font-black text-lg mb-2 tracking-tight">{title}</h4>
    <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">{description}</p>
  </div>
);

export const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed bottom-6 right-6 z-[100] bg-indigo-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-8 duration-300">
    <CheckCircle2 size={18} className="text-emerald-300" />
    <span className="font-bold text-sm tracking-tight">{message}</span>
    <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-md transition-colors"><X size={14} /></button>
  </div>
);
