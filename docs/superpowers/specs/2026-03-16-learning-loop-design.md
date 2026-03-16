# Automated Learning Loops: Connecting Quiz Mistakes to Flashcards

**Date:** 2026-03-16  
**Feature:** Learning Loop Automation  
**Status:** Approved

## 1. Overview

Connect quiz mistakes directly to flashcard generation and weak topic identification. Users can manually trigger flashcard creation from wrong answers, with integration at quiz completion and dashboard.

## 2. Problem Statement

Currently, when users complete quizzes with wrong answers:
- Mistakes are tracked in `topicMastery` but not transformed into actionable study materials
- No easy way to convert mistakes into spaced-repetition flashcards
- Users must manually create flashcards from scratch

## 3. Goals

1. Allow users to convert quiz mistakes into flashcards with one click
2. Show weak topics on dashboard for awareness
3. Enable bulk flashcard generation from recent mistakes
4. Integrate with existing spaced repetition system

## 4. Architecture

### Data Flow

```
Quiz Completion → Track in topicMastery (existing)
                    ↓
User clicks "Generate Flashcards"
                    ↓
Fetch wrong answers from quiz session
                    ↓
Create flashcards (question → front, answer+explanation → back)
                    ↓
Add to "Mistake Master" deck for spaced repetition
```

### Key Components

1. **src/lib/db/learning-loop-actions.ts** - Server actions for:
   - `getWrongAnswersFromQuiz(quizId, userId)` - Fetch questions answered incorrectly
   - `generateFlashcardsFromMistakes(quizId, userId)` - Bulk create flashcards
   - `getWeakTopicsForUser(userId)` - Get topics with <50% mastery

2. **src/screens/LessonComplete.tsx** - Add flashcard generation button

3. **Dashboard Widget** - "Focus Areas" showing weak topics with action

## 5. UI/UX Specification

### 5.1 Quiz Results Page (/lesson-complete)

After showing score summary, display:

```
┌─────────────────────────────────────────────┐
│  Quiz Complete!                             │
│  Score: 7/10 (70%)                         │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ 📚 Create Flashcards from Mistakes │   │
│  │    3 questions to review            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Back to Dashboard]  [Try Again]          │
└─────────────────────────────────────────────┘
```

**Button States:**
- Default: Blue background, shows count "X mistakes to review"
- Hover: Slight scale up (1.02), brighter background
- Loading: Spinner, disabled
- Success: Green checkmark, "X flashcards created!"

### 5.2 Dashboard Widget

Add "Focus Areas" widget to dashboard:

```
┌─────────────────────────────────────────────┐
│  Focus Areas                          [→]  │
│                                             │
│  Topics needing practice:                   │
│                                             │
│  • Algebra Equations  (40%)          [📚]  │
│  • Quadratic Functions (33%)         [📚]  │
│  • Probability Basics (25%)         [📚]  │
│                                             │
│  [Generate All as Flashcards]              │
└─────────────────────────────────────────────┘
```

**Interactions:**
- Click [📚] icon → generates flashcards for that topic
- Click "Generate All" → creates cards for all weak topics
- Empty state: "Great job! No weak topics identified"

## 6. Functionality Specification

### 6.1 Flashcard Generation Logic

For each wrong answer:
- **Front:** Question text (truncated to 1000 chars)
- **Back:** Correct answer + explanation from options table
  - If explanation is NULL/missing: fall back to correct answer only
  - If both missing: skip this question, log warning
- **Deck:** Use or create "Mistake Master" deck
- **Initial SRS values:** Match existing flashcard system defaults:
  - easeFactor: 2.5 (standard SM-2 default)
  - intervalDays: 1
  - repetitions: 0
  - nextReview: now

### 6.1.1 Error Handling

- If "Mistake Master" deck creation fails: show error toast, allow retry
- If flashcard insert fails: skip that card, continue with others, report partial success
- If no wrong answers found: return early with "no mistakes" message

### 6.2 API Endpoints

No new API routes needed - use existing patterns with server actions.

### 6.3 Data Handling

- Reuse existing `topicMastery` table for weak topic detection
- Reuse `flashcardDecks` - create "Mistake Master" if not exists
- Reuse `flashcards` table for card storage

## 7. Database Schema

No new tables required. Uses existing:
- `topicMastery` - identify weak topics
- `flashcardDecks` - store deck reference
- `flashcards` - store generated cards

## 8. Edge Cases

1. **No mistakes in quiz** - Hide flashcard button, show "Perfect score!"
2. **All flashcards already exist** - Check by comparing question text + topic, skip duplicates, show "No new cards created"
3. **Quiz session expired** - Store answers in localStorage during quiz
4. **User not authenticated** - Redirect to login

## 9. Acceptance Criteria

- [ ] Quiz completion page shows "Create Flashcards" button when mistakes exist
- [ ] Button shows correct count of wrong answers
- [ ] Clicking generates flashcards and shows success message
- [ ] Dashboard shows weak topics with <50% mastery
- [ ] Dashboard allows generating flashcards for all weak topics
- [ ] Generated flashcards appear in "Mistake Master" deck
- [ ] Works with existing spaced repetition system

## 10. File Changes

| File | Change |
|------|--------|
| `src/lib/db/learning-loop-actions.ts` | New - server actions |
| `src/screens/LessonComplete.tsx` | Add flashcard button |
| `src/components/Dashboard/FocusAreasWidget.tsx` | New - dashboard widget |
| `src/lib/db/flashcard-actions.ts` | Update - add deck creation |
