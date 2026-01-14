'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, Bell, BarChart3, Settings, Search, 
  Menu, X, LogOut, Zap
} from 'lucide-react';
import { Toast, Breadcrumbs } from '@/components/admin/AdminUI';
import { logout } from '@/lib/adminActions';

const menuItems = [
  { icon: <BarChart3 size={20} />, label: 'Control Room', path: '/admin' },
  { icon: <Users size={20} />, label: 'User Directory', path: '/admin/users' },
  { icon: <Bell size={20} />, label: 'Job Pipeline', path: '/admin/reminders' },
  { icon: <Settings size={20} />, label: 'Core Config', path: '/admin/settings' },
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

  // Generate breadcrumbs from pathname
  const breadcrumbItems = pathname.split('/').filter(Boolean).map((part, i, arr) => {
    const href = '/' + arr.slice(0, i + 1).join('/');
    const label = part.charAt(0).toUpperCase() + part.slice(1);
    return { label, href: i === arr.length - 1 ? undefined : href };
  });

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        } else {
          setSidebarOpen(true);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-72 lg:translate-x-0'}
        `}
      >
        <div className="p-8 flex items-center justify-between whitespace-nowrap overflow-hidden">
          <Link 
            href="/" 
            className="flex items-center gap-4 scale-100"
          >
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="font-black text-xl tracking-tighter">Remind<span className="text-indigo-500">AI</span></span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="p-2 text-slate-500 hover:text-white transition-all hover:bg-slate-900 rounded-lg shrink-0 lg:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-grow px-4 py-8 space-y-2 overflow-x-hidden overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.label}
                href={item.path}
                className={`
                  flex items-center px-6 py-4 rounded-2xl transition-all group whitespace-nowrap outline-none relative gap-4
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' 
                    : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'}
                `}
              >
                <span className={`shrink-0 transition-colors ${isActive ? 'text-white' : 'group-hover:text-indigo-400'}`}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-tight ml-4">
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-indigo-300 rounded-r-full shadow-lg shadow-indigo-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 mt-auto border-t border-slate-900/50 overflow-hidden">
          <button 
            onClick={() => logout()}
            className="w-full flex items-center px-6 py-4 text-slate-600 hover:text-rose-400 transition-colors group whitespace-nowrap rounded-2xl outline-none gap-4"
          >
            <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm ml-4">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow h-screen overflow-y-auto relative flex flex-col scroll-smooth min-w-0 bg-[#020617]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] -z-0 pointer-events-none" />
        
        <header className="sticky top-0 z-20 px-6 lg:px-12 py-4 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="p-2 lg:hidden bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors" 
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-4">
                {menuItems.find(i => i.path === pathname)?.label || 'Console'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="relative group max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800/60 rounded-2xl py-2 pl-12 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
              />
            </div>
            <button className="p-2 rounded-xl bg-slate-900/50 border border-slate-800/60 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all relative group focus:ring-2 focus:ring-indigo-500/40 outline-none">
               <div className="absolute top-3 right-3 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-950 group-hover:animate-ping" />
               <Bell size={18} />
             </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 p-px flex items-center justify-center font-black text-xs text-indigo-500 shadow-2xl">
               AD
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-12 max-w-[1440px] mx-auto w-full relative z-10 flex-grow">
          <Breadcrumbs items={breadcrumbItems} />
          {children}
        </div>
      </main>
    </div>
  );
}
