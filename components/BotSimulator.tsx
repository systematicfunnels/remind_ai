'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Smartphone, User, Bot, Mic, 
  Paperclip, MoreVertical, CheckCheck, Clock,
  ChevronLeft, Bell, Zap
} from 'lucide-react';
import { processMessageWithAI, AIResponse } from '@/services/geminiService';
import { getAppData, saveAppData, addLog } from '@/services/storageService';
import { Reminder } from '@/types';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sent' | 'delivered' | 'read';
}

export default function BotSimulator() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome to RemindAI! I'm your personal assistant on WhatsApp. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      status: 'read'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [platform, setPlatform] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const result = await processMessageWithAI(input);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate AI processing

      let responseText = "";
      const data = getAppData();
      const demoUser = data.users.find(u => u.phone === 'Demo User') || data.users[0];

      switch (result.intent) {
        case 'CREATE':
          if (result.task && result.delayMinutes) {
            const scheduledAt = new Date(Date.now() + result.delayMinutes * 60000);
            const newReminder: Reminder = {
              id: Math.random().toString(36).substr(2, 9),
              userId: demoUser.id,
              task: result.task,
              scheduledAt: scheduledAt.toISOString(),
              status: 'pending',
              recurrence: result.recurrence || 'none',
              originalMessage: input,
              isVoice: false,
              createdAt: new Date().toISOString()
            };
            data.reminders.push(newReminder);
            saveAppData(data);
            addLog({
              platform,
              userId: demoUser.id,
              message: `Scheduled: ${result.task} for ${scheduledAt.toLocaleTimeString()}`,
              intent: 'CREATE'
            });
            responseText = `✅ Noted! I'll remind you to "${result.task}" at ${scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
          }
          break;
        case 'LIST':
          const active = data.reminders.filter(r => r.userId === demoUser.id && r.status === 'pending');
          if (active.length > 0) {
            responseText = `📋 Your active reminders:\n${active.map((r, i) => `${i + 1}. ${r.task} (${new Date(r.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`).join('\n')}`;
          } else {
            responseText = "You don't have any active reminders right now.";
          }
          break;
        case 'COMPLETE':
          responseText = "I've marked that task as completed for you! 🎯";
          break;
        default:
          responseText = "I'm not quite sure how to help with that. Try saying 'remind me to call Mom in 5 minutes'.";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Simulation Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-[800px] max-w-2xl mx-auto bg-slate-950 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      {/* Header */}
      <div className={`${platform === 'whatsapp' ? 'bg-[#075e54]' : 'bg-[#24a1de]'} p-4 flex items-center justify-between transition-colors duration-500`}>
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="text-white/80 hover:text-white p-1">
            <ChevronLeft size={24} />
          </button>
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/10 overflow-hidden">
            {platform === 'whatsapp' ? <Bot className="text-white" size={24} /> : <Zap className="text-white fill-white" size={20} />}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm leading-none">RemindAI Bot</h3>
            <span className="text-white/70 text-[10px] font-medium">{isTyping ? 'typing...' : 'online'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/80">
          <button onClick={() => setPlatform(p => p === 'whatsapp' ? 'telegram' : 'whatsapp')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Smartphone size={20} />
          </button>
          <MoreVertical size={20} />
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#0b141a] relative"
        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}
      >
        <div className="flex justify-center">
          <span className="bg-[#182229] text-[#8696a0] text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider border border-slate-800/50">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl relative shadow-md ${
              msg.sender === 'user' 
                ? 'bg-[#005c4b] text-white rounded-tr-none' 
                : 'bg-[#202c33] text-[#e9edef] rounded-tl-none border border-slate-800/50'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[9px] opacity-50 font-medium">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.sender === 'user' && (
                  <CheckCheck size={12} className={msg.status === 'read' ? 'text-[#53bdeb]' : 'text-white/40'} />
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#202c33] text-[#e9edef] px-4 py-3 rounded-xl rounded-tl-none border border-slate-800/50 flex gap-1">
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#202c33] flex items-center gap-2">
        <button className="p-2 text-[#8696a0] hover:text-[#e9edef] transition-colors">
          <Paperclip size={24} />
        </button>
        <form onSubmit={handleSend} className="flex-grow">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="w-full bg-[#2a3942] text-[#e9edef] text-sm py-2.5 px-4 rounded-xl outline-none placeholder:text-[#8696a0] border border-transparent focus:border-white/5 transition-all"
          />
        </form>
        <button 
          onClick={() => handleSend()}
          className={`p-2.5 rounded-full transition-all active:scale-95 ${
            input.trim() ? 'bg-[#00a884] text-white shadow-lg' : 'text-[#8696a0] hover:text-[#e9edef]'
          }`}
        >
          {input.trim() ? <Send size={20} /> : <Mic size={24} />}
        </button>
      </div>
    </div>
  );
}
