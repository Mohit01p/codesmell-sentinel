# CodeSmell Sentinel

AI-powered Security & Code Quality PR Reviewer. See `docs/` and project
documentation for full architecture, schema, and 14-day build plan.

## Day 1 Status: ✅ Project Setup

- MERN folder structure scaffolded (`client/`, `server/`)
- Express server with a `/api/health` route
- Mongoose wired up (`server/config/db.js`) — needs a real `MONGO_URI`
- GitHub OAuth config skeleton (`server/config/github.js`) — needs a real Client ID/Secret
- Mongoose models for `User`, `Repo`, `Scan`, `Finding` scaffolded ahead of schedule
- React (Vite) client that pings `/api/health` on load to prove the wiring works

## Setup

### 1. MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Add a database user + allow your IP (or `0.0.0.0/0` for dev)
3. Copy the connection string (Database → Connect → Drivers)

### 2. GitHub OAuth App
1. Go to https://github.com/settings/developers → "New OAuth App"
2. Homepage URL: `http://localhost:5173`
3. Authorization callback URL: `http://localhost:5000/api/auth/github/callback`
4. Copy the Client ID, generate a Client Secret

### 3. Environment variables
```bash
cp .env.example server/.env
# then fill in server/.env with your Mongo URI, GitHub OAuth creds, etc.
```

### 4. Install & run

**Backend:**
```bash
cd server
npm install
npm run dev      # requires nodemon; or `npm start`
```
Visit http://localhost:5000/api/health — should return a JSON success message.

**Frontend:**
```bash
cd client
npm install
npm run dev
```
Visit http://localhost:5173 — should show "API status: CodeSmell Sentinel API is running"
once the backend is up and `MONGO_URI` is valid.

## Next: Day 2 — Authentication
GitHub OAuth login flow, JWT sessions, storing users in MongoDB.
