import React, { useState } from 'react';
import { Heart, ArrowRight, ShieldCheck } from 'lucide-react';
import { storageService } from '../services/storageService';

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      storageService.login(email.trim().toLowerCase());
      onLogin();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-4 text-brand-600 shadow-sm">
            <Heart size={36} fill="currentColor" className="text-brand-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome to ReliefAnchor</h1>
          <p className="text-slate-500 text-center mt-2">
            Your safe space for mental wellness. <br/> Enter your email to begin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all placeholder:text-slate-400"
              autoComplete="email"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-200 transition-all active:scale-95 flex items-center justify-center gap-2 group"
          >
            <span>Continue</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <ShieldCheck size={20} className="text-brand-600 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong>Privacy First:</strong> Your chats and journal entries are stored locally on this device. We use your email only to secure and identify your local data profile.
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-xs text-slate-400">© 2024 ReliefAnchor. All rights reserved.</p>
    </div>
  );
}