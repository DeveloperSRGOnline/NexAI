# Feature Spec 02 — Google OAuth + JWT Authentication

## Goal

Implement secure, end-to-end authentication for NexAI using custom Google OAuth 2.0 and JWTs (HS256) stored in `httpOnly` cookies, supported by MongoDB Atlas user persistence, centralized auth middleware (`auth.middleware.js`), a reactive frontend auth state slice in Zustand (`authStore`), a reusable `<ProtectedRoute />` React wrapper, a dedicated `/login` page with Google OAuth trigger (and development fallback), and a session termination / logout pipeline.

## Skills / Docs Read

- `AGENTS.md` (Agent Operating Harness: Decision 001 - Custom Google OAuth + JWT, free-tier discipline, security invariants)
- `context/progress-tracker.md` (Feature 02 checklist items)
- `context/memory.md` (Decision 001 — Custom Google OAuth + JWT vs Clerk for Chrome Extension sharing, Decision 005 — Render cold start)
- `context/build-plan.md` (Phase 0 Feature 02 requirements)
- `context/data-models.md` (Authoritative `users` Mongoose schema specification)
- `context/code-standards.md` (Backend controller-service-repo pattern, Zod validation, apiClient JWT interceptor, Zustand devtools slice)
- `context/ui-tokens.md` (Dark theme tokens, typography, surface colors, button styles)

## Assumptions

1. MongoDB connection will be managed via Mongoose in `server/src/config/db.js` with connection pooling, connecting on server start and handling reconnections gracefully without crashing Render instances.
2. Google OAuth 2.0 flow is handled server-side via `google-auth-library` or standard OAuth redirect flow: frontend initiates navigation to `GET /auth/google`, backend redirects to Google's OAuth consent screen, Google calls back `GET /auth/google/callback?code=...`, backend exchanges code for user profile, upserts user in MongoDB `users` collection, issues a signed JWT, sets an `httpOnly`, `SameSite=Lax` cookie, and redirects the browser back to `${FRONTEND_URL}/`.
3. To facilitate immediate local development, testing, and CI verification without requiring live Google Cloud Console credentials upfront, a development login route (`POST /auth/dev-login`) will be available in non-production (`NODE_ENV !== 'production'`), allowing instant mock authentication with test profiles.
4. JWT tokens will contain `{ userId: user._id, email: user.email }` signed with `JWT_SECRET` and expire in 7 days (`7d`).
5. Frontend calls `GET /auth/me` on app load via `apiClient` to verify session and populate `authStore`. If a 401 is received, `authStore.logout()` is called and unauthenticated users are directed to `/login`.

## Exact Files to Modify / Create

### Backend (`server/`)

- `server/package.json` [MODIFY] — Add `mongoose`, `jsonwebtoken`, `google-auth-library`
- `server/src/config/db.js` [NEW] — MongoDB Mongoose connection manager with pooling and error handling
- `server/src/models/User.js` [NEW] — Mongoose User model based on `context/data-models.md`
- `server/src/services/auth.service.js` [NEW] — Google OAuth URL generator, token exchange, user upsert, JWT signing, and session verification
- `server/src/controllers/auth.controller.js` [NEW] — HTTP handlers: `googleRedirect`, `googleCallback`, `getCurrentUser`, `logout`, `devLogin`
- `server/src/middleware/auth.middleware.js` [NEW] — JWT verification middleware extracting token from `httpOnly` cookie or `Authorization: Bearer` header
- `server/src/routes/auth.routes.js` [NEW] — Auth route definitions (`/auth/google`, `/auth/google/callback`, `/auth/me`, `/auth/logout`, `/auth/dev-login`)
- `server/src/app.js` [MODIFY] — Connect to MongoDB on boot, mount `/auth` routes
- `server/src/config/env.js` [MODIFY] — Export complete auth configuration (`jwtSecret`, Google OAuth credentials, cookie options)

### Frontend (`web-app/`)

- `web-app/src/lib/auth.js` [NEW] — Client auth helper functions (`loginWithGoogle`, `devLogin`, `logoutUser`, `fetchCurrentUser`)
- `web-app/src/store/authStore.js` [MODIFY] — Upgrade store with `checkAuth`, `isCheckingAuth`, `logout`, and reactive state
- `web-app/src/components/auth/ProtectedRoute.jsx` [NEW] — Route guard checking `isAuthenticated` and `isCheckingAuth`
- `web-app/src/pages/Auth/LoginPage.jsx` [NEW] & `LoginPage.module.scss` [NEW] — Auth landing page with Google Sign-In and dev-mode login
- `web-app/src/App.jsx` [MODIFY] — Register `/login` route, wrap core routes with `<ProtectedRoute />`, invoke `checkAuth()`
- `web-app/src/components/layout/AppLayout.jsx` [MODIFY] — Display user profile (avatar, name, email) and sign-out button in sidebar

### Progress & Memory Tracking

- `context/progress-tracker.md` [MODIFY] — Update Feature 02 status and checklist
- `context/memory.md` [MODIFY] — Log Feature 02 architectural notes and completion state

## Security & Auth Invariants

1. **JWT Secret Protection**: `JWT_SECRET` must be read strictly from environment variables; fallback is provided for local dev only.
2. **HttpOnly Cookie**: Auth cookie must be set with `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, and `secure: true` in production.
3. **No Password Stored**: No passwords or Google refresh tokens are stored in the database.
4. **Edge Validation**: All incoming auth mutations and requests validate credentials before querying the database.
5. **No Token Leakage**: The JWT cookie is never accessible to client-side scripts via `document.cookie`.

## Acceptance Criteria

- [ ] Backend dependencies installed (`mongoose`, `jsonwebtoken`, `google-auth-library`).
- [ ] `User` model created adhering exactly to `context/data-models.md`.
- [ ] `auth.middleware.js` verifies JWT from either `req.cookies.token` or `Authorization: Bearer <token>`, attaching `req.user`.
- [ ] Protected endpoints return 401 Unauthorized when no valid token is provided.
- [ ] `GET /auth/me` returns current user data when authenticated.
- [ ] `POST /auth/logout` clears the auth cookie and terminates session.
- [ ] Dev login endpoint (`POST /auth/dev-login`) functions in development mode for seamless local testing.
- [ ] Frontend displays dedicated `/login` page with Google OAuth trigger and Dev login helper.
- [ ] `<ProtectedRoute />` protects all private routes (`/`, `/library`, `/documents`, `/prompts`, `/settings`), redirecting unauthenticated visitors to `/login`.
- [ ] Authenticated state reflects user avatar, name, and email in sidebar footer.
- [ ] Logging out clears state and redirects back to `/login`.

## Manual / CLI Verification Test Steps

1. Run `npm install` in `server/` to install `mongoose`, `jsonwebtoken`, `google-auth-library`.
2. Start server (`npm run dev:server`) and verify `GET http://localhost:5000/auth/me` returns 401 Unauthorized.
3. Test dev login via curl: `curl -X POST http://localhost:5000/auth/dev-login -H "Content-Type: application/json" -d '{"email":"test@nexai.app","name":"Demo User"}' -c cookies.txt` -> returns 200 with user payload and sets `token` cookie.
4. Test session verification: `curl http://localhost:5000/auth/me -b cookies.txt` -> returns 200 with authenticated user profile.
5. Test logout: `curl -X POST http://localhost:5000/auth/logout -b cookies.txt -c cookies.txt` -> cookie is cleared; subsequent `GET /auth/me` returns 401.
6. Build frontend (`npm run build` in `web-app/`) to verify clean bundle compilation with no syntax/import errors.
7. Run frontend dev server, navigate to `http://localhost:5173/`, verify redirect to `/login`, test login flow, verify redirect to `/` with user details shown in sidebar, and test logout.
