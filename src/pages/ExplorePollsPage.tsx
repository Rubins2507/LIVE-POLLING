import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Poll } from '../types';
import {
  Search,
  BarChart2,
  ExternalLink,
  Flame,
  Radio,
  Clock,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface ExplorePollsPageProps {
  navigate: (path: string) => void;
}

export const ExplorePollsPage: React.FC<ExplorePollsPageProps> = ({ navigate }) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch polls
    api.getMyPolls()
      .then((data) => setPolls(data))
      .catch(() => {
        // Fallback demo polls if not authenticated
        setPolls([
          {
            id: 'poll_lang_1',
            ownerId: 'usr_rubin',
            question: 'Which programming language do you like the most?',
            options: [
              { id: 'opt_py', text: 'Python', voteCount: 61 },
              { id: 'opt_jv', text: 'Java', voteCount: 40 },
              { id: 'opt_js', text: 'JavaScript', voteCount: 19 },
              { id: 'opt_cpp', text: 'C++', voteCount: 5 },
            ],
            settings: { allowMultipleVotes: false },
            status: 'active',
            shareId: 'abc123',
            createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'poll_frame_2',
            ownerId: 'usr_rubin',
            question: 'Best framework for web development?',
            options: [
              { id: 'opt_react', text: 'React', voteCount: 45 },
              { id: 'opt_next', text: 'Next.js', voteCount: 25 },
              { id: 'opt_vue', text: 'Vue.js', voteCount: 12 },
              { id: 'opt_angular', text: 'Angular', voteCount: 7 },
            ],
            settings: { allowMultipleVotes: false },
            status: 'active',
            shareId: 'web456',
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'poll_mobile_3',
            ownerId: 'usr_rubin',
            question: 'Your favorite mobile OS?',
            options: [
              { id: 'opt_ios', text: 'iOS', voteCount: 32 },
              { id: 'opt_android', text: 'Android', voteCount: 20 },
              { id: 'opt_other', text: 'Other', voteCount: 4 },
            ],
            settings: { allowMultipleVotes: false },
            status: 'closed',
            shareId: 'mob789',
            createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = polls.filter((p) => {
    const matchSearch = p.question.toLowerCase().includes(search.toLowerCase());
    if (filter === 'active') return matchSearch && p.status === 'active';
    if (filter === 'closed') return matchSearch && p.status === 'closed';
    return matchSearch;
  });

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Flame className="w-3.5 h-3.5 text-blue-600" />
            <span>Public Directory</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Active Polls
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse public community questions and cast your live vote instantly
          </p>
        </div>

        <button
          onClick={() => navigate('/polls/create')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create a Poll</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Polls ({polls.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'active' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Active
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'closed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      {/* Grid of Polls */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading polls...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <BarChart2 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">No polls match your search</h3>
          <p className="text-xs text-slate-400">Try clearing the search or filter to see more.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((poll) => {
            const total = poll.options.reduce((s, o) => s + o.voteCount, 0);
            return (
              <div
                key={poll.id}
                onClick={() => navigate(`/poll/${poll.shareId || poll.id}`)}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:border-blue-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        poll.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          poll.status === 'active' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
                      {poll.status === 'active' ? 'LIVE' : 'CLOSED'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {total} votes
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {poll.question}
                  </h3>

                  {/* Options Mini Preview */}
                  <div className="space-y-1.5 pt-1">
                    {poll.options.slice(0, 3).map((opt) => {
                      const pct = total > 0 ? Math.round((opt.voteCount / total) * 100) : 0;
                      return (
                        <div key={opt.id} className="text-xs text-slate-600 flex justify-between items-center">
                          <span className="truncate max-w-[180px]">{opt.text}</span>
                          <span className="font-semibold text-slate-900">{pct}%</span>
                        </div>
                      );
                    })}
                    {poll.options.length > 3 && (
                      <span className="text-[11px] text-slate-400">
                        +{poll.options.length - 3} more options
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                  <span>{poll.status === 'active' ? 'Vote Now' : 'View Results'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
