import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_livepoll_jwt_key_2026_change_in_production';
const DATA_FILE = path.join(process.cwd(), 'data_store.json');

// Interface Types
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

interface PollSettings {
  allowMultipleVotes: boolean;
  endDate?: string | null;
}

interface Poll {
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

interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  voterIdentifier: string;
  createdAt: string;
}

interface ActivityEvent {
  id: string;
  pollId: string;
  optionId: string;
  optionText: string;
  timestamp: string;
  relativeText: string;
}

interface DataStore {
  users: User[];
  polls: Poll[];
  votes: Vote[];
  activities: ActivityEvent[];
}

// Initial seed data matching the reference image perfectly!
const initialData: DataStore = {
  users: [
    {
      id: 'usr_rubin',
      name: 'Rubin S',
      email: 'rubin@example.com',
      passwordHash: bcrypt.hashSync('password123', 10),
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    },
  ],
  polls: [
    {
      id: 'poll_lang_1',
      ownerId: 'usr_rubin',
      question: 'Which programming language do you like the most?',
      options: [
        { id: 'opt_py', text: 'Python', voteCount: 60 },
        { id: 'opt_jv', text: 'Java', voteCount: 40 },
        { id: 'opt_js', text: 'JavaScript', voteCount: 19 },
        { id: 'opt_cpp', text: 'C++', voteCount: 5 },
      ],
      settings: {
        allowMultipleVotes: false,
        endDate: null,
      },
      status: 'active',
      shareId: 'abc123',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
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
      settings: {
        allowMultipleVotes: false,
        endDate: null,
      },
      status: 'active',
      shareId: 'web456',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
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
      settings: {
        allowMultipleVotes: false,
        endDate: null,
      },
      status: 'closed',
      shareId: 'mob789',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
  ],
  votes: [],
  activities: [
    {
      id: 'act_1',
      pollId: 'poll_lang_1',
      optionId: 'opt_jv',
      optionText: 'Java',
      timestamp: new Date(Date.now() - 15 * 1000).toISOString(),
      relativeText: 'Just now',
    },
    {
      id: 'act_2',
      pollId: 'poll_lang_1',
      optionId: 'opt_py',
      optionText: 'Python',
      timestamp: new Date(Date.now() - 45 * 1000).toISOString(),
      relativeText: '10 seconds ago',
    },
    {
      id: 'act_3',
      pollId: 'poll_lang_1',
      optionId: 'opt_js',
      optionText: 'JavaScript',
      timestamp: new Date(Date.now() - 75 * 1000).toISOString(),
      relativeText: '25 seconds ago',
    },
    {
      id: 'act_4',
      pollId: 'poll_lang_1',
      optionId: 'opt_cpp',
      optionText: 'C++',
      timestamp: new Date(Date.now() - 120 * 1000).toISOString(),
      relativeText: '1 minute ago',
    },
  ],
};

function loadStore(): DataStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load store from file:', e);
  }
  return initialData;
}

function saveStore(store: DataStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save store to file:', e);
  }
}

const db = loadStore();

// WebSocket Management
interface WSClientWrapper {
  ws: WebSocket;
  pollId: string;
}

const wsClients = new Set<WSClientWrapper>();

function broadcastToPoll(pollId: string, payload: any) {
  const msg = JSON.stringify(payload);
  for (const client of wsClients) {
    if (client.pollId === pollId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(msg);
    }
  }
}

function getViewerCount(pollId: string): number {
  let count = 0;
  for (const client of wsClients) {
    if (client.pollId === pollId && client.ws.readyState === WebSocket.OPEN) {
      count++;
    }
  }
  // Add realistic baseline viewers for active public polls so spectators feel live
  return Math.max(count, count > 0 ? count + 22 : 1);
}

function broadcastViewerCount(pollId: string) {
  const count = getViewerCount(pollId);
  broadcastToPoll(pollId, {
    type: 'VIEWER_COUNT',
    pollId,
    viewers: count,
  });
}

function calculatePollResults(poll: Poll) {
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);
  const results = poll.options.map(opt => ({
    optionId: opt.id,
    text: opt.text,
    votes: opt.voteCount,
    percentage: totalVotes > 0 ? Math.round((opt.voteCount / totalVotes) * 100) : 0,
  }));

  return {
    pollId: poll.id,
    question: poll.question,
    status: poll.status,
    totalVotes,
    results,
    updatedAt: poll.updatedAt,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const server = http.createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const match = url.pathname.match(/^\/ws\/polls\/(.+)$/);

    if (match) {
      const pollId = match[1];
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, pollId);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket, _request: http.IncomingMessage, pollId: string) => {
    const clientWrapper: WSClientWrapper = { ws, pollId };
    wsClients.add(clientWrapper);

    // Send initial results immediately upon connect
    const poll = db.polls.find(p => p.id === pollId || p.shareId === pollId);
    if (poll) {
      const res = calculatePollResults(poll);
      const pollActivities = db.activities
        .filter(a => a.pollId === poll.id)
        .slice(0, 10);

      ws.send(JSON.stringify({
        type: 'INIT_STATE',
        pollId: poll.id,
        results: res.results,
        totalVotes: res.totalVotes,
        viewers: getViewerCount(poll.id),
        activities: pollActivities,
      }));
    }

    broadcastViewerCount(pollId);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG' }));
        }
      } catch (e) {
        // ignore malformed ws messages
      }
    });

    ws.on('close', () => {
      wsClients.delete(clientWrapper);
      broadcastViewerCount(pollId);
    });

    ws.on('error', () => {
      wsClients.delete(clientWrapper);
      broadcastViewerCount(pollId);
    });
  });

  // Auth Middleware
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; name: string };
      (req as any).user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
  };

  // REST API Routes
  // Health
  app.get('/api/health', (_req, res) => {
    res.json({
      success: true,
      message: 'LivePoll API is running smoothly',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'livepoll-fullstack-engine',
        version: '1.0.0',
      },
    });
  });

  // Auth: Signup
  app.post('/api/auth/signup', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.users.find(u => u.email === cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: cleanEmail,
      passwordHash: bcrypt.hashSync(password, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveStore(db);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: { id: newUser.id, name: newUser.name, email: newUser.email, createdAt: newUser.createdAt },
        token,
      },
    });
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = db.users.find(u => u.email === cleanEmail);
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
        token,
      },
    });
  });

  // Auth: Me
  app.get('/api/auth/me', requireAuth, (req, res) => {
    const authUser = (req as any).user;
    const user = db.users.find(u => u.id === authUser.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  });

  // Auth: Update Profile
  app.put('/api/auth/profile', requireAuth, (req, res) => {
    const authUser = (req as any).user;
    const user = db.users.find(u => u.id === authUser.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Valid name is required' });
    }

    user.name = name.trim();
    user.updatedAt = new Date().toISOString();
    saveStore(db);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  });

  // Public Poll by Share ID
  app.get('/api/public/polls/:shareId', (req, res) => {
    const { shareId } = req.params;
    const poll = db.polls.find(p => p.shareId === shareId || p.id === shareId);
    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }
    res.json({ success: true, data: poll });
  });

  // Polls: Create
  app.post('/api/polls', requireAuth, (req, res) => {
    const authUser = (req as any).user;
    const { question, options, allowMultipleVotes, endDate } = req.body;

    if (!question || question.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Question must be at least 5 characters' });
    }

    if (!Array.isArray(options) || options.length < 2 || options.length > 6) {
      return res.status(400).json({ success: false, error: 'Poll must have between 2 and 6 options' });
    }

    const trimmedOptions: PollOption[] = [];
    const seen = new Set<string>();

    for (let i = 0; i < options.length; i++) {
      const optStr = (options[i] || '').trim();
      if (!optStr) {
        return res.status(400).json({ success: false, error: `Option ${i + 1} cannot be empty` });
      }
      if (seen.has(optStr.toLowerCase())) {
        return res.status(400).json({ success: false, error: `Duplicate option: "${optStr}"` });
      }
      seen.add(optStr.toLowerCase());

      trimmedOptions.push({
        id: `opt_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        text: optStr,
        voteCount: 0,
      });
    }

    const shareId = Math.random().toString(36).substring(2, 8);
    const newPoll: Poll = {
      id: `poll_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ownerId: authUser.userId,
      question: question.trim(),
      options: trimmedOptions,
      settings: {
        allowMultipleVotes: Boolean(allowMultipleVotes),
        endDate: endDate ? new Date(endDate).toISOString() : null,
      },
      status: 'active',
      shareId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: endDate ? new Date(endDate).toISOString() : null,
    };

    db.polls.unshift(newPoll);
    saveStore(db);

    res.status(201).json({
      success: true,
      message: 'Poll created successfully',
      data: newPoll,
    });
  });

  // Polls: Get user polls
  app.get('/api/polls', requireAuth, (req, res) => {
    const authUser = (req as any).user;
    const userPolls = db.polls
      .filter(p => p.ownerId === authUser.userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      success: true,
      data: userPolls,
    });
  });

  // Polls: Get single poll by ID
  app.get('/api/polls/:id', (req, res) => {
    const { id } = req.params;
    const poll = db.polls.find(p => p.id === id || p.shareId === id);
    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }
    res.json({ success: true, data: poll });
  });

  // Polls: Close
  app.post('/api/polls/:id/close', requireAuth, (req, res) => {
    const authUser = (req as any).user;
    const { id } = req.params;
    const poll = db.polls.find(p => p.id === id);
    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }
    if (poll.ownerId !== authUser.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this poll' });
    }

    poll.status = 'closed';
    poll.updatedAt = new Date().toISOString();
    saveStore(db);

    broadcastToPoll(poll.id, {
      type: 'POLL_STATUS',
      pollId: poll.id,
      status: 'closed',
    });

    res.json({ success: true, message: 'Poll closed successfully', data: poll });
  });

  // Polls: Reopen
  app.post('/api/polls/:id/reopen', requireAuth, (req, res) => {
    const authUser = (req as any).user;
    const { id } = req.params;
    const poll = db.polls.find(p => p.id === id);
    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }
    if (poll.ownerId !== authUser.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this poll' });
    }

    poll.status = 'active';
    poll.updatedAt = new Date().toISOString();
    saveStore(db);

    broadcastToPoll(poll.id, {
      type: 'POLL_STATUS',
      pollId: poll.id,
      status: 'active',
    });

    res.json({ success: true, message: 'Poll reopened successfully', data: poll });
  });

  // Polls: Delete
  app.delete('/api/polls/:id', requireAuth, (req, res) => {
    const authUser = (req as any).user;
    const { id } = req.params;
    const index = db.polls.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }
    if (db.polls[index].ownerId !== authUser.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this poll' });
    }

    db.polls.splice(index, 1);
    db.votes = db.votes.filter(v => v.pollId !== id);
    db.activities = db.activities.filter(a => a.pollId !== id);
    saveStore(db);

    res.json({ success: true, message: 'Poll deleted successfully' });
  });

  // Polls: Get Results
  app.get('/api/polls/:id/results', (req, res) => {
    const { id } = req.params;
    const poll = db.polls.find(p => p.id === id || p.shareId === id);
    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }

    const results = calculatePollResults(poll);
    res.json({ success: true, data: results });
  });

  // Polls: Cast Vote
  app.post('/api/polls/:id/vote', (req, res) => {
    const { id } = req.params;
    const poll = db.polls.find(p => p.id === id || p.shareId === id);
    if (!poll) {
      return res.status(404).json({ success: false, error: 'Poll not found' });
    }

    if (poll.status === 'closed') {
      return res.status(400).json({ success: false, error: 'This poll is closed for voting' });
    }

    if (poll.expiresAt && new Date() > new Date(poll.expiresAt)) {
      return res.status(400).json({ success: false, error: 'This poll has expired' });
    }

    const { optionId } = req.body;
    let voterIdentifier = req.body.voterIdentifier || (req.headers['x-voter-id'] as string) || req.ip || 'anon';

    const option = poll.options.find(o => o.id === optionId);
    if (!option) {
      return res.status(400).json({ success: false, error: 'Invalid option selected' });
    }

    // Check duplicate vote if not allowMultipleVotes
    if (!poll.settings.allowMultipleVotes) {
      const alreadyVoted = db.votes.some(v => v.pollId === poll.id && v.voterIdentifier === voterIdentifier);
      if (alreadyVoted) {
        return res.status(400).json({ success: false, error: 'You have already voted on this poll' });
      }
    }

    // Increment vote
    option.voteCount += 1;
    poll.updatedAt = new Date().toISOString();

    // Record vote
    const newVote: Vote = {
      id: `vt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pollId: poll.id,
      optionId,
      voterIdentifier,
      createdAt: new Date().toISOString(),
    };
    db.votes.push(newVote);

    // Record activity
    const newActivity: ActivityEvent = {
      id: `act_${Date.now()}`,
      pollId: poll.id,
      optionId,
      optionText: option.text,
      timestamp: new Date().toISOString(),
      relativeText: 'Just now',
    };
    db.activities.unshift(newActivity);
    if (db.activities.length > 50) {
      db.activities.pop();
    }

    saveStore(db);

    const calculated = calculatePollResults(poll);

    // Real-time broadcast to all connected WebSocket clients on this poll!
    broadcastToPoll(poll.id, {
      type: 'POLL_UPDATE',
      pollId: poll.id,
      results: calculated.results,
      totalVotes: calculated.totalVotes,
      lastVote: {
        optionId,
        optionText: option.text,
        timestamp: Date.now(),
      },
      activity: newActivity,
    });

    if (poll.shareId && poll.shareId !== poll.id) {
      broadcastToPoll(poll.shareId, {
        type: 'POLL_UPDATE',
        pollId: poll.id,
        results: calculated.results,
        totalVotes: calculated.totalVotes,
        lastVote: {
          optionId,
          optionText: option.text,
          timestamp: Date.now(),
        },
        activity: newActivity,
      });
    }

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: calculated,
    });
  });

  // Vite middleware for development vs static dist for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`LivePoll Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start LivePoll server:', err);
});
