'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Bell, BarChart3, Settings, Search, 
  Menu, X, LogOut, Terminal, Zap, ChevronRight
} from 'lucide-react';
import { Toast, Tooltip } from '@/components/admin/AdminUI';

const menuItems = [
  { icon: <BarChart3 size={20} />, label: 'Overview', path: '/admin' },
  { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
  { icon: <Bell size={20} />, label: 'Reminders', path: '/admin/reminders' },
  { icon: <Terminal size={20} />, label: 'System Logs', path: '/admin/logs' },
  { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_expanded');
      if (saved !== null) {
        setSidebarOpen(JSON.parse(saved));
      } else {
        setSidebarOpen(window.innerWidth > 1024);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar_expanded', JSON.stringify(isSidebarOpen));
    }
  }, [isSidebarOpen]);

  const triggerResize = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('resize'));
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 350);
    }
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen((prev: boolean) => !prev);
    triggerResize();
  };

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        } else {
          // Optional: automatically reopen if it was previously open
          const saved = localStorage.getItem('sidebar_expanded');
          if (saved !== 'false') {
            setSidebarOpen(true);
          }
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-500 ease-in-out ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={() => setSidebarOpen(false)} 
        aria-hidden="true" 
      />

      <aside 
        className={`
          fixed lg:relative z-50 h-screen bg-slate-950/80 backdrop-blur-3xl border-r border-slate-800/40 transition-all duration-300 ease-in-out flex flex-col overflow-hidden shrink-0
          ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-[88px] lg:translate-x-0'}
        `}
      >
        <div className="p-6 flex items-center justify-between whitespace-nowrap overflow-hidden">
          <Link 
            href="/" 
            className={`flex items-center transition-all duration-300 ${!isSidebarOpen ? 'lg:opacity-0 pointer-events-none scale-90 w-0' : 'scale-100 gap-3'}`}
          >
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="font-black text-xl tracking-tighter">Remind<span className="text-indigo-500">AI</span></span>
          </Link>
          <button 
            onClick={handleSidebarToggle} 
            className="p-2 text-slate-500 hover:text-white transition-all hover:bg-slate-900 rounded-lg shrink-0 outline-none"
          >
            {isSidebarOpen ? <ChevronRight className="rotate-180 hidden lg:block" size={20} /> : <Menu className="hidden lg:block" size={20} />}
            <X size={24} className="lg:hidden" />
          </button>
        </div>

        <nav className="flex-grow px-3 py-4 space-y-1.5 overflow-x-hidden overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Tooltip text={item.label} visible={!isSidebarOpen} key={item.label}>
                <Link
                  href={item.path}
                  className={`
                    flex items-center px-3.5 py-3.5 rounded-2xl transition-all group whitespace-nowrap outline-none relative
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' 
                      : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'}
                    ${isSidebarOpen ? 'gap-4' : 'lg:justify-center'}
                  `}
                >
                  <span className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'group-hover:text-indigo-400'}`}>
                    {item.icon}
                  </span>
                  <span className={`font-bold text-sm tracking-tight transition-all duration-200 ${!isSidebarOpen ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden lg:ml-0' : 'opacity-100 ml-4'}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-indigo-300 rounded-r-full shadow-lg shadow-indigo-400" />
                  )}
                </Link>
              </Tooltip>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-900/50 overflow-hidden">
          <Link 
            href="/"
            className={`w-full flex items-center px-3.5 py-3.5 text-slate-600 hover:text-rose-400 transition-colors group whitespace-nowrap rounded-2xl outline-none ${isSidebarOpen ? 'gap-4' : 'lg:justify-center'}`}
          >
            <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            <span className={`font-bold text-sm transition-all duration-200 ${!isSidebarOpen ? 'lg:w-0 lg:opacity-0 lg:overflow-hidden lg:ml-0' : 'opacity-100 ml-4'}`}>Sign Out</span>
          </Link>
        </div>
      </aside>

      <main className="flex-grow h-screen overflow-y-auto relative flex flex-col scroll-smooth min-w-0 bg-[#020617]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] -z-0 pointer-events-none" />
        
        <header className="sticky top-0 z-20 px-6 lg:px-10 py-5 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 lg:hidden bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors" 
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                {menuItems.find(i => i.path === pathname)?.label || 'Console'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative group max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800/60 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
            <button className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/60 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all relative group focus:ring-2 focus:ring-indigo-500/40 outline-none">
               <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950 group-hover:animate-ping" />
               <Bell size={18} />
             </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-px flex items-center justify-center font-black text-xs text-indigo-500 shadow-2xl">
               AD
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full relative z-10 flex-grow">
          {children}
        </div>
      </main>
    </div>
  );
}
