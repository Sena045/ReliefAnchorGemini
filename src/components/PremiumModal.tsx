import React, { useState } from 'react';
import { X, Check, Lock, Star, Copy } from 'lucide-react';
import { storageService } from '../services/storageService';
import { PRICING_TIERS, RAZORPAY_TEST_KEY } from '../constants';
import { addDays, format } from 'date-fns';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PremiumModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'OFFER' | 'SUCCESS'>('OFFER');
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');
  const [newRecoveryKey, setNewRecoveryKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const user = storageService.getUser();
  const pricingTiers = user.region === 'INDIA' ? PRICING_TIERS.INDIA : PRICING_TIERS.GLOBAL;
  const plan = pricingTiers[selectedPlan];

  const handleClose = () => {
    if (view === 'SUCCESS') {
      onSuccess();
    }
    setView('OFFER');
    setNewRecoveryKey(null);
    onClose();
  };

  const handlePayment = () => {
    setLoading(true);

    const options = {
      key: RAZORPAY_TEST_KEY,
      amount: plan.amount,
      currency: plan.currency,
      name: "ReliefAnchor Premium",
      description: `${plan.name} Access`,
      image: "https://picsum.photos/128/128",
      handler: function (response: any) {
        // Calculate expiration date
        const expiryDate = addDays(new Date(), plan.durationDays);
        const expiryString = format(expiryDate, 'yyyy-MM-dd');

        // Client-side verification
        if (response.razorpay_payment_id) {
          storageService.updateUser({
            isPremium: true,
            premiumUntil: expiryString,
            planType: selectedPlan,
            paymentId: response.razorpay_payment_id
          });
          
          // Generate recovery key immediately
          const token = storageService.getRecoveryToken();
          setNewRecoveryKey(token);
          setView('SUCCESS');
        }
        setLoading(false);
      },
      prefill: {
        name: "ReliefAnchor User",
        email: user.email // Use actual user email
      },
      theme: {
        color: "#0f766e"
      },
      modal: {
        ondismiss: function() {
            setLoading(false);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error("Razorpay Error", e);
      setLoading(false);
      alert("Payment gateway failed to load. Please check your connection.");
    }
  };

  const copyToClipboard = () => {
    if (newRecoveryKey) {
      navigator.clipboard.writeText(newRecoveryKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 fade-in">
        
        {view === 'OFFER' ? (
          <>
            {/* Header */}
            <div className="bg-brand-600 p-6 text-white relative">
              <button onClick={handleClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
                <X size={24} />
              </button>
              
              <div className="absolute top-4 left-4 bg-yellow-400/20 border border-yellow-400/40 text-yellow-100 text-[10px] font-bold px-2 py-0.5 rounded">
                TEST MODE
              </div>

              <div className="flex justify-center mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Star size={32} className="text-yellow-300 fill-yellow-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center">Unlock Full Access</h2>
              <p className="text-center text-brand-100 mt-2">Invest in your mental well-being</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-1 rounded-full"><Check size={14} className="text-green-600" /></div>
                  <span className="text-slate-700 text-sm">Unlimited AI Chat Messages</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-1 rounded-full"><Check size={14} className="text-green-600" /></div>
                  <span className="text-slate-700 text-sm">Full Access to Wellness Hub</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-1 rounded-full"><Check size={14} className="text-green-600" /></div>
                  <span className="text-slate-700 text-sm">Advanced Mood Analytics</span>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                 <button 
                   onClick={() => setSelectedPlan('MONTHLY')}
                   className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                     selectedPlan === 'MONTHLY' 
                      ? 'border-brand-500 bg-brand-50 text-brand-700' 
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                   }`}
                 >
                   <span className="text-xs font-bold uppercase mb-1">Monthly</span>
                   <span className="text-lg font-bold">{pricingTiers.MONTHLY.label}</span>
                 </button>

                 <button 
                   onClick={() => setSelectedPlan('YEARLY')}
                   className={`relative p-3 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                     selectedPlan === 'YEARLY' 
                      ? 'border-brand-500 bg-brand-50 text-brand-700' 
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                   }`}
                 >
                   <div className="absolute -top-3 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                     BEST VALUE
                   </div>
                   <span className="text-xs font-bold uppercase mb-1">Yearly</span>
                   <span className="text-lg font-bold">{pricingTiers.YEARLY.label}</span>
                 </button>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-slate-500 mb-1">
                  Billed {selectedPlan === 'MONTHLY' ? 'Monthly' : 'Yearly'}
                </p>
                <p className="text-xs text-amber-600 font-medium mt-1 bg-amber-50 inline-block px-2 py-1 rounded">
                  Test Mode: No real money charged
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-lg shadow-brand-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Start {plan.name}</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check size={32} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Premium!</h2>
            <p className="text-slate-600 mb-6">Your purchase was successful.</p>

            <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-brand-700 mb-2 uppercase">Important: Save Your Recovery Key</p>
              <p className="text-xs text-slate-600 mb-3">
                Since this is a privacy-first app, your data is local. Use this key to restore your purchase on other devices.
              </p>
              
              <div className="bg-white p-2 rounded border border-brand-100 font-mono text-[10px] text-slate-500 break-all mb-3">
                {newRecoveryKey}
              </div>

              <button 
                onClick={copyToClipboard}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied to Clipboard" : "Copy Key"}
              </button>
            </div>

            <button 
              onClick={handleClose}
              className="w-full py-3 text-slate-500 font-medium hover:text-slate-800"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};