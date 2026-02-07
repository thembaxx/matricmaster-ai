# 📚 English Home Language P1 (May/June 2025) - Structured Data Solution

I've analyzed the exam paper and created a production-ready solution optimized for language assessment workflows. Unlike physics papers, this requires nuanced handling of textual analysis, multimodal content (posters/cartoons), and writing-focused tasks.

---

## 🗃️ Database Schema (Language Assessment Optimized)

```sql
-- Core exam metadata
CREATE TABLE exam_papers (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(100) NOT NULL DEFAULT 'ENGLISH HOME LANGUAGE P1',
  session VARCHAR(50) NOT NULL,  -- 'MAY/JUNE 2025'
  year INTEGER NOT NULL,
  total_marks INTEGER NOT NULL CHECK (total_marks = 70),
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  page_count INTEGER NOT NULL,
  instructions TEXT NOT NULL  -- Full instructions block
);

-- Sections (A: Comprehension, B: Summary, C: Language)
CREATE TABLE sections (
  id SERIAL PRIMARY KEY,
  exam_paper_id INTEGER REFERENCES exam_papers(id) ON DELETE CASCADE,
  section_letter CHAR(1) NOT NULL CHECK (section_letter IN ('A','B','C')),
  title VARCHAR(100) NOT NULL,  -- 'Comprehension', 'Summary', etc.
  allocated_marks INTEGER NOT NULL,
  suggested_time_minutes INTEGER,
  section_instructions TEXT,  -- Section-specific guidance
  UNIQUE(exam_paper_id, section_letter)
);

-- Source texts (passages, posters, cartoons, ads)
CREATE TABLE source_texts (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  text_identifier VARCHAR(20) NOT NULL,  -- 'TEXT A', 'TEXT B', etc.
  title TEXT,
  content TEXT NOT NULL,
  text_type VARCHAR(30) NOT NULL CHECK (
    text_type IN ('passage', 'poster', 'cartoon_description', 'advertisement', 'summary_passage')
  ),
  source_attribution VARCHAR(255),  -- e.g., '[Adapted from thenorthernview.com]'
  has_visual_element BOOLEAN DEFAULT TRUE,
  visual_reference_key VARCHAR(100),  -- For asset linking (e.g., 'text_b_safety_poster')
  word_count INTEGER
);

-- Questions (structured for language analysis)
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,  -- 1, 2, 3
  question_stem TEXT,  -- Main prompt (e.g., "Summarise how people can adopt a frugal lifestyle")
  total_marks INTEGER NOT NULL,
  referenced_texts VARCHAR(50)[] DEFAULT '{}',  -- ['TEXT A', 'TEXT B']
  task_type VARCHAR(50) NOT NULL CHECK (
    task_type IN (
      'comprehension', 'summary', 'ad_analysis', 'cartoon_analysis',
      'grammar_correction', 'vocabulary', 'discourse_analysis'
    )
  ),
  constraints TEXT[]  -- e.g., '{"SEVEN points"', '"NOT exceed 90 words"'}
);

-- Sub-questions (granular assessment items)
CREATE TABLE sub_questions (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  sub_question_number VARCHAR(15) NOT NULL,  -- '1.1', '1.12.1', '4.6'
  prompt TEXT NOT NULL,
  marks NUMERIC(3,1) NOT NULL,
  question_format VARCHAR(30) CHECK (
    question_format IN (
      'short_answer', 'multiple_choice', 'rewrite_sentence',
      'justify_response', 'sketch_graph', 'identify_technique'
    )
  ),
  requires_visual_context BOOLEAN DEFAULT FALSE,
  visual_context_hint VARCHAR(255),  -- e.g., 'FRAME 3 of cartoon', 'right-hand side font'
  mcq_options JSONB,  -- For MCQs: [{"letter":"A","text":"litotes"},...]
  answer_guidance TEXT  -- Examiner notes (optional)
);
```

---

## 💻 TypeScript Interfaces (Pedagogy-Focused)

```typescript
// Core types
type SectionLetter = "A" | "B" | "C";
type TextType =
  | "passage"
  | "poster"
  | "cartoon_description"
  | "advertisement"
  | "summary_passage";
type TaskType =
  | "comprehension"
  | "summary"
  | "ad_analysis"
  | "cartoon_analysis"
  | "grammar_correction"
  | "vocabulary"
  | "discourse_analysis";
type QuestionFormat =
  | "short_answer"
  | "multiple_choice"
  | "rewrite_sentence"
  | "justify_response"
  | "sketch_graph"
  | "identify_technique";

// Source text with multimodal support
interface SourceText {
  id?: number;
  identifier: string; // "TEXT A", "TEXT E"
  title?: string;
  content: string;
  type: TextType;
  sourceAttribution?: string;
  hasVisualElement: boolean;
  visualReferenceKey?: string; // Links to asset library
  wordCount?: number;
}

// Sub-question with language-specific features
interface SubQuestion {
  id?: number;
  number: string; // "1.12.1", "4.6"
  prompt: string;
  marks: number;
  format: QuestionFormat;
  requiresVisualContext?: boolean;
  visualContextHint?: string; // "FRAME 9", "right-hand font"
  mcqOptions?: Array<{ letter: string; text: string }>;
  constraints?: string[]; // ["SEVEN points", "90 words max"]
}

// Main question with pedagogical metadata
interface Question {
  id?: number;
  number: number; // 1, 2, 3
  stem?: string;
  totalMarks: number;
  referencedTexts: string[]; // ["TEXT A", "TEXT B"]
  taskType: TaskType;
  subQuestions: SubQuestion[];
  constraints?: string[]; // Section B specific requirements
}

// Full exam structure
interface EnglishExamPaper {
  id?: number;
  subject: string;
  session: string;
  year: number;
  totalMarks: number;
  durationMinutes: number;
  instructions: string;
  sections: {
    [key in SectionLetter]: {
      title: string;
      allocatedMarks: number;
      suggestedTimeMinutes?: number;
      sectionInstructions?: string;
      sourceTexts?: SourceText[];
      questions: Question[];
    };
  };
}

// Specialized interfaces for key tasks
interface SummaryTask extends Question {
  taskType: "summary";
  constraints: [
    "SEVEN points",
    "NOT exceed 90 words",
    "fluent paragraph",
    "no title",
  ];
  sourceTextIdentifier: "TEXT C";
}

interface CartoonAnalysisTask {
  characters: { name: string; description: string }[];
  framesReferenced: string[]; // ["FRAME 1", "FRAME 3", "FRAME 9"]
  visualElements: string[];
}
```

---

## 📊 Sample Extracted Data (JSON Snippet)

```json
{
  "examPaper": {
    "subject": "ENGLISH HOME LANGUAGE P1",
    "session": "MAY/JUNE 2025",
    "year": 2025,
    "totalMarks": 70,
    "durationMinutes": 120,
    "instructions": "Answer ALL questions. Start EACH section on a NEW page. Number answers correctly. Leave a line after each answer. Pay attention to spelling and sentence construction."
  },
  "sections": {
    "A": {
      "title": "Comprehension",
      "allocatedMarks": 30,
      "suggestedTimeMinutes": 50,
      "sourceTexts": [
        {
          "identifier": "TEXT A",
          "title": "HITCHHIKING: THE ALTERNATIVE FORM OF TRANSPORT THAT NOBODY USES",
          "type": "passage",
          "content": "A recent survey published by the Automobile Association(AA) found that only 9 per cent of drivers would be likely to pick up a hitchhiker... [full text truncated]",
          "sourceAttribution": "[Adapted from theecologist.org]",
          "wordCount": 385,
          "hasVisualElement": false
        },
        {
          "identifier": "TEXT B",
          "type": "poster",
          "content": "THIS RIDE MAY TAKE YOU TO A PLACE YOU DON'T WANT TO GO\n\n• Let someone know where you are going...\n• Carry a mobile phone and identification...\n• TRUST your INSTINCTS. If someone makes you feel uncomfortable, DON'T GET IN!",
          "sourceAttribution": "[Adapted from thenorthernview.com]",
          "hasVisualElement": true,
          "visualReferenceKey": "safety_poster_text_b"
        }
      ],
      "questions": [
        {
          "number": 1,
          "totalMarks": 30,
          "referencedTexts": ["TEXT A", "TEXT B"],
          "taskType": "comprehension",
          "subQuestions": [
            {
              "number": "1.1",
              "prompt": "Provide the meaning of the expression, 'thumbing it' in paragraph 1.",
              "marks": 1,
              "format": "short_answer"
            },
            {
              "number": "1.12.1",
              "prompt": "'THIS RIDE MAY TAKE YOU TO A PLACE YOU DON'T WANT TO GO' is an example of...",
              "marks": 1,
              "format": "multiple_choice",
              "mcqOptions": [
                { "letter": "A", "text": "litotes" },
                { "letter": "B", "text": "metaphor" },
                { "letter": "C", "text": "hyperbole" },
                { "letter": "D", "text": "irony" }
              ]
            },
            {
              "number": "1.13",
              "prompt": "Does TEXT B reinforce the writer's view expressed in paragraph 6 of TEXT A? Justify your answer.",
              "marks": 3,
              "format": "justify_response",
              "requiresVisualContext": true,
              "visualContextHint": "Safety poster messaging vs. TEXT A paragraph 6 discussion of risk"
            }
          ]
        }
      ]
    },
    "B": {
      "title": "Summary",
      "allocatedMarks": 10,
      "suggestedTimeMinutes": 30,
      "sourceTexts": [
        {
          "identifier": "TEXT C",
          "title": "THE UNIQUE WORLD OF FRUGAL LIVING",
          "type": "summary_passage",
          "content": "Being frugal means using less and performing many tiny tasks in a very inexpensive way to save more money... [full text truncated]",
          "wordCount": 218
        }
      ],
      "questions": [
        {
          "number": 2,
          "stem": "Summarise, in your own words, how people can adopt a frugal lifestyle.",
          "totalMarks": 10,
          "taskType": "summary",
          "constraints": [
            "SEVEN points",
            "NOT exceed 90 words",
            "fluent paragraph",
            "no title required",
            "indicate word count"
          ],
          "referencedTexts": ["TEXT C"],
          "subQuestions": []
        }
      ]
    },
    "C": {
      "title": "Language structures and conventions",
      "allocatedMarks": 30,
      "suggestedTimeMinutes": 40,
      "sourceTexts": [
        {
          "identifier": "TEXT D",
          "type": "advertisement",
          "content": "RAISING THE ROOF\nHOMELESS YOUTH HAVE NOTHING, BUT POTENTIAL.\nYou see an abandoned chair... You see a homeless youth...",
          "visualReferenceKey": "homeless_youth_ad"
        },
        {
          "identifier": "TEXT E",
          "type": "cartoon_description",
          "content": "CHARACTERS: Woman: Mrs Wilson, Boy: Dennis, Man: Mr Wilson\n[9-frame sequence description with dialogue]",
          "visualReferenceKey": "dennis_cartoon_frames"
        }
      ],
      "questions": [
        {
          "number": 4,
          "totalMarks": 10,
          "taskType": "cartoon_analysis",
          "referencedTexts": ["TEXT E"],
          "subQuestions": [
            {
              "number": "4.6",
              "prompt": "Mrs Wilson's statement in FRAME 8, written in indirect speech, is:",
              "marks": 1,
              "format": "multiple_choice",
              "mcqOptions": [
                {
                  "letter": "A",
                  "text": "Mrs Wilson said(to Mr Wilson) that Dennis had been picking a Christmas present for himself."
                },
                {
                  "letter": "B",
                  "text": "Mrs Wilson said(to Mr Wilson) that Dennis was picking a Christmas present for him."
                },
                {
                  "letter": "C",
                  "text": "Mrs Wilson said(to Mr Wilson) that Dennis had been picking a Christmas present for him."
                },
                {
                  "letter": "D",
                  "text": "Mrs Wilson said(to Mr Wilson) that Dennis had picked a Christmas present for you."
                }
              ]
            },
            {
              "number": "4.5",
              "prompt": "Rewrite Dennis's words in FRAME 2 so that the sentence is grammatically CORRECT.",
              "marks": 1,
              "format": "rewrite_sentence",
              "requiresVisualContext": true,
              "visualContextHint": "FRAME 2 dialogue bubble"
            }
          ]
        }
      ]
    }
  }
}
```

---

## 🌐 Web Application Integration Guide

### Critical Implementation Strategies

1. **Multimodal Content Handling**

   ```typescript
   // Visual asset resolver
   const getVisualAsset = (referenceKey: string): VisualAsset => {
     const assets = {
       safety_poster_text_b: {
         type: "image",
         path: "/assets/exams/2025/english/text_b_poster.jpg",
         altText: "Safety poster with red background and warning text",
       },
       dennis_cartoon_frames: {
         type: "interactive-carousel",
         frames: Array(9)
           .fill(0)
           .map((_, i) => `/assets/cartoons/dennis/frame_${i + 1}.png`),
         characterKey: {
           "Mrs Wilson": " stern woman",
           Dennis: "mischievous boy",
         },
       },
     };
     return (
       assets[referenceKey] || {
         type: "placeholder",
         message: "[Visual reference required]",
       }
     );
   };
   ```

2. **Summary Task Validation**

   ```typescript
   const validateSummary = (
     text: string,
     constraints: string[],
   ): ValidationResult => {
     const wordCount = text
       .trim()
       .split(/\s+/)
       .filter((w) => w).length;
     const hasSevenPoints = (text.match(/\d+\./g)?.length || 0) >= 7;

     return {
       valid: wordCount <= 90 && hasSevenPoints && !text.includes("\n\n"),
       errors: [
         ...(wordCount > 90
           ? [`Exceeds 90-word limit (${wordCount} words)`]
           : []),
         ...(!hasSevenPoints ? ["Requires exactly SEVEN distinct points"] : []),
         ...(text.includes("\n\n") ? ["Must be single fluent paragraph"] : []),
       ],
       wordCount,
     };
   };
   ```

3. **Cartoon Analysis Component**
   ```tsx
   const CartoonAnalyzer = ({
     textId,
     frames,
   }: {
     textId: string;
     frames: string[];
   }) => (
     <div className="cartoon-analysis">
       <Carousel frameAssets={getVisualAsset(textId).frames}>
         {({ currentFrame }) => (
           <div>
             <QuestionPrompt
               prompt={`Explain what is revealed about Mrs Wilson's attitude in ${currentFrame}`}
             />
             <CharacterKey characters={cartoonCharacters[textId]} />
           </div>
         )}
       </Carousel>
     </div>
   );
   ```

### Pedagogical Features to Implement

| Feature                      | Implementation Tip                                          | Why It Matters                             |
| ---------------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| **Word Count Validator**     | Real-time counter with constraint alerts                    | Critical for Section B success             |
| **Visual Context Toggle**    | "Show Frame Description" button for cartoon questions       | Supports accessibility & remote learning   |
| **MCQ Answer Justification** | Required text field after selection: "Explain your choice"  | Develops critical thinking beyond guessing |
| **Summary Point Builder**    | Drag-and-drop interface to organize 7 points before writing | Scaffolds complex writing task             |
| **Grammar Highlighter**      | Click text in TEXT F to tag errors before rewriting         | Mirrors actual exam annotation process     |

### Asset Management Strategy

1. Create visual asset library with keys matching `visualReferenceKey`
2. For cartoons: Store frame-by-frame images + character key
3. For posters/ads: High-res images with alt-text descriptions
4. Include "text-only fallback" mode for screen readers:
   ```json
   "text_b_fallback": "Safety poster with bold red text: 'THIS RIDE MAY TAKE YOU TO A PLACE YOU DON'T WANT TO GO' followed by 5 bullet points of safety advice including 'TRUST your INSTINCTS'"
   ```

This solution transforms the exam into an interactive learning tool while preserving assessment integrity. The schema supports both student practice platforms and teacher marking systems, with special attention to language-specific workflows like summary validation and visual text analysis. 📖✨
