'use client';

import React, { useState } from 'react';
import { Edit3, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BotNameForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name === initialName) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/users/update-bot-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botName: name }),
      });

      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to update bot name:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setIsEditing(true)}>
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight group-hover:text-indigo-400 transition-colors">
          {name || 'My Bot'}
        </h2>
        <Edit3 size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="bg-slate-950/50 border border-indigo-500/50 rounded-xl px-4 py-2 text-xl font-black text-white uppercase italic tracking-tight outline-none w-full max-w-[300px]"
        autoFocus
        onBlur={() => !loading && setIsEditing(false)}
      />
      <button
        type="submit"
        disabled={loading}
        className="p-2 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
      </button>
    </form>
  );
}
