# Feature Spec 03 — Base App Shell & Sidebar

## Goal

Implement the responsive, mode-aware App Shell and Sidebar navigation system specified in `context/ui-rules.md` (Section 2) and `context/build-plan.md` (Feature 03). This includes the persistent desktop sidebar, tablet collapsed icon-only state, mobile drawer with backdrop overlay and touch dismiss, persona mode switcher (General, Developer, Student, Power-User) with mode-filtered navigation, active link highlighting (`var(--color-accent)` indicator), top header bar with mobile toggle, search / `Ctrl+K` button placeholder, active persona badge, and authenticated user profile card.

## Skills / Docs Read

- `AGENTS.md` (Agent Operating Harness, Tech Stack Lock, Full-Access Autonomous Mode)
- `context/ui-rules.md` (Section 2: Sidebar behaviors, breakpoints, section anatomy, mode-filtered navigation, WCAG AA accessibility)
- `context/ui-tokens.md` (Design tokens: `--sidebar-width: 240px`, `--sidebar-collapsed-width: 56px`, `--z-sidebar: 100`, `--z-modal: 500`)
- `context/build-plan.md` (Feature 03 requirements)
- `context/progress-tracker.md` (Feature 03 checklist items)
- `context/memory.md` (Decision 007 Autonomous Execution)
- `modern-web-guidance` (Responsive layouts, ARIA landmarks, keyboard accessibility)

## Assumptions

1. Persona modes defined: `'general'`, `'developer'`, `'student'`, `'power-user'`.
2. Navigation items are dynamically filtered according to the active mode:
   - **General**: Chat, Knowledge Library, Settings
   - **Developer**: Chat, Knowledge Library, Code Snippets, JSON Tester, Regex Tester, API Tester, Settings
   - **Student**: Chat, Knowledge Library, Document Studio, Flashcards, YouTube Summarizer, Settings
   - **Power-User**: All items + Analytics, Secrets Vault, Voice I/O
3. Mode preference is stored in Zustand `uiStore` and synced with `localStorage` (and ready to sync to `User.preferences.sidebarMode` in the Settings feature).
4. Responsive breakpoints:
   - Desktop (≥1024px): 240px wide persistent sidebar.
   - Tablet (768px–1023px): Collapses to 56px icon rail or expands when toggled.
   - Mobile (<768px): Hidden off-canvas drawer with backdrop blur, opened via header hamburger button and closed when a link or backdrop is clicked.
5. Top header contains:
   - Sidebar toggle icon (hamburger on mobile, collapse/expand on desktop)
   - Breadcrumb / Active Page Title
   - Active persona indicator badge
   - Quick Search trigger (`Ctrl+K` placeholder)
   - User profile indicator

## Exact Files to Modify / Create

### Frontend (`web-app/`)

- `web-app/src/store/uiStore.js` [MODIFY] — Add tablet collapsed state, mode persistence, and helper actions
- `web-app/src/components/layout/AppLayout.jsx` [MODIFY] — Full responsive shell, mode switcher, mobile backdrop, header search trigger
- `web-app/src/components/layout/AppLayout.module.scss` [MODIFY] — SCSS module with full breakpoint mixins, mobile drawer animation, tablet icon rail, active item indicator
- `web-app/src/components/layout/ModeSwitcher.jsx` [NEW] & `ModeSwitcher.module.scss` [NEW] — Persona mode segmented control (General, Dev, Student, Power)
- `web-app/src/pages/DevTools/DevToolsPage.jsx` [NEW] & `DevToolsPage.module.scss` [NEW] — Stub page for developer tools
- `web-app/src/pages/Focus/FocusPage.jsx` [NEW] & `FocusPage.module.scss` [NEW] — Stub page for focus/productivity tools
- `web-app/src/pages/Analytics/AnalyticsPage.jsx` [NEW] & `AnalyticsPage.module.scss` [NEW] — Stub page for analytics
- `web-app/src/pages/Security/SecurityPage.jsx` [NEW] & `SecurityPage.module.scss` [NEW] — Stub page for secrets vault
- `web-app/src/App.jsx` [MODIFY] — Register routes for newly accessible pages across modes

### Progress & Memory Tracking

- `context/progress-tracker.md` [MODIFY] — Mark Feature 03 `[/] In Progress` then `[x] Completed`
- `context/memory.md` [MODIFY] — Log Feature 03 architectural implementation and responsive shell notes

## Security & Auth Invariants

1. All newly scaffolded mode routes remain inside `<ProtectedRoute>` inside the application layout.
2. Mode switcher state never exposes sensitive data or alters backend authorization scopes.
3. DOM click events for backdrop and drawer must not cause unintended state mutations or event bubbling leaks.

## Acceptance Criteria

- [ ] Desktop sidebar displays logo, mode switcher, mode-filtered nav items, user profile, and system status dot.
- [ ] Mode switcher allows switching between General, Developer, Student, and Power-User modes, filtering visible navigation links dynamically.
- [ ] Tablet screen width (768px-1023px) collapses sidebar to 56px with icon-focused layout and tooltips.
- [ ] Mobile screen width (<768px) hides sidebar off-canvas; clicking hamburger button in header opens animated drawer with backdrop.
- [ ] Clicking backdrop or navigating to any page automatically closes mobile drawer.
- [ ] Active page is visually highlighted with accent border and subtle background tint.
- [ ] Top header displays toggle button, title, persona badge, search trigger button (`Ctrl+K`), and user status.
- [ ] Client build passes with zero errors (`npm run build`).

## Manual / CLI Verification Test Steps

1. Run `npm run build` in `web-app/` to verify SCSS modules and new component JSX compilation.
2. Verify responsive layout classes and media query rules in SCSS.
3. Verify mode switcher state changes in Zustand store and navigation items re-render accordingly.
4. Verify mobile backdrop visibility and click-outside dismissal behavior.
