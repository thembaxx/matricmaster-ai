# Past Paper RAG Implementation Plan

> **For agentic workers:** Use this plan to implement Past Paper RAG.

**Goal:** Allow students to search past paper questions by topic/content, not just metadata.

**Architecture:** Extract questions from PDFs → Store with embeddings → Semantic search → Display results

---

## File Structure

```
src/
├── lib/
│   └── rag/
│       ├── indexer.ts           # NEW - Extract questions from PDFs
│       ├── search.ts            # NEW - Semantic search
│       └── embeddings.ts        # NEW - Embedding generation
├── app/
│   └── api/
│       └── past-paper/
│           └── search/
│               └── route.ts     # NEW - Search API
├── components/
│   └── PastPapers/
│       └── QuestionSearch.tsx  # NEW - Search UI
└── lib/
    └── db/
        └── schema.ts           # MODIFY - Add questions table
```

---

## Implementation Tasks

### Task 1: Database Schema

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add past_paper_questions table**

```typescript
// In schema.ts, add:
export const pastPaperQuestions = pgTable('past_paper_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  paperId: uuid('paper_id').references(() => pastPapers.id),
  questionText: text('question_text').notNull(),
  answerText: text('answer_text'),
  year: integer('year').notNull(),
  subject: text('subject').notNull(),
  paper: text('paper'), // e.g., "P1", "P2"
  month: text('month'), // "Nov", "Jun"
  topic: text('topic'), // e.g., "Meiosis", "Calculus"
  marks: integer('marks'),
  questionNumber: integer('question_number'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Add to indexes
export const pastPaperQuestionsTopicIdx = index('past_paper_questions_topic_idx').on(pastPaperQuestions.topic);
export const pastPaperQuestionsSubjectIdx = index('past_paper_questions_subject_idx').on(pastPaperQuestions.subject);
export const pastPaperQuestionsYearIdx = index('past_paper_questions_year_idx').on(pastPaperQuestions.year);
```

- [ ] **Step 2: Commit**
```bash
git add src/lib/db/schema.ts
git commit -m "feat: add past_paper_questions table schema"
```

---

### Task 2: Embedding Generation

**Files:**
- Create: `src/lib/rag/embeddings.ts`

- [ ] **Step 1: Create embedding utility**

```typescript
// src/lib/rag/embeddings.ts
import { generateAI, AI_MODELS } from '@/lib/ai-config';

export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Gemini to generate embeddings
  const response = await generateAI({
    prompt: `Generate a semantic embedding vector for this text. Return a JSON array of 768 numbers between -1 and 1.
    
Text: ${text}`,
    model: AI_MODELS.PRIMARY,
  });

  try {
    const parsed = JSON.parse(response);
    return parsed;
  } catch {
    // Fallback: simple hash-based embedding
    return simpleEmbedding(text);
  }
}

function simpleEmbedding(text: string): number[] {
  const vector = new Array(768).fill(0);
  for (let i = 0; i < text.length; i++) {
    vector[i % 768] += text.charCodeAt(i) / 255;
  }
  return vector.map(v => (v / text.length) * 2 - 1);
}
```

- [ ] **Step 2: Commit**
```bash
git add src/lib/rag/embeddings.ts
git commit -m "feat: add embedding generation for RAG"
```

---

### Task 3: Question Indexer

**Files:**
- Create: `src/lib/rag/indexer.ts`

- [ ] **Step 1: Create indexer**

```typescript
// src/lib/rag/indexer.ts
import { db } from '@/lib/db';
import { pastPaperQuestions, pastPapers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateEmbedding } from './embeddings';

interface ExtractedQuestion {
  questionText: string;
  answerText?: string;
  questionNumber?: number;
  marks?: number;
}

export async function indexPastPaper(
  paperId: string,
  questions: ExtractedQuestion[]
): Promise<void> {
  // Get paper metadata
  const [paper] = await db
    .select()
    .from(pastPapers)
    .where(eq(pastPapers.id, paperId))
    .limit(1);

  if (!paper) {
    throw new Error('Paper not found');
  }

  // Insert questions
  for (const q of questions) {
    const embedding = await generateEmbedding(q.questionText);

    await db.insert(pastPaperQuestions).values({
      paperId,
      questionText: q.questionText,
      answerText: q.answerText,
      year: paper.year,
      subject: paper.subject,
      paper: paper.paper,
      month: paper.month,
      questionNumber: q.questionNumber,
      marks: q.marks,
    });
  }
}

export function parseQuestionsFromText(text: string): ExtractedQuestion[] {
  // Simple regex-based extraction
  // In production, use more sophisticated parsing
  const questions: ExtractedQuestion[] = [];
  
  const pattern = /(\d+)\.\s*(.+?)(?=\n|$)/g;
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    questions.push({
      questionNumber: parseInt(match[1]),
      questionText: match[2].trim(),
    });
  }
  
  return questions;
}
```

- [ ] **Step 2: Commit**
```bash
git add src/lib/rag/indexer.ts
git commit -m "feat: add past paper question indexer"
```

---

### Task 4: Search Logic

**Files:**
- Create: `src/lib/rag/search.ts`

- [ ] **Step 1: Create search function**

```typescript
// src/lib/rag/search.ts
import { db } from '@/lib/db';
import { pastPaperQuestions, pastPapers } from '@/lib/db/schema';
import { like, and, gte, lte, eq, asc } from 'drizzle-orm';
import { generateEmbedding } from './embeddings';
import { sql } from 'drizzle-orm';

interface SearchOptions {
  query: string;
  subject?: string;
  yearFrom?: number;
  yearTo?: number;
  topic?: string;
  limit?: number;
}

interface SearchResult {
  id: string;
  questionText: string;
  answerText?: string;
  year: number;
  subject: string;
  paper: string;
  month: string;
  marks?: number;
  questionNumber?: number;
  paperUrl?: string;
}

export async function searchPastPaperQuestions(
  options: SearchOptions
): Promise<SearchResult[]> {
  const { query, subject, yearFrom, yearTo, topic, limit = 20 } = options;

  // Build conditions
  const conditions = [];

  if (subject) {
    conditions.push(eq(pastPaperQuestions.subject, subject));
  }

  if (topic) {
    conditions.push(like(pastPaperQuestions.topic, `%${topic}%`));
  }

  if (yearFrom) {
    conditions.push(gte(pastPaperQuestions.year, yearFrom));
  }

  if (yearTo) {
    conditions.push(lte(pastPaperQuestions.year, yearTo));
  }

  // For now, use text search
  // In production, use vector similarity
  if (query) {
    conditions.push(
      sql`${pastPaperQuestions.questionText} ILIKE ${`%${query}%`}`
    );
  }

  const results = await db
    .select({
      id: pastPaperQuestions.id,
      questionText: pastPaperQuestions.questionText,
      answerText: pastPaperQuestions.answerText,
      year: pastPaperQuestions.year,
      subject: pastPaperQuestions.subject,
      paper: pastPaperQuestions.paper,
      month: pastPaperQuestions.month,
      marks: pastPaperQuestions.marks,
      questionNumber: pastPaperQuestions.questionNumber,
    })
    .from(pastPaperQuestions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit)
    .orderBy(asc(pastPaperQuestions.year), asc(pastPaperQuestions.questionNumber));

  return results;
}
```

- [ ] **Step 2: Commit**
```bash
git add src/lib/rag/search.ts
git commit -m "feat: add past paper question search"
```

---

### Task 5: Search API Endpoint

**Files:**
- Create: `src/app/api/past-paper/search/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
// src/app/api/past-paper/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchPastPaperQuestions } from '@/lib/rag/search';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, subject, yearFrom, yearTo, topic, limit } = body;

    if (!query && !topic) {
      return NextResponse.json(
        { error: 'Query or topic required' },
        { status: 400 }
      );
    }

    const results = await searchPastPaperQuestions({
      query,
      subject,
      yearFrom,
      yearTo,
      topic,
      limit: limit || 20,
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/app/api/past-paper/search/route.ts
git commit -m "feat: add past paper search API"
```

---

### Task 6: Search UI Component

**Files:**
- Create: `src/components/PastPapers/QuestionSearch.tsx`

- [ ] **Step 1: Create the search UI**

```tsx
// src/components/PastPapers/QuestionSearch.tsx
'use client';

import { SearchIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SearchResult {
  id: string;
  questionText: string;
  answerText?: string;
  year: number;
  subject: string;
  paper: string;
  month: string;
}

export function QuestionSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/past-paper/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Find questions about... (e.g., Meiosis, Calculus)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          <HugeiconsIcon icon={SearchIcon} className="w-4 h-4 mr-2" />
          Search
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-black text-sm">
            Found {results.length} questions
          </h3>
          
          {results.map((result) => (
            <Card key={result.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black text-muted-foreground">
                  {result.subject} {result.paper} • {result.month} {result.year}
                </span>
                {result.marks && (
                  <span className="text-xs font-black text-primary">
                    {result.marks} marks
                  </span>
                )}
              </div>
              <p className="font-medium text-sm">{result.questionText}</p>
              {result.answerText && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer text-primary">
                    Show answer
                  </summary>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.answerText}
                  </p>
                </details>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**
```bash
git add src/components/PastPapers/QuestionSearch.tsx
git commit -m "feat: add past paper question search UI"
```

---

## Summary

| Task | Files | Status |
|------|-------|--------|
| 1. DB Schema | src/lib/db/schema.ts | Pending |
| 2. Embeddings | src/lib/rag/embeddings.ts | Pending |
| 3. Indexer | src/lib/rag/indexer.ts | Pending |
| 4. Search | src/lib/rag/search.ts | Pending |
| 5. API Route | src/app/api/past-paper/search/route.ts | Pending |
| 6. Search UI | src/components/PastPapers/QuestionSearch.tsx | Pending |

## Testing Checklist

- [ ] Search returns matching questions
- [ ] Filters work (subject, year range)
- [ ] Results show question + source
- [ ] UI is responsive

## Future Enhancements

- Vector embeddings for semantic search
- AI-generated topic tags
- Question difficulty classification
- Similar questions grouping
