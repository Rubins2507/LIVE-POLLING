import React, { useState, useEffect, useCallback } from 'react';
import { api, getVoterIdentifier } from '../services/api';
import { usePollWebSocket } from '../services/websocket';
import { Poll, OptionResult, ActivityEvent, WSMessage } from '../types';
import { DonutChart } from '../components/DonutChart';
import { LivePollLogo } from '../components/LivePollLogo';
import { QRCodeModal } from '../components/QRCodeModal';
import { useToast } from '../components/Toast';
import {
  Radio,
  Users,
  Wifi,
  WifiOff,
  CheckCircle2,
  Share2,
  Lock,
  Clock,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  QrCode,
  Check,
  Activity as ActivityIcon,
  Zap,
  Download,
  Copy,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublicPollPageProps {
  shareId: string;
  navigate: (path: string) => void;
}

const OPTION_COLORS = [
  'bg-blue-600',
  'bg-purple-600',
  'bg-emerald-600',
  'bg-amber-500',
  'bg-pink-500',
  'bg-cyan-500',
];

export const PublicPollPage: React.FC<PublicPollPageProps> = ({ shareId, navigate }) => {
  const { showToast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionText, setVotedOptionText] = useState<string | null>(null);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Live real-time state from WebSocket
  const [activeTab, setActiveTab] = useState<'results' | 'activity'>('results');
  const [liveResults, setLiveResults] = useState<OptionResult[]>([]);
  const [liveTotalVotes, setLiveTotalVotes] = useState<number>(0);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);

  // Trigger pulse highlight on recently updated option
  const triggerOptionHighlight = (optionId: string) => {
    setRecentlyUpdatedId(optionId);
    setTimeout(() => {
      setRecentlyUpdatedId((prev) => (prev === optionId ? null : prev));
    }, 1400);
  };

  // Simulate an incoming live vote over the API to test real-time WebSocket broadcast
  const handleSimulateLiveVote = async () => {
    if (!poll || poll.options.length === 0) return;
    setIsSimulating(true);
    try {
      const randomOption = poll.options[Math.floor(Math.random() * poll.options.length)];
      const randomVoterId = `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const updated = await api.vote(poll.id, randomOption.id, randomVoterId);
      triggerOptionHighlight(randomOption.id);
      setLiveResults(updated.results);
      setLiveTotalVotes(updated.totalVotes);
      showToast(`Simulated live vote for "${randomOption.text}"! Check the updated live results.`);
    } catch (e: any) {
      showToast('Simulation failed: ' + e.message, 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Export results as CSV
  const handleExportCSV = () => {
    if (!poll) return;
    const rows = [
      ['Option', 'Votes', 'Percentage'],
      ...liveResults.map((r) => [r.text, r.votes, `${r.percentage}%`]),
      ['Total', liveTotalVotes, '100%'],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `poll_${poll.shareId || 'results'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Poll results exported as CSV');
  };

  // Check if voter already voted locally in this browser
  useEffect(() => {
    const voterId = getVoterIdentifier();
    const storedVote = localStorage.getItem(`livepoll_voted_${shareId}_${voterId}`);
    if (storedVote) {
      setHasVoted(true);
      setVotedOptionText(storedVote);
    }
  }, [shareId]);

  // Initial fetch
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.getPublicPollByShareId(shareId);
        setPoll(data);

        // Compute initial results
        const total = data.options.reduce((sum, opt) => sum + opt.voteCount, 0);
        setLiveTotalVotes(total);
        setLiveResults(
          data.options.map((opt) => ({
            optionId: opt.id,
            text: opt.text,
            votes: opt.voteCount,
            percentage: total > 0 ? Math.round((opt.voteCount / total) * 100) : 0,
          }))
        );

        // Fetch activity or results from server
        try {
          const res = await api.getPollResults(data.id);
          setLiveResults(res.results);
          setLiveTotalVotes(res.totalVotes);
        } catch (e) {
          // ignore
        }
      } catch (err: any) {
        setError(err.message || 'Poll not found');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [shareId]);

  // WebSocket message listener
  const handleWSMessage = useCallback((msg: WSMessage) => {
    if (msg.type === 'INIT_STATE') {
      if (msg.results) setLiveResults(msg.results);
      if (typeof msg.totalVotes === 'number') setLiveTotalVotes(msg.totalVotes);
      if (msg.activities) setActivities(msg.activities);
    } else if (msg.type === 'POLL_UPDATE') {
      if (msg.results) {
        // Detect which option votes changed to trigger subtle highlight
        setLiveResults((prev) => {
          if (msg.results) {
            msg.results.forEach((newOpt) => {
              const oldOpt = prev.find((p) => p.optionId === newOpt.optionId);
              if (oldOpt && newOpt.votes > oldOpt.votes) {
                triggerOptionHighlight(newOpt.optionId);
              }
            });
          }
          return msg.results!;
        });
      }
      if (typeof msg.totalVotes === 'number') setLiveTotalVotes(msg.totalVotes);
      if (msg.activity) {
        setActivities((prev) => [msg.activity!, ...prev.slice(0, 20)]);
      }
    } else if (msg.type === 'POLL_STATUS' && msg.status) {
      setPoll((prev) => (prev ? { ...prev, status: msg.status! } : null));
    }
  }, []);

  const { status: wsStatus, viewers } = usePollWebSocket(poll?.id, handleWSMessage);

  const handleVoteSubmit = async () => {
    if (!selectedOptionId || !poll) return;
    setSubmittingVote(true);
    setVoteError(null);

    try {
      const selectedOption = poll.options.find((o) => o.id === selectedOptionId);
      const updated = await api.vote(poll.id, selectedOptionId);

      setHasVoted(true);
      triggerOptionHighlight(selectedOptionId);
      const optionName = selectedOption?.text || 'your selected option';
      setVotedOptionText(optionName);

      const voterId = getVoterIdentifier();
      localStorage.setItem(`livepoll_voted_${shareId}_${voterId}`, optionName);

      setLiveResults(updated.results);
      setLiveTotalVotes(updated.totalVotes);

      // Trigger confetti celebration on voting!
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      setVoteError(err.message || 'Failed to submit vote');
    } finally {
      setSubmittingVote(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8 text-slate-500 text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Connecting to live poll...</span>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Poll Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'This poll may have been deleted or the link is incorrect.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const isClosed = poll.status === 'closed';
  const isExpired = poll.expiresAt && new Date() > new Date(poll.expiresAt);
  const canVote = !isClosed && !isExpired && (!hasVoted || poll.settings.allowMultipleVotes);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar matching Screen 7 in Reference Image */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <LivePollLogo size="sm" />
        </button>

        {/* Right Header Badges (LIVE + Viewers + Simulator) */}
        <div className="flex items-center gap-2.5">
          {/* Quick simulator tester button */}
          <button
            onClick={handleSimulateLiveVote}
            disabled={isSimulating || isClosed}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 text-amber-800 rounded-full text-xs font-semibold border border-amber-200/80 transition-colors shadow-2xs"
            title="Simulate an incoming vote from another client"
          >
            <Zap className={`w-3.5 h-3.5 text-amber-600 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Sending Vote...' : 'Simulate Live Vote'}</span>
          </button>

          {/* LIVE indicator badge with pulsing red dot */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/70 text-red-600 text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <span>LIVE</span>
          </div>

          {/* Viewers Counter */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>{viewers} watching</span>
          </div>

          <button
            onClick={() => setShowQR(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Show QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Title and Stats Row */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <button
              onClick={() => navigate('/dashboard')}
              className="hover:text-slate-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {poll.question}
            </h1>
            <div className="text-sm font-bold text-slate-500 shrink-0">
              {liveTotalVotes} {liveTotalVotes === 1 ? 'vote' : 'votes'}
            </div>
          </div>
        </div>

        {/* 2-Column Grid (Options / Left vs Results & Live Activity / Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Voting Options */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {canVote ? 'Select an Option' : 'Live Poll Options'}
              </span>
              {isClosed ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  <Lock className="w-3 h-3" />
                  Poll Closed
                </span>
              ) : hasVoted && !poll.settings.allowMultipleVotes ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  <Check className="w-3 h-3" />
                  Voted
                </span>
              ) : null}
            </div>

            {voteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{voteError}</span>
              </div>
            )}

            {/* Options List */}
            <div className="space-y-3.5">
              {poll.options.map((opt, index) => {
                const isSelected = selectedOptionId === opt.id;
                const optResult = liveResults.find((r) => r.optionId === opt.id);
                const percentage = optResult ? optResult.percentage : 0;
                const votes = optResult ? optResult.votes : opt.voteCount;
                const barColor = OPTION_COLORS[index % OPTION_COLORS.length];

                return (
                  <div
                    key={opt.id}
                    onClick={() => canVote && setSelectedOptionId(opt.id)}
                    className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 ${
                      canVote ? 'cursor-pointer' : 'cursor-default'
                    } ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    } ${recentlyUpdatedId === opt.id ? 'ring-2 ring-blue-400/60 border-blue-300 bg-blue-50/20' : ''}`}
                  >
                    {/* Top row: Radio + Text + Percentage */}
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold mb-2.5 relative z-10">
                      <div className="flex items-center gap-3">
                        {canVote ? (
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        ) : null}
                        <span className="text-slate-900 font-bold">{opt.text}</span>
                      </div>

                      {/* Percentage & Vote Count with smooth CSS transition */}
                      <div className="flex items-center gap-2 text-xs">
                        <span
                          className={`font-extrabold text-sm transition-all duration-500 ${
                            recentlyUpdatedId === opt.id
                              ? 'text-blue-600 scale-110 animate-vote-pulse'
                              : 'text-slate-900 scale-100'
                          }`}
                        >
                          {percentage}%
                        </span>
                        <span className="text-slate-400 font-medium transition-colors">({votes})</span>
                      </div>
                    </div>

                    {/* Visual Animated Progress Bar with smooth CSS width expansion */}
                    <div className="w-full h-3 bg-slate-100/90 rounded-full overflow-hidden relative z-10 shadow-inner">
                      <div
                        className={`h-full ${barColor} rounded-full relative overflow-hidden progress-bar-fill`}
                        style={{
                          width: `${percentage}%`,
                          willChange: 'width',
                        }}
                      >
                        {/* Subtle flowing glossy sheen highlight */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent w-full h-full animate-sheen pointer-events-none" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Voting Button */}
            {canVote && (
              <button
                onClick={handleVoteSubmit}
                disabled={!selectedOptionId || submittingVote}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
              >
                {submittingVote ? 'Submitting Your Vote...' : 'Vote'}
              </button>
            )}

            {hasVoted && !poll.settings.allowMultipleVotes && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your vote for <strong>{votedOptionText}</strong> has been registered.</span>
              </div>
            )}

            {/* Bottom Real-time sync indicator */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                {wsStatus === 'connected' ? (
                  <Wifi className="w-4 h-4 text-emerald-600 animate-pulse" />
                ) : (
                  <WifiOff className="w-4 h-4 text-amber-500" />
                )}
                <span>Results update automatically in real time</span>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  wsStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {wsStatus === 'connected' ? 'Live Connected' : 'Syncing...'}
              </span>
            </div>
          </div>

          {/* Right Column: Tabs (Results vs Live Activity) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Tabs Header */}
            <div className="flex items-center border-b border-slate-100">
              <button
                onClick={() => setActiveTab('results')}
                className={`flex-1 py-3.5 text-xs font-bold transition-all border-b-2 ${
                  activeTab === 'results'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Results
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                  activeTab === 'activity'
                    ? 'border-blue-600 text-blue-600 bg-blue-50/20'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>Live Activity</span>
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              </button>
            </div>

            {/* Tab 1: Donut Chart Results */}
            {activeTab === 'results' && (
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    Vote Distribution
                  </h3>
                  <p className="text-xs text-slate-400">
                    Calculated in real time across all participants
                  </p>
                </div>

                {/* Donut Chart Component */}
                <DonutChart
                  results={liveResults}
                  totalVotes={liveTotalVotes}
                />

                {/* Quick Share and Export Box */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Invite more voters
                    </span>
                    <button
                      onClick={handleExportCSV}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export CSV</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/poll/${shareId}`}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600 select-all"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/poll/${shareId}`);
                        showToast('Share link copied to clipboard!');
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Live Activity Feed */}
            {activeTab === 'activity' && (
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <ActivityIcon className="w-4 h-4 text-blue-600" />
                    <span>Real-time Vote Stream</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live events broadcast directly through WebSockets
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {activities.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">
                      Waiting for live votes...
                    </div>
                  ) : (
                    activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1 duration-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          <span className="text-slate-700">
                            Someone voted for <strong className="text-slate-900">{act.optionText}</strong>
                          </span>
                        </div>
                        <span className="text-slate-400 font-medium shrink-0 ml-2">
                          {act.relativeText || 'Just now'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        url={`${window.location.origin}/poll/${shareId}`}
        question={poll.question}
      />
    </div>
  );
};
