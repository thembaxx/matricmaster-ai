# MatricMaster AI - System Design & Feature Integration Plan

> **Generated:** 2026-04-16
> **Status:** Draft for Review

---

## Executive Summary

The quiz page has a critical bug where passing `subject` parameters always defaults to the math quiz. This plan addresses the immediate bug fix and establishes a **robust architectural foundation** for all app features to integrate seamlessly.

---

## Part 1: Root Cause Analysis

### The Bug: Quiz Page Ignores Subject Parameter

**Location:** `src/screens/Quiz.tsx` (lines 25-27)

```typescript
// CURRENT (BROKEN)
const searchParams = useSearchParams();
const urlQuizId = searchParams.get('id');
const quizId = initialQuizId || urlQuizId || 'math-p1-2023-nov'; // Always falls back to math!
```

**Problem:** The code only retrieves `id` from URL parameters. When navigating to `/quiz?subject=physics`:
1. `urlQuizId` is `null` (no `id` param)
2. Code falls back to hardcoded `'math-p1-2023-nov'`

### Additional Architectural Issues Identified

| Issue | Location | Impact |
|-------|----------|--------|
| Inconsistent URL schema | `TimelineSidebar.tsx` vs `useQuizState.ts` | Navigation breaks |
| No parameter validation | All quiz routes | Security vulnerability |
| Hardcoded subject mappings | `useQuizState.ts` | inflexible |
| No content resolver service | Scattered logic | Duplication |
| No centralized quiz state | Multiple components | State sync issues |

---

## Part 2: Feature Map & Integration Matrix

### Core Features

```
┌─────────────────────────────────────────────────────────────────┐
│                        MatricMaster AI                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Quiz       │◄──►│   Study      │◄──►│   Progress   │       │
│  │   Engine     │    │   Plans      │    │   Tracking   │       │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘       │
│         │                  │                   │               │
│         ▼                  ▼                   ▼               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Unified Content Resolver                     │   │
│  │    (Subject → Category → Difficulty → Questions)          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                  │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Past      │    │   AI         │    │   Gamification│       │
│  │   Papers    │    │   Tutor      │    │   (XP/Streaks)│       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Feature Connection Matrix

| From \ To | Quiz Engine | Study Plans | Progress | Past Papers | AI Tutor | Gamification |
|-----------|-------------|-------------|----------|-------------|----------|---------------|
| **Quiz Engine** | - | Study plan generated from weak areas | Tracks performance | Questions sourced from papers | N/A | XP awarded per quiz |
| **Study Plans** | Quizzes recommended from plan | - | Syncs completion | Links to related papers | N/A | N/A |
| **Progress** | Weak areas feed quiz selection | Plans adapt to progress | - | N/A | Tutor focuses on gaps | XP/streak data |
| **Past Papers** | Questions imported | Related chapters flagged | Exam prep progress | - | N/A | N/A |
| **AI Tutor** | N/A | Adapts explanations | Identifies gaps | N/A | - | N/A |
| **Gamification** | N/A | N/A | N/A | N/A | N/A | - |

### Data Flow Diagram

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                     Route Resolver                           │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ URL: /quiz?subject=physics&category=momentum        │     │
│  │ ↓                                                   │     │
│  │ Parameter Validator (Zod schema)                   │     │
│  │ ↓                                                   │     │
│  │ Content Resolver Service                            │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                  Quiz State Machine                          │
│                                                             │
│  IDLE → STARTED → IN_PROGRESS → PAUSED → COMPLETED → REVIEW │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│               Analytics & Persistence                        │
│  • Quiz completion → Update progress → Adjust study plan     │
│  • XP awarded → Streak updated                             │
│  • Weak areas identified → AI tutor notified                │
└─────────────────────────────────────────────────────────────┘
```

---

## Part 3: URL Schema Design

### Proposed URL Structure

```
/quiz                              # Quiz homepage (subject selector)
/quiz/[subject]                    # Subject-specific quiz list
/quiz/[subject]/[category]         # Category within subject
/quiz/[subject]/[category]?difficulty=medium&limit=10

/quizzes                           # User's quiz history
/quizzes/[sessionId]              # Specific quiz session (review)

/study-plan                       # Current study plan
/study-plan/[planId]              # Specific plan

/past-papers                      # Past papers browser
/past-papers/[subject]/[year]/[paper]

/progress                         # Progress dashboard
/progress/[subject]               # Subject-specific progress

/tutor                             # AI Tutor chat
/tutor?topic=kinematics&context=quiz-weakness
```

### Parameter Schema (Zod Validation)

```typescript
// lib/schemas/quiz-params.ts
import { z } from 'zod';

export const SubjectEnum = z.enum(['mathematics', 'physics', 'chemistry', 'biology', 'english', 'afrikaans']);
export const DifficultyEnum = z.enum(['beginner', 'intermediate', 'advanced']);
export const CategoryEnum = z.record(z.string(), z.array(z.string())); // Per-subject categories

export const QuizParamsSchema = z.object({
  subject: SubjectEnum.optional(),
  category: z.string().optional(),
  difficulty: DifficultyEnum.optional(),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
  sessionId: z.string().uuid().optional(), // For resuming
});

export type QuizParams = z.infer<typeof QuizParamsSchema>;
```

---

## Part 4: Core Services Architecture

### 4.1 Content Resolver Service

```typescript
// services/content-resolver.ts
interface ContentResolver {
  resolveQuiz(params: QuizParams): Promise<Quiz>;
  resolveStudyPlan(userId: string, focusAreas: string[]): Promise<StudyPlan>;
  resolvePastPaper(params: PaperParams): Promise<PastPaper>;
}

class QuizContentResolver implements ContentResolver {
  constructor(
    private quizStore: QuizStore,
    private analyticsService: AnalyticsService,
    private cache: CacheService
  ) {}

  async resolveQuiz(params: QuizParams): Promise<Quiz> {
    // 1. Validate params
    const validated = QuizParamsSchema.parse(params);

    // 2. Check cache
    const cacheKey = this.buildCacheKey(validated);
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // 3. Query content store with fallback logic
    const quiz = await this.quizStore.findWithFallback(validated);

    // 4. Cache result
    await this.cache.set(cacheKey, quiz, { ttl: 3600 });

    return quiz;
  }
}
```

### 4.2 Quiz State Machine

```typescript
// lib/quiz-state-machine.ts
type QuizState = 'IDLE' | 'STARTED' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'REVIEWED';

const quizStateMachine = {
  IDLE: {
    START: 'STARTED',
  },
  STARTED: {
    NEXT_QUESTION: 'IN_PROGRESS',
    ABANDON: 'IDLE',
  },
  IN_PROGRESS: {
    ANSWER: 'IN_PROGRESS',      // Can answer multiple times
    PAUSE: 'PAUSED',
    COMPLETE: 'COMPLETED',
    TIMEOUT: 'COMPLETED',
  },
  PAUSED: {
    RESUME: 'IN_PROGRESS',
    ABANDON: 'IDLE',
  },
  COMPLETED: {
    REVIEW: 'REVIEWED',
    NEW_QUIZ: 'IDLE',
  },
  REVIEWED: {
    NEW_QUIZ: 'IDLE',
  },
};
```

### 4.3 Feature Integration Events

```typescript
// lib/event-bus.ts
type AppEvent =
  | { type: 'QUIZ_COMPLETED'; payload: { quizId: string; score: number; weakAreas: string[] } }
  | { type: 'STUDY_PLAN_UPDATED'; payload: { planId: string; completedItems: number } }
  | { type: 'PROGRESS_MILESTONE'; payload: { subject: string; milestone: string } }
  | { type: 'XP_EARNED'; payload: { amount: number; source: string } }
  | { type: 'STREAK_UPDATED'; payload: { currentStreak: number } };

class EventBus {
  subscribe<T extends AppEvent['type']>(
    event: T,
    handler: (payload: Extract<AppEvent, { type: T }>['payload']) => void
  ): Unsubscribe;

  publish(event: AppEvent): void;
}

// Usage in Quiz Engine
eventBus.publish({
  type: 'QUIZ_COMPLETED',
  payload: { quizId, score, weakAreas }
});

// Study Plan subscribes
eventBus.subscribe('QUIZ_COMPLETED', ({ weakAreas }) => {
  studyPlan.adaptFocusAreas(weakAreas);
});

// Gamification subscribes
eventBus.subscribe('QUIZ_COMPLETED', ({ score }) => {
  if (score >= 80) xpService.awardXp(100, 'quiz_excellence');
});
```

---

## Part 5: Implementation Roadmap

### Phase 1: Critical Bug Fix (Immediate)

- [ ] Fix `src/screens/Quiz.tsx` to handle `subject` parameter
- [ ] Add `subject` parameter handling with content lookup
- [ ] Implement proper fallback: find first quiz matching subject
- [ ] Add URL param validation

### Phase 2: URL & Routing Architecture

- [ ] Create `lib/schemas/quiz-params.ts` with Zod validation
- [ ] Create `lib/url-utils.ts` for URL building/parsing
- [ ] Update `TimelineSidebar.tsx` to use new URL schema
- [ ] Update `useQuizState.ts` to use validated params
- [ ] Add `nextjs` or middleware for param validation

### Phase 3: Content Resolver Service

- [ ] Create `services/content-resolver.ts`
- [ ] Implement `QuizContentResolver` class
- [ ] Add cache layer for quiz content
- [ ] Implement fallback logic (exact → category → subject → default)

### Phase 4: State Management Refactor

- [ ] Create `lib/quiz-state-machine.ts`
- [ ] Refactor `useQuizState.ts` to use state machine
- [ ] Add event bus (`lib/event-bus.ts`)
- [ ] Wire up event subscriptions for feature integration

### Phase 5: Feature Integration

- [ ] Connect Quiz Engine → Study Plans (weak areas)
- [ ] Connect Quiz Engine → Progress Tracking
- [ ] Connect Quiz Engine → Gamification (XP/streaks)
- [ ] Connect Past Papers → Quiz Engine (question sourcing)
- [ ] Connect Progress → AI Tutor (gap identification)

### Phase 6: Polish & Testing

- [ ] Add comprehensive tests for URL param handling
- [ ] Add integration tests for feature events
- [ ] Add E2E tests for critical flows
- [ ] Performance optimization (caching, lazy loading)

---

## Part 6: File Structure (Proposed)

```
src/
├── app/
│   ├── quiz/
│   │   ├── page.tsx                    # Quiz homepage
│   │   ├── [subject]/
│   │   │   ├── page.tsx               # Subject quiz list
│   │   │   └── [category]/
│   │   │       └── page.tsx           # Category quiz
│   │   └── session/
│   │       └── [sessionId]/
│   │           └── page.tsx           # Quiz review
│   ├── study-plan/
│   ├── progress/
│   └── past-papers/
├── components/
│   ├── Quiz/
│   │   ├── QuizScreen.tsx
│   │   ├── QuizContent.tsx
│   │   ├── QuizControls.tsx
│   │   └── QuizResults.tsx
│   └── shared/
├── lib/
│   ├── schemas/
│   │   ├── quiz-params.ts
│   │   ├── study-plan-params.ts
│   │   └── index.ts
│   ├── url-utils.ts
│   ├── quiz-state-machine.ts
│   ├── event-bus.ts
│   └── validators.ts
├── services/
│   ├── content-resolver.ts
│   ├── quiz-resolver.ts
│   ├── study-plan-resolver.ts
│   ├── analytics-service.ts
│   └── cache-service.ts
├── stores/
│   ├── quiz-store.ts
│   ├── progress-store.ts
│   └── user-store.ts
├── hooks/
│   ├── useQuizParams.ts
│   ├── useQuizSession.ts
│   └── useFeatureEvents.ts
└── types/
    ├── quiz.ts
    ├── study-plan.ts
    └── events.ts
```

---

## Part 7: API Design

### Quiz Endpoints

```
GET  /api/quiz
     ?subject=mathematics
     &category=algebra
     &difficulty=intermediate
     &limit=10
     &offset=0
     → Returns quiz list matching criteria

GET  /api/quiz/:id
     → Returns specific quiz with questions

POST /api/quiz/:id/start
     → Creates quiz session, returns sessionId

POST /api/quiz/:id/answer
     { questionId, answer, timeSpent }
     → Validates answer, returns feedback

POST /api/quiz/:id/complete
     → Finalizes session, calculates score, returns results

GET  /api/quiz/sessions/:sessionId
     → Returns session for review
```

### Response Shapes

```typescript
// GET /api/quiz?subject=physics
{
  data: QuizSummary[],
  meta: {
    total: 45,
    subject: 'physics',
    categories: ['mechanics', 'waves', 'optics'],
    difficulties: ['beginner', 'intermediate', 'advanced']
  }
}

// POST /api/quiz/:id/complete
{
  sessionId: 'uuid',
  score: 85,
  percentage: 85,
  weakAreas: ['momentum conservation', 'collision problems'],
  strongAreas: ['velocity calculations'],
  xpEarned: 120,
  studyPlanSuggested: true,
  recommendedNext: {
    subject: 'physics',
    category: 'momentum',
    reason: 'weak area identified'
  }
}
```

---

## Part 8: Security Considerations

### Parameter Validation

```typescript
// All user input must be validated at API boundary
import { QuizParamsSchema } from '@/lib/schemas/quiz-params';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = QuizParamsSchema.safeParse(Object.fromEntries(searchParams));

  if (!params.success) {
    return Response.json(
      { error: 'Invalid parameters', details: params.error.flatten() },
      { status: 400 }
    );
  }

  // Proceed with validated params
}
```

### Security Checklist

- [ ] All quiz parameters validated with Zod schema
- [ ] No SQL injection vectors (parameterized queries only)
- [ ] Rate limiting on quiz submission endpoints
- [ ] Session tokens required for quiz completion
- [ ] Input sanitization on all free-text fields

---

## Part 9: Testing Strategy

### Unit Tests

```typescript
// __tests__/lib/quiz-params.test.ts
describe('QuizParamsSchema', () => {
  it('accepts valid subject parameter', () => {
    const result = QuizParamsSchema.parse({ subject: 'physics' });
    expect(result.subject).toBe('physics');
  });

  it('rejects invalid subject', () => {
    const result = QuizParamsSchema.safeParse({ subject: 'astronomy' });
    expect(result.success).toBe(false);
  });

  it('defaults difficulty when not provided', () => {
    const result = QuizParamsSchema.parse({});
    expect(result.difficulty).toBeUndefined();
  });
});
```

### Integration Tests

```typescript
// __tests__/services/content-resolver.test.ts
describe('QuizContentResolver', () => {
  it('resolves physics subject to first physics quiz', async () => {
    const resolver = new QuizContentResolver(mockStore, mockAnalytics, mockCache);
    const quiz = await resolver.resolveQuiz({ subject: 'physics' });
    expect(quiz.subject).toBe('physics');
  });

  it('falls back to mathematics when subject not found', async () => {
    const resolver = new QuizContentResolver(mockStore, mockAnalytics, mockCache);
    const quiz = await resolver.resolveQuiz({ subject: 'invalid' });
    expect(quiz.subject).toBe('mathematics'); // Default fallback
  });
});
```

### E2E Tests

```typescript
// e2e/quiz-flow.spec.ts
it('completes physics quiz and triggers study plan update', async () => {
  // 1. Start physics quiz
  await page.goto('/quiz?subject=physics');
  await page.click('[data-testid="start-quiz"]');

  // 2. Answer questions
  for (const question of questions) {
    await page.click(`[data-testid="answer-${question.id}"]`);
    await page.click('[data-testid="next-question"]');
  }

  // 3. Complete quiz
  await page.click('[data-testid="complete-quiz"]');

  // 4. Verify results shown
  await expect(page.locator('[data-testid="score"]')).toBeVisible();

  // 5. Verify event fired (check via API)
  const events = await api.getEvents();
  expect(events).toContainEqual(expect.objectContaining({
    type: 'QUIZ_COMPLETED',
    payload: expect.objectContaining({ subject: 'physics' })
  }));
});
```

---

## Part 10: Rollout Plan

### Pre-Launch Checklist

- [ ] All Phase 1-4 items complete
- [ ] Unit tests passing (>80% coverage on new code)
- [ ] Integration tests passing
- [ ] E2E tests for critical flows passing
- [ ] Performance benchmarks met (<200ms quiz load)
- [ ] Security review completed

### Launch Phases

**Day 1-2: Shadow Mode**
- Deploy to 10% of users
- Monitor error rates and performance
- Compare with baseline metrics

**Day 3-5: Gradual Rollout**
- Expand to 50% of users
- Monitor feature event bus
- Watch for edge cases

**Day 6-7: Full Launch**
- 100% rollout
- Monitor dashboards
- Prepare hotfix if needed

---

## Appendices

### A. Technology Stack

- **Framework:** Next.js 16 (App Router)
- **State:** Zustand + React Context
- **Validation:** Zod
- **Testing:** Vitest + Playwright
- **Caching:** In-memory (future: Redis)

### B. References

- [Next.js App Router Best Practices](https://nextjs.org/docs/app)
- [Zod Validation Patterns](https://zod.dev)
- [Quiz System Architecture (Medium)](https://medium.com/@svenk9575/reference-architecture-for-online-assessments)
- [State Machines in React](https://xstate.js.org)

### C. Glossary

| Term | Definition |
|------|------------|
| Content Resolver | Service that finds appropriate content based on parameters |
| State Machine | Formal model for quiz flow states (IDLE → COMPLETED) |
| Event Bus | Central pub/sub system for feature communication |
| Fallback Logic | Hierarchy of alternatives when exact match not found |
