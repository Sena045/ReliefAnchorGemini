import { useState } from 'react';
import { Wind, Anchor, Book, Music, Lock, ArrowLeft } from 'lucide-react';
import { storageService } from '../services/storageService';
import { WELLNESS_TOOLS } from '../constants';
import { PremiumModal } from '../components/PremiumModal';

export default function Wellness() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const user = storageService.getUser();

  const handleToolClick = (id: string) => {
    if (!user.isPremium && id !== 'breathing') { // Only breathing is free
      setShowPremium(true);
      return;
    }
    setActiveTool(id);
  };

  const handleUpgradeSuccess = () => {
    alert("Unlocked all wellness tools!");
    setShowPremium(false);
  };

  // Explicit mapping to avoid TypeScript errors with dynamic indexing
  const iconMap: Record<string, React.ElementType> = {
    Wind,
    Anchor,
    Book,
    Music
  };

  if (activeTool) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <button onClick={() => setActiveTool(null)} className="p-2 hover:bg-slate-50 rounded-full">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="font-bold text-lg capitalize">{activeTool} Exercise</h1>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 bg-brand-50">
          {activeTool === 'breathing' && (
            <div className="text-center">
              <div className="w-48 h-48 bg-brand-200 rounded-full flex items-center justify-center animate-pulse mx-auto mb-8">
                <span className="text-brand-800 text-xl font-medium">Breathe</span>
              </div>
              <p className="text-slate-600">Inhale for 4s, Hold for 7s, Exhale for 8s</p>
            </div>
          )}
          {activeTool === 'grounding' && (
            <div className="text-center space-y-4">
              <Anchor size={64} className="mx-auto text-brand-600" />
              <h2 className="text-xl font-bold">5-4-3-2-1 Technique</h2>
              <p className="max-w-xs text-slate-600">Acknowledge 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.</p>
            </div>
          )}
          {activeTool === 'journal' && (
             <textarea 
               className="w-full h-64 p-4 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-500 outline-none resize-none shadow-sm"
               placeholder="Write your thoughts here..."
             />
          )}
           {activeTool === 'sound' && (
             <div className="text-center">
                <Music size={48} className="mx-auto text-brand-500 mb-4" />
                <p>Playing binaural beats...</p>
                <div className="w-full h-1 bg-slate-200 mt-4 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 w-1/3 animate-pulse"></div>
                </div>
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Wellness Hub</h1>
      <p className="text-slate-500 mb-6">Tools to help you find your center.</p>

      <div className="grid grid-cols-2 gap-4">
        {WELLNESS_TOOLS.map((tool) => {
          const isLocked = !user.isPremium && tool.id !== 'breathing';
          const Icon = iconMap[tool.icon] || Wind;

          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className="relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-95"
            >
              <div className={`p-3 rounded-full ${isLocked ? 'bg-slate-100 text-slate-400' : 'bg-brand-50 text-brand-600'}`}>
                {isLocked ? <Lock size={24} /> : <Icon size={24} />}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-slate-800">{tool.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{tool.desc}</p>
              </div>
              {isLocked && (
                <div className="absolute top-3 right-3 text-amber-500">
                  <Lock size={14} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <PremiumModal 
        isOpen={showPremium} 
        onClose={() => setShowPremium(false)}
        onSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}