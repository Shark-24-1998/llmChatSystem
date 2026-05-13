# OraAI — Personalized AI Chat System

A production-grade personalized AI chat system built with Next.js and Supabase. Features a full RAG pipeline, user-isolated knowledge base, multi-model fallback, persistent memory, and behavioral profiling.

---

## Live Demo

> Coming soon after deployment

---

## Features

### AI & Chat
- Multi-model fallback chain (Gemini → OpenRouter) — if one model fails, automatically switches to next
- Streaming LLM responses for real-time output
- Image understanding (vision support)
- Web search and browser tools integration

### Memory System
- Rolling window of recent messages
- Incremental summarization — summarizes old messages to save context
- Persistent memory across sessions and new chats

### RAG Pipeline (Retrieval-Augmented Generation)
- Document chunking with overlap for better context preservation
- Vector embeddings via Gemini (`gemini-embedding-001`, 3072 dimensions)
- Semantic search using pgvector (Supabase)
- User-isolated knowledge base — each user's documents are completely private
- Global knowledge base — admin can add documents visible to all users
- PDF text extraction and indexing
- Conflict resolution — user profile always takes priority over documents

### Personalization & Profiling
- Automatic profile extraction from conversation (name, salary, location, job title, company, hobbies etc.)
- Behavioral profiling and skill level detection
- Time decay on confidence signals
- Profile persists across all chats and sessions

### Admin Panel
- Password-protected `/admin` route
- Add and delete global documents (text + PDF)
- Complete user privacy — admin cannot see or delete user documents
- Global documents scope vs user documents scope

### Security
- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) on all tables
- User isolation enforced at database level
- Admin routes protected with separate password

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL + pgvector) |
| Auth | Supabase Auth (JWT) |
| Primary AI | Google Gemini (gemini-2.5-flash-lite) |
| Fallback AI | OpenRouter (qwen/qwen3.6-plus:free) |
| Embeddings | Gemini embedding-001 (3072 dimensions) |
| PDF Parsing | unpdf |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## Architecture

```
User
 │
 ▼
Next.js API Routes (JWT Auth)
 │
 ├── generate.controller.js
 │    ├── Profile Extraction (rule-based)
 │    ├── Memory Service (rolling window + summary)
 │    ├── RAG Search (match_chunks RPC)
 │    └── LLM Stream (multi-model fallback)
 │
 ├── Supabase (PostgreSQL + pgvector)
 │    ├── users
 │    ├── user_profiles
 │    ├── chats
 │    ├── messages
 │    ├── documents (user + global scope)
 │    └── document_chunks (embeddings + RLS)
 │
 └── AI Providers
      ├── Google Gemini (primary)
      └── OpenRouter (fallback)
```

---

## RAG Pipeline

```
User uploads document (text or PDF)
        ↓
Text extracted (unpdf for PDFs)
        ↓
chunkText() → splits into 500-word chunks with 50-word overlap
        ↓
createEmbedding() → Gemini generates vector[3072] per chunk
        ↓
Stored in document_chunks (user_id, scope, embedding)
        ↓
User asks question
        ↓
Question embedded → match_chunks() RPC
        ↓
Searches: user chunks + global chunks (scope filter)
        ↓
Top 5 relevant chunks injected as context
        ↓
LLM answers using personal knowledge base
```

---

## Database Schema

```sql
users
├── id, email, name, avatar_url

user_profiles
├── user_id, name, salary, location, job_title
├── company, age, hobbies[], languages[]
├── skill_level (with confidence + decay)
├── learning_style, tech_stack[], current_goal

chats
├── id, user_id, title, summary, last_summary_count

messages
├── id, chat_id, role, content, created_at

documents
├── id, user_id, title, source_type, content, scope

document_chunks
├── id, user_id, document_id, content
├── embedding vector(3072), chunk_index
├── scope (user | global), metadata
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Google Gemini API key
- OpenRouter API key (optional)

### Installation

```bash
git clone https://github.com/Shark-24-1998/llmChatSystem
cd llmChatSystem
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
GEMINI_API_KEY=your_gemini_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# Admin Panel
ADMIN_PASSWORD=your_admin_password
```

### Database Setup

Run these in your Supabase SQL editor in order:

1. Enable pgvector extension
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

2. Create tables (users, chats, messages, user_profiles, documents, document_chunks)

3. Enable RLS on all tables and add policies

4. Create `match_chunks` RPC function for vector search

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Key Implementation Details

### Multi-Model Fallback
```javascript
const MODEL_CHAIN = [
  { provider: "gemini", model: "gemini-2.5-flash-lite", vision: true },
  { provider: "gemini", model: "gemini-2.5-flash",      vision: true },
  { provider: "openrouter", model: "qwen/qwen3.6-plus:free", vision: false },
];
```
If a model returns 429 or 404, it's marked unhealthy for 60 seconds and the next model is tried automatically.

### User Isolation in RAG
```sql
-- match_chunks RPC ensures complete user isolation
WHERE (dc.user_id = p_user_id OR dc.scope = 'global')
AND 1 - (dc.embedding <=> query_embedding) > match_threshold
```

### Chunking Strategy
```javascript
chunkText(content, chunkSize = 500, overlap = 50)
// 500 words per chunk, 50 word overlap
// Overlap preserves context at chunk boundaries
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/      # Main chat endpoint
│   │   ├── chats/         # Chat CRUD
│   │   ├── messages/      # Message history
│   │   ├── documents/     # User document management
│   │   └── admin/         # Admin panel API
│   ├── chat/              # Chat UI page
│   └── admin/             # Admin panel page
├── components/
│   ├── ChatSidebar.js     # Sidebar with chat list + docs panel
│   └── ChatWindow.js      # Main chat interface
├── controllers/
│   └── generate.controller.js
└── services/
    ├── ai.gateway.js      # Multi-model fallback
    ├── memory.service.js  # Conversation memory
    ├── profile.service.js # User profiling
    ├── document.service.js # RAG + chunking
    ├── embedding.service.js # Gemini embeddings
    └── summarize.service.js # Incremental summarization
```

---

## What I Learned

- Implementing production RAG pipelines with proper chunking and overlap strategies
- Vector similarity search using pgvector and cosine distance
- Row Level Security for multi-tenant data isolation
- Multi-model AI provider fallback patterns
- Incremental summarization for long-term conversation memory
- Behavioral profiling with confidence scoring and time decay

---

## Future Improvements

- OCR support for scanned PDFs
- LLM-based profile extraction (when API quota allows)
- Admin analytics dashboard
- User document versioning
- Support for more file types (Word, Excel, CSV)

---

## Author

**Shark** — Full Stack Developer
- GitHub: [@Shark-24-1998](https://github.com/Shark-24-1998)

---

## License

MIT License
