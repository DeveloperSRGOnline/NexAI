# NexAI — Personal AI Workspace

NexAI is a full-stack, personal AI workspace built as an installable Progressive Web App (PWA) with Gemini 2.0 Flash, Gemini 2.5 Pro, LangGraph orchestration, MongoDB Atlas, and Pinecone vector search.

---

## 🚀 Architecture Overview

- **Frontend (`web-app/`)**: React + Vite + SCSS Modules (Design Token System) + Zustand atomic stores + Workbox PWA. Hosted on Vercel.
- **Backend (`server/`)**: Node.js + Express (Controller-Service-Repository pattern) + LangGraph agentic workflows. Hosted on Render.
- **AI Core**: Gemini 2.0 Flash (fast workhorse) + Gemini 2.5 Pro (complex documents/reasoning) via `@google/generative-ai`.
- **Database & Storage**: MongoDB Atlas M0 + Pinecone Starter Vector Search.

---

## 🛠️ Project Structure

```
nexai/
├── web-app/             # Vite + React PWA client
│   ├── public/          # manifest.json, icons, static assets
│   └── src/
│       ├── components/  # Layout, common UI components
│       ├── lib/         # API client and utility helpers
│       ├── pages/       # Chat, Library, Documents, Prompts, Settings
│       ├── store/       # Zustand atomic store slices
│       └── styles/      # SCSS tokens & global styles
├── server/              # Express API server
│   └── src/
│       ├── config/      # Environment & database configuration
│       ├── controllers/ # Request handlers
│       ├── middleware/  # Auth, validation, error handlers
│       ├── routes/      # API routes
│       └── services/    # Business logic & AI integrations
├── context/             # Architecture, tokens, standards, and progress
├── prompts/             # Two-step vibe engineering specs
├── render.yaml          # Render deployment blueprint
└── vercel.json          # Vercel SPA routing
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` in `server/` to `server/.env` and supply the required keys:
```bash
cp server/.env.example server/.env
```

### 3. Run Locally
```bash
# Run both client and server:
npm run dev:server    # Runs Express API on http://localhost:5000
npm run dev:client    # Runs Vite PWA on http://localhost:5173
```

---

## 📄 License
MIT
