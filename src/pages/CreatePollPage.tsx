import React, { useState } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';

interface CreatePollPageProps {
  navigate: (path: string) => void;
  onPollCreated: (pollData: any) => void;
}

export const CreatePollPage: React.FC<CreatePollPageProps> = ({ navigate, onPollCreated }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['Python', 'Java', 'JavaScript', 'C++']);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!question.trim() || question.trim().length < 5) {
      setError('Question must be at least 5 characters');
      return;
    }

    const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);
    if (trimmedOptions.length < 2) {
      setError('Please provide at least 2 non-empty options');
      return;
    }

    // Check duplicates
    const set = new Set(trimmedOptions.map((o) => o.toLowerCase()));
    if (set.size !== trimmedOptions.length) {
      setError('All poll options must be unique');
      return;
    }

    setLoading(true);
    try {
      const created = await api.createPoll({
        question: question.trim(),
        options: trimmedOptions,
        allowMultipleVotes,
        endDate: hasEndDate && endDate ? endDate : undefined,
      });

      onPollCreated(created);
      navigate(`/polls/created/${created.shareId || created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-3xl w-full mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create a New Poll
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Fill in the details to create your poll
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Card (Matching Screen 5 in Reference Image) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Question
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Which programming language do you like the most?"
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Options
            </label>
            <div className="space-y-3">
              {options.map((opt, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 text-xs font-semibold text-slate-400 text-center select-none">
                    {index + 1}.
                  </div>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Option Button */}
            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-3.5 w-full py-2.5 px-4 border-2 border-dashed border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-xl text-xs font-semibold text-slate-600 flex items-center justify-center gap-2 transition-all cursor-pointer bg-slate-50/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option ({options.length}/6)</span>
              </button>
            )}
          </div>

          {/* Settings Section */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Settings
            </h3>

            {/* Checkbox 1: Multiple votes */}
            <div className="flex items-center gap-3">
              <input
                id="multipleVotes"
                type="checkbox"
                checked={allowMultipleVotes}
                onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="multipleVotes" className="text-xs text-slate-700 font-medium cursor-pointer select-none">
                Allow multiple votes per participant
              </label>
            </div>

            {/* Checkbox 2: End date */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  id="hasEndDate"
                  type="checkbox"
                  checked={hasEndDate}
                  onChange={(e) => setHasEndDate(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="hasEndDate" className="text-xs text-slate-700 font-medium cursor-pointer select-none">
                  Set an end date (optional)
                </label>
              </div>

              {hasEndDate && (
                <div className="pl-7 pt-1">
                  <div className="relative max-w-xs">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow transition-all cursor-pointer"
            >
              {loading ? 'Creating Poll...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
