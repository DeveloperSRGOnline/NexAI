# NexAI — Project Overview

> **Agent instruction**: Load this file at the start of every session to establish product context.

---

## 1. Product Summary

**NexAI** is a unified, installable Progressive Web App (PWA) that acts as a personal AI-powered workspace. It is designed for individuals — students, developers, and knowledge workers — who need a single, searchable, context-aware interface for their notes, saved links, documents, and AI conversations.

It is **not** a team tool. It is **not** a marketplace. It is a deeply personal, self-hosted knowledge workspace that survives context loss by building a long-term memory layer on top of AI.

### Sidebar Modes (Filtered Views)
| Mode | Target User | Active Features |
|---|---|---|
| General | Default | Chat, Library, Settings |
| Developer | Engineers | Code Snippets, JSON/Regex Tester, API Tester, DevTools |
| Student | Students | Flashcards, YouTube Summarizer, Document Generator |
| Power-User | Advanced | Analytics, Secrets Vault, Voice I/O, Command Palette |

---

## 2. Core User Journeys

### A. Core AI Chat with RAG
- User opens a chat (or creates a new one inside a project)
- Query is embedded → Pinecone searches across Library + Documents + Notes
- Retrieved context + chat history passed to LangGraph agent
- Agent answers directly or calls a tool; response is streamed back
- Message pair saved to `messages` collection
- Supports **message branching**: user can fork from any message to explore an alternate path

### B. Personal Knowledge Library
- User pastes a URL, uploads a file, or the extension captures the current page
- Backend fetches/extracts content → Gemini Flash generates summary + tags
- Embedding generated → upserted into Pinecone → `libraryItems` saved with `vectorId`
- Tags/summary shown for **one-tap confirm/edit** — never applied silently
- Daily cron performs link health checks (`HEAD` requests); broken links flagged and user notified

### C. Structured AI Document Generation
- User requests a document (from chat or dedicated Documents page)
- Agent drafts structured sections (JSON: `{ heading, body }` per section)
- Rendered in a live split-pane preview (Tiptap editor)
- User edits sections inline
- User clicks **"+ Add image"** per section → chooses: upload / free-stock search (Unsplash/Pexels) / AI-generate (on-demand, explicit click only)
- On export: `pdf-lib` or `docx` package compiles the final file → downloaded → auto-indexed into Library

### D. Prompt Vault
- User creates prompt templates with `{{variable}}` placeholders
- Tags, pins, and organizes prompts
- On use: if variables exist, a small form collects values
- Filled prompt injected into a new or existing chat as the first message

### E. Files & Multimodal Analysis
- User uploads PDF/image → Gemini performs OCR/analysis
- Extracted content chunked, embedded, stored in Library

### F. Developer Utilities
- Code Snippet Manager (language-tagged, searchable)
- JSON Formatter / Validator
- Regex Tester (live match highlighting)
- Internal API Tester (lightweight REST client, no Puppeteer)

### G. Learning & Study Suite
- Flashcard generator (from Library items or documents)
- Spaced repetition scheduler (`easeFactor`, `nextReviewAt`)
- YouTube video summarizer (via transcript extraction)

### H. Productivity / Focus
- Workspace Sessions (tab group memory, requires extension for full tab data)
- Reminders (Web Push via VAPID)
- Quiet Hours (suppress push during user-defined hours)

### I. Analytics (App-Level)
- App usage tracking (time spent per feature, focus score)
- Site-level tracking only with the companion extension installed

### J. Secrets Vault
- Client-side encrypted key-value store
- Master password → PBKDF2 key derivation → AES-GCM encryption (Web Crypto API)
- Only `ciphertext` + `iv` ever touch the server — never plaintext

### K. Voice I/O
- Web Speech API for voice input (dictation into chat)
- Text-to-speech for AI responses

### L. Command Palette
- `Ctrl/Cmd + K` global shortcut within the app
- Fuzzy-search over pages, library items, prompts, and commands

---

## 3. Companion Extension (Phase 4 — Optional)

A thin **Manifest V3** Chrome extension bridge:
- **Global hotkey** (`chrome.commands`) to open a quick-access popup anywhere in the OS
- Popup authenticates via the **same JWT** used by the main PWA (shared session)
- Sends question/search to the same backend endpoints
- **"Ask AI about this page"** content script
- Site-time tracking (passive, user-consented)
- Tab session capture and restore
- Optional site blocklist

> ⚠️ **Why custom JWT and not Clerk?** The extension popup must authenticate using the same session token as the main PWA. Clerk's session management is browser-tab-scoped and cannot be trivially shared with a Chrome extension service worker. The custom Google OAuth → JWT flow is deliberately chosen to make this token-sharing work seamlessly.

---

## 4. Deliberately Out of Scope (PERMANENT — Do Not Build)

| Feature | Why Excluded |
|---|---|
| Multi-model marketplace (OpenAI, Anthropic, etc.) | Scope creep; free-tier key management complexity |
| Paid subscriptions / Stripe / billing UI | Not needed for capstone; adds complexity |
| Multi-tenant team collaboration | Completely different product |
| Server-side Puppeteer / headless Chrome | Crashes Render free-tier (512 MB RAM) |
| Real-time multiplayer document editing | Out of scope |
| Mobile native app (iOS/Android) | PWA install covers mobile |
| Self-hosted AI models (Ollama, llama.cpp) | Render free-tier can't handle inference |

---

## 5. Non-Functional Requirements

| Requirement | Target |
|---|---|
| First load (warm) | < 3 seconds |
| Cold start (Render) | 30–60 seconds — show loading state, handle gracefully |
| Offline capability | Read-only access to cached library items and past chats |
| PWA installability | Passes Lighthouse PWA checklist |
| Auth security | Google OAuth → JWT; tokens never stored in localStorage |
| Data privacy | All vault data encrypted client-side before transmission |
| Accessibility | WCAG AA minimum; focus traps on all modals |

---

*Source: NexAI PRD — extracted and formalized for agent context system.*
