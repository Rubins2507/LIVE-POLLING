export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

export interface PollSettings {
  allowMultipleVotes: boolean;
  endDate?: string | null;
}

export interface Poll {
  id: string;
  ownerId: string;
  question: string;
  options: PollOption[];
  settings: PollSettings;
  status: 'active' | 'closed';
  shareId: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
}

export interface OptionResult {
  optionId: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface PollResults {
  pollId: string;
  question: string;
  status: string;
  totalVotes: number;
  results: OptionResult[];
  updatedAt: string;
}

export interface ActivityEvent {
  id: string;
  pollId: string;
  optionId: string;
  optionText: string;
  timestamp: string;
  relativeText?: string;
}

export interface WSMessage {
  type: 'INIT_STATE' | 'POLL_UPDATE' | 'POLL_STATUS' | 'VIEWER_COUNT' | 'PING' | 'PONG';
  pollId?: string;
  results?: OptionResult[];
  totalVotes?: number;
  viewers?: number;
  status?: 'active' | 'closed';
  lastVote?: {
    optionId: string;
    optionText: string;
    timestamp: number;
  };
  activity?: ActivityEvent;
  activities?: ActivityEvent[];
}
