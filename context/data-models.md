# NexAI — Data Models

> **Agent instruction**: All Mongoose schemas defined here are the authoritative contracts. Never add fields to a schema without updating this file. Never store plaintext secrets — the `secrets` collection stores only `ciphertext` and `iv`.

---

## 1. `users`

```javascript
// server/src/models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId:    { type: String, required: true, unique: true },
  email:       { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  avatar:      { type: String },

  preferences: {
    sidebarMode:   { type: String, enum: ['general', 'developer', 'student', 'power-user'], default: 'general' },
    theme:         { type: String, enum: ['dark', 'light'], default: 'dark' },
    language:      { type: String, default: 'en' },
    streamingEnabled: { type: Boolean, default: true },
  },

  globalInstructions: { type: String, default: '' }, // System prompt injected into every chat

  quietHours: {
    enabled:   { type: Boolean, default: false },
    startTime: { type: String, default: '22:00' }, // HH:MM format
    endTime:   { type: String, default: '08:00' },
  },

  notificationPrefs: {
    pushEnabled:    { type: Boolean, default: false },
    emailEnabled:   { type: Boolean, default: false },
    brokenLinks:    { type: Boolean, default: true },
    weeklyDigest:   { type: Boolean, default: true },
    reminders:      { type: Boolean, default: true },
  },

  pushSubscription: { type: mongoose.Schema.Types.Mixed }, // Web Push subscription object

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', userSchema);
```

---

## 2. `projects`

```javascript
// server/src/models/Project.js
import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:             { type: String, required: true, trim: true },
  description:      { type: String, default: '' },
  systemInstructions: { type: String, default: '' }, // Scoped system prompt for this project's chats
  color:            { type: String, default: '#6366f1' }, // UI accent color
  icon:             { type: String, default: '📁' },
  pinned:           { type: Boolean, default: false },
  createdAt:        { type: Date, default: Date.now },
  updatedAt:        { type: Date, default: Date.now },
});

export default mongoose.model('Project', projectSchema);
```

---

## 3. `libraryItems`

```javascript
// server/src/models/LibraryItem.js
import mongoose from 'mongoose';

const libraryItemSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:      { type: String, enum: ['link', 'note', 'file', 'document', 'youtube'], required: true },

  // Content
  title:     { type: String, required: true, trim: true },
  url:       { type: String },                          // For 'link' and 'youtube' types
  content:   { type: String },                          // Raw extracted text (for search/embed)
  summary:   { type: String },                          // AI-generated summary
  fileKey:   { type: String },                          // Cloud storage key (Phase 2+)
  mimeType:  { type: String },                          // For file uploads

  // Organization
  tags:      [{ type: String, trim: true }],
  folder:    { type: String, default: 'Uncategorized' },
  pinned:    { type: Boolean, default: false },

  // Vector search
  vectorId:  { type: String },                          // Pinecone vector ID

  // Health & status
  status:    { type: String, enum: ['pending', 'confirmed', 'broken', 'archived'], default: 'pending' },
  lastCheckedAt: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Text index for fallback keyword search
libraryItemSchema.index({ title: 'text', summary: 'text', content: 'text', tags: 'text' });

export default mongoose.model('LibraryItem', libraryItemSchema);
```

---

## 4. `documents`

```javascript
// server/src/models/Document.js
import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  heading:  { type: String, default: '' },
  body:     { type: String, default: '' },
  imageUrl: { type: String },         // Inserted image (upload, stock, or AI-generated)
  order:    { type: Number, required: true },
}, { _id: true });

const documentSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title:     { type: String, required: true, trim: true },
  sections:  [sectionSchema],

  // Version history (shallow — just the last N versions)
  versionHistory: [{
    sections:  [sectionSchema],
    savedAt:   { type: Date, default: Date.now },
    label:     { type: String },
  }],

  exportFormats: [{ type: String, enum: ['pdf', 'docx'] }], // Track what's been exported
  libraryItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LibraryItem' }, // After indexing

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Document', documentSchema);
```

---

## 5. `prompts` (Prompt Vault)

```javascript
// server/src/models/Prompt.js
import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:     { type: String, required: true, trim: true },

  // Template with {{variable}} placeholders
  // Example: "Summarize {{topic}} in {{tone}} tone for a {{audience}} audience"
  template:  { type: String, required: true },

  // Extracted variable names (e.g., ['topic', 'tone', 'audience'])
  // Populated automatically by the API when template is saved
  variables: [{ type: String }],

  tags:      [{ type: String, trim: true }],
  pinned:    { type: Boolean, default: false },
  lastUsedAt: { type: Date },
  useCount:  { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Prompt', promptSchema);
```

---

## 6. `chats`

```javascript
// server/src/models/Chat.js
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  title:     { type: String, default: 'New Chat', trim: true },
  pinned:    { type: Boolean, default: false },
  archived:  { type: Boolean, default: false },
  archivedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Chat', chatSchema);
```

---

## 7. `messages`

```javascript
// server/src/models/Message.js
import mongoose from 'mongoose';

const toolCallSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  input:  { type: mongoose.Schema.Types.Mixed },
  output: { type: mongoose.Schema.Types.Mixed },
}, { _id: false });

const messageSchema = new mongoose.Schema({
  chatId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:     { type: String, enum: ['user', 'assistant', 'tool'], required: true },
  content:  { type: String, required: true },

  // For message branching: parentId points to the message this branches from
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  branchIndex: { type: Number, default: 0 }, // Which branch this is (0 = main thread)

  // Tool call telemetry (for agent transparency)
  toolCalls: [toolCallSchema],

  // Metadata
  model:    { type: String }, // Which Gemini model was used
  latencyMs: { type: Number }, // Response time for performance tracking

  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
```

---

## 8. `snippets`

```javascript
// server/src/models/Snippet.js
import mongoose from 'mongoose';

const snippetSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title:     { type: String, required: true, trim: true },
  language:  { type: String, required: true, trim: true }, // 'javascript', 'python', etc.
  code:      { type: String, required: true },
  tags:      [{ type: String, trim: true }],
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

snippetSchema.index({ title: 'text', code: 'text', tags: 'text' });

export default mongoose.model('Snippet', snippetSchema);
```

---

## 9. `flashcards`

```javascript
// server/src/models/Flashcard.js
import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // Source tracking — where this flashcard was generated from
  sourceId:   { type: mongoose.Schema.Types.ObjectId },
  sourceType: { type: String, enum: ['libraryItem', 'document', 'chat', 'manual'] },

  question:   { type: String, required: true },
  answer:     { type: String, required: true },

  // Spaced Repetition (SM-2 algorithm)
  easeFactor:    { type: Number, default: 2.5 },  // Difficulty multiplier (min 1.3)
  interval:      { type: Number, default: 1 },    // Days until next review
  repetitions:   { type: Number, default: 0 },    // Times reviewed
  nextReviewAt:  { type: Date, default: Date.now },

  createdAt: { type: Date, default: Date.now },
});

flashcardSchema.index({ userId: 1, nextReviewAt: 1 }); // For due-card queries

export default mongoose.model('Flashcard', flashcardSchema);
```

---

## 10. `secrets` — ⚠️ CIPHERTEXT ONLY

```javascript
// server/src/models/Secret.js
import mongoose from 'mongoose';

// ⚠️ CRITICAL INVARIANT:
// This schema stores ONLY ciphertext and IV.
// Plaintext is NEVER sent to or stored on the server.
// Key derivation happens client-side: PBKDF2(masterPassword, salt) → AES-GCM key.
// The server has zero knowledge of the master password or plaintext values.

const secretSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  label:      { type: String, required: true, trim: true }, // Friendly name (e.g., "OpenAI Key")

  // AES-GCM encrypted output — both are base64 encoded
  ciphertext: { type: String, required: true },
  iv:         { type: String, required: true },  // Initialization vector (12 bytes → base64)

  // Salt used for PBKDF2 key derivation — not a secret, safe to store
  salt:       { type: String, required: true },  // base64 encoded

  createdAt:  { type: Date, default: Date.now },
  updatedAt:  { type: Date, default: Date.now },
});

export default mongoose.model('Secret', secretSchema);
```

---

## 11. `usageStats`

```javascript
// server/src/models/UsageStat.js
import mongoose from 'mongoose';

const usageStatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date:   { type: String, required: true }, // YYYY-MM-DD

  // Site-level tracking (only available when extension is installed)
  domainMinutes: [{
    domain:   { type: String },
    minutes:  { type: Number, default: 0 },
    category: { type: String, enum: ['productive', 'neutral', 'distraction', 'unknown'], default: 'unknown' },
  }],

  // App-level tracking (always available)
  appActivity: {
    chatMessages:      { type: Number, default: 0 },
    libraryItemsSaved: { type: Number, default: 0 },
    documentsExported: { type: Number, default: 0 },
    promptsUsed:       { type: Number, default: 0 },
  },

  focusScore: { type: Number, min: 0, max: 100 }, // Computed from domainMinutes categories
});

usageStatSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('UsageStat', usageStatSchema);
```

---

## 12. `reminders`

```javascript
// server/src/models/Reminder.js
import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  targetId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ['libraryItem', 'document', 'chat'], required: true },
  message:    { type: String, default: '' },
  remindAt:   { type: Date, required: true },
  sent:       { type: Boolean, default: false },
  createdAt:  { type: Date, default: Date.now },
});

reminderSchema.index({ userId: 1, remindAt: 1, sent: 1 }); // For cron query

export default mongoose.model('Reminder', reminderSchema);
```

---

## 13. `agentTasks`

```javascript
// server/src/models/AgentTask.js
import mongoose from 'mongoose';

// Tracks async agent operations that require user review before applying
// Enforces the Suggest → Review → Confirm lifecycle for destructive/creative actions

const agentTaskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:   { type: String, enum: [
    'library_tag',        // Suggest tags for a library item
    'library_summarize',  // Suggest summary for a library item
    'document_generate',  // Propose document sections
    'link_repair',        // Propose archiving broken links
  ], required: true },
  status: { type: String, enum: ['pending', 'awaiting_review', 'confirmed', 'rejected', 'done'], default: 'pending' },
  input:          { type: mongoose.Schema.Types.Mixed }, // What the agent received
  proposedResult: { type: mongoose.Schema.Types.Mixed }, // What the agent proposes to do
  createdAt:      { type: Date, default: Date.now },
  resolvedAt:     { type: Date },
});

export default mongoose.model('AgentTask', agentTaskSchema);
```

---

## Index Summary

| Collection | Key Indexes |
|---|---|
| users | `googleId` (unique), `email` (unique) |
| projects | `userId` |
| libraryItems | `userId`, full-text on `title+summary+content+tags` |
| documents | `userId`, `projectId` |
| prompts | `userId` |
| chats | `userId`, `projectId` |
| messages | `chatId + createdAt` composite |
| snippets | `userId`, full-text on `title+code+tags` |
| flashcards | `userId + nextReviewAt` composite |
| secrets | `userId` |
| usageStats | `userId + date` (unique) |
| reminders | `userId + remindAt + sent` |
| agentTasks | `userId` |
