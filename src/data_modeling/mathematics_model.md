I'll help you structure this exam paper data for a Next.js application. Since **full automated extraction isn't feasible** (math symbols are corrupted in the text extract, hierarchical structure requires manual validation), here's a production-ready solution with clean interfaces, sample data, and implementation strategy:

---

### ✅ TypeScript Interfaces (`types/exam-paper.ts`)

```typescript
// Core metadata
export interface ExamMetadata {
  id: string; // slug: 'mathematics-p1-may-june-2025'
  title: string; // "MATHEMATICS P1"
  examType: string; // "SENIOR CERTIFICATE EXAMINATIONS"
  year: number;
  session: "MAY/JUNE" | "NOVEMBER";
  totalMarks: number;
  timeHours: number;
  subject: "Mathematics";
  paperNumber: "P1" | "P2";
  confidentiality: "Confidential" | "Public";
}

// Recursive question structure (handles all nesting levels)
export interface QuestionNode {
  id: string; // "1.1.3", "2.2.1(a)", "5"
  text: string; // Cleaned question text (LaTeX-ready)
  marks?: number; // Only on leaf nodes
  isLeaf: boolean; // true = actual question, false = container section
  children?: QuestionNode[];
  metadata?: {
    requiresDiagram?: boolean;
    rounding?: "TWO_DECIMAL" | "INTEGER";
    specialInstructions?: string;
  };
}

// Full paper structure
export interface ExamPaper {
  metadata: ExamMetadata;
  questions: QuestionNode[]; // Top-level: ["1", "2", ..., "11"]
  informationSheet?: string; // LaTeX-formatted formula sheet
  extractedAt: string; // ISO date
  sourceFile: string; // "Mathematics_P1_May-June_2025_Eng.pdf"
}

// For database storage (normalized)
export interface DbQuestionItem {
  id: string; // UUID
  paperId: string; // References ExamPaper.id
  hierarchicalId: string; // "3.2"
  parentId: string | null; // UUID of parent section
  text: string;
  marks: number | null;
  depth: number; // 0=question, 1=part, 2=subpart
  orderIndex: number; // For sorting siblings
  createdAt: Date;
}
```

---

### 📦 Sample Dataset Snippet (`data/papers/mathematics-p1-2025.json`)

```json
{
  "metadata": {
    "id": "mathematics-p1-may-june-2025",
    "title": "MATHEMATICS P1",
    "examType": "SENIOR CERTIFICATE EXAMINATIONS",
    "year": 2025,
    "session": "MAY/JUNE",
    "totalMarks": 150,
    "timeHours": 3,
    "subject": "Mathematics",
    "paperNumber": "P1",
    "confidentiality": "Confidential"
  },
  "questions": [
    {
      "id": "1",
      "text": "QUESTION 1",
      "isLeaf": false,
      "children": [
        {
          "id": "1.1",
          "text": "Solve for $x$:",
          "isLeaf": false,
          "children": [
            {
              "id": "1.1.1",
              "text": "$x^2 - 3x - 10 = 0$",
              "marks": 3,
              "isLeaf": true
            },
            {
              "id": "1.1.2",
              "text": "$3x^2 + 6x + 1 = 0$ (correct to TWO decimal places)",
              "marks": 3,
              "isLeaf": true
            }
          ]
        },
        {
          "id": "1.2",
          "text": "A rectangle having sides of $(y - 3)$ metres and $(x + 2)$ metres has a perimeter of 24 metres and an area of 32 square metres. Calculate the values of $x$ and $y$.",
          "marks": 6,
          "isLeaf": true
        }
      ]
    }
  ],
  "informationSheet": "\\[ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\]\n\\[ A = P(1 + i)^n \\]",
  "extractedAt": "2026-02-08T12:00:00Z",
  "sourceFile": "Mathematics_P1_May-June_2025_Eng.pdf"
}
```

---

### 🗄️ Database Schema Recommendation (PostgreSQL)

```sql
-- Papers table
CREATE TABLE exam_papers (
  id TEXT PRIMARY KEY, -- 'mathematics-p1-may-june-2025'
  metadata JSONB NOT NULL, -- Stores ExamMetadata
  information_sheet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Normalized questions table (for querying/filtering)
CREATE TABLE question_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id TEXT REFERENCES exam_papers(id) ON DELETE CASCADE,
  hierarchical_id TEXT NOT NULL, -- '4.3'
  parent_hierarchical_id TEXT, -- '4' for section parent
  text TEXT NOT NULL,
  marks SMALLINT,
  depth SMALLINT NOT NULL CHECK (depth >= 0), -- 0=Q, 1=part, 2=subpart
  order_index SMALLINT NOT NULL,
  is_leaf BOOLEAN NOT NULL,
  metadata JSONB,
  UNIQUE(paper_id, hierarchical_id)
);

-- Index for fast paper retrieval
CREATE INDEX idx_questions_paper ON question_items(paper_id, depth, order_index);
```

---

### 🚀 Next.js Implementation Guide

1. **Data Preparation Workflow**
   - Clean math symbols using regex + manual review:
     ```ts
     // utils/cleanMath.ts
     export const cleanMathText = (raw: string) =>
       raw
         .replace(//g, "=")
         .replace(//g, "-")
         .replace(/(\d) (\d)/g, "$1$2") // Fix spacing in eqs
         .replace(/(x)\^(\d)/g, "$1^{$2}"); // Prepare for LaTeX
     ```
   - Convert to LaTeX using [Mathpix](https://mathpix.com/) for production quality
   - Store final JSON in `/public/data/papers/`

2. **Data Fetching (App Router)**

   ```ts
   // app/exams/[paperId]/page.tsx
   import { ExamPaper } from '@/types/exam-paper';

   async function getExamPaper(id: string): Promise<ExamPaper> {
     // For static sites: import JSON directly
     // For dynamic: fetch from /api/papers/[id]
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/papers/${id}`);
     return res.json();
   }

   export default async function PaperPage({ params }) {
     const paper = await getExamPaper(params.paperId);
     return <ExamRenderer paper={paper} />;
   }
   ```

3. **Critical Recommendations**
   - 🔒 **Do NOT store raw extracted text** – corrupted symbols will break rendering
   - ✨ **Use LaTeX rendering**: Integrate [KaTeX](https://katex.org/) or MathJax
     ```tsx
     // components/MathRenderer.tsx
     import { InlineMath, BlockMath } from "react-katex";
     ```
   - 🌐 **For multi-paper apps**: Add `curriculum: 'CAPS' | 'IEB'` to metadata
   - 📱 **Mobile optimization**: Store diagram URLs separately in `metadata.diagramUrls`
   - ⚠️ **Legal note**: Confirm copyright status before public deployment (DBE materials often have usage restrictions)

---

### 📌 Why This Approach Wins

| Component             | Solution                          | Benefit                                                     |
| --------------------- | --------------------------------- | ----------------------------------------------------------- |
| **Data Structure**    | Recursive tree + normalized DB    | Handles arbitrary nesting; enables filtering by marks/topic |
| **Math Rendering**    | LaTeX-ready text + KaTeX          | Professional equation display                               |
| **Scalability**       | Paper ID slugs + UUIDs            | Supports 1000s of papers                                    |
| **Maintainability**   | Separated clean JSON + DB schema  | Easy updates without code changes                           |
| **Next.js Optimized** | Static JSON + App Router patterns | Max performance with SSG/ISR                                |

> 💡 **Pro Tip**: Start with **QUESTION 1 only** as your MVP dataset. Validate the rendering pipeline before processing all 11 questions. Use [PDFPlumber](https://github.com/jsvine/pdfplumber) + manual cleanup for future extractions – fully automated parsing of scanned math PDFs remains unreliable.

Let me know if you need the full QUESTION 1 JSON sample with cleaned LaTeX, KaTeX integration code, or Prisma schema! 🧮✨
