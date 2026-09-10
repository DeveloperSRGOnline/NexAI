# Feature Spec 01 — Workspace Scaffolding & Base PWA Shell

## Goal
Scaffold the core monorepo structure for NexAI, establishing the frontend client (`web-app/`) with Vite, React 19/18, SCSS modules, CSS custom properties / design tokens, Workbox PWA service worker, manifest.json, page stubs, Zustand atomic store stubs, and React Router v6; and the backend service (`server/`) with Node.js, Express, health probe (`GET /health`), deployment manifests (`render.yaml`, `vercel.json`), root `.gitignore`, root workspace scripts, git repository initialization, and a structured baseline for version control and remote deployment.

## Skills / Docs Read
- `AGENTS.md` (Agent Operating Harness, Tech Stack Lock, Two-Step Vibe Protocol)
- `context/progress-tracker.md` (Feature 01 checklist items)
- `context/memory.md` (Architecture Decisions 001-005, cold-start handling, model lock)
- `context/build-plan.md` (Phase 0 Feature 01 requirements)
- `context/code-standards.md` (SCSS modules, BEM, Zustand atomic slices, Express controller-service-repo structure, error handling)
- `context/ui-tokens.md` (Dark-first design tokens, CSS variables, typography, spacing, surface colors)
- `context/architecture.md` (System architecture, tech stack tiering)
- `modern-web-guidance` (Modern PWA standards, service worker lifecycle, manifest specifications)

## Assumptions
1. Frontend will be built using Vite + React + Sass (`sass`), utilizing SCSS modules (`*.module.scss`) and CSS variables from `_tokens.scss`.
2. PWA setup will leverage `vite-plugin-pwa` with Workbox for service worker registration and caching strategies, complemented by `manifest.json`.
3. Backend will be an ES-module Node.js Express server (`"type": "module"`) running on port 5000 (configurable via `PORT`), with a lightweight, non-blocking `GET /health` endpoint that returns `<5ms` responses (satisfying Decision 005 for Render cold starts).
4. Root workspace contains orchestration scripts (`dev:client`, `dev:server`, `build`, etc.) to run or build both client and server cleanly.
5. Git repository will be initialized locally (`git init -b main`) with a root `.gitignore` protecting secrets (`.env`, `*.pem`), build artifacts (`dist/`), and dependency directories (`node_modules/`). Since GitHub CLI (`gh`) is not installed on the system, the user will be provided with the exact commands / options to link their new GitHub remote repository.

## Exact Files to Modify / Create

### Root Configuration
- `package.json` [NEW] — Monorepo root scripts (`dev:client`, `dev:server`, `build`, etc.)
- `.gitignore` [NEW] — Git ignore rules for Node, Vite, logs, environment variables, OS files
- `render.yaml` [NEW] — Render Blueprint deployment configuration for the Express service
- `vercel.json` [NEW] — Vercel routing / SPA rewrites configuration for `web-app`
- `README.md` [NEW] — Project overview, architecture summary, and local development setup

### Backend (`server/`)
- `server/package.json` [NEW] — Dependencies (`express`, `cors`, `dotenv`, `helmet`, `cookie-parser`, `zod`)
- `server/.env.example` [NEW] — Template for required environment variables
- `server/src/app.js` [NEW] — Express app initialization, middleware pipeline, health check route, and error handler
- `server/src/config/env.js` [NEW] — Centralized environment configuration
- `server/src/middleware/error.middleware.js` [NEW] — Centralized error handler avoiding stack traces in production
- `server/src/routes/health.routes.js` [NEW] — Fast `/health` endpoint returning uptime and status

### Frontend (`web-app/`)
- `web-app/package.json` [NEW] — Frontend dependencies (`react`, `react-dom`, `react-router-dom`, `zustand`, `axios`, `lucide-react`, `sass`, `vite`, `vite-plugin-pwa`)
- `web-app/vite.config.js` [NEW] — Vite configuration with SCSS module support, path aliases, and `VitePWA`
- `web-app/index.html` [NEW] — HTML entrypoint referencing fonts (Inter, JetBrains Mono) and PWA manifest
- `web-app/public/manifest.json` [NEW] — Web App Manifest (NexAI branding, standalone mode, dark theme colors)
- `web-app/public/favicon.svg` [NEW] — App SVG icon
- `web-app/src/main.jsx` [NEW] — React entrypoint wrapping Router and App
- `web-app/src/App.jsx` [NEW] — App shell with navigation layout and route declarations
- `web-app/src/styles/_tokens.scss` [NEW] — Full CSS custom properties & SCSS tokens from `context/ui-tokens.md`
- `web-app/src/styles/global.scss` [NEW] — Base CSS resets, typography, and dark canvas backgrounds
- `web-app/src/store/authStore.js` [NEW] — Zustand auth slice stub
- `web-app/src/store/chatStore.js` [NEW] — Zustand chat slice stub
- `web-app/src/store/libraryStore.js` [NEW] — Zustand library slice stub
- `web-app/src/store/documentStore.js` [NEW] — Zustand document generator slice stub
- `web-app/src/store/uiStore.js` [NEW] — Zustand UI/sidebar slice stub
- `web-app/src/lib/apiClient.js` [NEW] — Configured Axios client with 30s timeout and 401 interceptor
- `web-app/src/pages/Chat/ChatPage.jsx` [NEW] & `ChatPage.module.scss` [NEW] — Chat stub page
- `web-app/src/pages/Library/LibraryPage.jsx` [NEW] & `LibraryPage.module.scss` [NEW] — Library stub page
- `web-app/src/pages/Documents/DocumentsPage.jsx` [NEW] & `DocumentsPage.module.scss` [NEW] — Documents stub page
- `web-app/src/pages/Prompts/PromptsPage.jsx` [NEW] & `PromptsPage.module.scss` [NEW] — Prompts stub page
- `web-app/src/pages/Settings/SettingsPage.jsx` [NEW] & `SettingsPage.module.scss` [NEW] — Settings stub page
- `web-app/src/components/layout/AppLayout.jsx` [NEW] & `AppLayout.module.scss` [NEW] — Base responsive app shell with header and sidebar navigation

### Progress Tracking
- `context/progress-tracker.md` [MODIFY] — Update Feature 01 checklist items and status
- `context/memory.md` [MODIFY] — Record scaffolding completions and Git setup status

## Security & Auth Invariants
1. `server/.env` must never be tracked by git; `.gitignore` must explicitly prevent committing any `.env` files.
2. `web-app` must never reference Gemini API keys directly; all AI keys remain strictly backend-only.
3. `/health` endpoint must NOT query the database or require authentication, responding in <5ms to avoid cold-start timeouts.
4. Express must be hardened with `helmet`, parameterized `cors` with `credentials: true`, and strict JSON payload limits.

## Acceptance Criteria
- [ ] Root folder structure created according to `AGENTS.md` section 10.
- [ ] `server/` runs via `npm run dev:server`, responds with HTTP 200 on `GET http://localhost:5000/health`.
- [ ] `web-app/` builds via `npm run build` with zero errors and runs locally via `npm run dev:client`.
- [ ] All 5 core routes (`/`, `/library`, `/documents`, `/prompts`, `/settings`) navigate correctly.
- [ ] PWA manifest and service worker configuration are active and valid.
- [ ] SCSS design token system is injected into `:root` and consumed by page stubs.
- [ ] Git repository is initialized on `main` branch, initial commit created with a clean working tree.
- [ ] Remote repository connection instructions verified and ready to push once remote URL is supplied.

## Manual / CLI Verification Test Steps
1. Run `npm install` in `server/` and verify successful install.
2. Run `npm install` in `web-app/` and verify successful install.
3. Start backend (`npm run dev:server` or `node server/src/app.js`) and curl `http://localhost:5000/health` -> verify `{ "status": "ok", ... }`.
4. Run `npm run build` in `web-app/` to verify Vite bundling, SCSS modules compilation, and PWA manifest generation.
5. Verify git status has no untracked untamed files (node_modules ignored, .env ignored).
6. Create initial commit `feat(core): scaffold monorepo workspace and base PWA shell`.
