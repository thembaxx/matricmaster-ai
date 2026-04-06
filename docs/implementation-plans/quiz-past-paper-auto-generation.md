# Implementation Plan: Quiz ← Past Paper Auto-generation

> Feature: P1 - Quiz ← Past Paper Auto-generation  
> Version: 1.0 | Created: April 2026

## 1. Overview

**Feature Summary:** Automatically generate quizzes from uploaded past paper PDFs, leveraging existing question extraction infrastructure and creating adaptive quiz experiences.

**Business Value:**
- Increase past paper engagement by 35%
- Enable instant practice from any past paper
- Link to study plans automatically
- Support exam preparation workflow

**Success Metrics:**
- Past paper engagement: +35%
- Quiz completion rate: 60% → 80%
- Questions extracted per paper: 90%+ accuracy

---

## 2. Work Breakdown

### 2.1 User Stories

| Story | Priority | Estimate |
|-------|----------|----------|
| Upload past paper → auto-generate quiz | P0 | 5 pts |
| Select questions from extracted set | P0 | 3 pts |
| Link quiz to study plan topic | P1 | 2 pts |
| Review incorrect answers → recommend review | P1 | 3 pts |
| Generate quiz from past paper recommendations | P2 | 3 pts |

### 2.2 Technical Tasks

#### Task 1: Enhance Question Extraction
**Location:** `src/app/api/extract-questions/route.ts` (modify)

**Enhancements:**
- Add quiz-ready formatting (options generation)
- Include difficulty estimation
- Extract topic alignment
- Add year/paper metadata
- **Estimate:** 3 pts

#### Task 2: API - Quiz Generation from Extraction
**Location:** `src/app/api/quiz/from-past-paper/generate/route.ts` (new)

**Implementation:**
- Accept paper ID + question selection
- Generate quiz questions from extracted data
- Add distractors (AI-generated for multiple choice)
- Create quiz session
- **Estimate:** 5 pts

#### Task 3: Frontend - Quiz Generation UI
**Location:** `src/components/PastPapers/QuizGenerator.tsx` (new)

**Features:**
- Question preview with selection checkboxes
- Filter by topic/difficulty/year
- "Generate Quiz" button with settings
- Quiz settings: question count, time limit
- **Estimate:** 5 pts

#### Task 4: Frontend - Quiz Taking Experience
**Location:** `src/app/setwork-library/quiz/page.tsx` (modify)

**Enhancements:**
- Past paper quiz mode with source reference
- Show source question (link to PDF)
- Timer based on difficulty
- Immediate feedback with explanation
- **Estimate:** 5 pts

#### Task 5: Integration - Study Plan Link
**Location:** `src/components/StudyPlan/LinkQuizModal.tsx` (new)

**Features:**
- After quiz completion, prompt to add to study plan
- Auto-suggest topics based on weak areas
- Track quiz as study plan activity
- **Estimate:** 3 pts

#### Task 6: Analytics - Question Performance
**Location:** `src/app/api/quiz/from-past-paper/stats/route.ts` (new)

**Implementation:**
- Track performance by extracted question
- Identify high-value practice questions
- Update difficulty based on user performance
- **Estimate:** 3 pts

---

## 3. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Past Paper Upload                        │
│                          │                                  │
│                          ▼                                  │
│         ┌───────────────────────────────┐                   │
│         │   /api/extract-questions     │                   │
│         │   (existing + enhanced)      │                   │
│         └───────────────┬───────────────┘                   │
│                         │                                  │
│                         ▼                                  │
│         ┌───────────────────────────────┐                   │
│         │   Question Bank (stored)      │                   │
│         └───────────────┬───────────────┘                   │
│                         │                                  │
│          ┌──────────────┴──────────────┐                   │
│          ▼                             ▼                   │
│  ┌───────────────┐            ┌───────────────┐           │
│  │Quiz Generator │            │ Quiz Taking   │           │
│  │ UI            │            │ Experience    │           │
│  └───────┬───────┘            └───────┬───────┘           │
│          │                             │                    │
│          └──────────────┬──────────────┘                   │
│                         ▼                                   │
│          ┌───────────────────────────────┐                 │
│          │    Study Plan Integration     │                 │
│          └───────────────────────────────┘                 │
```

---

## 4. API Contracts

### 4.1 Existing Endpoints (Enhanced)

| Endpoint | Enhancement |
|----------|-------------|
| POST `/api/extract-questions` | Add quiz-ready format |
| POST `/api/quiz/from-past-papers` | Already exists - enhance |

### 4.2 New Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/quiz/from-past-paper/create` | Create quiz from extracted questions |
| GET | `/api/quiz/from-past-paper/{paperId}/questions` | Get extracted questions for quiz |
| POST | `/api/quiz/from-past-paper/{quizId}/complete` | Quiz completion with study plan link |

### 4.3 Data Models

```typescript
interface ExtractedQuestionForQuiz {
  questionId: string;
  questionText: string;
  subQuestions?: SubQuestion[];
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  year: number;
  paper: string;
  month: string;
  
  // Quiz-specific
  options?: string[]; // for multiple choice
  correctAnswer?: string;
  explanation?: string;
}

interface QuizGenerationRequest {
  paperId: string;
  questionIds: string[];
  settings: {
    questionCount?: number;
    timeLimit?: number;
    shuffleQuestions: boolean;
    showImmediateFeedback: boolean;
  };
}
```

---

## 5. Question Enhancement Pipeline

### 5.1 Current State

- Questions extracted with text, topic, marks, year
- Stored in `extracted_questions` JSON field

### 5.2 Enhancement Steps

```typescript
async function enhanceQuestionForQuiz(question: ExtractedQuestion) {
  // Step 1: Generate multiple choice options if not already present
  if (!question.options && isObjectiveType(question)) {
    const options = await generateDistractors(question);
    question.options = options;
  }
  
  // Step 2: Estimate difficulty if not set
  if (!question.difficulty) {
    question.difficulty = await estimateDifficulty(question, question.marks);
  }
  
  // Step 3: Link to curriculum topics
  if (!question.curriculumTopics) {
    question.curriculumTopics = await mapToCurriculum(question.topic);
  }
  
  return question;
}
```

---

## 6. Frontend Components

### 6.1 Quiz Generator UI

```tsx
// Flow:
// 1. User uploads/views past paper
// 2. Click "Generate Quiz"
// 3. Shows extracted questions with checkboxes
// 4. Filter by topic/difficulty
// 5. Select count or "All"
// 6. Configure settings (time, feedback)
// 7. Click "Start Quiz"
```

### 6.2 Quiz Taking Mode

- Shows "Past Paper Quiz" badge
- Each question shows source reference
- Timer in corner
- Submit → instant results with explanations
- "Add to Study Plan" prompt on completion

---

## 7. Study Plan Integration

### 7.1 Link Flow

```
Quiz Completion
      │
      ▼
┌───────────────────┐
│ Show Weak Topics  │
│ (from quiz result)│
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Prompt: "Add to   │
│ Study Plan?"      │
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
   Yes       No
    │         │
    ▼         ▼
┌────────┐  Done
│ Link to│
│ Topics │
└────────┘
```

### 7.2 Tracking

- Quiz result linked to study plan
- Topic performance tracked
- Adaptive recommendations updated

---

## 8. Analytics & Adaptive Learning

### 8.1 Question Performance Tracking

```typescript
interface QuestionPerformance {
  questionId: string;
  attempts: number;
  correctCount: number;
  averageTime: number;
  lastAttempted: Date;
  difficultyAdjusted: number;
}
```

### 8.2 Adaptive Selection

- Prioritize questions user struggle with
- Mix of difficulty levels based on user level
- Remove questions user master

---

## 9. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| Poor PDF quality | Show warning, allow manual question entry |
| No questions extracted | Fallback to OCR + AI extraction |
| Duplicate questions | Dedupe across papers, track uniqueness |
| Quiz interrupted | Save progress, allow resume |
| Large paper (50+ questions) | Paginate, lazy load |

---

## 10. Testing Requirements

- [ ] PDF upload → question extraction → quiz generation
- [ ] Quiz taking → completion → results display
- [ ] Study plan link flow
- [ ] Question difficulty estimation accuracy
- [ ] Performance with large papers (50+ Qs)

---

## 11. Dependencies

- **Blocked by:** None
- **Uses:** PDF extraction service (existing), Quiz engine (existing)

---

## 12. Timeline Estimate

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1 | Enhance extraction + quiz creation API | 5 pts |
| Phase 2 | Quiz generator UI + question selection | 5 pts |
| Phase 3 | Quiz taking experience + results | 5 pts |
| Phase 4 | Study plan integration + analytics | 6 pts |
| **Total** | | **21 pts** |

---

## 13. Files to Modify/Create

### New Files
- `src/app/api/quiz/from-past-paper/create/route.ts`
- `src/app/api/quiz/from-past-paper/stats/route.ts`
- `src/components/PastPapers/QuizGenerator.tsx`
- `src/components/PastPapers/QuestionSelector.tsx`
- `src/components/StudyPlan/LinkQuizModal.tsx`

### Modified Files
- `src/app/api/extract-questions/route.ts` (enhance)
- `src/app/api/quiz/from-past-papers/route.ts` (enhance)
- `src/app/setwork-library/quiz/page.tsx` (enhance)
- `src/components/Quiz/QuizQuestion.tsx` (past paper mode)

---

## 14. Rollout Strategy

1. **Alpha:** Internal with 5 past papers
2. **Beta:** 10% users, all subjects
3. **GA:** Full rollout with monitoring