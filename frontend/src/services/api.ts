import { Poll, PollResults, User } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || '/api';

export function getVoterIdentifier(): string {
  let id = localStorage.getItem('livepoll_voter_id');
  if (!id) {
    id = `voter_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('livepoll_voter_id', id);
  }
  return id;
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('livepoll_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Voter-ID': getVoterIdentifier(),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async signup(data: { name: string; email: string; password: string; confirmPassword?: string }) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to sign up');
    }
    return json.data as { user: User; token: string };
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Invalid credentials');
    }
    return json.data as { user: User; token: string };
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Session expired');
    }
    return json.data as User;
  },

  async updateProfile(name: string) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to update profile');
    }
    return json.data as User;
  },

  // Polls
  async createPoll(data: {
    question: string;
    options: string[];
    allowMultipleVotes: boolean;
    endDate?: string;
  }) {
    const res = await fetch(`${API_BASE}/polls`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to create poll');
    }
    return json.data as Poll;
  },

  async getMyPolls() {
    const res = await fetch(`${API_BASE}/polls`, {
      headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to fetch polls');
    }
    return json.data as Poll[];
  },

  async getPollById(id: string) {
    const res = await fetch(`${API_BASE}/polls/${id}`, {
      headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Poll not found');
    }
    return json.data as Poll;
  },

  async getPublicPollByShareId(shareId: string) {
    const res = await fetch(`${API_BASE}/public/polls/${shareId}`, {
      headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Public poll not found');
    }
    return json.data as Poll;
  },

  async getPollResults(id: string) {
    const res = await fetch(`${API_BASE}/polls/${id}/results`, {
      headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to fetch results');
    }
    return json.data as PollResults;
  },

  async vote(pollId: string, optionId: string, customVoterId?: string) {
    const voterId = customVoterId || getVoterIdentifier();
    const res = await fetch(`${API_BASE}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({
        optionId,
        voterIdentifier: voterId,
      }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to vote');
    }
    return json.data as PollResults;
  },

  async closePoll(pollId: string) {
    const res = await fetch(`${API_BASE}/polls/${pollId}/close`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to close poll');
    }
    return json.data;
  },

  async reopenPoll(pollId: string) {
    const res = await fetch(`${API_BASE}/polls/${pollId}/reopen`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to reopen poll');
    }
    return json.data;
  },

  async deletePoll(pollId: string) {
    const res = await fetch(`${API_BASE}/polls/${pollId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Failed to delete poll');
    }
    return json.data;
  },
};
