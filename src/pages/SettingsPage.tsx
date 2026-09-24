import React, { useState } from 'react';
import { getVoterIdentifier } from '../services/api';
import { Settings, Shield, Bell, Key, RefreshCw, Check } from 'lucide-react';

interface SettingsPageProps {
  navigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = () => {
  const [voterId, setVoterId] = useState(getVoterIdentifier());
  const [realtimeNotify, setRealtimeNotify] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleResetVoterId = () => {
    const newId = `voter_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('livepoll_voter_id', newId);
    setVoterId(newId);
    alert('Voter identifier reset. You can vote again on polls that restrict 1 vote per voter.');
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl w-full mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure real-time notifications and privacy settings
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
        {/* Real-time Section */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <span>Real-time Live Sync</span>
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Auto-update Poll Results</p>
              <p className="text-[11px] text-slate-500">Subscribe to WebSocket broadcast stream</p>
            </div>
            <input
              type="checkbox"
              checked={realtimeNotify}
              onChange={(e) => setRealtimeNotify(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Confetti Celebration FX</p>
              <p className="text-[11px] text-slate-500">Play particle burst animations on vote</p>
            </div>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </div>
        </div>

        {/* Voter Identifier & Privacy */}
        <div className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Anonymous Voter Token</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            LivePoll assigns an anonymous device identifier so visitors can cast votes without creating an account while preventing ballot-box stuffing.
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="font-mono text-xs text-slate-700">{voterId}</span>
            <button
              onClick={handleResetVoterId}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Token</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
