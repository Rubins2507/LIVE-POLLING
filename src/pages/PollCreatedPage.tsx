import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QRCodeModal } from '../components/QRCodeModal';
import { api } from '../services/api';
import { Poll } from '../types';
import {
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Share2,
  ArrowRight,
  Plus,
  ExternalLink,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook,
} from 'lucide-react';

interface PollCreatedPageProps {
  shareId: string;
  pollData?: Poll | null;
  navigate: (path: string) => void;
}

export const PollCreatedPage: React.FC<PollCreatedPageProps> = ({
  shareId,
  pollData: initialPoll,
  navigate,
}) => {
  const [poll, setPoll] = useState<Poll | null>(initialPoll || null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    // Fire confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }

    if (!initialPoll && shareId) {
      api.getPublicPollByShareId(shareId)
        .then((p) => setPoll(p))
        .catch((e) => console.error(e));
    }
  }, [shareId, initialPoll]);

  const pollUrl = `${window.location.origin}/poll/${shareId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const question = poll?.question || 'Which programming language do you like the most?';
  const optionsCount = poll?.options?.length || 4;

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Vote on this poll: "${question}"\n${pollUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`Vote on this poll: "${question}" via LivePoll`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(pollUrl)}`, '_blank');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pollUrl)}`, '_blank');
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pollUrl)}`, '_blank');
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50">
      <div className="max-w-xl w-full space-y-6">
        {/* Success Card (Matching Screen 6 in Reference Image) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 text-center space-y-6">
          {/* Green Check Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-100 shadow-xs">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Poll Created Successfully!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your poll is ready to be shared with your audience.
            </p>
          </div>

          {/* Poll Summary Preview Box */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 text-left">
            <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
              {question}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {optionsCount} options • Created just now
            </p>
          </div>

          {/* Share Link Input Box with Copy Button */}
          <div className="space-y-2 text-left">
            <label className="block text-xs font-semibold text-slate-700">
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={pollUrl}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 select-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Share Via Social Media Buttons */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Share via
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={shareWhatsApp}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-medium border border-emerald-200/60 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={shareTwitter}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                <Twitter className="w-4 h-4" />
                <span>X / Twitter</span>
              </button>
              <button
                onClick={shareLinkedIn}
                className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-medium border border-blue-200/60 transition-colors cursor-pointer"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </button>
              <button
                onClick={shareFacebook}
                className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-medium border border-indigo-200/60 transition-colors cursor-pointer"
              >
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </button>
              <button
                onClick={() => setShowQR(true)}
                className="flex items-center gap-2 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold border border-purple-200/60 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => navigate('/polls/create')}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Another Poll</span>
            </button>

            <button
              onClick={() => navigate(`/poll/${shareId}`)}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Live Poll</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        url={pollUrl}
        question={question}
      />
    </div>
  );
};
