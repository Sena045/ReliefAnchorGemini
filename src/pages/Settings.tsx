import React, { useState } from 'react';
import { Globe, User, LogOut, Ban, Calendar, Mail, Key, Copy, Check, Download } from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserState } from '../types';
import { PremiumModal } from '../components/PremiumModal';

export default function Settings() {
  const [user, setUser] = useState<UserState>(storageService.getUser());
  const [showPremium, setShowPremium] = useState(false);
  
  // Recovery State
  const [recoveryToken, setRecoveryToken] = useState('');
  const [restoreInput, setRestoreInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUser = storageService.updateUser({ region: e.target.value as 'INDIA' | 'GLOBAL' });
    setUser(newUser);
  };

  const handleClearData = () => {
    if (confirm("Are you sure? This deletes all your chats, mood logs, and journal entries. \n\nYour Premium Membership and Region settings will be SAFE and preserved.")) {
      try {
        storageService.clearPrivateData();
        alert("Data cleared successfully.");
      } catch (error) {
        console.error("Error clearing data:", error);
        alert("Failed to clear data.");
      }
    }
  };

  const handleCancelPremium = () => {
    if (confirm("Are you sure you want to cancel your Premium benefits? You will lose access to exclusive wellness tools and unlimited chat.")) {
      const newUser = storageService.updateUser({ 
        isPremium: false, 
        premiumUntil: null,
        planType: null
      });
      setUser(newUser);
      alert("Premium subscription cancelled. You are now on the Free Plan.");
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      storageService.logout();
      window.location.reload(); // Reload to trigger App auth check
    }
  };

  const handleShowKey = () => {
    const token = storageService.getRecoveryToken();
    if (token) setRecoveryToken(token);
  };

  const handleCopyKey = () => {
    if (recoveryToken) {
      navigator.clipboard.writeText(recoveryToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRestore = () => {
    if (!restoreInput.trim()) return;
    const result = storageService.restorePurchase(restoreInput.trim());
    if (result.success) {
      alert(result.message);
      setUser(storageService.getUser());
      setRestoreInput('');
    } else {
      alert("Error: " + result.message);
    }
  };

  return (
    <div className="p-4 bg-slate-50 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Account Status */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.isPremium ? 'bg-brand-100' : 'bg-slate-100'}`}>
              <User className={user.isPremium ? 'text-brand-600' : 'text-slate-500'} />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-slate-800">Your Account</h3>
              <p className={`text-sm font-medium ${user.isPremium ? 'text-brand-600' : 'text-slate-500'}`}>
                {user.isPremium 
                  ? `${user.planType === 'YEARLY' ? 'Yearly' : 'Monthly'} Premium Member` 
                  : 'Free Plan'}
              </p>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 truncate">
                 <Mail size={12} />
                 <span className="truncate">{user.email}</span>
              </div>
              {user.isPremium && user.premiumUntil && (
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                  <Calendar size={12} />
                  <span>Valid until {user.premiumUntil}</span>
                </div>
              )}
            </div>
          </div>
          
          {user.isPremium ? (
            <div className="space-y-3">
              {/* Backup Key Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                    <Key size={16} />
                    <span>Backup Premium Key</span>
                  </div>
                  {!recoveryToken && (
                    <button onClick={handleShowKey} className="text-xs text-brand-600 font-bold hover:underline">
                      View Key
                    </button>
                  )}
                </div>
                
                {recoveryToken ? (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <div className="bg-white p-2 rounded border border-slate-200 text-[10px] text-slate-500 break-all font-mono leading-tight">
                      {recoveryToken}
                    </div>
                    <button 
                      onClick={handleCopyKey}
                      className="mt-2 w-full flex items-center justify-center gap-2 text-xs font-bold text-brand-600 py-1.5 hover:bg-brand-50 rounded transition-colors"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </button>
                    <p className="mt-1 text-[10px] text-slate-400 text-center">
                      Save this key! Use it to restore Premium on other devices.
                    </p>
                  </div>
                ) : (
                   <p className="text-xs text-slate-400">Use this key to activate Premium on other devices.</p>
                )}
              </div>

              <button
                onClick={handleCancelPremium}
                className="w-full bg-white text-red-500 border border-red-100 py-2.5 rounded-xl font-medium shadow-sm hover:bg-red-50 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Ban size={16} />
                Cancel Premium
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => setShowPremium(true)}
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium shadow-md shadow-brand-200 active:scale-95 transition-transform"
              >
                Upgrade to Premium
              </button>
              
              {/* Restore Purchase Section */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">Already purchased?</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={restoreInput}
                    onChange={(e) => setRestoreInput(e.target.value)}
                    placeholder="Paste Recovery Key here..."
                    className="flex-1 text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-brand-500"
                  />
                  <button 
                    onClick={handleRestore}
                    disabled={!restoreInput}
                    className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
                  >
                    Restore
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Preferences */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preferences</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-700">
              <Globe size={20} />
              <span>Region</span>
            </div>
            <select
              value={user.region}
              onChange={handleRegionChange}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-500"
            >
              <option value="INDIA">India (₹)</option>
              <option value="GLOBAL">Global ($)</option>
            </select>
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Data & Privacy</h3>
          
          <button onClick={handleClearData} className="w-full flex items-center gap-3 text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={20} />
            <span>Clear Chats & Logs</span>
          </button>
          
          <div className="pt-2 text-xs text-slate-400 text-center">
            ReliefAnchor v1.0.0 <br />
            Data is stored locally on your device.
          </div>
        </section>

        {/* Logout */}
        <button 
          onClick={handleLogout} 
          className="w-full py-3 text-slate-500 font-medium hover:text-slate-800 transition-colors"
        >
          Log Out
        </button>
      </div>

      <PremiumModal 
        isOpen={showPremium} 
        onClose={() => setShowPremium(false)}
        onSuccess={() => {
          setUser(storageService.getUser());
          // Don't alert here, the modal handles the success view now
        }}
      />
    </div>
  );
}