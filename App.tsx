
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import BotSimulator from './components/BotSimulator';
import { LayoutDashboard, MessageSquare, Menu, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      {!isAdminPath && (
        <nav className="fixed top-0 w-full z-50 glass-effect border-b border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-20 items-center">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                  <MessageSquare className="text-white w-5 h-5 fill-current" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-900">
                  Remind<span className="text-indigo-600">AI</span>
                </span>
              </Link>
              
              <div className="hidden lg:flex items-center gap-10">
                <Link to="/" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Product</Link>
                <a href="#features" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Features</a>
                <a href="#pricing" className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">Pricing</a>
                
                <div className="h-4 w-px bg-slate-200"></div>
                
                <Link to="/demo" className="text-sm font-black bg-slate-900 text-white px-6 py-3 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2">
                   Live Demo
                   <ArrowRight size={14} />
                </Link>
                <Link to="/admin" className="p-2 text-slate-400 hover:text-indigo-600 transition-all hover:bg-indigo-50 rounded-xl" title="Admin Dashboard">
                   <LayoutDashboard className="w-5 h-5" />
                </Link>
              </div>

              <div className="lg:hidden flex items-center gap-4">
                 <Link to="/demo" className="text-xs font-black bg-indigo-600 text-white px-4 py-2 rounded-xl">Demo</Link>
                 <Menu className="w-6 h-6 text-slate-900" />
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className={`flex-grow ${!isAdminPath ? 'pt-20' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/demo" element={<BotSimulator />} />
        </Routes>
      </main>

      {!isAdminPath && (
        <footer className="bg-white border-t border-slate-100 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
              <div className="col-span-2">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="bg-indigo-600 p-2 rounded-xl">
                    <MessageSquare className="text-white w-5 h-5 fill-current" />
                  </div>
                  <span className="text-2xl font-black tracking-tighter text-slate-900">RemindAI</span>
                </div>
                <p className="max-w-xs text-slate-500 text-sm leading-relaxed font-medium">
                  Supercharge your focus using the messaging apps you already love. Powered by Gemini Pro.
                </p>
                <div className="flex gap-4 mt-8">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-indigo-50 transition-colors cursor-pointer">
                      <div className="w-4 h-4 bg-slate-400 rounded-sm"></div>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-indigo-50 transition-colors cursor-pointer">
                      <div className="w-4 h-4 bg-slate-400 rounded-sm"></div>
                   </div>
                </div>
              </div>
              
              <div className="col-span-1">
                <h4 className="text-slate-900 font-black mb-6 text-xs uppercase tracking-[0.2em]">Solution</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">WhatsApp Bot</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Telegram Bot</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Voice Notes</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">SLA Dashboard</a></li>
                </ul>
              </div>

              <div className="col-span-1">
                <h4 className="text-slate-900 font-black mb-6 text-xs uppercase tracking-[0.2em]">Company</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Our Blog</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">API Docs</a></li>
                </ul>
              </div>

              <div className="col-span-1">
                <h4 className="text-slate-900 font-black mb-6 text-xs uppercase tracking-[0.2em]">Trust</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms</a></li>
                </ul>
              </div>

              <div className="col-span-1">
                <h4 className="text-slate-900 font-black mb-6 text-xs uppercase tracking-[0.2em]">Admin</h4>
                <ul className="space-y-4 text-sm font-bold text-slate-400">
                  <li><Link to="/admin" className="hover:text-indigo-600 transition-colors">Dashboard</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-slate-100 pt-12 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-slate-400 text-xs font-bold">
                &copy; {new Date().getFullYear()} RemindAI SaaS. A division of Nexa Labs.
              </p>
              <div className="flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    System Operational
                 </span>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
