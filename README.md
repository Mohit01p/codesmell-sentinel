# 🛡️ CodeSmell Sentinel

**AI-powered Security & Code Quality PR Reviewer**

CodeSmell Sentinel automatically reviews every GitHub Pull Request the 
moment it's opened. It combines deterministic static analysis (ESLint + 
Semgrep) with AI-generated plain-English explanations (Google Gemini), 
posting a clear, actionable review comment directly on the PR — before a 
human reviewer even looks at it.

🔗 **Live app**: https://codesmell-sentinel.vercel.app
🔗 **Live API health check**: https://codesmell-sentinel.onrender.com/api/health

---

## The Problem

Small dev teams, student teams, and open-source projects rarely have the 
bandwidth for thorough manual code review. Bugs, security vulnerabilities, 
and messy code slip into the main branch simply because nobody has time to 
check every PR carefully.

## The Approach

Rather than relying on AI for everything, CodeSmell Sentinel combines two 
layers deliberately:

1. **Deterministic static analysis** (ESLint + Semgrep) — proven, 
   rule-based tools that don't hallucinate and reliably catch known issues
2. **An AI explanation layer** (Gemini) — translates raw, cryptic tool 
   output into a plain-English explanation of *why* something is a 
   problem, plus a specific suggested fix

This shows deliberate engineering judgment: know when to use hard rules 
and when to use AI, instead of defaulting to "AI for everything."

---

## Features

- **GitHub OAuth login** — sign in with your GitHub account
- **Repo dashboard** — activate/deactivate scanning per repository with 
  one click
- **Real-time webhook listener** — reacts to PRs the moment they're 
  opened or updated, with HMAC signature verification for security
- **Diff-aware scanning** — only reports issues on lines actually changed 
  in the PR, not pre-existing code
- **Dual static analysis** — ESLint (code quality) + Semgrep (security 
  patterns like hardcoded secrets), merged into one result set
- **AI explanations** — Gemini turns raw warnings into plain-English 
  explanations + suggested fixes, with graceful fallback if the API is 
  unavailable
- **Automated PR comments** — posts a formatted Markdown review directly 
  on the pull request
- **Deterministic scoring** — a transparent, explainable 0-100 quality 
  score (not AI-generated — see formula below)
- **Scan history dashboard** — every scan and finding is saved and 
  browsable: repo → scan history → finding detail
- **Edge case handling** — large PRs are capped and flagged, non-code 
  files are skipped, API failures don't crash the pipeline

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | MongoDB (Atlas) |
| Auth | GitHub OAuth + JWT (httpOnly cookies) |
| Static Analysis | ESLint + Semgrep |
| AI | Google Gemini API |
| Hosting | Render (backend) + Vercel (frontend) |

---

## Architecture

Developer opens/updates a PR on GitHub
│
▼
GitHub sends a Webhook event to the backend
│
▼
Backend verifies the webhook signature (HMAC)
│
▼
Backend fetches the PR's changed files/diff via the GitHub API
│
▼
ESLint + Semgrep scan the changed files
│
▼
Findings are filtered to only lines actually changed in the diff
│
▼
Each finding is sent to Gemini for a plain-English explanation + fix
│
▼
Backend posts a formatted review comment back onto the PR
│
▼
Scan + findings are saved to MongoDB and shown on the dashboard


---

## Scoring Formula

Overall Score = 100 − Σ(severity_weight × count)

severity_weight:
critical = 15
high = 8
medium = 4
low = 1

(floor capped at 0)


Deliberately simple, deterministic, and explainable — not a black box.

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

## Database Schema

**User** — githubId, username, accessToken (encrypted in a full production 
setup), avatarUrl

**Repo** — owner (ref User), repoName, githubRepoId, webhookId, isActive

**Scan** — repo (ref Repo), prNumber, prTitle, prAuthor, status, 
overallScore, totalFindings

**Finding** — scan (ref Scan), filePath, lineNumber, tool, ruleId, 
severity, rawMessage, aiExplanation, aiSuggestedFix

---

## Running Locally

### Prerequisites
- Node.js
- Python 3.8+ (for Semgrep)
- A MongoDB Atlas account (free tier)
- A GitHub OAuth App
- An ngrok account (to receive webhooks locally)
- A Google Gemini API key (free tier)

### Setup

```bash
git clone https://github.com/Mohit01p/codesmell-sentinel.git
cd codesmell-sentinel

pip install semgrep
cp .env.example server/.env
# fill in server/.env with your real credentials
```

### Run (3 terminals)

**Backend**
```bash
cd server
npm install
npm start
```

**Frontend**
```bash
cd client
npm install
npm run dev
```

**Ngrok** (for local webhook testing)
```bash
ngrok http 5000
```
Copy the forwarding URL into `SERVER_PUBLIC_URL` in `server/.env`, then 
restart the backend.

### Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Any random string, used to sign session tokens |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | From your GitHub OAuth App |
| `GITHUB_CALLBACK_URL` | OAuth callback URL |
| `GITHUB_WEBHOOK_SECRET` | Any random string, used to verify webhook signatures |
| `GEMINI_API_KEY` | From Google AI Studio |
| `CLIENT_URL` | Frontend origin, used for CORS |
| `SERVER_PUBLIC_URL` | Public backend URL (ngrok locally, real domain in production) |

---

## Deployment Notes

- **Backend** (Render) and **frontend** (Vercel) live on different 
  domains, so the session cookie uses `sameSite: "none"` + `secure: true` 
  in production to work across domains (falls back to `sameSite: "lax"` 
  in local dev).
- Render's free tier spins down after ~15 minutes of inactivity — the 
  first request afterward can take 30-60 seconds.
- Render auto-redeploys on environment variable changes; Vercel requires 
  a manual redeploy trigger after changing env vars.

---

## Security Notes

- Webhook payloads are verified via HMAC-SHA256 signature comparison 
  before any processing occurs
- Sessions use httpOnly cookies (not accessible to client-side JS)
- No secrets are committed to the repository — see `.env.example` for 
  the required variables, actual values are injected via environment 
  variables at runtime
- If the Gemini API fails or rate-limits mid-scan, the pipeline falls 
  back to posting raw findings without an AI explanation rather than 
  failing the whole scan

---

## Possible Extensions

- Slack notification on critical-severity findings
- Trend chart: code quality score over time per repo
- Python support (flake8/bandit) alongside JavaScript
- Auto-block merge via GitHub's Check Runs API if score is below a threshold

---

## Resume Bullet

> Built and deployed a full-stack MERN application that automatically 
> reviews GitHub Pull Requests using ESLint and Semgrep static analysis 
> combined with Gemini-powered plain-English explanations, posting 
> real-time review comments via GitHub Webhooks with a custom-weighted 
> code quality scoring system.

---

## License

MIT
