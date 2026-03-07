# PDF to Markdown Extraction Enhancement Implementation Plan

> **For Claude:** Use the executing-plans skill to implement this plan task-by-task.

**Goal:** Enhance PDF extraction to convert PDFs to markdown using markdown.new, save both files to UploadThing, and provide smart view (markdown) vs original PDF view modes.

**Architecture:** Add markdown conversion step using markdown.new/file-to-markdown API before Gemini extraction. Store both PDF and markdown files in UploadThing. Add view mode toggle in PastPaperViewer for smart vs original view.

**Tech Stack:** Next.js 16, Drizzle ORM, UploadThing, markdown.new API, Google Gemini

---

## Task 1: Database Schema Changes

**Files:**
- Modify: `src/lib/db/schema.ts:119-143`
- Create: `drizzle/migration/XXXX_add_markdown_file_url.sql`

**Step 1: Add markdownFileUrl field to schema**

```typescript
// In src/lib/db/schema.ts, add to pastPapers table (around line 125):
markdownFileUrl: text('markdown_file_url'),
```

**Step 2: Update updatePastPaperSchema in actions.ts**

```typescript
// In src/lib/db/actions.ts, update updatePastPaperSchema (around line 716):
const updatePastPaperSchema = z.object({
  // ... existing fields
  markdownFileUrl: z.string().url().max(500).optional(),
});
```

**Step 3: Create migration**

```sql
-- File: drizzle/migration/XXXX_add_markdown_file_url.sql
ALTER TABLE past_papers ADD COLUMN markdown_file_url TEXT;
```

**Step 4: Run migration**

```bash
bun run db:migrate
```

---

## Task 2: UploadThing Configuration

**Files:**
- Modify: `src/app/api/uploadthing/core.ts`

**Step 1: Add markdown file endpoint**

```typescript
// Add to ourFileRouter in src/app/api/uploadthing/core.ts:
pastPaperMarkdown: f({
  text: { maxFileSize: '4MB', maxFileCount: 1 },
})
  .middleware(async () => ({}) )
  .onUploadComplete(async ({ file }) => {
    console.log('Past paper markdown uploaded:', file.ufsUrl);
    return { url: file.ufsUrl };
  }),
```

---

## Task 3: Create Markdown Converter Service

**Files:**
- Create: `src/services/markdownConverter.ts`

**Step 1: Write the service**

```typescript
// src/services/markdownConverter.ts
import { uploadFiles } from '@/lib/uploadthing';
import { logError, logInfo } from '@/lib/monitoring';

export interface MarkdownConversionResult {
  success: boolean;
  markdown?: string;
  error?: string;
}

const MARKDOWN_API_BASE = 'https://markdown.new';

export async function convertPdfToMarkdown(pdfUrl: string): Promise<MarkdownConversionResult> {
  try {
    logInfo('markdown-converter', 'Converting PDF to markdown', { pdfUrl });
    
    const response = await fetch(`${MARKDOWN_API_BASE}/${encodeURIComponent(pdfUrl)}`, {
      headers: {
        'Accept': 'text/markdown',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Markdown API returned ${response.status}`);
    }
    
    const markdown = await response.text();
    
    if (!markdown || markdown.trim().length < 100) {
      throw new Error('Received empty or too short markdown');
    }
    
    logInfo('markdown-converter', 'Markdown conversion successful', { 
      pdfUrl, 
      length: markdown.length 
    });
    
    return { success: true, markdown };
  } catch (error) {
    logError('markdown-converter', 'Markdown conversion failed', {
      pdfUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function uploadMarkdownToUploadThing(
  markdown: string, 
  paperId: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const fileName = `${paperId}-${Date.now()}.md`;
    const file = new File([markdown], fileName, { type: 'text/markdown' });
    
    const result = await uploadFiles('pastPaperMarkdown', {
      files: [file],
    });
    
    if (result?.[0]?.ufsUrl) {
      return { success: true, url: result[0].ufsUrl };
    }
    
    return { success: false, error: 'Upload failed - no URL returned' };
  } catch (error) {
    logError('markdown-converter', 'Markdown upload failed', {
      paperId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
```

---

## Task 4: Modify PDF Extractor to Use Markdown

**Files:**
- Modify: `src/services/pdfExtractor.ts`
- Create: `src/services/markdownExtractor.ts` (extract questions from markdown)

**Step 1: Create markdown extractor service**

```typescript
// src/services/markdownExtractor.ts
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { ExtractedPaper, extractedPaperSchema } from './pdfExtractor';

const markdownOptionSchema = z.object({
  letter: z.string(),
  text: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
});

const markdownQuestionSchema = z.object({
  id: z.string(),
  questionNumber: z.string(),
  questionText: z.string(),
  options: z.array(markdownOptionSchema).optional(),
  subQuestions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    marks: z.number().optional(),
    options: z.array(markdownOptionSchema).optional(),
  })).optional(),
  marks: z.number(),
  topic: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

const markdownPaperSchema = z.object({
  paperId: z.string(),
  subject: z.string(),
  paper: z.string(),
  year: z.number(),
  month: z.string(),
  instructions: z.string().optional(),
  questions: z.array(markdownQuestionSchema),
});

export async function extractQuestionsFromMarkdown(
  markdown: string,
  paperId: string,
  subject: string,
  paper: string,
  year: number,
  month: string
): Promise<ExtractedPaper> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `You are a world-class educational AI specialized in South African NSC exam analysis.
Extract questions from the markdown-formatted exam paper below.

CONTEXT:
- Subject: ${subject}
- Paper: ${paper}
- Year: ${year}
- Month: ${month}

Return valid JSON following this schema:
{
  "paperId": "${paperId}",
  "subject": "${subject}",
  "paper": "${paper}",
  ${year},
  "month": "${month}",
  "instructions": "Extract the instructions section if present",
  "questions": [
    {
      "id": "unique_id",
      "questionNumber": "1",
      "questionText": "Question text",
      "options": [{"letter": "A", "text": "Option", "isCorrect": false}],
      "subQuestions": [{"id": "1.1", "text": "Sub-question", "marks": 5}],
      "marks": 15,
      "topic": "Topic name",
      "difficulty": "easy|medium|hard"
    }
  ]
}

IMPORTANT: Parse the markdown and extract ALL questions. Each question number in the markdown should become a question object.`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt + '\n\n---\n\n' + markdown }] }],
    config: { responseMimeType: 'application/json' },
  });
  
  const cleaned = result.text.replace(/```json\n?|```/g, '').trim();
  const parsed = JSON.parse(cleaned);
  return extractedPaperSchema.parse(parsed);
}
```

**Step 2: Update pdfExtractor.ts to use markdown first**

```typescript
// In src/services/pdfExtractor.ts, modify extractQuestionsFromPDF function
// Add import at top:
import { convertPdfToMarkdown, uploadMarkdownToUploadThing } from './markdownConverter';
import { extractQuestionsFromMarkdown } from './markdownExtractor';

// Modify the extraction logic around line 241:
// Replace step 3 with:
logInfo('pdf-extraction', `Attempting markdown conversion for ${paperId}`);
const markdownResult = await convertPdfToMarkdown(pdfSource);

// Use markdown if successful, otherwise fallback to PDF
if (markdownResult.success && markdownResult.markdown) {
  logInfo('pdf-extraction', `Markdown conversion successful for ${paperId}, extracting questions`);
  extractedData = await extractQuestionsFromMarkdown(
    markdownResult.markdown,
    paperId,
    subject,
    paper,
    year,
    month
  );
  
  // Upload markdown to UploadThing
  const markdownUpload = await uploadMarkdownToUploadThing(markdownResult.markdown, paperId);
  if (markdownUpload.success && markdownUpload.url) {
    extractedData.markdownFileUrl = markdownUpload.url;
  }
} else {
  // Fallback to original PDF extraction
  logWarn('pdf-extraction', `Markdown conversion failed for ${paperId}, using PDF extraction`);
  extractedData = await performFullExtraction(/* ... existing code */);
}
```

---

## Task 5: Update Database Actions for Dual Upload

**Files:**
- Modify: `src/lib/db/actions.ts`

**Step 1: Update save function to handle markdown URL**

```typescript
// In src/lib/db/actions.ts, find saveExtractedQuestionsAction and updatePastPaperSchema
const updatePastPaperSchema = z.object({
  // ... existing
  markdownFileUrl: z.string().url().max(500).optional(),
});

// Update save function to accept markdownFileUrl
export async function saveExtractedQuestionsAction(
  paperId: string,
  extractedQuestions: string,
  markdownFileUrl?: string
): Promise<PastPaper | null> {
  // ... existing code ...
  // Add to .set():
  if (markdownFileUrl) {
    updateData.markdownFileUrl = markdownFileUrl;
  }
}
```

---

## Task 6: Update API Routes

**Files:**
- Modify: `src/app/api/extract-questions/route.ts`
- Modify: `src/app/api/db/past-papers/route.ts`

**Step 1: Update extract-questions route to save markdown URL**

```typescript
// In POST function, after extraction:
// Save markdown URL along with questions
await saveExtractedQuestionsAction(
  paperId, 
  JSON.stringify(extractedData),
  extractedData.markdownFileUrl
);
```

---

## Task 7: Update Frontend Viewer with View Modes

**Files:**
- Modify: `src/screens/PastPaperViewer.tsx`

**Step 1: Add view mode state and toggle**

```typescript
// In PastPaperViewer component, add state:
const [viewMode, setViewMode] = useState<'smart' | 'original'>('smart');

// Add toggle button in header (around line 273):
<Button
  variant="ghost"
  size="sm"
  onClick={() => setViewMode(v => v === 'smart' ? 'original' : 'smart')}
  className="gap-2"
>
  {viewMode === 'smart' ? (
    <>
      <FileText className="w-4 h-4" />
      Smart View
    </>
  ) : (
    <>
      <FileText className="w-4 h-4" />
      Original PDF
    </>
  )}
</Button>
```

**Step 2: Conditionally render based on view mode**

```typescript
// Replace line 191-201 (PDF fallback) with:
if (viewMode === 'original' || showPdfFallback) {
  return (
    <div className="fixed inset-0 z-[200] bg-background overflow-hidden animate-in fade-in duration-300">
      <PdfViewer
        url={paper.storedPdfUrl || paper.downloadUrl}
        title={`${paper.subject} ${paper.paper} (${paper.year})`}
        onClose={() => setShowPdfFallback(false)}
      />
    </div>
  );
}
```

**Step 3: Update paper loading to include markdown URL**

```typescript
// In useEffect around line 83:
const dbPaper = await getPastPaperByIdAction(paperId);
if (dbPaper) {
  const paperData = {
    // ... existing fields
    downloadUrl: dbPaper.storedPdfUrl || dbPaper.originalPdfUrl,
    markdownUrl: dbPaper.markdownFileUrl,  // NEW
  };
  // ... rest of logic
}
```

---

## Task 8: Filter Papers Without PDF

**Files:**
- Modify: `src/lib/db/actions.ts`
- Modify: `src/screens/PastPapers.tsx`

**Step 1: Update getPastPapersAction to filter**

```typescript
// In src/lib/db/actions.ts, modify getPastPapersAction:
export async function getPastPapersAction(filters: PastPaperFilters = {}): Promise<PastPaper[]> {
  const db = await getDb();
  const conditions = [
    // Only show papers that have a stored PDF
    sql`${pastPapers.storedPdfUrl} IS NOT NULL`,
  ];
  
  // ... add other filters
}
```

---

## Task 9: Create Migration Script

**Files:**
- Create: `scripts/migrate-markdown.ts`

**Step 1: Write migration script**

```typescript
// scripts/migrate-markdown.ts
import { convertPdfToMarkdown, uploadMarkdownToUploadThing } from '../src/services/markdownConverter';
import { getDb, pastPapers } from '../src/lib/db';
import { eq } from 'drizzle-orm';

async function migrate() {
  const db = await getDb();
  
  // Get all papers with storedPdfUrl but no markdownFileUrl
  const papers = await db.select().from(pastPapers).where(
    sql`${pastPapers.storedPdfUrl} IS NOT NULL AND ${pastPapers.markdownFileUrl} IS NULL`
  );
  
  console.log(`Found ${papers.length} papers to migrate`);
  
  for (const paper of papers) {
    try {
      console.log(`Processing: ${paper.paperId}`);
      
      const result = await convertPdfToMarkdown(paper.storedPdfUrl!);
      
      if (result.success && result.markdown) {
        const upload = await uploadMarkdownToUploadThing(result.markdown, paper.paperId);
        
        if (upload.success && upload.url) {
          await db.update(pastPapers)
            .set({ markdownFileUrl: upload.url })
            .where(eq(pastPapers.id, paper.id));
          
          console.log(`Updated: ${paper.paperId} with markdown URL`);
        }
      }
      
      // Rate limit - 500 req/day
      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.error(`Failed: ${paper.paperId}`, error);
    }
  }
}

migrate();
```

---

## Task 10: Testing

**Files:**
- Create: `tests/markdown-converter.test.ts`
- Create: `tests/pdf-extractor-markdown.test.ts`

**Step 1: Write tests**

```typescript
// tests/markdown-converter.test.ts
import { describe, it, expect } from 'bun:test';
import { convertPdfToMarkdown } from '../src/services/markdownConverter';

describe('convertPdfToMarkdown', () => {
  it('should convert PDF URL to markdown', async () => {
    const result = await convertPdfToMarkdown('https://example.com/test.pdf');
    // Result structure depends on API
    expect(result).toHaveProperty('success');
  });
});
```

---

## Summary

This implementation adds:
1. Database field for markdown file URL
2. UploadThing endpoint for markdown files
3. Markdown converter service using markdown.new API
4. Modified extraction flow (markdown first, fallback to PDF)
5. Frontend view mode toggle (smart vs original)
6. Paper filtering (only show papers with stored PDF)
7. Migration script for existing papers

**Order of execution:** Tasks 1-2 → 3 → 4 → 5-6 → 7-8 → 9-10
