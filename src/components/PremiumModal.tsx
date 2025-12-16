import React, { useState } from 'react';
import { X, Check, Lock, Star } from 'lucide-react';
import { storageService } from '../services/storageService';
import { PRICING, RAZORPAY_TEST_KEY } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PremiumModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const user = storageService.getUser();
  const pricing = user.region === 'INDIA' ? PRICING.INDIA : PRICING.GLOBAL;

  const handlePayment = () => {
    setLoading(true);

    const options = {
      key: RAZORPAY_TEST_KEY,
      amount: pricing.amount,
      currency: pricing.currency,
      name: "ReliefAnchor Premium",
      description: "Lifetime Access to Wellness Tools",
      image: "https://picsum.photos/128/128",
      handler: function (response: any) {
        // Client-side verification for this serverless architecture
        if (response.razorpay_payment_id) {
          storageService.updateUser({
            isPremium: true,
            premiumUntil: '2099-12-31' // Lifetime
          });
          onSuccess();
          onClose();
        }
        setLoading(false);
      },
      prefill: {
        name: "ReliefAnchor User",
        email: "user@reliefanchor.app"
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 fade-in">
        
        {/* Header */}
        <div className="bg-brand-600 p-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
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
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-1 rounded-full"><Check size={16} className="text-green-600" /></div>
              <span className="text-slate-700">Unlimited AI Chat Messages</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-1 rounded-full"><Check size={16} className="text-green-600" /></div>
              <span className="text-slate-700">Full Access to Wellness Hub</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-1 rounded-full"><Check size={16} className="text-green-600" /></div>
              <span className="text-slate-700">Advanced Mood Analytics</span>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-slate-500 mb-1">One-time payment</p>
            <div className="text-3xl font-bold text-slate-900">{pricing.label}</div>
            <p className="text-xs text-amber-600 font-medium mt-2 bg-amber-50 inline-block px-2 py-1 rounded">
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
                <span>Get Lifetime Access</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};