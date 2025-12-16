import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, AlertTriangle, Menu, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { ChatMessage, UserState } from '../types';
import { MAX_FREE_MESSAGES } from '../constants';
import { PremiumModal } from '../components/PremiumModal';

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserState>(storageService.getUser());
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(storageService.getChatHistory());
    setUser(storageService.getUser());
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check limits
    if (!user.isPremium && user.messageCount >= MAX_FREE_MESSAGES) {
      setShowPremiumModal(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => {
      const updated = [...prev, userMsg];
      storageService.saveChatHistory(updated);
      return updated;
    });
    
    // Update count
    const updatedUser = storageService.updateUser({ 
      messageCount: user.messageCount + 1 
    });
    setUser(updatedUser);
    
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await geminiService.sendMessage(input);
      const modelMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: responseText || "I'm listening...",
        timestamp: Date.now()
      };
      
      setMessages(prev => {
        const updated = [...prev, modelMsg];
        storageService.saveChatHistory(updated);
        return updated;
      });
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'model',
        text: "I'm having trouble connecting right now. Please check your internet connection.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeSuccess = () => {
    setUser(storageService.getUser());
    alert("Welcome to Premium! You have unlimited messages.");
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-bold text-slate-800">Anya</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-slate-500">Always here for you</p>
            </div>
          </div>
        </div>
        {!user.isPremium && (
          <div className="bg-slate-100 px-3 py-1 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
            {MAX_FREE_MESSAGES - user.messageCount} free left
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center mt-20 p-6 opacity-60">
            <Sparkles className="w-12 h-12 mx-auto text-brand-400 mb-4" />
            <p className="text-slate-500 text-sm">Say "Hello" to start your journey.</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-none'
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex gap-1">
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
               <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={user.messageCount >= MAX_FREE_MESSAGES && !user.isPremium ? "Daily limit reached" : "Type a message..."}
            disabled={!user.isPremium && user.messageCount >= MAX_FREE_MESSAGES}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (!user.isPremium && user.messageCount >= MAX_FREE_MESSAGES)}
            className="p-3 bg-brand-600 text-white rounded-xl shadow-md hover:bg-brand-700 disabled:bg-slate-300 disabled:shadow-none transition-colors"
          >
            {!user.isPremium && user.messageCount >= MAX_FREE_MESSAGES ? (
              <Lock size={20} onClick={() => setShowPremiumModal(true)} />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>

      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)}
        onSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}