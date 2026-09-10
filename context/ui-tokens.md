# NexAI — UI Design Tokens

> **Agent instruction**: ALL colors, spacing, typography, and shadows in the codebase must reference these tokens. Hard-coded hex values are a code review failure. Import `_tokens.scss` in every component module.

---

## 1. SCSS Variables + CSS Custom Properties

```scss
// web-app/src/styles/_tokens.scss
// ============================================================
// NexAI Design Token System — Dark-Mode First
// ============================================================

// ─── EXPOSE EVERYTHING AS CSS CUSTOM PROPERTIES ──────────────
:root {
  // ── Backgrounds ──────────────────────────────────────────────
  --bg-base:         #0d0d0f;   // Deepest background — page canvas
  --bg-surface:      #16161a;   // Cards, sidebars, panels (elevated 1)
  --bg-elevated:     #1e1e24;   // Modals, dropdowns, tooltips (elevated 2)
  --bg-overlay:      #2a2a33;   // Hover states, highlighted rows

  // ── Border & Stroke ──────────────────────────────────────────
  --border-subtle:   #2a2a33;   // Low-contrast separators, card borders
  --border-default:  #3a3a47;   // Standard input borders, dividers
  --border-focus:    #6366f1;   // Focus rings (must be 3:1 contrast ratio minimum)

  // ── Brand & Accent ───────────────────────────────────────────
  --color-accent:    #6366f1;   // Indigo — primary CTA, active state
  --color-accent-hover: #4f52d9; // Darker on hover
  --color-accent-subtle: rgba(99, 102, 241, 0.12); // Light tint backgrounds

  // ── Semantic Status Accents ───────────────────────────────────
  --color-success:   #22c55e;   // Green — confirmed, saved, online
  --color-warning:   #f59e0b;   // Amber — pending, caution
  --color-error:     #ef4444;   // Red — broken, failed, destructive
  --color-info:      #38bdf8;   // Sky blue — info toasts, streaming indicator

  // ── Text ─────────────────────────────────────────────────────
  --text-primary:    #f1f1f3;   // Main content text (high contrast)
  --text-secondary:  #a1a1aa;   // Metadata, labels, captions
  --text-tertiary:   #71717a;   // Placeholders, disabled states
  --text-accent:     #818cf8;   // Accent-colored links, highlights
  --text-inverse:    #0d0d0f;   // Text on light backgrounds (buttons)

  // ── Typography — Scale ────────────────────────────────────────
  --font-sans:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:  'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;

  --text-xs:   0.75rem;    // 12px — labels, badges
  --text-sm:   0.875rem;   // 14px — body secondary, sidebar items
  --text-base: 1rem;       // 16px — primary body text
  --text-lg:   1.125rem;   // 18px — section headers
  --text-xl:   1.25rem;    // 20px — page sub-headers
  --text-2xl:  1.5rem;     // 24px — page titles
  --text-3xl:  1.875rem;   // 30px — hero text

  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
  --font-bold:     700;

  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  // ── Spacing ───────────────────────────────────────────────────
  // Base unit: 4px (0.25rem)
  --space-1:  0.25rem;   //  4px
  --space-2:  0.5rem;    //  8px
  --space-3:  0.75rem;   // 12px
  --space-4:  1rem;      // 16px
  --space-5:  1.25rem;   // 20px
  --space-6:  1.5rem;    // 24px
  --space-8:  2rem;      // 32px
  --space-10: 2.5rem;    // 40px
  --space-12: 3rem;      // 48px
  --space-16: 4rem;      // 64px
  --space-20: 5rem;      // 80px

  // ── Border Radius ─────────────────────────────────────────────
  --radius-sm:   4px;    // Tags, badges
  --radius-md:   8px;    // Inputs, buttons
  --radius-lg:   12px;   // Cards, panels
  --radius-xl:   16px;   // Modals, large cards
  --radius-full: 9999px; // Avatars, pills

  // ── Shadows ───────────────────────────────────────────────────
  --shadow-sm:  0 1px 3px rgba(0,0,0,0.4);
  --shadow-md:  0 4px 12px rgba(0,0,0,0.5);
  --shadow-lg:  0 8px 24px rgba(0,0,0,0.6);
  --shadow-xl:  0 16px 48px rgba(0,0,0,0.7);
  --shadow-accent: 0 0 0 3px rgba(99, 102, 241, 0.35); // Focus glow

  // ── Z-Index Layers ────────────────────────────────────────────
  --z-base:     0;
  --z-above:    10;
  --z-sidebar:  100;
  --z-dropdown: 200;
  --z-modal:    300;
  --z-toast:    400;
  --z-tooltip:  500;

  // ── Layout Dimensions ─────────────────────────────────────────
  --sidebar-width:          240px;
  --sidebar-collapsed-width: 56px;
  --header-height:          56px;
  --chat-max-width:         768px;
  --panel-width:            360px;  // Right panel (sources, settings)

  // ── Animation ─────────────────────────────────────────────────
  --transition-fast:   150ms ease;
  --transition-base:   250ms ease;
  --transition-slow:   400ms ease;
  --transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1); // Springy UI
}

// ─── LIGHT MODE OVERRIDE (optional Phase 3) ──────────────────
[data-theme='light'] {
  --bg-base:        #f8f8fa;
  --bg-surface:     #ffffff;
  --bg-elevated:    #f1f1f5;
  --bg-overlay:     #e5e5ed;
  --border-subtle:  #e0e0e8;
  --border-default: #c8c8d4;
  --text-primary:   #111116;
  --text-secondary: #52525b;
  --text-tertiary:  #a1a1aa;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.12);
}
```

---

## 2. SCSS Mixins & Utilities

```scss
// web-app/src/styles/_mixins.scss

// ── Responsive Breakpoints ────────────────────────────────────
$breakpoints: (
  'mobile':  480px,
  'tablet':  768px,
  'laptop':  1024px,
  'desktop': 1280px,
);

@mixin respond-to($bp) {
  @media (min-width: map-get($breakpoints, $bp)) { @content; }
}

@mixin respond-below($bp) {
  @media (max-width: calc(map-get($breakpoints, $bp) - 1px)) { @content; }
}

// ── Focus Ring (Accessibility) ────────────────────────────────
@mixin focus-ring {
  outline: none;
  box-shadow: var(--shadow-accent);
  border-color: var(--border-focus);
}

// ── Truncate Text ─────────────────────────────────────────────
@mixin truncate($lines: 1) {
  @if $lines == 1 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  } @else {
    display: -webkit-box;
    -webkit-line-clamp: $lines;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

// ── Scrollbar Styling ─────────────────────────────────────────
@mixin custom-scrollbar($width: 6px) {
  scrollbar-width: thin;
  scrollbar-color: var(--border-default) transparent;

  &::-webkit-scrollbar { width: $width; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb {
    background: var(--border-default);
    border-radius: var(--radius-full);
    &:hover { background: var(--border-focus); }
  }
}

// ── Glass Effect ──────────────────────────────────────────────
@mixin glass($opacity: 0.7) {
  background: rgba(22, 22, 26, $opacity);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
}

// ── Skeleton Loading ──────────────────────────────────────────
@mixin skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-surface) 25%,
    var(--bg-overlay) 50%,
    var(--bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 3. Token Usage Rules

| Context | Rule |
|---|---|
| Backgrounds | Always use `--bg-*` — never hard-coded hex |
| Text | Always use `--text-*` — never `color: white` or `color: #fff` |
| Spacing | Always use `--space-*` — never pixel values like `margin: 16px` |
| Colors | Accent elements use `--color-accent`; status uses `--color-success/warning/error` |
| Borders | Use `--border-*` variables; `--border-focus` only on `:focus` states |
| Shadows | Use `--shadow-*`; never write custom `box-shadow` in components |
| Animation | Use `--transition-*`; never write raw `transition: 0.3s` |
| Z-index | Always use `--z-*` layer variables; never arbitrary z-index numbers |

---

## 4. Typography Usage Map

| Use Case | Token |
|---|---|
| Page titles | `var(--text-2xl)`, `var(--font-bold)` |
| Section headers | `var(--text-lg)`, `var(--font-semibold)` |
| Body text | `var(--text-base)`, `var(--font-normal)` |
| Sidebar items | `var(--text-sm)`, `var(--font-medium)` |
| Labels / Badges | `var(--text-xs)`, `var(--font-medium)` |
| Code blocks | `var(--font-mono)`, `var(--text-sm)` |
| Captions / Meta | `var(--text-xs)`, `var(--text-secondary)` |
