# NexAI — UI Rules & Component Behavior

> **Agent instruction**: Every interactive component must implement these specifications. Do not invent component behaviors. If a pattern is not listed here, ask before implementing.

---

## 1. Modal / Dialog System

### Behavior Requirements
- **Focus trap**: When a modal opens, focus is immediately moved to the first focusable element inside the modal. Tab key cycles only within the modal until it closes.
- **Escape to close**: `Escape` key always closes the modal (unless the user has unsaved changes — show a "Discard changes?" confirmation first)
- **Backdrop click**: Clicking the backdrop closes the modal for informational dialogs. Destructive confirm dialogs do NOT close on backdrop click.
- **Scroll lock**: `document.body.style.overflow = 'hidden'` when modal is open; restore on close
- **Animation**: Fade-in + scale-up (100ms); fade-out + scale-down (80ms)
- **ARIA**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to modal title

### Modal Size Classes
| Size | Max Width | Use Case |
|---|---|---|
| `sm` | 400px | Confirm dialogs, simple forms |
| `md` | 560px | Add/edit items, fill variable forms |
| `lg` | 720px | Image picker, detailed settings |
| `xl` | 960px | Document export preview |
| `full` | 100vw - 80px | Command palette, global search |

---

## 2. Sidebar

### Behavior Requirements
- **Desktop (≥1024px)**: Always visible, fixed position, `var(--sidebar-width)` = 240px
- **Tablet (768px–1023px)**: Collapsed to `var(--sidebar-collapsed-width)` = 56px (icons only with tooltips); expands to 240px on hover/click
- **Mobile (<768px)**: Hidden by default; opens as an overlay drawer from the left (backdrop + swipe-to-close)
- **Toggle button**: Hamburger icon in header on mobile; collapse/expand arrow on tablet
- **Active state**: Active page item highlighted with `--color-accent-subtle` background + left border `var(--color-accent)` 2px

### Section Structure
```
Sidebar
├── Logo / App Name (top)
├── Mode Switcher (tabs: General | Developer | Student | Power-User)
├── Navigation Items (filtered by mode)
│   ├── Section labels (non-clickable, uppercase, var(--text-xs))
│   └── Nav items (icon + label, clickable)
├── Spacer (flex-grow)
└── User Profile (avatar, name, logout — bottom)
```

### Mode-Filtered Navigation
| Mode | Visible Items |
|---|---|
| General | Chat, Library, Settings |
| Developer | Chat, Library, Code Snippets, JSON Tester, Regex Tester, API Tester, Settings |
| Student | Chat, Library, Documents, Flashcards, YouTube Summarizer, Settings |
| Power-User | All items + Analytics, Secrets Vault, Voice I/O |

---

## 3. Toast / Notification System

### Rules
- Toasts appear in the **bottom-right corner** of the viewport, stacked upward
- Maximum **4 toasts visible** at once; oldest auto-dismiss first
- Auto-dismiss: `success` after 3s, `info` after 4s, `warning` after 6s, `error` — never auto-dismiss (user must close)
- Dismiss button (×) always visible
- Click on toast body: navigate to relevant item if applicable

### Toast Variants
```
[✓] SUCCESS  — bg: --color-success at 15% opacity, border-left: --color-success
[ℹ] INFO     — bg: --color-info at 15% opacity, border-left: --color-info
[!] WARNING  — bg: --color-warning at 15% opacity, border-left: --color-warning
[✗] ERROR    — bg: --color-error at 15% opacity, border-left: --color-error
```

### Usage Pattern
```javascript
// Access from any component
import useToastStore from '../store/toastStore';

const { addToast } = useToastStore();

addToast({ type: 'success', message: 'Library item saved!' });
addToast({ type: 'error', message: 'Failed to connect to server. Please try again.' });
```

---

## 4. Command Palette (`Ctrl/Cmd + K`)

### Behavior
- Opens as a centered full-width overlay modal (`--z-modal`)
- Input auto-focused on open
- Results update in real-time as user types (debounced 200ms)
- Arrow keys navigate result list; `Enter` activates item
- `Escape` or backdrop click closes
- Grouping: Results divided into labeled sections (Pages, Recent, Library, Prompts, Commands)

### Default State (empty query)
- Shows: Recent items (last 5 opened), Quick commands ("New Chat", "New Document", "Open Settings")

### Result Item Anatomy
```
[Icon] [Label]                    [Keyboard shortcut or type badge]
[Subtitle / path if applicable]
```

---

## 5. Document Editor (Split-Pane)

### Layout
```
┌────────────────────────────────────────────────────────┐
│  Header: Title + Export buttons (PDF / DOCX)           │
├───────────────────────┬────────────────────────────────┤
│  LEFT PANEL           │  RIGHT PANEL                   │
│  AI Chat / Sections   │  Tiptap Live Preview           │
│  list with editing    │  (rendered document)           │
│                       │                                │
│  [+ Add Section]      │  [Heading]                     │
│                       │  Body text...                  │
│  Section items:       │  [Image if inserted]           │
│  - Drag to reorder    │                                │
│  - Click to edit      │  [Heading]                     │
│  - Delete             │  Body text...                  │
│  - Add Image          │                                │
└───────────────────────┴────────────────────────────────┘
```

### Section Editing Rules
- Click section in left panel → right panel scrolls to that section
- Edit heading/body inline in left panel; Tiptap updates in real-time (local state only — no auto-save on every keystroke)
- Auto-save to DB: debounced 2 seconds after last edit
- "Add Image" per section: opens `sm` modal with 3 tabs (Upload / Unsplash / AI-generate)
- AI-generate image tab: requires explicit confirm click + shows cost warning

---

## 6. Library List View

### Item Card Anatomy
```
┌────────────────────────────────────────────────┐
│ [Favicon/Type Icon]  [Title]          [Actions] │
│ [URL or type label]              [···] menu     │
│                                                 │
│ [Summary text — 2 lines max, truncated]         │
│                                                 │
│ [Tag] [Tag] [Tag]        [Date added]           │
└────────────────────────────────────────────────┘
```

### Actions (··· menu)
- View full item
- Edit tags / summary
- Set reminder
- Copy link
- Archive
- Delete (with confirmation)

### Status Indicators
- `pending` → amber dot (not yet confirmed)
- `confirmed` → no indicator (default)
- `broken` → red indicator + "Link broken" badge
- `archived` → dimmed, italic

---

## 7. Chat Interface

### Layout
```
┌────────────────────────────────────────────────┐
│ [Chat title] [Pin] [Archive] [Branch]  [Share] │
├────────────────────────────────────────────────┤
│                                                 │
│  [Assistant bubble]                             │
│                           [User bubble]        │
│  [Assistant bubble]                             │
│  [Sources: ▼ 2 sources]                        │
│                                                 │
├────────────────────────────────────────────────┤
│ [Attach] [Input field...]       [Voice] [Send] │
└────────────────────────────────────────────────┘
```

### Streaming Display Rules
- Show blinking cursor animation while streaming (`▌` character, pulsing CSS animation)
- Render markdown (code blocks with syntax highlighting, bold, italic, lists) using `react-markdown` or `marked`
- Code blocks: copy button in top-right corner
- Sources panel: collapsible, shows top-3 Pinecone results with titles + similarity scores

### Message Branching
- Each user message shows a "branch from here" icon on hover
- Clicking creates a new branch (new conversation thread from that point)
- Branch indicator shows `Branch 1 / Branch 2` tab switcher at the branch point

---

## 8. Form & Input Standards

### Input States
```
Default:  border --border-default, bg --bg-surface
Focus:    border --border-focus, box-shadow --shadow-accent
Error:    border --color-error, error message below (--text-xs, --color-error)
Disabled: opacity 0.5, cursor not-allowed
```

### Required Field Marking
- Asterisk (`*`) after label, `--color-error` color
- `aria-required="true"` on the input element

### Submit Buttons
- Show spinner inside button while request is in-flight
- Disabled during loading (prevent double-submission)
- Text changes: "Save" → "Saving..." → "Saved ✓" (resets after 2s)

---

## 9. Accessibility Requirements (WCAG AA)

| Requirement | Implementation |
|---|---|
| Color contrast | All text: minimum 4.5:1 ratio (checked against `--bg-*` backgrounds) |
| Focus visibility | All interactive elements: `--shadow-accent` focus ring, 3px minimum |
| Keyboard navigation | All actions reachable by keyboard; no mouse-only interactions |
| Screen reader support | All icons have `aria-label`; decorative images have `alt=""` |
| Skip link | "Skip to main content" link at top of page (visible on focus) |
| ARIA landmarks | `<nav>`, `<main>`, `<aside>` semantic regions used throughout |
| Motion sensitivity | `prefers-reduced-motion` media query disables all animations |

```scss
// styles/_tokens.scss — motion sensitivity
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Empty States

Every list view must have a designed empty state:

```
[Illustration or large icon]
[Heading: "Your library is empty"]
[Subtext: "Save your first link to get started"]
[Primary CTA button: "Save a link"]
```

Empty states must NEVER show:
- A blank white/dark screen with no content
- Raw error messages
- Undefined/null text
