# LivePoll — Real-Time Polling Application

LivePoll is a full-stack, real-time audience voting application designed for interactive presentations, lectures, all-hands meetings, and events.

## 🚀 Key Features & Highlights

- **Sub-Second Real-Time Updates**: Live vote tallies, percentage calculations, and live activity streams synchronize instantaneously to all spectators across devices via WebSockets.
- **Audience Voting (Frictionless)**: Zero authentication required for voters. Automatic anonymous voter tracking prevents ballot-box stuffing.
- **Visual Analytics**: Interactive Donut Charts with center totals, responsive progress bars, and real-time activity stream feeds.
- **Poll Management Dashboard**: Create, preview, copy share link, close/reopen, and delete polls.
- **Instant QR Code Generation**: Downloadable and printable QR codes for participants to scan from phone cameras.
- **Confetti Celebrations**: Smooth celebratory particle burst upon casting a vote and creating a poll.

---

## System Architecture

```
[ Audience / Spectators ]        [ Presenter / Creator ]
         │                                  │
         │  (React 19 + Tailwind CSS + WS) │
         ▼                                  ▼
 ┌─────────────────────────────────────────────────────────┐
 │                   API & WebSocket Hub                   │
 │   - Go Gin REST Engine                                  │
 │   - WebSocket Room Multiplexing                         │
 │   - JWT Token Authentication                            │
 └─────────────────────────┬───────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
     [ Redis 7 Engine ]          [ MongoDB 7 Engine ]
     - Atomic HINCRBY Counters   - Persistent Poll Documents
     - Pub/Sub Channels          - User Auth Profiles
     - Broadcast Fan-out         - Historical Vote Records
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS (light theme, modern typography, responsive layout)
- **Icons**: Lucide React
- **Visualizations**: Custom SVG Donut Charts with dynamic arc calculation & legends
- **Real-Time Client**: Custom WebSocket manager with exponential backoff auto-reconnect
- **Utilities**: `canvas-confetti`, `qrcode`

### Backend (Go / Microservices)
- **Language**: Go 1.19+
- **HTTP Web Framework**: Gin (`github.com/gin-gonic/gin`)
- **Real-time Pub/Sub & Counters**: Go-Redis (`github.com/redis/go-redis/v9`)
- **Database Driver**: MongoDB Go Driver (`go.mongodb.org/mongo-driver`)
- **WebSockets**: Gorilla WebSocket (`github.com/gorilla/websocket`)
- **Authentication**: JWT (`github.com/golang-jwt/jwt/v5`) & Bcrypt (`golang.org/x/crypto/bcrypt`)

---

## 📂 Project Directory Structure

```
├── backend/                  # Full Go Backend
│   ├── cmd/server/main.go    # Go application entrypoint
│   ├── config/               # Environment config loader
│   ├── database/             # MongoDB connection & index initialization
│   ├── handlers/             # HTTP & WebSocket route handlers
│   ├── middleware/           # JWT auth & CORS middleware
│   ├── models/               # MongoDB models (User, Poll, Vote)
│   ├── redis/                # Redis counter & Pub/Sub clients
│   ├── repository/           # Database data access layer
│   ├── routes/               # API route definitions
│   ├── services/             # Core business logic
│   ├── utils/                # JWT & password hashing utilities
│   ├── websocket/            # Gorilla WebSocket Hub & room manager
│   ├── Dockerfile            # Go alpine multi-stage Docker build
│   └── go.mod                # Go module declarations
├── src/                      # React Frontend
│   ├── components/           # Navbar, Footer, Sidebar, DonutChart, QRCodeModal, Logo
│   ├── context/              # AuthContext (JWT & state management)
│   ├── pages/                # LandingPage, LoginPage, SignupPage, DashboardPage,
│   │                         # CreatePollPage, PollCreatedPage, PublicPollPage, ProfilePage, SettingsPage
│   ├── services/             # REST API client & WebSocket hooks
│   └── types/                # TypeScript interface contracts
├── vite.config.ts            # Local proxy from React to the Go API/WebSocket
├── docker-compose.yml        # Multi-container orchestration (React, Go, Mongo, Redis)
└── metadata.json             # Applet descriptor
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` — Register a new account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Retrieve current authenticated profile
- `PUT /api/auth/profile` — Update display name

### Polls & Analytics
- `POST /api/polls` — Create a new poll (2-6 options, expiration, multi-vote settings)
- `GET /api/polls` — List authenticated creator's polls
- `GET /api/polls/:id` — Get poll details
- `POST /api/polls/:id/close` — Close poll to new votes
- `POST /api/polls/:id/reopen` — Re-open poll
- `DELETE /api/polls/:id` — Delete poll
- `GET /api/public/polls/:shareId` — Fetch public poll for voting
- `POST /api/polls/:id/vote` — Cast a vote with duplicate protection
- `GET /api/polls/:id/results` — Fetch latest percentages and distribution

### Real-Time WebSocket
- `ws://host/ws/polls/:pollId` — Connect to poll room for live push notifications (`INIT_STATE`, `POLL_UPDATE`, `VIEWER_COUNT`, `POLL_STATUS`)

---

## 🐳 Running with Docker Compose

To spin up MongoDB, Redis, the Go backend, and the frontend:

```bash
docker-compose up --build
```
The application will be accessible at `http://localhost:3000`.
The Go API backend will be accessible at `http://localhost:8080`.

## Local Development

Start the required services first:

```bash
docker compose up mongodb redis backend
```

Then run the React development server in a second terminal:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. Vite proxies `/api` and `/ws` to Gin on port 8080, so the browser uses the same real MongoDB, Redis, and WebSocket path as the containerized frontend.

## Environment

Copy `backend/.env.example` to `backend/.env` for local backend values. For a public deployment, set a long random `JWT_SECRET`, use managed MongoDB and Redis URLs, set `CORS_ORIGIN` to the frontend origin, and serve the frontend and backend behind the same HTTPS domain so `/api` and `/ws` remain same-origin.

The repository does not include hosted infrastructure credentials or a public deployment URL. Docker Compose is the reproducible deployment package; deploy it to a container host and add the resulting URL to the internship submission.
