
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Zap, 
  Mic, 
  Lock, 
  MessageCircle, 
  Smartphone,
  ArrowRight,
  Star,
  Clock,
  ArrowDown,
  X
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-24 lg:pt-36 lg:pb-48 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>The #1 AI Reminder for WhatsApp</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 mb-8 leading-[0.9]">
            Never forget <br />
            <span className="text-indigo-600">anything again.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-500 mb-12 leading-relaxed">
            Send a text or voice note to our bot. Our AI instantly understands your task, schedules it, and pings you when it's time. Zero friction, total peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link to="/demo" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:-translate-y-1">
              Try the Live Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <div className="flex items-center gap-4">
              <a href="https://wa.me/your-bot-number" className="group flex items-center gap-3 px-6 py-5 rounded-2xl border border-slate-200 font-bold hover:bg-slate-50 transition-all text-slate-700">
                <MessageCircle className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                WhatsApp
              </a>
              <a href="https://t.me/your-bot-name" className="group flex items-center gap-3 px-6 py-5 rounded-2xl border border-slate-200 font-bold hover:bg-slate-50 transition-all text-slate-700">
                <Smartphone className="w-6 h-6 text-sky-500 group-hover:scale-110 transition-transform" />
                Telegram
              </a>
            </div>
          </div>
          
          <div className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
             <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                   {[1,2,3,4].map(i => (
                     <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="User" />
                   ))}
                </div>
                <div className="text-sm font-bold text-slate-400">Join 1k+ happy users</div>
             </div>
             <div className="flex items-center gap-2 text-slate-300 font-bold text-sm tracking-widest uppercase italic">
                <span>Featured in</span>
                <span className="text-slate-200 text-lg">ProductHunt</span>
                <span className="text-slate-200 text-lg">IndieHackers</span>
             </div>
          </div>
        </div>
        
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-50 rounded-full blur-[100px] opacity-40"></div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-20 hidden lg:block">
          <ArrowDown className="w-6 h-6 text-slate-400" />
        </div>
      </section>

      {/* How it Works Step Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Three steps to productivity.</h2>
            <p className="text-slate-500 max-w-lg mx-auto">No app to download, no account to verify. It's that simple.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-16 relative">
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-slate-100 -z-0"></div>
            
            <StepCard 
              number="01"
              title="Add to Contacts"
              description="Save our number or click the chat link. We're ready when you are."
              icon={<Smartphone className="w-6 h-6 text-indigo-600" />}
            />
            <StepCard 
              number="02"
              numberColor="text-violet-500"
              title="Send a Message"
              description="'Remind me to call the bank in 2 hours'. Text or voice—we understand both."
              icon={<MessageCircle className="w-6 h-6 text-violet-600" />}
            />
            <StepCard 
              number="03"
              numberColor="text-emerald-500"
              title="Relax"
              description="We'll ping you exactly when needed. Your personal AI never sleeps."
              icon={<Clock className="w-6 h-6 text-emerald-600" />}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4">The Smartest Way to Manage Life</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Built on Gemini AI to provide context-aware scheduling that feels like talking to a human.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Mic className="w-6 h-6 text-violet-600" />}
              title="AI Voice Notes"
              description="On the move? Send a quick voice note. Our AI transcribes it and sets the reminder accurately."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-indigo-600" />}
              title="Natural Language"
              description="No rigid commands. 'Remind me tomorrow morning' works just as well as specific times."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="w-6 h-6 text-emerald-600" />}
              title="Task Management"
              description="Type 'What are my tasks?' or 'Mark call bank as done'. Manage your day without leaving chat."
            />
            <FeatureCard 
              icon={<Smartphone className="w-6 h-6 text-sky-600" />}
              title="WhatsApp & Telegram"
              description="Use your favorite messaging app. No new interface to learn or app to bloat your phone."
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6 text-rose-600" />}
              title="Bank-Grade Privacy"
              description="Your data is encrypted. We only process reminders—we don't sell your conversation data."
            />
            <FeatureCard 
              icon={<Star className="w-6 h-6 text-amber-600" />}
              title="Intelligent Priority"
              description="AI helps categorize reminders, so you get nudged appropriately for critical vs casual tasks."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Simple, Scalable Pricing</h2>
            <p className="text-slate-500">Free for casual users. Pro for power-movers.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-10 rounded-[2.5rem] border-2 border-slate-100 hover:border-indigo-100 transition-all flex flex-col group">
              <h3 className="text-xl font-black mb-2 text-slate-900">Lite Starter</h3>
              <p className="text-slate-500 text-sm mb-8">Perfect for seeing how it works.</p>
              <div className="text-5xl font-black text-slate-900 mb-8">₹0 <span className="text-lg font-normal text-slate-400">/ forever</span></div>
              <ul className="space-y-5 mb-12 text-slate-600 flex-grow">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> 5 Smart Reminders / mo</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Text Messaging Support</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> WhatsApp & Telegram</li>
                {/* Fixed missing icon import here */}
                <li className="flex items-center gap-3 text-slate-300"><X className="w-5 h-5 shrink-0" /> No Voice Notes</li>
              </ul>
              <Link to="/demo" className="block w-full text-center py-5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all">Start for Free</Link>
            </div>
            
            {/* Premium Plan */}
            <div className="p-10 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 relative transform md:scale-105 overflow-hidden flex flex-col">
              <div className="absolute top-6 right-6 bg-white/20 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full backdrop-blur-md">Best Value</div>
              <h3 className="text-xl font-black mb-2">Pro Power</h3>
              <p className="text-indigo-100 text-sm mb-8">For the ultimate productivity pro.</p>
              <div className="text-5xl font-black mb-8">₹99 <span className="text-lg font-normal text-indigo-300">/mo</span></div>
              <ul className="space-y-5 mb-12 text-indigo-50 flex-grow">
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" /> Unlimited AI Reminders</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" /> AI Voice Note Transcription</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" /> Custom Reminder Alerts</li>
                <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" /> Priority 24/7 Support</li>
              </ul>
              <button onClick={() => alert('Razorpay Simulation: Opening payment portal...')} className="block w-full text-center py-5 rounded-2xl bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20">Go Pro Today</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/10 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Start your productivity <br />journey today.</h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <a href="https://wa.me/your-bot-number" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-slate-900 font-black hover:bg-slate-100 transition-all shadow-xl">
              <MessageCircle className="w-6 h-6 mr-3 text-emerald-500" />
              WhatsApp Bot
            </a>
            <Link to="/demo" className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 rounded-2xl border border-white/20 text-white font-black hover:bg-white/10 transition-all">
              Live App Demo
            </Link>
          </div>
          <p className="mt-8 text-slate-500 text-sm font-medium">Join over 1,000+ people reclaiming their focus.</p>
        </div>
      </section>
    </div>
  );
};

const StepCard = ({ number, title, description, icon, numberColor = "text-indigo-500" }: any) => (
  <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative z-10 bg-white p-2">
    <div className={`text-5xl font-black ${numberColor} opacity-20 mb-4 tracking-tighter`}>{number}</div>
    <div className="mb-6 p-4 bg-slate-50 rounded-[1.5rem] w-fit">
      {icon}
    </div>
    <h3 className="text-2xl font-black text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100 transition-all group hover:-translate-y-1">
    <div className="mb-8 p-4 bg-slate-50 rounded-2xl w-fit group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
      {icon}
    </div>
    <h3 className="text-xl font-black text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
  </div>
);

export default LandingPage;
