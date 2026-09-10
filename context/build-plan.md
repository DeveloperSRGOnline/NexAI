# NexAI — Build Plan

> **Agent instruction**: This is the master execution roadmap. Never start Phase N+1 until Phase N is fully marked `[x]` in `context/progress-tracker.md`. Read this file before generating any implementation spec.

---

## Phase 0 — Core MVP (Base Capstone)

> **Goal**: A fully defensible, deployable capstone. Phase 0 alone is enough to pass.

### Feature 01 — Workspace Scaffolding & Base PWA Shell
- Initialize monorepo: `web-app/` (Vite + React), `server/` (Node + Express), `context/`, `prompts/`, `docs/`
- Configure `vite.config.js` with SCSS Modules support
- Set up `vite-plugin-pwa` with Workbox service worker
- Create `public/manifest.json` (installability)
- Scaffold all page stubs: Chat, Library, Documents, Prompts, Settings
- Set up SCSS token system (`styles/_tokens.scss`)
- Set up Zustand store stubs
- Render deploy config (`render.yaml`) + `GET /health` endpoint
- Vercel deploy config (`vercel.json`)

### Feature 02 — Google OAuth + JWT Authentication
- Google OAuth 2.0 flow (backend-only, redirect-based)
- `POST /auth/google/callback` → issue JWT (HS256, `jsonwebtoken`)
- JWT stored in `httpOnly` cookie (NOT localStorage)
- `authMiddleware.js` — verify JWT on all protected routes
- Frontend: auth state in Zustand `authStore`, redirect on 401
- Protected route component wrapper
- Logout endpoint + cookie clear

### Feature 03 — Base App Shell & Sidebar
- Persistent left sidebar with mode switcher (General / Developer / Student / Power-User)
- Active page highlighting, collapsible on mobile
- Top header with user avatar, search button, `Ctrl+K` placeholder
- Dark-mode-first responsive layout
- Route structure: React Router v6 with protected routes

### Feature 04 — Core Streaming Chat
- `POST /chat/message` with streaming response (Server-Sent Events)
- Gemini 2.0 Flash integration via `gemini.service.js`
- Frontend: streaming text render with cursor animation
- Chat list sidebar (create, rename, delete, pin)
- Message history load from `messages` collection
- Auto-title generation for new chats (Gemini Flash, 3-word summary)
- Empty state + first-message onboarding copy

### Feature 05 — Personal Knowledge Library (Save + Embed + Confirm)
- `POST /library/save` — accept URL or note text
- URL content extraction (cheerio / built-in fetch)
- Gemini Flash: generate summary + suggest tags
- Pinecone: embed (text-embedding-004) + upsert
- Frontend: confirm dialog showing suggested summary + tags (editable)
- Library list view with search, filter by type/tag/folder
- `PATCH /library/:id/confirm` — finalize after user confirms
- `DELETE /library/:id` with confirmation

### Feature 06 — Chat with RAG
- On each chat message: embed query → Pinecone top-k search
- Inject retrieved context into Gemini prompt
- LangGraph basic setup (single `ragTool` node)
- Display "Sources" citation panel below AI response
- Namespace separation: `library`, `documents`, `notes`

### Feature 07 — Basic Settings Page
- User profile display (name, avatar, email — read-only from Google)
- `globalInstructions` text area (injected into every chat system prompt)
- Sidebar mode preference save
- Notification preferences toggle
- Theme toggle (dark/light)
- `PATCH /users/settings` endpoint

---

## Phase 1 — Key Differentiators

> **Goal**: Features that make NexAI feel like a real AI app, not a bookmark manager.

### Feature 08 — AI Document Generator
- Dedicated `/documents` page with two-panel layout
- Chat-style input: "Write a report on X"
- Gemini 2.5 Pro: generate structured `[{ heading, body }]` JSON
- Tiptap editor renders sections in right panel (live editing)
- Add/remove/reorder sections
- "Add Image" per section → modal: upload / Unsplash search / AI-generate (explicit click)
- `pdf-lib` export → download as PDF
- `docx` export → download as DOCX
- Auto-save document to `documents` collection + index into Library

### Feature 09 — Prompt Vault
- `/prompts` page: grid/list view of saved prompts
- Create/edit prompt with `{{variable}}` template syntax
- Auto-extract variable names on save (regex: `/\{\{(\w+)\}\}/g`)
- Variable fill form (popover) on prompt use
- "Use in chat" → inject filled prompt into new chat as first message
- Pin, tag, search prompts
- `useCount` increment on each use

### Feature 10 — Unified Global Search
- `GET /search?q=` → parallel queries:
  - Pinecone semantic search (top-5 per namespace)
  - MongoDB `$text` search on libraryItems + snippets
  - Exact title match on prompts + documents
- Frontend: merged results grouped by type
- Click to navigate to source

### Feature 11 — Command Palette (`Ctrl/Cmd + K`)
- Global keyboard shortcut registered in root layout
- Fuzzy-search over: pages, library items, prompts, commands (New Chat, Export, etc.)
- Keyboard navigation (arrow keys + Enter)
- Recent items shown by default

---

## Phase 2 — Depth

> **Goal**: Make NexAI indispensable for daily use.

### Feature 12 — File & Document Upload + Multimodal Analysis
- File upload UI (drag-and-drop) for PDF, image, text files
- Gemini 2.5 Pro: analyze/OCR uploaded file
- Extracted text chunked + embedded into Pinecone
- Shows in Library as `type: 'file'`

### Feature 13 — Developer Utilities
- Code Snippet Manager (CRUD, language filter, copy button)
- JSON Formatter / Validator (client-side, `JSON.parse` + `JSON.stringify`)
- Regex Tester (live match highlighting with `String.prototype.matchAll`)
- Internal API Tester (method, URL, headers, body → `fetch()`)

### Feature 14 — Learning & Study Suite
- Flashcard generator (from Library item or document → Gemini Flash)
- Flashcard review UI (flip animation, SM-2 algorithm rating: Again / Hard / Good / Easy)
- YouTube summarizer (paste URL → extract transcript via YouTube API → Gemini Flash summary)
- Flashcard collection management

### Feature 15 — Productivity / Focus Features
- Reminders (set reminder on any library item or document → Web Push at remindAt)
- Quiet Hours configuration (suppress push during hours)
- Basic workspace sessions (manual URL list, no extension required)

### Feature 16 — Onboarding Flow
- First-run wizard (3 steps: Mode selection → Global instructions → Import first link)
- Skip option
- Shown only on first login (`user.onboardingComplete` flag)

---

## Phase 3 — Power-User Layer

### Feature 17 — App Usage Analytics (Dashboard)
- `/analytics` page showing: messages sent, library items saved, documents exported, prompts used
- Line chart (last 30 days) using lightweight chart library (Chart.js or recharts)
- Focus score display
- Data sourced from `usageStats` collection

### Feature 18 — Secrets Vault
- `/security` page with master-password lock UI
- Web Crypto: `PBKDF2(password, salt, 310000, 256, SHA-256)` → AES-GCM key
- Store/retrieve `{ ciphertext, iv, salt }` — never plaintext
- CRUD for secrets with label + masked value display
- Copy-to-clipboard (decrypt → copy → clear clipboard after 30s)

### Feature 19 — Creative Writing Suite
- Genre/style/tone selector
- Multi-chapter continuation
- Character + world-building notes panel

### Feature 20 — Voice I/O
- Web Speech API: `SpeechRecognition` for voice input to chat
- `SpeechSynthesis` for reading AI responses aloud
- Toggle button in chat UI

---

## Phase 4 — Extension Bridge (Optional — Only If Time Remains)

> **Viva tip**: The global hotkey extension is the single most impressive live demo moment.

### Feature 21 — Chrome Extension Scaffold (Manifest V3)
- Minimal `manifest.json` with `commands`, `action`, `host_permissions`
- Service worker (`background.js`) for global hotkey
- Popup UI (React, minimal) with auth check

### Feature 22 — Extension Authentication (JWT Sharing)
- After OAuth in main PWA, JWT written to `chrome.storage.local`
- Extension reads JWT from storage → attaches to API requests
- Token refresh handling

### Feature 23 — Quick-Access Popup
- Global hotkey opens popup from anywhere in the OS
- Chat input → sends to same `/chat/message` endpoint
- "Open full app" link for complex queries

### Feature 24 — Page Intelligence ("Ask AI about this page")
- Content script injected on all pages (user-permissioned)
- Context menu item: "Ask NexAI about this"
- Captures page text → opens popup with page as context

### Feature 25 — Tab Session Manager
- Service worker captures current open tabs on command
- Saves as workspace session to `sessions` collection
- Restore session reopens all tabs

---

## Phase Summary

| Phase | Features | Deliverable |
|---|---|---|
| 0 | 01–07 | Fully deployable capstone MVP |
| 1 | 08–11 | Differentiated, demo-worthy AI app |
| 2 | 12–16 | Daily-use depth and retention |
| 3 | 17–20 | Power-user layer |
| 4 | 21–25 | Companion extension bridge |
