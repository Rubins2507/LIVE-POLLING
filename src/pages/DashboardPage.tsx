import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { api } from '../services/api';
import { Poll } from '../types';
import {
  BarChart2,
  Users,
  Radio,
  Plus,
  Search,
  MoreVertical,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Power,
  RotateCcw,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface DashboardPageProps {
  navigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ navigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = await api.getMyPolls();
      setPolls(data);
    } catch (e) {
      console.error('Failed to load polls', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const totalPolls = polls.length;
  const totalVotes = polls.reduce((sum, p) => {
    return sum + p.options.reduce((s, opt) => s + opt.voteCount, 0);
  }, 0);
  const activePolls = polls.filter((p) => p.status === 'active').length;

  const handleCopyLink = (shareId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/poll/${shareId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(shareId);
    showToast('Poll share link copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
    setActiveMenuId(null);
  };

  const handleToggleStatus = async (poll: Poll, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (poll.status === 'active') {
        await api.closePoll(poll.id);
        showToast('Poll closed successfully');
      } else {
        await api.reopenPoll(poll.id);
        showToast('Poll reopened for voting');
      }
      fetchPolls();
    } catch (err: any) {
      showToast('Failed to change poll status: ' + err.message, 'error');
    }
    setActiveMenuId(null);
  };

  const handleDelete = async (pollId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      try {
        await api.deletePoll(pollId);
        showToast('Poll deleted successfully');
        fetchPolls();
      } catch (err: any) {
        showToast('Failed to delete poll: ' + err.message, 'error');
      }
    }
    setActiveMenuId(null);
  };

  const filteredPolls = polls.filter((poll) => {
    const matchesQuery = poll.question.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'active') return matchesQuery && poll.status === 'active';
    if (filter === 'closed') return matchesQuery && poll.status === 'closed';
    return matchesQuery;
  });

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    const days = Math.floor(diffSec / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your polls and view real-time analytics
          </p>
        </div>

        <button
          onClick={() => navigate('/polls/create')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Poll</span>
        </button>
      </div>

      {/* 3 Metric Cards (Matching Screen 4 in Reference Image) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Total Polls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Polls
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1.5">
              {totalPolls}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Total Votes */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Votes
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1.5">
              {totalVotes.toLocaleString()}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Active Polls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Polls
            </p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1.5">
              {activePolls}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Radio className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Polls Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Section Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Recent Polls
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              {filteredPolls.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  filter === 'active'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('closed')}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  filter === 'closed'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Closed
              </button>
            </div>
          </div>
        </div>

        {/* Polls List */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Loading your polls...
            </div>
          ) : filteredPolls.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-semibold text-slate-700 mb-1">No polls found</p>
              <p className="text-xs text-slate-400 mb-4">
                {searchQuery
                  ? 'Try a different search keyword'
                  : "You haven't created any polls yet"}
              </p>
              <button
                onClick={() => navigate('/polls/create')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
              >
                Create a Poll
              </button>
            </div>
          ) : (
            filteredPolls.map((poll) => {
              const pollTotalVotes = poll.options.reduce((s, opt) => s + opt.voteCount, 0);
              const isMenuOpen = activeMenuId === poll.id;

              return (
                <div
                  key={poll.id}
                  onClick={() => navigate(`/poll/${poll.shareId || poll.id}`)}
                  className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group relative"
                >
                  {/* Left info */}
                  <div className="flex items-start gap-4">
                    {/* Visual bar chart icon */}
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60 mt-0.5">
                      <BarChart2 className="w-6 h-6" />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {poll.question}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                        <span>{poll.options.length} options</span>
                        <span>•</span>
                        <span>{pollTotalVotes} votes</span>
                        <span>•</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            poll.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              poll.status === 'active' ? 'bg-emerald-600' : 'bg-slate-400'
                            }`}
                          />
                          {poll.status === 'active' ? 'Active' : 'Closed'}
                        </span>
                        <span>•</span>
                        <span>Created {formatRelativeTime(poll.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div
                    className="flex items-center gap-2 sm:self-center self-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => navigate(`/poll/${poll.shareId || poll.id}`)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {/* Action dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setActiveMenuId(isMenuOpen ? null : poll.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveMenuId(null)}
                          />
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 text-xs font-medium">
                            <button
                              onClick={(e) => handleCopyLink(poll.shareId || poll.id, e)}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                            >
                              {copiedId === (poll.shareId || poll.id) ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span>
                                {copiedId === (poll.shareId || poll.id) ? 'Copied Link' : 'Copy Link'}
                              </span>
                            </button>

                            <button
                              onClick={(e) => handleToggleStatus(poll, e)}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                            >
                              {poll.status === 'active' ? (
                                <>
                                  <Power className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Close Poll</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Reopen Poll</span>
                                </>
                              )}
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              onClick={(e) => handleDelete(poll.id, e)}
                              className="w-full px-3.5 py-2 text-left flex items-center gap-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
