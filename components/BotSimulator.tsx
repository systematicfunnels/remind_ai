
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, ChevronLeft, MoreVertical, Phone, Video, 
  CheckCheck, CreditCard, X, Info, Smile, Paperclip
} from 'lucide-react';
import { processMessageWithAI } from '../services/geminiService';
import { createReminder, getUserReminders, markReminderAsDone, addLog, getAppData } from '../services/storageService';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isVoice?: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

const BotSimulator: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', text: "Hey! I'm your AI Reminder Assistant. 🤖\n\nYou can just tell me what to remember. Try saying 'Remind me to buy coffee in 5 minutes'.", sender: 'bot', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSend = async (text: string, isVoice = false) => {
    if (!text.trim() && !isVoice) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      text: isVoice ? "🎤 Voice Note (0:04)" : text,
      sender: 'user',
      timestamp: new Date(),
      isVoice,
      status: 'read'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    try {
      // Simulate network delay for realism
      await new Promise(r => setTimeout(r, 800));
      
      const aiResponse = await processMessageWithAI(text);
      const currentUser = getAppData().users[0];

      if (aiResponse.intent === 'CREATE' && currentUser.subscriptionStatus === 'free' && currentUser.reminderCount >= 5) {
        setShowPayment(true);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "⚠️ Usage Alert: You've reached your free limit. Upgrade to Pro to continue setting smart reminders!",
          sender: 'bot',
          timestamp: new Date()
        }]);
        setIsProcessing(false);
        return;
      }

      addLog({ platform: 'whatsapp', userId: '1', message: text, intent: aiResponse.intent });

      let botReply = "I didn't quite catch that. Could you try rephrasing? For example: 'Remind me to [task] at [time]'.";

      if (aiResponse.intent === 'CREATE' && aiResponse.task) {
        const scheduledDate = new Date();
        scheduledDate.setMinutes(scheduledDate.getMinutes() + (aiResponse.delayMinutes || 10));
        createReminder({
          userId: '1',
          task: aiResponse.task,
          scheduledAt: scheduledDate.toISOString(),
          status: 'pending',
          originalMessage: text,
          isVoice
        });
        botReply = `Got it! ✅ I'll remind you to "${aiResponse.task}" at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
      } else if (aiResponse.intent === 'LIST') {
        const reminders = getUserReminders('1');
        botReply = reminders.length === 0 
          ? "You're all caught up! No pending reminders. 🌟"
          : `📋 Here are your tasks:\n\n${reminders.map((r, i) => `• ${r.task} (${new Date(r.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`).join('\n')}`;
      } else if (aiResponse.intent === 'COMPLETE') {
        const completed = markReminderAsDone('1', aiResponse.query || '');
        botReply = completed 
          ? `Nice work! 🌟 I've marked "${completed.task}" as completed.` 
          : "I couldn't find a pending task like that. Try 'List my tasks' to see what's open.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: botReply,
        sender: 'bot',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulated recording duration
      setTimeout(() => {
        setIsRecording(false);
        handleSend("Remind me to check the oven in 15 minutes", true);
      }, 3000);
    }
  };

  return (
    <div className="relative py-12 px-4 bg-slate-50 min-h-[calc(100vh-64px)] flex flex-col items-center">
      {/* Product Context / Help */}
      {showTips && (
        <div className="max-w-md w-full mb-6 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex gap-3 relative animate-in slide-in-from-top-4 duration-500">
           <Info className="shrink-0 w-5 h-5" />
           <div className="text-xs leading-relaxed">
             <strong>Pro Tip:</strong> You can send voice notes just like a real WhatsApp contact! The AI will transcribe and schedule it automatically.
           </div>
           <button onClick={() => setShowTips(false)} className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded">
             <X size={14} />
           </button>
        </div>
      )}

      <div className="max-w-md w-full h-[650px] flex flex-col bg-[#efeae2] rounded-[2.5rem] shadow-2xl overflow-hidden border-[8px] border-slate-900 relative">
        {/* Notch / Speaker area for the "phone" look */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-30"></div>

        {/* Header */}
        <div className="bg-[#075e54] text-white pt-8 pb-4 px-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <ChevronLeft className="w-5 h-5 cursor-pointer hover:bg-white/10 rounded-full" />
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white/20">
               <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=remind-v2`} alt="Bot" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide">RemindAI Chat</h3>
              <p className="text-[10px] opacity-90 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                online
              </p>
            </div>
          </div>
          <div className="flex gap-4 opacity-80">
            <Video size={18} className="cursor-not-allowed" />
            <Phone size={18} className="cursor-not-allowed" />
            <MoreVertical size={18} className="cursor-pointer" />
          </div>
        </div>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-4 space-y-3 relative flex flex-col"
          style={{ 
            backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`, 
            backgroundSize: '400px', 
            backgroundBlendMode: 'overlay'
          }}
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in zoom-in-95 duration-200`}>
              <div className={`
                max-w-[85%] rounded-2xl px-3.5 py-2 text-[13.5px] shadow-sm relative leading-relaxed
                ${msg.sender === 'user' 
                  ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none self-end' 
                  : 'bg-white text-slate-800 rounded-tl-none self-start'}
              `}>
                {/* Voice Note Visualizer */}
                {msg.isVoice && (
                  <div className="flex items-center gap-3 mb-2 py-1 border-b border-black/5">
                    <div className="p-2 bg-indigo-500 text-white rounded-full">
                      <Mic size={14} />
                    </div>
                    <div className="flex gap-0.5 items-center">
                       {[0.4, 0.7, 0.3, 0.9, 0.5, 0.2].map((h, i) => (
                         <div key={i} className="w-1 bg-indigo-400 rounded-full" style={{ height: `${h * 16}px` }}></div>
                       ))}
                    </div>
                  </div>
                )}
                
                <div className="whitespace-pre-wrap">{msg.text}</div>
                
                <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                  <span className="text-[9px] uppercase font-medium">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.sender === 'user' && <CheckCheck size={13} className="text-sky-500" />}
                </div>
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start animate-in fade-in slide-in-from-left-2">
              <div className="bg-white rounded-2xl px-4 py-2 flex items-center gap-1 shadow-sm">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Recording Overlay */}
        {isRecording && (
          <div className="absolute inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] flex flex-col items-center justify-end pb-24">
             <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center animate-in zoom-in duration-300">
                <div className="relative mb-4">
                   <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                   <div className="relative bg-red-500 text-white p-4 rounded-full">
                      <Mic size={32} />
                   </div>
                </div>
                <p className="font-bold text-slate-800">Recording Voice Note...</p>
                <div className="flex gap-1 mt-4">
                   {Array.from({ length: 12 }).map((_, i) => (
                     <div 
                      key={i} 
                      className="w-1.5 bg-red-400 rounded-full animate-pulse" 
                      style={{ height: `${10 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s` }}
                    ></div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* Footer / Input Area */}
        <div className="p-3 bg-[#f0f0f0] flex items-center gap-2 border-t border-slate-200/50">
          <Smile className="text-slate-500 cursor-pointer hover:text-slate-700" size={24} />
          <Paperclip className="text-slate-500 cursor-pointer hover:text-slate-700 -rotate-45" size={24} />
          <div className="flex-grow bg-white rounded-2xl px-4 py-2 flex items-center shadow-sm">
            <input 
              type="text" 
              placeholder="Message..."
              className="flex-grow bg-transparent border-none focus:ring-0 text-[14px] outline-none text-slate-800"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              disabled={isProcessing}
            />
          </div>
          <button 
            onClick={input ? () => handleSend(input) : toggleRecording}
            className={`p-3 rounded-full text-white transition-all transform active:scale-90 shadow-md ${isRecording ? 'bg-red-500' : 'bg-[#128c7e]'}`}
          >
            {input ? <Send size={20} /> : <Mic size={20} />}
          </button>
        </div>
      </div>

      {/* Payment Simulation Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-indigo-600 p-8 text-white text-center relative">
              <button onClick={() => setShowPayment(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <CreditCard size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-1">Upgrade to Pro</h3>
              <p className="text-indigo-100 text-sm opacity-90">Unlock the full power of AI reminders</p>
            </div>
            
            <div className="p-6">
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited smart reminders",
                  "AI Voice Note transcription",
                  "WhatsApp & Telegram sync",
                  "Priority server processing"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCheck size={16} className="text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              
              <div className="bg-slate-50 p-4 rounded-2xl mb-6 flex justify-between items-center border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly</span>
                  <div className="text-xl font-black text-slate-900">₹99 <span className="text-sm font-normal text-slate-500">/mo</span></div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Special Price</div>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => {
                    alert('Simulation: Payment Interface (Razorpay/Stripe) would open here.');
                    setShowPayment(false);
                  }}
                  className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  Pay Now
                </button>
                <button 
                  onClick={() => setShowPayment(false)}
                  className="w-full text-slate-400 text-sm font-medium py-2 hover:text-slate-600"
                >
                  Return to Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BotSimulator;
