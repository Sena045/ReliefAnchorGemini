import React, { useState } from 'react';
import { Globe, User, Shield, CreditCard, LogOut } from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserState } from '../types';
import { PremiumModal } from '../components/PremiumModal';

export default function Settings() {
  const [user, setUser] = useState<UserState>(storageService.getUser());
  const [showPremium, setShowPremium] = useState(false);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUser = storageService.updateUser({ region: e.target.value as 'INDIA' | 'GLOBAL' });
    setUser(newUser);
    // Reload to apply currency/helpline changes cleanly
    window.location.reload();
  };

  const handleClearData = () => {
    if (confirm("Are you sure? This deletes all chats and mood logs.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="p-4 bg-slate-50 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Account Status */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <User className="text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Your Account</h3>
              <p className={`text-sm font-medium ${user.isPremium ? 'text-brand-600' : 'text-slate-500'}`}>
                {user.isPremium ? 'Premium Member' : 'Free Plan'}
              </p>
            </div>
          </div>
          {!user.isPremium && (
            <button
              onClick={() => setShowPremium(true)}
              className="w-full bg-brand-600 text-white py-2.5 rounded-xl font-medium shadow-md shadow-brand-200 active:scale-95 transition-transform"
            >
              Upgrade to Premium
            </button>
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
            <span>Clear Local Data</span>
          </button>
          
          <div className="pt-2 text-xs text-slate-400 text-center">
            ReliefAnchor v1.0.0 <br />
            Data is stored locally on your device.
          </div>
        </section>
      </div>

      <PremiumModal 
        isOpen={showPremium} 
        onClose={() => setShowPremium(false)}
        onSuccess={() => {
          setUser(storageService.getUser());
          alert("Premium Activated!");
        }}
      />
    </div>
  );
}