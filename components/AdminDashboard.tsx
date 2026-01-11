
import React, { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, Bell, BarChart3, Settings, Search, ArrowUpRight, 
  CreditCard, Menu, X, LogOut, MessageSquare, Terminal, 
  ShieldCheck, Activity, Filter, Download, MoreHorizontal, 
  CheckCircle2, Trash2, Zap, RefreshCw, ChevronRight, UserPlus,
  Mic, Smartphone, Clock
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { getAppData, getStats, getLogs, saveAppData } from '../services/storageService';

/* ======================================================
   ATOMS & UI COMPONENTS
====================================================== */

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'warning' | 'info' | 'danger' }) => {
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

const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed bottom-6 right-6 z-[100] bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-8 duration-300">
    <CheckCircle2 size={18} className="text-emerald-300" />
    <span className="font-bold text-sm tracking-tight">{message}</span>
    <button onClick={onClose} className="ml-2 p-1 hover:bg-white/10 rounded-md transition-colors"><X size={14} /></button>
  </div>
);

/* ======================================================
   MAIN DASHBOARD SHELL
====================================================== */

const AdminDashboard: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const menuItems = [
    { icon: <BarChart3 size={20} />, label: 'Overview', path: '/admin' },
    { icon: <Users size={20} />, label: 'Users', path: '/admin/users' },
    { icon: <Bell size={20} />, label: 'Reminders', path: '/admin/reminders' },
    { icon: <Terminal size={20} />, label: 'System Logs', path: '/admin/logs' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/admin/settings' },
  ];

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed lg:relative z-50 h-full bg-slate-950/80 backdrop-blur-2xl border-r border-slate-800/40 transition-all duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-20 lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between whitespace-nowrap overflow-hidden">
          <Link to="/" className={`flex items-center gap-3 transition-opacity duration-300 ${!isSidebarOpen && 'lg:opacity-0 pointer-events-none'}`}>
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 shrink-0">
              <Zap className="text-white w-5 h-5 fill-current" />
            </div>
            <span className="font-black text-xl tracking-tighter">Remind<span className="text-indigo-500">AI</span></span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)} 
            className="p-2 text-slate-500 hover:text-white transition-colors hover:bg-slate-900 rounded-lg shrink-0"
          >
            {isSidebarOpen ? <ChevronRight className="rotate-180 hidden lg:block" size={20} /> : <Menu className="hidden lg:block" size={20} />}
            <X size={24} className="lg:hidden" />
          </button>
        </div>

        <nav className="flex-grow px-3 py-4 space-y-1.5 overflow-hidden">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`
                flex items-center gap-4 px-3.5 py-3.5 rounded-2xl transition-all group whitespace-nowrap
                ${location.pathname === item.path 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/20' 
                  : 'text-slate-500 hover:bg-slate-900 hover:text-slate-200'}
              `}
            >
              <span className={`shrink-0 transition-colors ${location.pathname === item.path ? 'text-white' : 'group-hover:text-indigo-400'}`}>
                {item.icon}
              </span>
              <span className={`font-bold text-sm tracking-tight transition-opacity duration-200 ${!isSidebarOpen && 'lg:opacity-0'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-900/50 overflow-hidden">
          <Link to="/" className="flex items-center gap-4 px-3.5 py-3.5 text-slate-600 hover:text-rose-400 transition-colors group whitespace-nowrap rounded-2xl">
            <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
            <span className={`font-bold text-sm transition-opacity duration-200 ${!isSidebarOpen && 'lg:opacity-0'}`}>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto relative flex flex-col scroll-smooth">
        {/* Glow Backgrounds */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] -z-0 pointer-events-none" />
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 px-6 lg:px-10 py-5 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-2 lg:hidden bg-slate-900 rounded-lg text-slate-400">
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-lg font-black tracking-tight text-white uppercase tracking-tighter">
                {menuItems.find(i => i.path === location.pathname)?.label || 'Console'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400" size={14} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900/50 border border-slate-800 focus:border-indigo-500/40 rounded-xl py-2 pl-10 pr-4 text-xs focus:ring-4 focus:ring-indigo-500/5 w-48 lg:w-64 transition-all outline-none text-slate-200"
              />
            </div>
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 p-px flex items-center justify-center font-black text-xs text-indigo-500">
               AD
            </div>
          </div>
        </header>

        {/* View Layout */}
        <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full relative z-10 flex-grow">
          <Routes>
            <Route path="/" element={<Overview showToast={showToast} />} />
            <Route path="/users" element={<UserList showToast={showToast} query={searchQuery} />} />
            <Route path="/reminders" element={<ReminderList showToast={showToast} query={searchQuery} />} />
            <Route path="/logs" element={<LogList query={searchQuery} />} />
            <Route path="*" element={<Overview showToast={showToast} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

/* ======================================================
   VIEW: OVERVIEW
====================================================== */

const Overview: React.FC<{ showToast: (m: string) => void }> = ({ showToast }) => {
  const stats = getStats();
  const chartData = [
    { name: 'Mon', val: 12000 }, { name: 'Tue', val: 18000 }, { name: 'Wed', val: 15000 },
    { name: 'Thu', val: 26000 }, { name: 'Fri', val: 32000 }, { name: 'Sat', val: 28000 },
    { name: 'Sun', val: 35000 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers.toLocaleString()} icon={<Users />} trend="+12%" color="indigo" />
        <StatCard title="Monthly Revenue" value={`₹${stats.mrr.toLocaleString()}`} icon={<CreditCard />} trend="+8%" color="emerald" />
        <StatCard title="Pending Tasks" value={stats.activeReminders.toString()} icon={<Activity />} trend="+18%" color="amber" />
        <StatCard title="Uptime Pulse" value="99.99%" icon={<ShieldCheck />} trend="Stable" color="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 bg-slate-900/30 rounded-3xl border border-slate-800/40 backdrop-blur-md">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-white text-lg tracking-tight">Growth Velocity</h3>
            <Badge variant="success">Live</Badge>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.2} />
                <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="val" stroke="#6366f1" strokeWidth={3} fill="url(#colorV)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-8 bg-indigo-600 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between group shadow-2xl shadow-indigo-900/40">
          <div className="relative z-10">
            <ShieldCheck className="mb-4 text-indigo-100" size={32} />
            <h3 className="font-black text-xl mb-2">Security Portal</h3>
            <p className="text-xs text-indigo-100 leading-relaxed mb-8">Your automated scheduling node is protected by world-class encryption.</p>
          </div>
          <button onClick={() => showToast("Downloading Security Protocol...")} className="relative z-10 w-full py-3.5 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-xl active:scale-95">
            Export Report
          </button>
          <Activity size={140} className="absolute -bottom-10 -right-10 text-white/10 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, color }: any) => {
  const colorMap: any = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20'
  };
  return (
    <div className="p-6 bg-slate-900/30 rounded-2xl border border-slate-800/40 hover:border-slate-700 transition-all backdrop-blur-sm group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3.5 rounded-xl border ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
          {React.cloneElement(icon, { size: 22 })}
        </div>
        <span className="text-[10px] font-black text-emerald-400">{trend}</span>
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</p>
      <h4 className="text-2xl font-black text-white">{value}</h4>
    </div>
  );
};

/* ======================================================
   VIEW: USER MANAGEMENT
====================================================== */

const UserList: React.FC<{ showToast: (m: string) => void, query: string }> = ({ showToast, query }) => {
  const [data, setData] = useState(getAppData());
  const filtered = useMemo(() => {
    return data.users.filter(u => u.phone.toLowerCase().includes(query.toLowerCase()) || u.platform.toLowerCase().includes(query.toLowerCase()));
  }, [data.users, query]);

  const deleteUser = (id: string) => {
    if (confirm("Delete this subscriber node?")) {
      const newData = { ...data, users: data.users.filter(u => u.id !== id) };
      setData(newData); saveAppData(newData);
      showToast("Node removed from network.");
    }
  };

  return (
    <div className="bg-slate-900/30 rounded-3xl border border-slate-800/40 overflow-hidden backdrop-blur-md shadow-2xl">
      <div className="p-6 border-b border-slate-800/40 flex items-center justify-between bg-slate-950/20">
         <h3 className="font-black text-white flex items-center gap-2">
           <Users size={18} className="text-indigo-500" /> Subscribers
         </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-950/40 border-b border-slate-800/40">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Subscriber</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Platform</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Plan</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/20">
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-slate-800/10 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}`} className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 p-1" alt="avatar" />
                    <div>
                      <div className="text-xs font-black text-slate-200">{user.phone}</div>
                      <div className="text-[10px] text-slate-500 font-bold">Member Since {user.createdAt}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <Badge variant={user.platform === 'whatsapp' ? 'success' : 'info'}>{user.platform}</Badge>
                </td>
                <td className="px-6 py-5 text-center">
                  <Badge variant={user.subscriptionStatus === 'premium' ? 'info' : 'default'}>{user.subscriptionStatus}</Badge>
                </td>
                <td className="px-6 py-5 text-right">
                  <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ======================================================
   VIEW: DISPATCH QUEUE
====================================================== */

const ReminderList: React.FC<{ showToast: (m: string) => void, query: string }> = ({ showToast, query }) => {
  const data = getAppData();
  const filtered = useMemo(() => {
    return data.reminders.filter(r => r.task.toLowerCase().includes(query.toLowerCase()));
  }, [data.reminders, query]);

  return (
    <div className="bg-slate-900/30 rounded-3xl border border-slate-800/40 overflow-hidden shadow-2xl backdrop-blur-md">
      <div className="p-6 border-b border-slate-800/40 flex items-center bg-slate-950/20">
         <h3 className="font-black text-white flex items-center gap-2">
           <Bell size={18} className="text-amber-500" /> Dispatch Queue
         </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-950/40 border-b border-slate-800/40">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Instruction</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Scheduled</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/20 font-sans">
            {filtered.map(rem => (
              <tr key={rem.id} className="hover:bg-slate-800/10 transition-colors">
                <td className="px-6 py-5">
                  <div className="text-xs font-black text-slate-200 truncate max-w-xs">{rem.task}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {rem.isVoice ? <Mic size={10} className="text-amber-400" /> : <MessageSquare size={10} className="text-indigo-400" />}
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Job-{rem.id.slice(0, 5)}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="text-[10px] font-black font-mono text-indigo-400">
                    {new Date(rem.scheduledAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex justify-center items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${rem.status === 'pending' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className={`text-[10px] font-black uppercase ${rem.status === 'pending' ? 'text-amber-400' : 'text-emerald-500'}`}>{rem.status}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ======================================================
   VIEW: SYSTEM LOGS
====================================================== */

const LogList: React.FC<{ query: string }> = ({ query }) => {
  const logs = getLogs();
  const filtered = useMemo(() => {
    return logs.filter(l => l.message.toLowerCase().includes(query.toLowerCase()) || l.intent.toLowerCase().includes(query.toLowerCase()));
  }, [logs, query]);

  return (
    <div className="bg-slate-950/60 rounded-3xl border border-slate-800/40 overflow-hidden shadow-2xl backdrop-blur-md font-mono">
      <div className="p-6 border-b border-slate-800/40 flex items-center justify-between">
         <h3 className="font-black text-white flex items-center gap-2">
           <Terminal size={18} className="text-indigo-400" /> Sequence Terminal
         </h3>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-950 sticky top-0 border-b border-slate-800/40 z-10 text-[9px] uppercase tracking-widest text-slate-600">
            <tr>
              <th className="px-6 py-4">Ref</th>
              <th className="px-6 py-4">Intent</th>
              <th className="px-6 py-4">Payload</th>
              <th className="px-6 py-4 text-right">Stamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/20 text-[10px]">
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-indigo-600/5 group">
                <td className="px-6 py-3 text-slate-600 group-hover:text-indigo-400">{log.id.slice(0, 8)}</td>
                <td className="px-6 py-3">
                   <span className={`font-black ${log.intent === 'CREATE' ? 'text-indigo-400' : 'text-emerald-400'}`}>{log.intent}</span>
                </td>
                <td className="px-6 py-3 text-slate-400 font-sans italic">"{log.message}"</td>
                <td className="px-6 py-3 text-slate-600 text-right">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 2 } as any)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
