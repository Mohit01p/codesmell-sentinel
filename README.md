# CodeSmell Sentinel

AI-powered Security & Code Quality PR Reviewer. Automatically scans every 
GitHub Pull Request the moment it's opened — running ESLint + Semgrep static 
analysis, translating raw findings into plain-English explanations with 
Google Gemini, posting a formatted review comment on the PR, and saving 
scan history to a dashboard.

## Status: ✅ Core pipeline complete (Day 1–13 of 14)

### What's working end-to-end
- **Auth** — Login with GitHub (OAuth), JWT-based sessions
- **Dashboard** — view your GitHub repos, activate/deactivate scanning per repo
- **Webhooks** — real-time PR event listener, signature-verified for security
- **Diff-aware scanning** — only reports issues on lines actually changed in the PR
- **Static analysis** — ESLint (JS/TS quality) + Semgrep (security patterns), merged
- **AI explanations** — Gemini turns raw tool warnings into plain-English 
  explanations + suggested fixes, with graceful fallback if the API fails
- **PR comments** — posts a formatted Markdown review directly on the PR
- **Scoring** — deterministic weighted formula (100 − Σ severity penalties)
- **Persistence** — every scan + finding saved to MongoDB
- **Scan history UI** — repo list → scan history table → finding detail view
- **Edge cases handled** — large PRs (file cap), non-JS files skipped, AI/API 
  failures don't crash the pipeline

### Not yet done
- Production deployment (currently runs locally + ngrok tunnel)
- Demo recording / final polish (Day 14)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | MongoDB (Atlas) |
| Auth | GitHub OAuth + JWT |
| Static Analysis | ESLint + Semgrep |
| AI | Google Gemini API |
| Local tunneling (dev) | ngrok |

---

## Setup

### 1. Prerequisites
- Node.js installed (`node -v` to check)
- Python 3.8+ installed (`python --version`) — needed for Semgrep
- A GitHub account
- A free MongoDB Atlas account
- A free ngrok account
- A free Gemini API key

### 2. MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Add a database user (Database Access) — use a password with **only letters/numbers** to avoid connection-string issues
3. Allow access from anywhere (Network Access → `0.0.0.0/0`) for local dev
4. Copy the connection string (Database → Connect → Drivers)

### 3. GitHub OAuth App
1. Go to https://github.com/settings/developers → "New OAuth App"
2. Homepage URL: `http://localhost:5173`
3. Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy the Client ID, generate and copy a Client Secret

### 4. ngrok (for receiving GitHub webhooks locally)
1. Sign up free at https://ngrok.com
2. Install it (Microsoft Store or direct download)
3. Run `ngrok config add-authtoken YOUR_TOKEN` (token from your ngrok dashboard)

### 5. Semgrep
```powershell
pip install semgrep
```

### 6. Gemini API key
1. Go to https://aistudio.google.com/apikey
2. Create an API key (accept the default project if prompted)

### 7. Environment variables
Copy `.env.example` into `server/.env`:
```powershell
cp .env.example server/.env
```
Then fill in `server/.env` with:
- `MONGO_URI` — your real Atlas connection string
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — from step 3
- `JWT_SECRET` — any random string you make up
- `GITHUB_WEBHOOK_SECRET` — any random string you make up (used in step 9)
- `GEMINI_API_KEY` — from step 6
- `SERVER_PUBLIC_URL` — your ngrok forwarding URL (added in step 9, changes each time ngrok restarts on the free plan)

---

## Running the app (3 terminals)

**Terminal 1 — Backend**
```powershell
cd server
npm install
npm start
```
Visit http://localhost:5000/api/health — should return a JSON success message.

**Terminal 2 — Frontend**
```powershell
cd client
npm install
npm run dev
```
Visit http://localhost:5173

**Terminal 3 — ngrok**
```powershell
ngrok http 5000
```
Copy the `https://....ngrok-free.dev` forwarding URL into `SERVER_PUBLIC_URL` in `server/.env`, then restart Terminal 1.

---

## Using it

1. Open http://localhost:5173 and log in with GitHub
2. Activate a repo from your dashboard — this registers a webhook on it (needs ngrok running)
3. Open a pull request on that repo (or push a commit to an existing one)
4. Within ~10-20 seconds, a review comment appears on the PR
5. Check "View History" on the repo in your dashboard to see the scan and its findings

⚠️ **Note on ngrok free tier**: the public URL changes every time you restart 
ngrok. If that happens, update `SERVER_PUBLIC_URL` in `.env`, restart the 
backend, delete the old webhook from the repo's GitHub settings, and 
re-activate the repo from the dashboard.

---

## Scoring Formula
Overall Score = 100 − Σ(severity_weight × count)

severity_weight:
critical = 15
high = 8
medium = 4
low = 1

(floor capped at 0)
Deterministic and explainable by design — not AI-generated, so it's not a black box.

---

## Project Structure
codesmell-sentinel/
├── client/ # React (Vite) frontend
│ └── src/
│ ├── components/ # RepoCard, ScoreBadge, ScanHistoryTable, FindingDetail
│ ├── pages/ # Login, Dashboard, RepoDetail, ScanDetail
│ ├── context/ # AuthContext
│ └── api/ # axios instance
├── server/ # Express backend
│ ├── config/ # db.js, github.js
│ ├── models/ # User, Repo, Scan, Finding
│ ├── controllers/ # auth, repo, scan, webhook
│ ├── routes/ # auth, repo, scan, webhook
│ ├── services/ # githubService, staticAnalysisService, aiService, webhookVerifier
│ ├── middleware/ # authMiddleware, errorHandler
│ └── utils/ # diffParser, commentFormatter
├── .env.example
└── README.md
---
