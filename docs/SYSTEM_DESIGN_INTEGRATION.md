# MatricMaster AI - System Design & Feature Integration

## Overview
This document outlines the updated architectural foundation for the MatricMaster quiz engine and its integration with other application features (Study Plans, Progress Tracking, Gamification, etc.).

## Core Architecture

### 1. URL Schema & Routing
We have moved from a search-parameter-heavy routing to a clean, path-based structure.

| Route | Description |
|-------|-------------|
| `/quiz` | Quiz landing page (Subject selector) |
| `/quiz/[subject]` | Subject-specific list / select category |
| `/quiz/[subject]/[category]` | Specific quiz for a category |
| `/quiz/v/[id]` | Legacy/Direct access to a specific quiz by ID |

**Utility:** `src/lib/url-utils.ts` provides `buildQuizUrl` for consistent navigation and `parseQuizUrl` for path extraction.

### 2. Content Resolution
The `QuizContentResolver` centralizes the logic for finding the right quiz content based on path or search parameters.

- **Location:** `src/services/content-resolver.ts`
- **Logic:** Exact ID Match (via `v/[id]`) → Category Match → Fallback (Math)
- **Subject-Level Navigation:** Per requirement, navigating to `/quiz/[subject]` without a category will return an `empty` status, prompting the user to select a category.
- **Empty States:** Returns a structured `empty` status if a subject exists but no content is found or if a category selection is required, allowing the UI to show proper context.

### 3. Quiz State Machine
To manage the complexity of quiz flows, we use a formal state machine.

- **Location:** `src/lib/quiz-state-machine.ts`
- **States:** `IDLE`, `STARTED`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`, `REVIEWED`.
- **Transitions:** Predictable state changes via `getNextQuizState(current, action)`.

### 4. Event Bus (Pub/Sub)
Cross-cutting concerns (Gamification, Progress, AI Tutor notifications) are decoupled from the core quiz logic using a central Event Bus.

- **Location:** `src/lib/event-bus.ts`
- **Provider:** `src/components/Providers/FeatureIntegrationProvider.tsx` (Mounted in root layout).
- **Events:**
  - `QUIZ_COMPLETED`: Triggered when a quiz finishes.
  - `XP_EARNED`: Triggered for rewards.
  - `STUDY_PLAN_UPDATED`: Triggered when plans adapt.

**Integration Hook:** `src/hooks/useFeatureIntegration.ts` subscribes to these events to trigger side effects (e.g., updating the Mistake Bank, awarding XP via the gamification system) without bloating the `useQuizState` hook.

## API Design

### Base Endpoints
All quiz-related data fetching is now standardized:

- `GET /api/quiz`: List quizzes with filtering/pagination.
- `GET /api/quiz/[id]`: Get full quiz content.
- `POST /api/quiz/[id]/start`: Initialize a session.
- `POST /api/quiz/[id]/answer`: Validate an answer.
- `POST /api/quiz/[id]/complete`: Finalize session and calculate results.

## Validation
All input parameters are validated using Zod schemas located in `src/lib/schemas/quiz-params.ts`.

## Implementation Checklist for New Features
1. **Define Params:** Add new parameters to `QuizParamsSchema`.
2. **Update Resolver:** Add any specific lookup logic to `QuizContentResolver`.
3. **Register Events:** If the feature needs to react to quiz events, subscribe in `useFeatureIntegration.ts`.
4. **Use Utilities:** Always use `buildQuizUrl` for navigation.
