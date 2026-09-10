# NexAI — Code Standards

> **Agent instruction**: Every line of code written for NexAI must comply with these standards. Do not introduce patterns not defined here. When in doubt, follow the existing pattern in the codebase.

---

## 1. General Principles

- **Explicit over clever**: Code should be readable by a junior developer and defensible in a viva exam
- **Error states are first-class**: Every async operation must handle loading, success, and error states
- **No silent failures**: Log errors to console in dev, display user-facing toast in production
- **Optimistic UI with rollback**: Show success immediately, roll back on server error
- **No `any` in logic paths**: Use explicit types/shapes (PropTypes or JSDoc at minimum)

---

## 2. Frontend Standards

### 2.1 SCSS Modules

```
// ✅ Correct — SCSS Module
// Button.module.scss
.button {
  &--primary { background: var(--color-accent); }
  &--ghost   { background: transparent; }
  &__icon    { margin-right: var(--space-2); }
}

// Button.jsx
import styles from './Button.module.scss';
<button className={styles['button--primary']}>...</button>
```

**Rules:**
- One `.module.scss` file per component
- Use BEM naming: `.block__element--modifier`
- All colors, spacing, fonts MUST use CSS custom properties (defined in `_tokens.scss`)
- No inline `style={{}}` for layout — only for dynamic values that can't be tokens
- No global selectors inside modules (no `*`, no bare `div` selectors)
- Breakpoints via SCSS mixin: `@include respond-to('tablet') { ... }`

### 2.2 Zustand Stores

**One file per domain slice. Never one giant store.**

```javascript
// store/chatStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useChatStore = create(devtools((set, get) => ({
  // STATE
  chats: [],
  activeChat: null,
  messages: [],
  isStreaming: false,
  error: null,

  // ACTIONS — always named with verb
  setActiveChat: (chat) => set({ activeChat: chat }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setStreaming: (val) => set({ isStreaming: val }),
  setError: (err) => set({ error: err }),
  clearError: () => set({ error: null }),
}), { name: 'chat-store' }));

export default useChatStore;
```

**Rules:**
- State is flat — no deeply nested objects in a single slice
- Actions are synchronous state setters only — async logic lives in hooks or service files
- `devtools` middleware always enabled (named for Redux DevTools)
- Never access store state directly from non-React code — use `getState()` sparingly

### 2.3 API Client

```javascript
// lib/apiClient.js
import axios from 'axios';
import useAuthStore from '../store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Send httpOnly JWT cookie
  timeout: 30000,        // 30s — accounts for Render cold start
});

// Response error interceptor
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout(); // Clear local state
      window.location.href = '/login'; // Redirect
    }
    return Promise.reject(err);
  }
);

export default apiClient;
```

**Rules:**
- All API calls go through `apiClient` — never raw `fetch()` for API requests
- 30-second timeout minimum to handle Render cold starts
- 401 interceptor always redirects to login
- Errors propagated to store `error` field — never swallowed silently

### 2.4 Streaming Responses

```javascript
// For SSE-based streaming from the backend
const streamMessage = async (chatId, userMessage, onChunk, onDone) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/message`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, content: userMessage }),
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) { onDone(); break; }
    onChunk(decoder.decode(value, { stream: true }));
  }
};
```

### 2.5 Optimistic UI Pattern

```javascript
// ✅ Correct — Optimistic update with rollback
const deleteLibraryItem = async (id) => {
  // 1. Optimistically remove from local state
  const previousItems = get().items;
  set((s) => ({ items: s.items.filter(i => i._id !== id) }));
  
  try {
    await apiClient.delete(`/library/${id}`);
  } catch (err) {
    // 2. Rollback on failure
    set({ items: previousItems, error: 'Failed to delete item' });
  }
};
```

### 2.6 Component Rules

- Components are functional only — no class components
- One component per file; file name matches component name
- Props are destructured in function signature
- Long component files (>200 lines) must be split into sub-components
- Custom hooks for any logic > 20 lines in a component
- Loading states use a consistent `<Spinner />` component (never ad-hoc)
- Error states use a consistent `<ErrorMessage />` component

---

## 3. Backend Standards

### 3.1 Controller-Service-Repository Architecture

```
routes/chat.routes.js       → define route + middleware chain
controllers/chat.controller.js → parse req/res, call service, return response
services/chat.service.js    → business logic, calls models/external APIs
models/Message.js           → Mongoose schema only, no business logic
```

**Rules:**
- Controllers never touch `mongoose` directly — always call a service
- Services never touch `req`/`res` — they receive plain data, return plain data
- Models contain only schema + static query helpers (no business logic)

### 3.2 Route Definition Pattern

```javascript
// routes/library.routes.js
import { Router } from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { saveLibraryItemSchema } from '../schemas/library.schema.js';
import * as LibraryController from '../controllers/library.controller.js';

const router = Router();

router.use(authMiddleware); // All library routes are protected

router.post('/save',        validate(saveLibraryItemSchema),  LibraryController.save);
router.patch('/:id/confirm', LibraryController.confirm);
router.get('/',              LibraryController.list);
router.delete('/:id',        LibraryController.remove);

export default router;
```

### 3.3 Zod Validation

```javascript
// schemas/library.schema.js
import { z } from 'zod';

export const saveLibraryItemSchema = z.object({
  body: z.object({
    url:  z.string().url().optional(),
    text: z.string().min(1).max(50000).optional(),
    type: z.enum(['link', 'note', 'file', 'youtube']),
  }).refine(d => d.url || d.text, { message: 'url or text is required' }),
});

// middleware/validate.middleware.js
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
  }
  next();
};
```

### 3.4 Centralized Error Handling

```javascript
// middleware/error.middleware.js
const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  // Never leak stack traces in production
  const payload = { error: message };
  if (process.env.NODE_ENV === 'development') payload.stack = err.stack;
  
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} → ${status}:`, message);
  res.status(status).json(payload);
};
```

### 3.5 Async Controller Pattern

```javascript
// Always wrap async controllers — never trust try/catch in route definitions
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// controller usage
export const save = asyncHandler(async (req, res) => {
  const result = await LibraryService.save(req.userId, req.body);
  res.status(201).json(result);
});
```

### 3.6 MongoDB Connection Rules

```javascript
// config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  mongoose.set('strictQuery', true);
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 5,        // M0 free tier limit — don't exceed
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    // Retry after 5 seconds (handles Render cold start race)
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — attempting reconnect...');
  connectDB();
});
```

### 3.7 Gemini Service Pattern

```javascript
// services/gemini.service.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fast tasks: summarize, tag, title generation
const flashModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Complex tasks: document generation, agentic reasoning
const proModel = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

// Embeddings
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

export const summarize = async (content) => {
  const result = await flashModel.generateContent(
    `Summarize this in 2-3 sentences:\n\n${content.slice(0, 10000)}`
  );
  return result.response.text();
};

export const embed = async (text) => {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
};
```

---

## 4. Resource Constraint Rules

### 4.1 Render Free Tier Compliance
- `GET /health` must always return `200 OK` immediately — no DB query in health check
- Frontend shows "Waking up server..." skeleton on first load if `/health` is slow
- Frontend retries failed requests once after 35 seconds (cold start window)
- No sync operations blocking the event loop for >100ms

### 4.2 MongoDB M0 Compliance
- `maxPoolSize: 5` — never exceed
- Index every field used in `WHERE`/`find()` queries
- No `Collection.find({})` without `.limit()` — always paginate
- Default page size: 20 items

### 4.3 Pinecone Quota Compliance
- No bulk re-embedding without explicit user confirmation (guards 2M write/month limit)
- Upsert in batches of 100 max (Pinecone recommendation)
- Delete vectors when library items are deleted (avoid index bloat)

### 4.4 Gemini Cost Management
- Image generation is ALWAYS on-demand — one explicit user click per section
- Long documents truncated to 10,000 chars for summarization (saves tokens)
- Chat history sent to model is capped at last 20 messages

---

## 5. Security Standards

- JWT stored in `httpOnly` cookie — NEVER in `localStorage` or `sessionStorage`
- All protected routes: `router.use(authMiddleware)` at the top
- `req.userId` set by `authMiddleware` — never trust `req.body.userId`
- `CORS`: allow only the Vercel frontend origin + `localhost:5173` in dev
- Rate limiting: `express-rate-limit` on auth routes (max 10 req/15min)
- Helmet.js: `app.use(helmet())` for security headers
- Input sanitization: strip HTML from any user content stored in DB (use `sanitize-html`)

---

## 6. Git & Commit Standards

```
feat: add Prompt Vault CRUD endpoints
fix: handle Pinecone upsert retry on 429
chore: update Gemini SDK to 0.21.0
docs: update architecture.md with new auth flow
```

- Conventional Commits format (type: description)
- Never commit `.env` files — only `.env.example`
- Feature branches: `feat/feature-name`
- One feature per branch; merge via PR
