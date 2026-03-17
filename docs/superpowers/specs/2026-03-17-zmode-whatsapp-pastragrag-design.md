# Z-Mode, WhatsApp Bot & Past Paper RAG Specification

## Overview

Three features to enhance student experience: data-saving mode, WhatsApp integration, and intelligent past paper search.

---

## 1. Z-Mode (Low-Data Toggle)

### Purpose
Reduce data consumption for students on limited connections.

### Functionality
- Global toggle in Settings
- Affects:
  - **Animations**: Disabled or simplified
  - **Images**: Reduced quality, enforced lazy loading
  - **AI Responses**: Plain text only (no markdown, no images)
  - **Background Sync**: Reduced frequency

### Implementation
- `stores/useZModeStore.ts` - Persisted Zustand store
- Components check `isZMode` before rendering effects
- AI responses served without rich formatting

---

## 2. WhatsApp Study Buddy

### Purpose
Allow students to get quick answers via WhatsApp (primary communication in SA).

### Flow
```
Student → WhatsApp Message → Webhook → FAQ Cache Check
                                          ↓
                              Hit? → Return Answer
                              Miss? → Gemini API → Return Answer
```

### Features
- Instant responses to common FAQs (reuse Vercel KV cache)
- AI-powered answers for complex questions
- Study reminder notifications (scheduled)
- Quick links back to app

### Implementation
- WhatsApp Business API (via Twilio or Meta)
- `app/api/webhooks/whatsapp/route.ts`
- Reuse existing FAQ cache

---

## 3. Past Paper RAG

### Purpose
Search past papers by topic/question content, not just metadata.

### User Experience
User types: "Find all questions about Meiosis from Life Sciences 2019-2024"
System returns: List of matching questions with source paper links

### Architecture
1. **Indexing**: Extract questions from PDF past papers
2. **Storage**: Store in `past_paper_questions` table
3. **Search**: Semantic search using embeddings
4. **UI**: Search bar in Past Papers page

### Database Schema
```sql
CREATE TABLE past_paper_questions (
  id UUID PRIMARY KEY,
  paper_id UUID REFERENCES past_papers(id),
  question_text TEXT,
  answer_text TEXT,
  year INT,
  subject TEXT,
  topic TEXT,
  marks INT,
  embedding vector(768),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API
- `POST /api/past-paper/search` - Search questions
- Input: query string, filters (subject, year range)
- Output: Array of matching questions with paper links

---

## Integration Points

- Z-Mode: Integrates with existing Settings, AI responses
- WhatsApp: Reuses FAQ cache from Client-Side AI feature
- Past Paper RAG: Extends existing past papers infrastructure
