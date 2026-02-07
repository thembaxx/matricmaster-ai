Yes, I can help structure this Economics exam paper into a production-ready dataset with TypeScript interfaces and database schema. Below is a **practical, implementable solution** optimized for a Next.js educational app (quiz platform, study tool, or teacher resource).

---

### 🔑 Key Design Decisions

1. **Modular structure** – Supports dynamic rendering of question types (MCQ, matching, data-response)
2. **Stimulus-aware** – Handles graphs/tables/cartoons referenced in questions
3. **Exam-compliant** – Preserves mark allocations, time limits, section rules
4. **Scalable** – Designed for multiple exam papers (2025 + future years)
5. **Next.js optimized** – Uses Prisma (PostgreSQL) + TypeScript interfaces ready for App Router

---

### 📦 TypeScript Interfaces (`types/exam.ts`)

```typescript
// Core enums
export enum QuestionType {
  MULTIPLE_CHOICE = "multiple_choice",
  MATCHING = "matching",
  SHORT_ANSWER = "short_answer",
  DATA_RESPONSE = "data_response",
  ESSAY = "essay",
  CALCULATION = "calculation",
}

export enum SectionType {
  COMPULSORY = "compulsory",
  OPTIONAL = "optional",
}

// Stimulus (graphs/tables/cartoons referenced in questions)
export interface Stimulus {
  id: string;
  type: "graph" | "table" | "cartoon" | "text_extract" | "dialogue";
  description: string; // Alt-text for accessibility
  source?: string; // e.g., "Adapted from SARB: Quarterly Bulletin, June 2024"
  imageUrl?: string; // Path to stored asset (e.g., "/stimuli/tot-graph-2025.png")
}

// Question structure
export interface ExamQuestion {
  id: string; // "1.1.1", "2.3.5"
  number: string; // Display number
  type: QuestionType;
  marks: number;
  prompt: string; // Full question text
  stimulusId?: string; // Links to Stimulus
  options?: { label: string; text: string }[]; // For MCQ
  columnA?: string[]; // For matching (COLUMN A items)
  columnB?: string[]; // For matching (COLUMN B items)
  requiresCalculation?: boolean;
  timeAllocation?: string; // e.g., "20 MINUTES" (for whole question block)
}

// Section structure
export interface ExamSection {
  id: string; // "A", "B", "C"
  type: SectionType;
  title: string; // "SECTION A (COMPULSORY)"
  instructions: string;
  requiredCount: number; // e.g., 2 for "Answer TWO of three questions"
  questions: ExamQuestion[];
}

// Full exam paper
export interface ExamPaper {
  id: string; // "economics-p1-may-june-2025"
  subject: string; // "Economics"
  paperCode: string; // "P1"
  session: string; // "May/June 2025"
  marksTotal: number; // 150
  timeTotal: string; // "2 hours"
  grade: string; // "Grade 12"
  sections: ExamSection[];
  copyright: string;
  sourcePdf: string; // "Economics P1 May-June 2025 Eng.pdf"
}
```

---

### 🗄️ Prisma Schema (`schema.prisma`)

```prisma
model ExamPaper {
  id            String    @id @default(uuid())
  subject       String    @default("Economics")
  paperCode     String    // "P1"
  session       String    // "May/June 2025"
  marksTotal    Int
  timeTotal     String
  grade         String    @default("Grade 12")
  copyright     String
  sourcePdf     String
  createdAt     DateTime  @default(now())
  sections      Section[]
  @@unique([paperCode, session])
}

model Section {
  id             String   @id @default(uuid())
  examPaperId    String
  examPaper      ExamPaper @relation(fields: [examPaperId], references: [id], onDelete: Cascade)
  sectionId      String   // "A", "B", "C"
  type           String   // "compulsory", "optional"
  title          String
  instructions   String
  requiredCount  Int
  sortOrder      Int      @default(0)
  questions      Question[]
  @@unique([examPaperId, sectionId])
}

model Question {
  id                String   @id @default(uuid())
  sectionId         String
  section           Section  @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  questionNumber    String   // "1.1.1"
  type              String   // enum value
  marks             Int
  prompt            String   @db.Text
  stimulusId        String?  // Links to Stimulus asset
  optionsJson       Json?    // Stores MCQ options safely
  columnAJson       Json?    // For matching exercises
  columnBJson       Json?    // For matching exercises
  requiresCalc      Boolean  @default(false)
  sortOrder         Int      @default(0)
  @@index([sectionId, sortOrder])
}

model StimulusAsset {
  id          String   @id @default(uuid())
  type        String   // "graph", "table", etc.
  description String   @db.Text
  source      String?
  assetPath   String?  // "/public/stimuli/tot-graph-2025.png"
  examPaperId String
  examPaper   ExamPaper @relation(fields: [examPaperId], references: [id], onDelete: Cascade)
  @@unique([examPaperId, assetPath])
}
```

---

### 📊 Sample Dataset Snippet (`data/economics-p1-2025.json`)

```json
{
  "id": "economics-p1-may-june-2025",
  "subject": "Economics",
  "paperCode": "P1",
  "session": "May/June 2025",
  "marksTotal": 150,
  "timeTotal": "2 hours",
  "grade": "Grade 12",
  "sections": [
    {
      "id": "A",
      "type": "compulsory",
      "title": "SECTION A (COMPULSORY)",
      "instructions": "Answer ALL questions in this section.",
      "requiredCount": 1,
      "questions": [
        {
          "id": "1.1.1",
          "number": "1.1.1",
          "type": "multiple_choice",
          "marks": 2,
          "prompt": "Consumer spending that is independent of the level of income is known as... consumption.",
          "options": [
            { "label": "A", "text": "induced" },
            { "label": "B", "text": "autonomous" },
            { "label": "C", "text": "household" },
            { "label": "D", "text": "aggregate" }
          ]
        },
        {
          "id": "1.2.1",
          "number": "1.2.1",
          "type": "matching",
          "marks": 1,
          "prompt": "Match items in COLUMN A with descriptions in COLUMN B",
          "columnA": ["Real flow", "Phillips curve", "Nationalisation"],
          "columnB": [
            "transfer of functions and ownership of entities from the private sector to the public sector",
            "movement of goods, services and factors of production between economic participants",
            "illustrates the relationship between unemployment and inflation"
          ]
        },
        {
          "id": "1.3.1",
          "number": "1.3.1",
          "type": "short_answer",
          "marks": 1,
          "prompt": "The proportion of additional income that households choose to spend on goods and services"
        }
      ]
    },
    {
      "id": "B",
      "type": "optional",
      "title": "SECTION B",
      "instructions": "Answer any TWO of the three questions.",
      "requiredCount": 2,
      "questions": [
        {
          "id": "2.2",
          "number": "2.2",
          "type": "data_response",
          "marks": 10,
          "prompt": "Study the cartoon below and answer the questions that follow.",
          "stimulusId": "stimulus-sa-economic-activity-cartoon",
          "subQuestions": [
            {
              "id": "2.2.1",
              "prompt": "Identify a contraction phase...",
              "marks": 1
            },
            {
              "id": "2.2.5",
              "prompt": "How can an economic recovery benefit...",
              "marks": 4
            }
          ]
        }
      ]
    }
  ],
  "copyright": "Confidential Copyright reserved",
  "sourcePdf": "Economics P1 May-June 2025 Eng.pdf"
}
```

---

### 🚀 Implementation Tips for Next.js

1. **Asset Handling**:
   - Store stimulus images in `/public/stimuli/` with naming convention: `{exam-id}-{question-id}.png`
   - Use `next/image` with `alt={stimulus.description}` for accessibility

2. **Dynamic Question Rendering**:

   ```tsx
   // components/QuestionRenderer.tsx
   export default function QuestionRenderer({
     question,
   }: {
     question: ExamQuestion;
   }) {
     switch (question.type) {
       case QuestionType.MULTIPLE_CHOICE:
         return <MCQ options={question.options!} prompt={question.prompt} />;
       case QuestionType.MATCHING:
         return (
           <MatchingExercise
             colA={question.columnA!}
             colB={question.columnB!}
           />
         );
       // ... other types
     }
   }
   ```

3. **Section Logic**:
   - Use `requiredCount` to build UI: "✅ Answer 2 of 3 questions" with selection validation
   - Track time allocation per section using `timeTotal` + section weights

4. **Data Population**:
   - Seed database using Prisma: `prisma db seed` with JSON parser
   - Generate stimulus assets from PDF using PDF.js + manual alt-text tagging

5. **Accessibility**:
   - All stimuli include `description` field for screen readers
   - Semantic HTML for question numbering (ARIA labels)

---

### ⚠️ Critical Notes

- **PDF Limitation**: Actual graphs/tables require manual extraction (image + alt-text). The text extract lacks visual data values (e.g., exact ToT graph numbers).
- **Answer Keys**: This structure holds _questions only_. Add `answerKey` field if building a grading tool.
- **Scalability**: For 100+ papers, add `curriculum` (CAPS), `language`, and `difficulty` fields.
- **Legal**: Respect copyright – this structure is for educational/internal use only per exam board terms.

Would you like me to:

1. Generate the full JSON dataset for Section A?
2. Provide a Next.js page component example for rendering Question 1.1?
3. Share a Prisma seed script to populate the database?
