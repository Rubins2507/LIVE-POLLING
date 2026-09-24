import React, { useState, useEffect } from 'react';
import { X, Play, RotateCcw, Check, Activity, Users, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  navigate: (path: string) => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose, navigate }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedLang, setSelectedLang] = useState<string | null>('Python');
  const [demoVotes, setDemoVotes] = useState({
    Python: 65,
    Java: 42,
    JavaScript: 28,
  });
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setIsSimulating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = demoVotes.Python + demoVotes.Java + demoVotes.JavaScript;

  const triggerLiveSim = () => {
    setIsSimulating(true);
    let count = 0;
    const interval = setInterval(() => {
      count++;
      const keys: ('Python' | 'Java' | 'JavaScript')[] = ['Python', 'Java', 'JavaScript'];
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      setDemoVotes((prev) => ({ ...prev, [randomKey]: prev[randomKey] + 1 }));

      if (count >= 5) {
        clearInterval(interval);
        setIsSimulating(false);
        try {
          confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
        } catch (e) {}
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
            Interactive Product Tour
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            <span>LIVE SYNC ENGINE</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          How LivePoll Syncs Real-Time Audiences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-6">
          Experience sub-second WebSocket broadcasting and Redis counter aggregation.
        </p>

        {/* Interactive Sandbox inside modal */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Demo Question: Which programming language do you like the most?
            </span>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {total} votes
            </span>
          </div>

          <div className="space-y-2.5">
            {(['Python', 'Java', 'JavaScript'] as const).map((lang, idx) => {
              const count = demoVotes[lang];
              const pct = Math.round((count / total) * 100);
              const isPicked = selectedLang === lang;
              const barColor = idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-purple-600' : 'bg-emerald-600';

              return (
                <div
                  key={lang}
                  onClick={() => {
                    setSelectedLang(lang);
                    setDemoVotes((prev) => ({ ...prev, [lang]: prev[lang] + 1 }));
                  }}
                  className={`p-3 rounded-xl border bg-white cursor-pointer transition-all ${
                    isPicked ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span>{lang}</span>
                    <span className="text-slate-900">{pct}% ({count})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={triggerLiveSim}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all"
            >
              <Activity className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Simulating 5 Votes...' : 'Simulate Incoming Votes'}</span>
            </button>

            <span className="text-[11px] text-slate-400">
              Click any option above to cast a vote!
            </span>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              navigate('/poll/abc123');
            }}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            Open Full Live Screen
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/signup');
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5"
          >
            <span>Create Your Own Poll Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
