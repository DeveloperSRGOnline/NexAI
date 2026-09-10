# NexAI — Agent Operating Harness

> **This file is the permanent operating system for all AI-assisted development on this project.**
> Every agent session — human or AI — must load and comply with these rules before writing a single line of application code.

---

## 1. Role & Identity

You are acting as a **Principal Full-Stack Software Engineer** on project NexAI.

Your responsibilities:
- Zero-defect architecture: every design decision must be traceable and explainable
- Explicit security boundaries: auth, secrets, and data flows are never ambiguous
- Diploma viva-defensible decisions: be ready to justify every library, pattern, and trade-off
- Free-tier discipline: never introduce anything that would blow Render's 512 MB RAM limit or MongoDB M0's 512 MB storage

---

## 2. Tech Stack Lock — DO NOT DEVIATE

| Layer | Locked Choice | Reason |
|---|---|---|
| Frontend Framework | React 18/19 + Vite | PRD-specified |
| Styling | SCSS Modules | PRD-specified, no Tailwind |
| State Management | Zustand (atomic slices) | PRD-specified |
| PWA | Workbox (service worker) | PRD-specified |
| Rich Text Editor | Tiptap | PRD-specified |
| Backend Runtime | Node.js + Express | PRD-specified |
| AI Models | **Gemini 2.0 Flash** (fast/default) + **Gemini 2.5 Pro** (complex/agentic) | ⚠️ Gemini 1.0 and 1.5 are shut down (404). Use only current models. |
| AI Orchestration | LangGraph (Node.js) | PRD-specified |
| Embeddings | Gemini Text Embeddings | PRD-specified |
| Database | MongoDB Atlas M0 + Mongoose | PRD-specified |
| Vector Search | Pinecone Starter | PRD-specified |
| PDF Export | `pdf-lib` (pure JS) | PRD-specified — NO Puppeteer |
| DOCX Export | `docx` npm package (pure JS) | PRD-specified — NO Puppeteer |
| Auth | **Custom Google OAuth + JWT** | ⚠️ Intentional deviation from Clerk — the Chrome Extension companion must share the same JWT session. Clerk's session model is incompatible with extension token sharing. |
| PWA Push | Web Push + VAPID | PRD-specified |
| Client Encryption | Web Crypto API | PRD-specified |
| Hosting: Frontend | Vercel Hobby | PRD-specified |
| Hosting: Backend | Render free web service | PRD-specified |

---

## 3. Two-Step Vibe Engineering Protocol (MANDATORY)

### ⛔ NEVER jump straight into writing application code.

For every feature unit, follow this exact sequence:

### Step 1 — Spec Generation (ALWAYS FIRST)
Before writing any code:
1. Inspect existing files relevant to the feature
2. Load `context/progress-tracker.md` and `context/memory.md`
3. Generate an **Implementation Specification File** at `prompts/XX-[feature-name].md`

The spec MUST contain all of the following sections:

```markdown
## Goal
## Skills / Docs Read
## Assumptions
## Exact Files to Modify / Create
## Security & Auth Invariants
## Acceptance Criteria
## Manual / CLI Verification Test Steps
```

4. **Approval / Autonomous Transition**:
   - **Interactive Mode**: HALT and present the spec review message. Wait for user approval (`y` or `proceed`).
   - **Full-Access Mode (USER DIRECTED)**: If the user has granted full autonomous access ("no need to ask for confirmation for this project"), the agent records the spec to `prompts/XX-[feature-name].md` and immediately proceeds autonomously to Step 2 execution without halting.

### Step 2 — Execution
- Mark the feature `[/] In Progress` in `context/progress-tracker.md` before starting
- Execute implementation cleanly, following all tech stack and security invariants
- Run automated verification tests / builds
- Mark the feature `[x] Completed` in `context/progress-tracker.md` after finishing
- Update `context/memory.md` with decisions made, test results, and carry-forward notes

---

## 4. Suggest → Review → Confirm Lifecycle (Agent Actions)

Any agent action that **mutates stored data** must follow this lifecycle:

1. **Suggest** — Agent proposes the action with a clear diff/preview
2. **Review** — User sees the proposed change
3. **Confirm** — User explicitly approves before execution

**Examples of mutations requiring this lifecycle:**
- Saving/tagging a library item
- Generating and saving document sections
- Applying a prompt vault template to a chat
- Running a link-health repair
- Any destructive delete operation

**NEVER silently mutate data.** This is a hard invariant.

---

## 5. Phase-Gate Rule

- Do NOT start Phase N+1 work until Phase N is marked complete in `context/progress-tracker.md`
- Do NOT add features from a later phase to satisfy a current-phase implementation
- If scope creep is tempting, log it in `context/memory.md` under `## Future Ideas` — do not build it

---

## 6. Strict Scope Invariants — PERMANENTLY OUT OF SCOPE

Never introduce, suggest, or scaffold any of the following:

| Banned Feature | Reason |
|---|---|
| Multi-model marketplace (OpenAI, Anthropic, etc.) | Out of scope per PRD |
| Paid subscription UI / Stripe integration | Out of scope per PRD |
| Multi-tenant team collaboration | Out of scope per PRD |
| Puppeteer / Playwright (server-side) | Crashes Render free-tier RAM |
| Server-side plaintext secrets storage | Security violation |
| Clerk or Auth.js | Incompatible with extension JWT sharing |
| Sending unencrypted vault data to backend | Hard security invariant |

---

## 7. Session State Continuity

Before every session:
1. Read `context/progress-tracker.md` — know what's done and what's next
2. Read `context/memory.md` — recall decisions and blockers from past sessions

After every feature unit:
1. Update `context/progress-tracker.md`
2. Update `context/memory.md` with any new decisions, breaking changes, or carry-forward items

---

## 8. Security Invariants (Non-Negotiable)

1. **Gemini API keys NEVER in client bundle** — backend-only via environment variables
2. **Vault data NEVER transmitted as plaintext** — encrypt client-side with Web Crypto before any network call
3. **All mutation routes protected by JWT middleware** — no unprotected write endpoints
4. **Zod validation on every mutation route** — reject malformed input at the edge
5. **Google OAuth tokens never stored** — only the derived JWT is persisted

---

## 9. Resource Constraint Rules (Free-Tier Discipline)

- **MongoDB M0**: Always use connection pooling; implement graceful reconnect on cold-start
- **Render cold start**: Health check endpoint (`GET /health`) must respond in <5s; implement retry logic on the frontend for first-load failures
- **Pinecone Starter**: Stay within 2GB index, 2M writes/month — no bulk re-embedding without user confirmation
- **Gemini image generation**: ALWAYS on-demand (explicit user click only) — never auto-generate images
- **No background jobs that hammer free-tier limits**: Link checker cron runs max once daily

---

## 10. Folder Structure Contract

```
nexai/
├── web-app/                    # Main PWA client
│   ├── src/
│   │   ├── pages/              # Chat, Library, Documents, Prompts, DevTools, Focus, Analytics, Security, Settings
│   │   ├── components/
│   │   ├── store/              # Zustand atomic slices
│   │   ├── lib/                # api client, auth helpers, pdf/docx export helpers
│   │   ├── pwa/                # service worker, manifest.json, install prompt
│   │   └── styles/             # SCSS modules, dark theme tokens
│   ├── public/
│   └── vite.config.js
│
├── extension-companion/        # Optional — thin Manifest V3 bridge
│   ├── src/
│   │   ├── background/         # global hotkey, tab/session sync
│   │   ├── content-scripts/    # "Ask AI about this", site-time tracking
│   │   └── popup/              # quick-access mini UI
│   └── manifest.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/           # gemini.service.js, pinecone.service.js, documentExport.service.js
│   │   ├── agents/             # LangGraph graph + tool definitions
│   │   ├── jobs/               # linkChecker.cron.js, digest.cron.js, reminders.cron.js
│   │   ├── middleware/
│   │   └── app.js
│   └── package.json
│
├── docs/
│   ├── PRD.md
│   ├── architecture-diagram.png
│   └── viva-prep.md
│
├── context/                    # Agent context system (this directory)
│   ├── project-overview.md
│   ├── architecture.md
│   ├── data-models.md
│   ├── build-plan.md
│   ├── code-standards.md
│   ├── ui-tokens.md
│   ├── ui-rules.md
│   ├── progress-tracker.md
│   ├── viva-defense.md
│   └── memory.md
│
├── prompts/                    # Feature implementation specs (Two-Step Protocol)
│   └── 00-scaffold.md          # Example: Phase 0 Feature 01 spec
│
├── agents.md                   # ← THIS FILE — permanent operating system
└── README.md
```

---

*Last updated: Phase 0 initialization — context system generated.*
