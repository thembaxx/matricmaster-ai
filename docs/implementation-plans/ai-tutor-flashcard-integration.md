# Implementation Plan: AI Tutor ↔ Flashcard Integration

> Feature: P0 - AI Tutor ↔ Flashcard Integration  
> Version: 1.0 | Created: April 2026

## 1. Overview

**Feature Summary:** Enable users to generate flashcards directly from AI tutor conversations, with inline "Save as Flashcard" buttons on key concepts and automatic concept extraction.

**Business Value:**
- Increase flashcard creation rate from 15% to 40% of conversations
- Reduce friction in flashcard creation workflow
- Improve concept retention through active recall

**Success Metrics:**
- Flashcard creation rate: 15% → 40% of conversations
- Average flashcards per session: 3 → 8

---

## 2. Work Breakdown

### 2.1 User Stories

| Story | Priority | Estimate |
|-------|----------|----------|
| Inline "Save as Flashcard" button on assistant messages | P0 | 3 pts |
| Auto-detect concepts from conversation and prompt user | P0 | 5 pts |
| Batch generate flashcards from conversation summary | P0 | 3 pts |
| Link generated flashcards to study plan automatically | P1 | 2 pts |

### 2.2 Technical Tasks

#### Task 1: API - Extract Concepts from Conversation
**Location:** `src/app/api/ai-tutor/extract-concepts/route.ts` (new)

```typescript
// POST /api/ai-tutor/extract-concepts
interface RequestBody {
  conversation: Message[];
  subject?: string;
}

interface Response {
  concepts: {
    term: string;
    definition: string;
    context: string;
    suggestedTags: string[];
  }[];
}
```

**Implementation:**
- Create new API route
- Use Gemini to extract key concepts from conversation
- Return structured concept objects
- **Estimate:** 2 pts

#### Task 2: API - Create Flashcards from Conversation
**Location:** `src/app/api/flashcards/from-conversation/route.ts` (new)

**Implementation:**
- Accept conversation messages + optional deck ID
- Call extract-concepts internally
- Generate flashcards
- Save to database (new or existing deck)
- Return created flashcards
- **Estimate:** 3 pts

#### Task 3: Frontend - Inline Save Button
**Location:** `src/components/AI/MessageContent.tsx` (modify)

**Changes:**
- Add "Save as Flashcard" button on assistant messages
- Show button when AI detects key concept (or always)
- On click: open quick-save modal with pre-filled term/definition
- **Estimate:** 3 pts

#### Task 4: Frontend - Concept Detection & Prompt
**Location:** `src/components/AI/AiTutorChat.tsx` (modify)

**Changes:**
- After assistant response, analyze for key concepts
- Show toast prompt: "Want to create flashcards from this?"
- On accept: call batch generate and show modal
- **Estimate:** 5 pts

#### Task 5: Frontend - Quick Save Modal
**Location:** `src/components/AI/QuickFlashcardSave.tsx` (new)

**Features:**
- Compact modal for single-card creation
- Pre-filled term from selected text
- Option to add to existing deck or create new
- **Estimate:** 2 pts

#### Task 6: Integration - Link to Study Plan
**Location:** `src/app/api/study-plan/link-flashcards/route.ts` (new)

**Changes:**
- After flashcard creation, prompt to add to study plan
- Create/update study plan items for new concepts
- **Estimate:** 2 pts

---

## 3. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AiTutorChat                              │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │ MessageContent  │  │ ConceptDetector │                   │
│  │ - Save Button   │  │ - Analyze resp  │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
│           │                    │                            │
└───────────┼────────────────────┼────────────────────────────┘
            │                    │
            ▼                    ▼
┌───────────────────┐    ┌──────────────────────┐
│ QuickFlashcardSave│    │ FlashcardModal       │
│ Modal             │    │ (existing)           │
└────────┬──────────┘    └──────────┬───────────┘
         │                          │
         └──────────┬───────────────┘
                    ▼
         ┌─────────────────────────┐
         │ /api/flashcards/create   │
         │ (existing + new endpoint)│
         └─────────────────────────┘
```

---

## 4. API Contracts

### 4.1 New Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/ai-tutor/extract-concepts` | Extract key concepts from conversation |
| POST | `/api/flashcards/from-conversation` | Create flashcards from conversation |
| POST | `/api/study-plan/link-flashcards` | Link flashcards to study plan |

### 4.2 Existing Endpoints (Enhanced)

| Endpoint | Enhancement |
|----------|-------------|
| POST `/api/ai-tutor/flashcards` | Add `saveToDeck` option |
| POST `/api/flashcards/decks/{id}/cards` | Accept concept objects |

---

## 5. Database Schema Changes

### 5.1 New Tables (if needed)

```sql
-- Concept tracking (optional - for analytics)
CREATE TABLE concept_extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  conversation_id UUID,
  concept_term TEXT NOT NULL,
  concept_definition TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Frontend Changes

### 6.1 Feature Flags

```typescript
// src/config/feature-flags.ts
export const featureFlags = {
  aiTutorFlashcardIntegration: {
    enabled: process.env.NEXT_PUBLIC_FF_AI_TUTOR_FLASHCARDS === 'true',
    rollout: 0.1, // 10% of users initially
  },
  autoConceptDetection: {
    enabled: process.env.NEXT_PUBLIC_FF_CONCEPT_DETECTION === 'true',
  },
};
```

### 6.2 UI States

1. **Default:** No visible flashcard button
2. **Hover on message:** Show "Save as Flashcard" icon
3. **Concept detected:** Show toast prompt after response
4. **Saving:** Show loading spinner
5. **Success:** Show confirmation + option to add more

---

## 7. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| AI fails to extract concepts | Show manual entry option |
| User not authenticated | Prompt sign-in before save |
| No concepts detected | Disable "Save" button |
| Duplicate flashcard | Warn user, allow override |
| Network error | Queue for later sync (offline) |

---

## 8. Testing Requirements

- [ ] Unit tests for concept extraction logic
- [ ] Integration tests for API endpoints
- [ ] E2E test: conversation → extract → save → review
- [ ] Accessibility test: keyboard navigation for save button

---

## 9. Dependencies

- **Blocked by:** None (P0 feature)
- **Enables:** Study Plan ↔ Flashcard linking

---

## 10. Timeline Estimate

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1 | API endpoints (extract, create) | 5 pts |
| Phase 2 | Frontend save button + modal | 5 pts |
| Phase 3 | Concept detection + prompts | 5 pts |
| Phase 4 | Study plan integration | 2 pts |
| **Total** | | **17 pts** |

---

## 11. Files to Modify/Create

### New Files
- `src/app/api/ai-tutor/extract-concepts/route.ts`
- `src/app/api/flashcards/from-conversation/route.ts`
- `src/app/api/study-plan/link-flashcards/route.ts`
- `src/components/AI/QuickFlashcardSave.tsx`

### Modified Files
- `src/components/AI/MessageContent.tsx` (add save button)
- `src/components/AI/AiTutorChat.tsx` (concept detection)
- `src/components/AI/FlashcardModal.tsx` (enhance)
- `src/hooks/useAiTutor.ts` (add handlers)

---

## 12. Rollout Strategy

1. **Alpha:** Internal testing with 5 users
2. **Beta:** 10% of users (feature flag)
3. **GA:** 100% rollout after 80% positive feedback