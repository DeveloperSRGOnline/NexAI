# NexAI — Architecture

> **Agent instruction**: This file is the single source of truth for all technology decisions. Do not introduce any library, service, or pattern not listed here without updating this file and getting explicit approval.

---

## 1. Tech Stack Table

| Layer | Technology | Version / Tier | Notes |
|---|---|---|---|
| **Frontend Framework** | React | 18 or 19 | Vite as bundler |
| **Styling** | SCSS Modules | — | No Tailwind, no CSS-in-JS |
| **State Management** | Zustand | Latest | Atomic slices; no Redux |
| **PWA** | Workbox | Latest | Via `vite-plugin-pwa` |
| **Rich Text Editor** | Tiptap | v2 | For document live preview |
| **Backend Runtime** | Node.js + Express | Node 20 LTS | REST API + LangGraph layer |
| **AI Model — Fast** | **Gemini 2.0 Flash** | `gemini-2.0-flash` | Default for chat, RAG, summaries, tags |
| **AI Model — Complex** | **Gemini 2.5 Pro** | `gemini-2.5-pro` | Agentic tasks, doc generation, long reasoning |
| **AI SDK** | `@google/generative-ai` | Latest | Backend-only; never in client bundle |
| **AI Orchestration** | LangGraph (JS/TS) | Latest | Multi-step agent pipelines |
| **Embeddings** | Gemini Text Embeddings | `text-embedding-004` | For Pinecone upsert |
| **Database** | MongoDB Atlas | M0 (512MB free) | Mongoose ODM |
| **Vector Store** | Pinecone | Starter (2GB, 5 indexes) | Cosine similarity search |
| **PDF Export** | `pdf-lib` | Latest | Pure JS — no Puppeteer |
| **DOCX Export** | `docx` | Latest | Pure JS — no Puppeteer |
| **Authentication** | Custom Google OAuth + JWT | — | ⚠️ Intentional — NOT Clerk (see note below) |
| **Push Notifications** | Web Push + VAPID | — | `web-push` npm package on server |
| **Client Encryption** | Web Crypto API | Browser built-in | PBKDF2 + AES-GCM for Secrets Vault |
| **Frontend Host** | Vercel Hobby | Free | Static + edge functions |
| **Backend Host** | Render | Free web service | 750 hrs/mo, ~30-60s cold start |
| **HTTP Client** | `axios` or `fetch` | — | Frontend API calls |
| **Schema Validation** | Zod | Latest | Backend mutation routes only |
| **Stock Images** | Unsplash / Pexels API | Free tier | On-demand document image insertion |
| **Voice I/O** | Web Speech API | Browser built-in | Phase 3 |

### ⚠️ Auth Decision Note
> Custom Google OAuth + JWT is used **intentionally** over Clerk/Auth.js.
> The Chrome Extension companion (Phase 4) must share the same authentication session as the main PWA.
> Clerk's session model is scoped to browser tabs and cannot be accessed from an extension service worker.
> The custom JWT flow allows the extension popup to read the token from `chrome.storage.local` after the user authenticates in the main app, enabling seamless shared sessions without re-authentication.

---

## 2. System Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│                                                         │
│  ┌──────────────────┐    ┌──────────────────────────┐  │
│  │  React PWA       │    │  Chrome Extension        │  │
│  │  (Vercel)        │    │  (Manifest V3)           │  │
│  │  Zustand store   │    │  Popup + Content Script  │  │
│  │  Workbox SW      │    │  Shares JWT via          │  │
│  │  Web Crypto API  │    │  chrome.storage.local    │  │
│  └────────┬─────────┘    └──────────┬───────────────┘  │
└───────────┼──────────────────────────┼──────────────────┘
            │ HTTPS + JWT              │ HTTPS + JWT
            ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│                   SERVER LAYER (Render)                  │
│                                                         │
│  Express REST API                                        │
│  ├── /auth          Google OAuth → issue JWT            │
│  ├── /chat          Streaming Gemini responses          │
│  ├── /library       Save, tag, embed, search            │
│  ├── /documents     Generate, edit, export              │
│  ├── /prompts       CRUD Prompt Vault                   │
│  ├── /snippets      Code snippet manager                │
│  ├── /flashcards    Spaced repetition                   │
│  ├── /secrets       Store ciphertext only               │
│  ├── /push          Web Push subscription mgmt          │
│  └── /health        Render cold-start probe             │
│                                                         │
│  LangGraph Agent Layer                                   │
│  ├── RAG Tool       Pinecone query → context injection  │
│  ├── Doc Tool       Structured section generation       │
│  ├── Memory Tool    Long-term user memory retrieval     │
│  └── Search Tool    Unified search orchestration        │
│                                                         │
│  Cron Jobs                                               │
│  ├── linkChecker.cron.js   (daily HEAD checks)          │
│  ├── digest.cron.js        (weekly summaries)           │
│  └── reminders.cron.js     (push notification dispatch) │
└──────┬───────────────────────────────┬──────────────────┘
       │                               │
       ▼                               ▼
┌──────────────┐              ┌────────────────────┐
│ MongoDB Atlas│              │  Pinecone Starter   │
│ M0 (512MB)   │              │  2GB vector index   │
│ Mongoose ODM │              │  text-embedding-004 │
└──────────────┘              └─────────────────────┘
                                        │
                              ┌─────────▼──────────┐
                              │   Gemini API        │
                              │  (backend-only)     │
                              │  gemini-2.0-flash   │
                              │  gemini-2.5-pro     │
                              │  text-embedding-004 │
                              └─────────────────────┘
```

---

## 3. System Invariants (Hard Rules — Never Violate)

### Security
1. **Gemini API keys NEVER in client bundle** — set via `process.env` on Render, accessed only server-side
2. **Vault plaintext NEVER sent to server** — encrypt with Web Crypto before any `fetch()`
3. **All mutation routes require `Authorization: Bearer <jwt>` header** — enforced by `authMiddleware`
4. **Zod validates every request body on mutation routes** — reject at the edge, not deep in business logic
5. **JWT secret in env variable only** — never hardcoded

### Data Integrity
6. **Suggest → Review → Confirm** for all agent-initiated data mutations
7. **No silent tagging/summarizing** — always show a confirm step to the user
8. **No bulk Pinecone re-embedding without user confirmation** — quota protection

### Resource Management
9. **No Puppeteer, no headless Chrome** — use `pdf-lib` and `docx` only
10. **Gemini image generation is opt-in per section per click** — never automatic
11. **MongoDB connection pooled** — `mongoose.connect()` once, reuse; graceful reconnect on cold start
12. **Render health endpoint** (`GET /health → 200 OK`) must respond in < 5s always

---

## 4. Data Flow Specifications

### A. Library Save Flow
```
User input (URL / file / extension)
  → POST /library/save
  → authMiddleware (JWT verify)
  → Zod validate body
  → Fetch/extract content (URL → cheerio, file → buffer)
  → gemini.service: summarize + generate tags (Gemini 2.0 Flash)
  → pinecone.service: embed (text-embedding-004) → upsert
  → MongoDB: save libraryItem with vectorId
  → Response: { suggestedSummary, suggestedTags } ← show to user for confirm
  → User confirms → PATCH /library/:id/confirm
  → libraryItem.status = 'confirmed'
```

### B. Chat + RAG Flow
```
User message
  → POST /chat/message (streaming)
  → authMiddleware
  → Query embedded (text-embedding-004)
  → Pinecone: top-k search across library + documents + notes namespace
  → Retrieved context + chat history → LangGraph agent
  → Agent selects: answer directly OR call tool
  → Response streamed via SSE / ReadableStream
  → Message pair saved to messages collection
```

### C. Document Generation Flow
```
User request (chat or /documents page)
  → LangGraph: structured section generation (Gemini 2.5 Pro)
  → Response: [{ heading, body }, ...] JSON
  → Rendered in Tiptap split-pane preview
  → User edits inline (local state)
  → "Add image" click → choose source → insert imageUrl into section
  → Export click → pdf-lib / docx renders → file download
  → Auto: POST /documents/save + POST /library/save (indexed)
```

### D. Secrets Vault Flow
```
User unlocks vault (enters master password)
  → Web Crypto: PBKDF2(password, salt) → AES-GCM key (never leaves browser)
  → GET /secrets → returns [{ ciphertext, iv }]
  → Browser: AES-GCM decrypt → plaintext shown locally
  
User saves new secret:
  → Browser: AES-GCM encrypt → { ciphertext, iv }
  → POST /secrets → store ciphertext + iv only
  → Plaintext NEVER in request body
```

---

## 5. Folder Structure Contract

```
nexai/
├── web-app/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Chat/
│   │   │   ├── Library/
│   │   │   ├── Documents/
│   │   │   ├── Prompts/
│   │   │   ├── DevTools/
│   │   │   ├── Focus/
│   │   │   ├── Analytics/
│   │   │   ├── Security/
│   │   │   └── Settings/
│   │   ├── components/
│   │   │   ├── Sidebar/
│   │   │   ├── CommandPalette/
│   │   │   ├── Toast/
│   │   │   └── [feature-components]/
│   │   ├── store/
│   │   │   ├── authStore.js
│   │   │   ├── chatStore.js
│   │   │   ├── libraryStore.js
│   │   │   ├── documentStore.js
│   │   │   ├── promptStore.js
│   │   │   └── uiStore.js
│   │   ├── lib/
│   │   │   ├── apiClient.js       # axios instance with JWT interceptor
│   │   │   ├── auth.js            # Google OAuth helpers
│   │   │   ├── crypto.js          # Web Crypto API wrappers
│   │   │   ├── pdfExport.js       # pdf-lib helpers
│   │   │   └── docxExport.js      # docx helpers
│   │   ├── pwa/
│   │   │   ├── sw.js              # Workbox service worker
│   │   │   └── manifest.json
│   │   └── styles/
│   │       ├── _tokens.scss       # Design tokens
│   │       ├── _reset.scss
│   │       └── global.scss
│   ├── public/
│   └── vite.config.js
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connect + pool
│   │   │   ├── pinecone.js        # Pinecone client init
│   │   │   └── env.js             # Validated env variables
│   │   ├── models/                # Mongoose schemas (see data-models.md)
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── library.routes.js
│   │   │   ├── documents.routes.js
│   │   │   ├── prompts.routes.js
│   │   │   ├── snippets.routes.js
│   │   │   ├── flashcards.routes.js
│   │   │   ├── secrets.routes.js
│   │   │   └── push.routes.js
│   │   ├── controllers/           # Request handling only
│   │   ├── services/
│   │   │   ├── gemini.service.js
│   │   │   ├── pinecone.service.js
│   │   │   └── documentExport.service.js
│   │   ├── agents/
│   │   │   ├── graph.js           # LangGraph graph definition
│   │   │   └── tools/
│   │   │       ├── ragTool.js
│   │   │       ├── docTool.js
│   │   │       ├── memoryTool.js
│   │   │       └── searchTool.js
│   │   ├── jobs/
│   │   │   ├── linkChecker.cron.js
│   │   │   ├── digest.cron.js
│   │   │   └── reminders.cron.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js  # JWT verify
│   │   │   ├── error.middleware.js # Centralized error handler
│   │   │   └── validate.middleware.js # Zod validator wrapper
│   │   └── app.js
│   └── package.json
│
├── extension-companion/
│   ├── src/
│   │   ├── background/
│   │   ├── content-scripts/
│   │   └── popup/
│   └── manifest.json
│
├── docs/
├── context/
├── prompts/
├── agents.md
└── README.md
```

---

*Source: NexAI PRD Section 9 + architectural decisions formalized for agent context.*
