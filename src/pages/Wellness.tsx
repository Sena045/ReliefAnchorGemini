import { useState, useEffect, useRef } from 'react';
import { Wind, Anchor, Book, Music, Lock, ArrowLeft, Play, Pause, Save, Check, RefreshCw } from 'lucide-react';
import { storageService } from '../services/storageService';
import { WELLNESS_TOOLS } from '../constants';
import { PremiumModal } from '../components/PremiumModal';

// --- COMPONENTS FOR TOOLS ---

// 1. Interactive Breathing Circle
const BreathingExercise = () => {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'ready'>('ready');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      if (phase === 'ready') {
        setPhase('inhale');
        setTimeLeft(4);
      } else if (timeLeft > 0) {
        interval = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      } else {
        if (phase === 'inhale') {
          setPhase('hold');
          setTimeLeft(7);
        } else if (phase === 'hold') {
          setPhase('exhale');
          setTimeLeft(8);
        } else if (phase === 'exhale') {
          setPhase('inhale');
          setTimeLeft(4);
        }
      }
    }
    return () => clearTimeout(interval);
  }, [isActive, phase, timeLeft]);

  const toggleSession = () => {
    if (isActive) {
      setIsActive(false);
      setPhase('ready');
      setTimeLeft(0);
    } else {
      setIsActive(true);
    }
  };

  const getInstruction = () => {
    switch (phase) {
      case 'inhale': return "Breathe In...";
      case 'hold': return "Hold...";
      case 'exhale': return "Breathe Out...";
      default: return "Ready?";
    }
  };

  const getScale = () => {
    if (!isActive) return 'scale-100';
    if (phase === 'inhale') return 'scale-150 duration-[4000ms] ease-out';
    if (phase === 'hold') return 'scale-150 duration-0'; // Stay expanded
    if (phase === 'exhale') return 'scale-100 duration-[8000ms] ease-in-out';
    return 'scale-100';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-12">
      <div className={`relative w-48 h-48 rounded-full bg-brand-200/50 flex items-center justify-center transition-transform ${getScale()}`}>
        <div className="w-40 h-40 bg-brand-400/80 rounded-full flex items-center justify-center shadow-lg shadow-brand-200">
          <span className="text-white text-2xl font-bold">{timeLeft > 0 ? timeLeft : ''}</span>
        </div>
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2 transition-all">{getInstruction()}</h2>
        <p className="text-slate-500 mb-8">4-7-8 Relaxation Technique</p>
        <button 
          onClick={toggleSession}
          className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-medium shadow-lg active:scale-95 transition-all"
        >
          {isActive ? 'Stop' : 'Start'}
        </button>
      </div>
    </div>
  );
};

// 2. Grounding Wizard
const GroundingExercise = () => {
  const [step, setStep] = useState(0);
  const steps = [
    { count: 5, text: "Things you can SEE", sub: "Look around you. Notice the details." },
    { count: 4, text: "Things you can FEEL", sub: "Texture of your clothes, the air, the chair." },
    { count: 3, text: "Things you can HEAR", sub: "Listen closely. Birds? Traffic? Silence?" },
    { count: 2, text: "Things you can SMELL", sub: "Or your favorite scents you can imagine." },
    { count: 1, text: "Thing you can TASTE", sub: "Or a grateful thought about yourself." }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      setStep(0); // Reset
    }
  };

  const current = steps[step];

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-sm mx-auto text-center px-4">
      <div className="w-full bg-slate-100 rounded-full h-2 mb-8">
        <div 
          className="bg-brand-500 h-2 rounded-full transition-all duration-500" 
          style={{ width: `${((step + 1) / steps.length) * 100}%` }}
        />
      </div>
      
      <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 key={step}">
        <div className="text-6xl font-bold text-brand-200 mb-4">{current.count}</div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{current.text}</h2>
        <p className="text-slate-600">{current.sub}</p>
      </div>

      <button 
        onClick={handleNext}
        className="w-full py-4 bg-brand-600 text-white rounded-xl font-medium shadow-md hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        {step === steps.length - 1 ? (
          <> <RefreshCw size={20} /> Start Over </>
        ) : (
          <> <Check size={20} /> Next Step </>
        )}
      </button>
    </div>
  );
};

// 3. Audio Synth (No external assets)
const SoundExercise = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const toggleSound = () => {
    if (isPlaying) {
      stopSound();
    } else {
      startSound();
    }
  };

  const startSound = () => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Binaural-ish drone effect (simple sine wave for calm)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime); // A2 (Deep calm)
      
      // Soft attack
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      audioContextRef.current = ctx;
      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
      setIsPlaying(true);
    } catch (e) {
      console.error("Audio API not supported");
    }
  };

  const stopSound = () => {
    if (gainNodeRef.current && audioContextRef.current) {
      // Soft release
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 1);
      setTimeout(() => {
        oscillatorRef.current?.stop();
        setIsPlaying(false);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 transition-colors duration-500 ${isPlaying ? 'bg-brand-100' : 'bg-slate-100'}`}>
        {isPlaying ? (
          <div className="flex items-end gap-1 h-12">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-2 bg-brand-500 animate-[bounce_1s_infinite] rounded-full" style={{ animationDelay: `${i * 0.1}s`, height: isPlaying ? '100%' : '20%' }} />
            ))}
          </div>
        ) : (
          <Music size={48} className="text-slate-400" />
        )}
      </div>
      
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Binaural Calm</h2>
      <p className="text-slate-600 mb-8 max-w-xs">A generated sine wave at 110Hz to promote focus and relaxation.</p>
      
      <button 
        onClick={toggleSound}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isPlaying ? 'bg-amber-500 text-white' : 'bg-brand-600 text-white'}`}
      >
        {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
      </button>
    </div>
  );
};

// 4. Micro Journal
const JournalExercise = () => {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!text.trim()) return;
    storageService.addJournalEntry(text);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setText('');
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-slate-800 mb-4">What's on your mind?</h2>
      <div className="flex-1 relative">
        <textarea 
          className="w-full h-full p-6 rounded-2xl bg-white border-2 border-brand-100 focus:border-brand-500 focus:ring-0 outline-none resize-none shadow-sm text-slate-700 leading-relaxed text-lg placeholder:text-slate-300"
          placeholder="I'm feeling..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button 
          onClick={handleSave}
          disabled={!text.trim() || saved}
          className={`absolute bottom-6 right-6 p-4 rounded-full shadow-lg transition-all active:scale-95 flex items-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-slate-300'}`}
        >
          {saved ? <Check size={24} /> : <Save size={24} />}
        </button>
      </div>
      <p className="text-center text-xs text-slate-400 mt-4">Entries are stored privately on your device.</p>
    </div>
  );
};

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

  const iconMap: Record<string, React.ElementType> = {
    Wind, Anchor, Book, Music
  };

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'breathing': return <BreathingExercise />;
      case 'grounding': return <GroundingExercise />;
      case 'sound': return <SoundExercise />;
      case 'journal': return <JournalExercise />;
      default: return null;
    }
  };

  if (activeTool) {
    return (
      <div className="h-full flex flex-col bg-slate-50">
        <div className="p-4 flex items-center gap-4 bg-white shadow-sm z-10">
          <button onClick={() => setActiveTool(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="font-bold text-lg capitalize text-slate-800">{activeTool === 'sound' ? 'Audio' : activeTool}</h1>
        </div>
        <div className="flex-1 p-6 overflow-hidden">
          {renderActiveTool()}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-50 h-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Wellness Hub</h1>
        <p className="text-slate-500">Science-backed tools for instant relief.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {WELLNESS_TOOLS.map((tool) => {
          const isLocked = !user.isPremium && tool.id !== 'breathing';
          const Icon = iconMap[tool.icon] || Wind;

          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4 hover:shadow-md hover:border-brand-200 transition-all active:scale-95"
            >
              <div className={`p-4 rounded-2xl transition-colors ${isLocked ? 'bg-slate-100 text-slate-400' : 'bg-brand-50 text-brand-600 group-hover:bg-brand-100'}`}>
                {isLocked ? <Lock size={28} /> : <Icon size={28} />}
              </div>
              <div className="text-center">
                <h3 className={`font-bold ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>{tool.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{tool.desc}</p>
              </div>
              {isLocked && (
                <div className="absolute top-3 right-3 bg-amber-100 text-amber-600 p-1 rounded-full">
                  <Lock size={12} />
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