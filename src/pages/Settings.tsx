import React, { useState } from 'react';
import { Globe, User, LogOut, Ban, Calendar, Mail, Key, Copy, Check, QrCode, Smartphone, ArrowRight, Info, Star } from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserState } from '../types';
import { PremiumModal } from '../components/PremiumModal';

export default function Settings() {
  const [user, setUser] = useState<UserState>(storageService.getUser());
  const [showPremium, setShowPremium] = useState(false);
  
  // Recovery State
  const [recoveryToken, setRecoveryToken] = useState('');
  const [showQR, setShowQR] = useState(false);
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
              {/* Backup Key Section - FOR PREMIUM USERS */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
                  <Smartphone size={16} />
                  <span>Sync to Mobile</span>
                </div>
                
                <p className="text-xs text-amber-800 mb-3 leading-relaxed">
                   Premium is stored on this device. To use it on your phone:
                </p>

                {!recoveryToken ? (
                   <button 
                     onClick={handleShowKey} 
                     className="w-full bg-white border border-amber-200 text-amber-800 text-xs font-bold py-2 rounded-lg shadow-sm hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                   >
                     <Key size={14} /> Reveal Sync Key
                   </button>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                    {/* QR Toggle */}
                    <div className="flex justify-center">
                       <button 
                         onClick={() => setShowQR(!showQR)}
                         className="flex items-center gap-2 text-xs bg-white border border-amber-200 px-3 py-1.5 rounded-lg text-amber-800 hover:bg-amber-50 font-medium"
                       >
                         <QrCode size={14} />
                         {showQR ? "Hide QR Code" : "Show QR Code"}
                       </button>
                    </div>

                    {showQR && (
                      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-amber-200 shadow-sm">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(recoveryToken)}`}
                          alt="Recovery Key QR"
                          className="w-32 h-32"
                        />
                        <p className="text-[10px] text-slate-400 mt-2 text-center max-w-[150px]">
                          Open Settings on your other device and scan this, or copy the key below.
                        </p>
                      </div>
                    )}

                    <div className="bg-white p-2.5 rounded border border-amber-200 text-[10px] text-slate-600 break-all font-mono leading-tight shadow-inner select-all">
                      {recoveryToken}
                    </div>
                    
                    <button 
                      onClick={handleCopyKey}
                      className="w-full flex items-center justify-center gap-2 text-xs font-bold text-amber-800 py-2 hover:bg-amber-100 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </button>
                  </div>
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
                className="w-full bg-brand-600 text-white py-3 rounded-xl font-medium shadow-md shadow-brand-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Star size={18} className="fill-white/20" />
                Upgrade to Premium
              </button>
              
              {/* Restore Purchase Section - FOR FREE USERS */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-4">
                 <div className="flex items-start gap-2 mb-3">
                   <div className="bg-white p-1.5 rounded-full shadow-sm">
                      <Key size={14} className="text-brand-600" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-800">Already have Premium?</p>
                     <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                       If you bought Premium on another device (like your desktop), paste the <strong>Recovery Key</strong> here to sync it.
                     </p>
                   </div>
                 </div>
                 
                <div className="space-y-2">
                  <input 
                    type="text" 
                    value={restoreInput}
                    onChange={(e) => setRestoreInput(e.target.value)}
                    placeholder="Paste Recovery Key here..."
                    className="w-full text-sm px-3 py-2.5 bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 shadow-sm"
                  />
                  <button 
                    onClick={handleRestore}
                    disabled={!restoreInput}
                    className="w-full bg-slate-800 text-white px-3 py-2.5 rounded-lg text-sm font-bold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Restore Purchase</span>
                    <ArrowRight size={14} />
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
          
          <div className="pt-2 flex flex-col items-center gap-1 text-xs text-slate-400 text-center">
             <div className="flex items-center gap-1">
                <Info size={12} />
                <span>ReliefAnchor v1.0.1</span>
             </div>
             <span>Data is stored locally on this device.</span>
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
