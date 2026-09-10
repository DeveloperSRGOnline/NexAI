# NexAI — Viva Defense Preparation

> **Agent instruction**: This file contains exam-ready answers. These are not just talking points — they reference specific implementation details that the agent must have actually built. Verify each answer against the actual codebase before the viva.

---

## Q1: "Isn't this just an API wrapper around Gemini?"

**Short answer**: No. The value is in what happens *between* the user's input and the Gemini API call.

**Full defense**:

NexAI is an engineering system, not a UI skin. Here's what sits between the user's question and Gemini:

1. **Multi-Stage LangGraph Pipeline**: Every chat message passes through a LangGraph agent graph with multiple tool nodes:
   - `ragTool`: Embeds the user query using `text-embedding-004`, queries Pinecone with cosine similarity search across three namespaces (`library`, `documents`, `notes`), and retrieves the top-k chunks. These chunks are injected as context into the system prompt before Gemini ever sees the user's message.
   - `memoryTool`: Pulls the user's saved `globalInstructions` and relevant past decisions from long-term memory.
   - `docTool`: For document generation tasks, orchestrates multi-step structured output — generating `{ heading, body }` JSON sections, validating structure, and piping to the Tiptap renderer.

2. **Vector Search over Pinecone**: Plain keyword search can't find "articles about neural networks" if the item was saved as "deep learning fundamentals." Pinecone cosine similarity search finds semantically related content regardless of exact wording. This is the core of the RAG value.

3. **Document Compilation Engine**: The document generation pipeline produces editable structured output (not just a text blob), allows per-section image insertion from multiple sources, and exports to production-quality PDF via `pdf-lib` and DOCX via the `docx` npm package — all without any server-side browser.

4. **Suggest → Review → Confirm Agent Pattern**: Unlike a raw API call that just returns text, NexAI's agent proposes mutations (tags, summaries, document sections) and waits for explicit user confirmation. This is a deliberate UX pattern that builds user trust in AI-generated content.

5. **Client-Side Encryption Layer**: The Secrets Vault encrypts data using PBKDF2 + AES-GCM (Web Crypto API) entirely in the browser. The server stores only `{ ciphertext, iv, salt }` — it has zero knowledge of the master password or plaintext values. This is zero-knowledge architecture.

---

## Q2: "Why build a web app instead of just using ChatGPT or Gemini directly?"

**Short answer**: Because NexAI is a *personal knowledge operating system*, not a chat interface.

**Full defense**:

When you use ChatGPT or Gemini directly, you get a conversation. When you close the tab, the context is gone. NexAI is fundamentally different:

1. **Persistent Personal Knowledge Base**: Every link you save, every document you generate, every conversation you have is embedded into Pinecone and searchable semantically. Your saved library from 6 months ago can be automatically recalled as context in today's chat. ChatGPT has no access to your saved links from last month.

2. **Unified Cross-Source Synthesis**: NexAI answers your question by searching across your library items, your past documents, and your past notes simultaneously — then synthesizes a response grounded in *your personal context*. Gemini.ai only knows what you tell it right now.

3. **Prompt Vault with Variable Templating**: Power users maintain a vault of reusable prompt templates with `{{variable}}` placeholders. A developer might have "Review this code for {{issue_type}} in {{language}}" saved as a template — one click fills it and launches the chat. No other AI interface has this built-in.

4. **PWA Installability**: NexAI is installable as a native-feeling app on desktop and mobile. It has an offline-capable service worker (Workbox) that caches previously accessed library items and chats for read access when the user is offline.

5. **Global Hotkey Access (Phase 4)**: With the companion extension, users can press a keyboard shortcut from anywhere in the OS and instantly query their personal knowledge base without switching context. This is OS-level AI integration, not a browser tab.

---

## Q3: "Explain the architecture of your RAG pipeline."

**Short answer**: Embed → Store in Pinecone → Query on message → Inject → Generate.

**Full defense** (step by step):

```
INGESTION (when user saves content):
1. Content arrives (URL text, file, note)
2. Text is chunked into ~500 token segments (overlap: 50 tokens)
3. Each chunk embedded with Gemini text-embedding-004
   → 768-dimensional float vector
4. Vectors upserted to Pinecone Starter index
   → Namespace: 'library' | 'documents' | 'notes'
   → Metadata: { userId, itemId, chunkIndex, preview_text }

RETRIEVAL (on every chat message):
1. User's message embedded with text-embedding-004
   → Same 768-dim vector space
2. Pinecone cosine similarity query: top-5 chunks per namespace
   → Filter by userId (single-user isolation)
3. Chunks ranked by similarity score
4. Top chunks concatenated into a context block

AUGMENTATION (building the LLM prompt):
System prompt structure:
  [User's globalInstructions]
  [Retrieved context: "Based on your saved knowledge:
    - [chunk 1 preview]
    - [chunk 2 preview]
    ..."]
  [Chat history: last 20 messages]
  [User's current message]

5. Augmented prompt sent to Gemini 2.0 Flash
6. Response streamed back via SSE
7. Sources (Pinecone result metadata) shown in UI citation panel
```

**Why cosine similarity over keyword search?**
Cosine similarity measures the angle between embedding vectors in 768-dimensional space. Two texts that mean the same thing but use different words will have vectors pointing in similar directions. A keyword search for "machine learning" would miss an article titled "neural network fundamentals." Pinecone's ANN (approximate nearest neighbor) index finds semantically similar content in milliseconds regardless of exact wording.

---

## Q4: "How is security maintained on a free-tier hosting environment?"

**Short answer**: Defense in depth — encryption at the client, JWT at the API layer, and zero-plaintext secrets.

**Full defense**:

**Layer 1 — Client-Side Web Crypto (Secrets Vault)**:
The Secrets Vault uses the browser's built-in Web Crypto API (no third-party library). The flow:
```
masterPassword → PBKDF2(password, salt, 310000 iterations, SHA-256) → 256-bit AES-GCM key
plaintext secret → AES-GCM encrypt(key, iv) → { ciphertext, iv }
```
Only `{ ciphertext, iv, salt }` is sent to the server. The master password and the derived key never leave the browser. Even if the MongoDB database were compromised, the attacker gets only ciphertext with no key to decrypt it.

**Layer 2 — JWT Route Protection**:
Every non-auth endpoint is protected by `authMiddleware`:
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.nexai_token; // httpOnly cookie only
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```
JWT stored in `httpOnly` cookie — inaccessible to JavaScript (XSS-safe). `JWT_SECRET` is an environment variable set on Render — never in code.

**Layer 3 — Input Sanitization**:
Zod validates every mutation request body at the route level. `sanitize-html` strips HTML from user-generated text before it enters MongoDB (prevents stored XSS). Helmet.js adds security headers (`Content-Security-Policy`, `X-Frame-Options`, etc.).

**Layer 4 — Data Isolation**:
All Pinecone queries and MongoDB queries filter by `userId` (set by `authMiddleware` from the verified JWT). A user can never access another user's data — not through the API, and not through vector search (namespace + metadata filter enforced on every query).

**Regarding free-tier specifically**:
Render free-tier has cold starts (30–60 seconds after 15 minutes of inactivity). This is a performance concern, not a security one. The app handles it via: a `/health` probe that responds immediately, a frontend "waking up server" skeleton state, and retry logic for the first failed request.

---

## Q5: "Why Pinecone over just using MongoDB text search?"

**Short answer**: Semantic understanding vs. keyword matching.

**Full defense**:
MongoDB's `$text` search finds documents where the search term literally appears (after stemming). It's fast and good for exact queries. But consider:

- User query: *"how do transformer models handle long sequences?"*
- Saved item title: *"Attention is All You Need — summary notes"*

MongoDB text search would find this only if the user typed "attention" or "transformer." Pinecone finds it because the embedding vectors for both phrases are close in semantic space — the model knows "transformer models" and "attention mechanism" are related concepts.

NexAI uses **both**:
- Pinecone for semantic RAG retrieval (the primary knowledge retrieval path)
- MongoDB `$text` index as a fallback for exact title/tag matches in the global search (`/search` endpoint)

This hybrid approach gives users the best of both: semantic understanding for AI-powered recall, and exact matching for when they remember a specific title.

---

## Q6: "What did you personally design vs. what does a library do?"

**Personally designed and engineered**:
- The LangGraph agent graph topology (which tools run, in what order, with what inputs)
- The RAG pipeline design (chunking strategy, namespace separation, context injection format)
- The Suggest → Review → Confirm UX pattern for agent-initiated mutations
- The JWT sharing architecture for the extension (custom OAuth flow instead of Clerk)
- The client-side zero-knowledge encryption design for the Secrets Vault
- The structured document generation schema (`{ heading, body, imageUrl }[]`) and the Tiptap integration
- The SCSS token system and component behavior specifications
- The two-step vibe engineering protocol in `agents.md`
- The free-tier resource constraint rules (pool size, rate limits, quota guards)

**What libraries do for me** (and I can explain each):
- `@google/generative-ai` — HTTP wrapper for the Gemini REST API
- `@pinecone-database/pinecone` — HTTP wrapper for Pinecone's upsert/query API
- `mongoose` — Schema definition and query builder over MongoDB's native driver
- `langgraph` — State machine framework for multi-step agent pipelines
- `pdf-lib` — Low-level PDF manipulation (I compose the document structure)
- `workbox` — Service worker strategy presets (I choose which routes use which caching strategy)
- `tiptap` — Rich text editor base (I configure the schema and extensions)

Being able to explain what each library does under the hood — and why I chose it over alternatives — is the actual measure of engineering judgment.
