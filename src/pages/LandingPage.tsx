import React, { useState } from 'react';
import { DemoModal } from '../components/DemoModal';
import {
  Edit3,
  BarChart3,
  Share2,
  ShieldCheck,
  Play,
  ArrowRight,
  Sparkles,
  Radio,
  CheckCircle2,
  Link,
  Users,
  Activity,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const [demoVote, setDemoVote] = useState<string | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoCounts, setDemoCounts] = useState({
    Python: 60,
    Java: 40,
    JavaScript: 25,
  });

  const handleDemoVote = (option: 'Python' | 'Java' | 'JavaScript') => {
    if (demoVote) return;
    setDemoVote(option);
    setDemoCounts(prev => ({
      ...prev,
      [option]: prev[option] + 1,
    }));
  };

  const totalDemoVotes = demoCounts.Python + demoCounts.Java + demoCounts.JavaScript;
  const pythonPct = Math.round((demoCounts.Python / totalDemoVotes) * 100);
  const javaPct = Math.round((demoCounts.Java / totalDemoVotes) * 100);
  const jsPct = Math.round((demoCounts.JavaScript / totalDemoVotes) * 100);

  return (
    <div className="w-full bg-white flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Typography & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Real-time • Simple • Interactive</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Create Polls.<br />
                Share Links.<br />
                See Results <span className="text-blue-600">Live.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Make decisions together with real-time polling. Perfect for classrooms, events, teams and more.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => setShowDemoModal(true)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base rounded-xl border border-slate-200 shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
                  <span>Watch Demo</span>
                </button>

                <button
                  onClick={() => navigate('/explore')}
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Explore Polls</span>
                </button>
              </div>

              {/* Quick stats counter */}
              <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No login required to vote</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sub-second live sync</span>
                </div>
              </div>
            </div>

            {/* Right Column: Laptop / Mockup matching the image */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md lg:max-w-none relative">
                {/* Decorative glow */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-3xl blur-xl opacity-70 -z-10" />

                {/* Laptop Body Outer Shell */}
                <div className="bg-slate-900 rounded-2xl p-2.5 sm:p-3.5 shadow-2xl border-4 border-slate-800">
                  {/* Laptop Camera dot */}
                  <div className="flex items-center justify-center pb-1.5">
                    <div className="w-2 h-2 rounded-full bg-slate-700 border border-slate-600" />
                  </div>

                  {/* Laptop Screen Display */}
                  <div className="bg-white rounded-xl p-5 sm:p-6 text-slate-900 shadow-inner">
                    {/* Screen Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        <span>LIVE</span>
                      </div>
                    </div>

                    {/* Poll Question in Mockup */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 leading-snug">
                      What&apos;s your favorite programming language?
                    </h3>

                    {/* Mockup Option 1: Python */}
                    <div
                      onClick={() => handleDemoVote('Python')}
                      className={`group p-3 rounded-xl border transition-all mb-3 cursor-pointer ${
                        demoVote === 'Python'
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            demoVote === 'Python' ? 'border-blue-600 bg-blue-600' : 'border-slate-400'
                          }`}>
                            {demoVote === 'Python' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>Python</span>
                        </div>
                        <span className="font-bold text-slate-900">{pythonPct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${pythonPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Mockup Option 2: Java */}
                    <div
                      onClick={() => handleDemoVote('Java')}
                      className={`group p-3 rounded-xl border transition-all mb-3 cursor-pointer ${
                        demoVote === 'Java'
                          ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            demoVote === 'Java' ? 'border-purple-600 bg-purple-600' : 'border-slate-400'
                          }`}>
                            {demoVote === 'Java' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>Java</span>
                        </div>
                        <span className="font-bold text-slate-900">{javaPct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${javaPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Mockup Option 3: JavaScript */}
                    <div
                      onClick={() => handleDemoVote('JavaScript')}
                      className={`group p-3 rounded-xl border transition-all mb-4 cursor-pointer ${
                        demoVote === 'JavaScript'
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            demoVote === 'JavaScript' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'
                          }`}>
                            {demoVote === 'JavaScript' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>JavaScript</span>
                        </div>
                        <span className="font-bold text-slate-900">{jsPct}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${jsPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Mockup Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span>{totalDemoVotes} votes</span>
                      <span className="flex items-center gap-1 text-blue-600 font-medium">
                        <Activity className="w-3 h-3 animate-spin" />
                        Updating in real time
                      </span>
                    </div>
                  </div>
                </div>

                {/* Laptop Base */}
                <div className="mx-auto w-11/12 h-3.5 bg-slate-700 rounded-b-xl shadow-lg border-t border-slate-600 flex justify-center">
                  <div className="w-16 h-1 bg-slate-500 rounded-full mt-0.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards Section (Exact match to Reference Image) */}
      <section id="features" className="py-16 bg-slate-50/60 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Easy to Use */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Edit3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Easy to Use
              </h3>
              <p className="text-xs text-slate-500">
                Create polls in seconds
              </p>
            </div>

            {/* Feature 2: Real-time Results */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Real-time Results
              </h3>
              <p className="text-xs text-slate-500">
                See votes update instantly
              </p>
            </div>

            {/* Feature 3: Share Anywhere */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Share Anywhere
              </h3>
              <p className="text-xs text-slate-500">
                Link or QR code
              </p>
            </div>

            {/* Feature 4: Secure & Private */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Secure & Private
              </h3>
              <p className="text-xs text-slate-500">
                Your data is protected
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              From question to audience insights in 4 effortless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative group">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center mb-4 shadow-md shadow-blue-200">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Create Poll</h4>
              <p className="text-xs text-slate-500 max-w-[200px]">
                Type your question and define 2 to 6 custom answer options.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 font-extrabold text-lg flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Share Link</h4>
              <p className="text-xs text-slate-500 max-w-[200px]">
                Distribute via public URL, social media, or instantly generated QR code.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative group">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 font-extrabold text-lg flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Audience Votes</h4>
              <p className="text-xs text-slate-500 max-w-[200px]">
                Participants tap their choice on phone or desktop without needing to sign up.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center relative group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center mb-4 shadow-md shadow-emerald-200">
                4
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Results Update Live</h4>
              <p className="text-xs text-slate-500 max-w-[200px]">
                Watch percentages, charts, and activity feeds refresh instantaneously via WebSockets.
              </p>
            </div>
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={() => navigate('/polls/create')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              <span>Create Your First Poll Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-slate-900">
            About LivePoll
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            LivePoll is an interactive real-time audience polling engine architected with a Go + Gin REST API,
            MongoDB persistence, high-speed Redis Hash counters, Redis Pub/Sub broadcast, and WebSocket synchronization.
            Whether teaching a university lecture or running a global company all-hands, LivePoll delivers zero-latency audience feedback.
          </p>
        </div>
      </section>
      {/* Demo Modal */}
      <DemoModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        navigate={navigate}
      />
    </div>
  );
};
