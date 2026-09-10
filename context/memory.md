# NexAI — Session Memory & Decision Log

> **Agent instruction**: Update this file after every feature unit. Record decisions made, breaking changes discovered, and any unfinished work that carries forward. Read this file at the start of every new session BEFORE reading progress-tracker.md.

---

## ⚡ Current Session State

| Field | Value |
|---|---|
| **Session Start** | 2026-09-10 |
| **Phase** | Phase 0 — Core MVP |
| **Status** | Feature 02 completed — ready to begin Feature 03 (Base App Shell & Sidebar) |
| **Unfinished Work** | None |

---

## Architecture Decisions Log

### Decision 001 — Custom Google OAuth + JWT (not Clerk)
- **Date**: 2026-09-10
- **Decision**: Use custom Google OAuth 2.0 → JWT flow instead of Clerk or Auth.js
- **Reason**: Phase 4 Chrome Extension must share the same authentication session. Clerk's session model is browser-tab-scoped and cannot be accessed from a Chrome extension service worker. Custom JWT stored in `chrome.storage.local` by the extension after the user authenticates in the main app enables seamless shared sessions.
- **Impact**: Requires implementing Google OAuth callback route manually; no Clerk dashboard; JWT refresh logic must be built manually.
- **Irreversible**: Yes — switching auth systems mid-project would require database migration and client-side refactor.

### Decision 002 — Model Names (Corrected from PRD)
- **Date**: 2026-09-10
- **Decision**: Use `gemini-2.0-flash` (not `gemini-1.5-flash`) and `gemini-2.5-pro` (not `gemini-1.5-pro`)
- **Reason**: Gemini 1.0 and 1.5 are shut down as of 2026 and return 404 errors. Current lineup: Gemini 2.0 Flash (fast/default workhorse) and Gemini 2.5 Pro (complex reasoning/agentic tasks). The PRD contained outdated model names.
- **Impact**: All `gemini.service.js` code must use these model strings. Never reference 1.0 or 1.5.

### Decision 003 — pdf-lib + docx (not Puppeteer)
- **Date**: 2026-09-10
- **Decision**: Use `pdf-lib` for PDF export and `docx` npm package for DOCX export; zero Puppeteer
- **Reason**: Puppeteer spins up a headless Chrome browser which consumes ~200–400MB RAM. Render free-tier has 512MB total. This would cause OOM crashes in production.
- **Impact**: Export fidelity is slightly lower than browser-print-to-PDF, but it's reliable on free-tier and fast.

### Decision 004 — Secrets Vault Zero-Knowledge Architecture
- **Date**: 2026-09-10
- **Decision**: PBKDF2 + AES-GCM entirely client-side; only `{ ciphertext, iv, salt }` stored server-side
- **Reason**: Even if the MongoDB database or the server process is compromised, the attacker gets only encrypted blobs they cannot decrypt without the master password.
- **Impact**: Master password is NEVER sent to the server. If a user forgets their master password, their secrets are permanently unrecoverable (by design).

### Decision 005 — Render Free Tier Cold Start Handling
- **Date**: 2026-09-10
- **Decision**: `/health` endpoint responds instantly (no DB query); frontend shows "Waking up server..." skeleton; frontend retries once after 35 seconds
- **Reason**: Render free-tier spins down after 15 minutes of inactivity. Cold starts take 30–60 seconds. This must be handled gracefully or users will think the app is broken.
- **Impact**: First-time load experience is degraded but acceptable for a capstone/demo context.

### Decision 006 — Dual Token Verification & Disconnect-Tolerant Mock Fallback
- **Date**: 2026-09-10
- **Decision**: `authMiddleware` accepts either `httpOnly` cookie (`req.cookies.token`) or `Authorization: Bearer <token>`. In non-production without live MongoDB, auth falls back immediately to an in-memory dev cache with `bufferCommands: false` on Mongoose.
- **Reason**: Web client uses secure `httpOnly` cookies; Chrome Extension companion in Phase 4 uses `Authorization: Bearer` headers. Furthermore, developers or examiners running the project without an active MongoDB connection string will not experience 10-second Mongoose buffering timeouts or crashes.
- **Impact**: Clean, unified auth middleware across both clients; instant local dev experience.

---

## Breaking Changes Log

*(None yet — project just initialized)*

---

## Carry-Forward Items

*(None yet — project just initialized)*

---

## Unresolved Questions

| # | Question | Status |
|---|---|---|
| 1 | Which Unsplash/Pexels API to use for document image search? Both are free-tier compatible. | Open — decide in Feature 08 |
| 2 | Chunking strategy: fixed 500 tokens with 50 overlap, or paragraph-based? | Open — decide in Feature 05 |
| 3 | Message branching UI: tab-based or tree-based? | Open — decide in Feature 04 |

---

## Future Ideas (Phase 5+, Do Not Build Yet)

- Multi-language support (i18n)
- Dark/light theme auto-detection from OS preference
- Export library to Notion or Obsidian format
- Collaborative document review (read-only share link)
- Self-hosted deployment guide (Docker Compose)

---

## Environment Variables Checklist

All of these must be set before first deployment:

### Server (Render)
```
MONGODB_URI=           # MongoDB Atlas M0 connection string
GEMINI_API_KEY=        # Google AI Studio key
PINECONE_API_KEY=      # Pinecone Starter key
PINECONE_INDEX_NAME=   # e.g., nexai-library
JWT_SECRET=            # Random 64-char hex string
GOOGLE_CLIENT_ID=      # Google OAuth App client ID
GOOGLE_CLIENT_SECRET=  # Google OAuth App client secret
GOOGLE_CALLBACK_URL=   # https://your-render-url/auth/google/callback
FRONTEND_URL=          # https://your-vercel-url.vercel.app
VAPID_PUBLIC_KEY=      # Generated via web-push generate-vapid-keys
VAPID_PRIVATE_KEY=     # Generated via web-push generate-vapid-keys
NODE_ENV=production
```

### Frontend (Vercel)
```
VITE_API_URL=          # https://your-render-url.onrender.com
VITE_GOOGLE_CLIENT_ID= # Same as server
VITE_VAPID_PUBLIC_KEY= # Same as server VAPID_PUBLIC_KEY
```
