# Implementation Plan: Unified Progress Dashboard

> Feature: P0 - Unified Progress Dashboard  
> Version: 1.0 | Created: April 2026

## 1. Overview

**Feature Summary:** Create a single, comprehensive view that aggregates all learning metrics from across the platform, giving students a complete picture of their progress.

**Business Value:**
- Increase study plan completion from 45% to 65%
- Provide clear visibility into weak areas
- Enable parents to see child's progress at a glance
- Reduce cognitive load of checking multiple dashboards

**Success Metrics:**
- Study Plan Completion: 45% → 65%
- Parent Dashboard adoption: 10% → 30%
- Time to identify weak topic: <5 minutes

---

## 2. Work Breakdown

### 2.1 User Stories

| Story | Priority | Estimate |
|-------|----------|----------|
| View combined progress from all features | P0 | 5 pts |
| See weak areas highlighted automatically | P0 | 3 pts |
| Compare performance with peers (anonymized) | P1 | 3 pts |
| Export progress report (PDF/CSV) | P1 | 2 pts |

### 2.2 Technical Tasks

#### Task 1: API - Unified Progress Endpoint
**Location:** `src/app/api/progress/unified/route.ts` (new)

**Implementation:**
- Aggregate data from:
  - AI Tutor: topics studied, conversations count
  - Flashcards: cards mastered, decks completed
  - Quiz: scores by topic, questions attempted
  - Study Plans: completion percentage, streak
  - Calendar: study sessions attended
- Return normalized progress object
- **Estimate:** 5 pts

#### Task 2: API - Weak Topic Detection
**Location:** `src/app/api/progress/weak-topics/route.ts` (enhance existing)

**Enhancements:**
- Already exists at `/api/progress/weak-topics`
- Add cross-feature correlation (quiz + flashcard + AI tutor)
- Include recommended actions for each weak topic
- **Estimate:** 3 pts

#### Task 3: Frontend - Unified Dashboard Page
**Location:** `src/app/progress/page.tsx` (new)

**Components:**
- ProgressRing component (already exists)
- SubjectProgressCard
- WeeklyTrendChart
- WeakTopicRecommendations
- AchievementSummary
- **Estimate:** 5 pts

#### Task 4: Frontend - Dashboard Cards
**Location:** `src/components/Progress/UnifiedDashboard.tsx` (new)

**Features:**
- Responsive grid layout
- Collapsible sections
- Time period selector (week/month/semester)
- Interactive charts using existing charting library
- **Estimate:** 5 pts

#### Task 5: Integration - Parent Dashboard
**Location:** `src/app/parent-dashboard/page.tsx` (enhance existing)

**Enhancements:**
- Show linked child's unified progress
- Add AI-generated insights summary
- Weekly digest option
- **Estimate:** 3 pts

---

## 3. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    /progress Page                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              UnifiedDashboard                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│  │  │ AI Tutor │ │Flashcards│ │   Quiz   │           │   │
│  │  │  Stats   │ │  Stats   │ │  Stats   │           │   │
│  │  └──────────┘ └──────────┘ └──────────┘           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐           │   │
│  │  │ Study   │ │Calendar  │ │Achievement│           │   │
│  │  │ Plans    │ │ Sessions │ │ Summary  │           │   │
│  │  └──────────┘ └──────────┘ └──────────┘           │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               /api/progress/unified (new)                   │
│  - getGlobalProgress()                                       │
│  - getFlashcardProgress()                                    │
│  - getQuizProgress()                                         │
│  - getStudyPlanProgress()                                    │
│  - getCalendarProgress()                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. API Contracts

### 4.1 New Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/progress/unified` | Get all learning metrics |
| GET | `/api/progress/peer-comparison` | Anonymized peer comparison |

### 4.2 Response Schema

```typescript
interface UnifiedProgress {
  // Summary
  totalXp: number;
  level: number;
  streak: number;
  
  // AI Tutor
  aiTutor: {
    topicsStudied: number;
    conversationsCount: number;
    totalSessionTime: number;
  };
  
  // Flashcards
  flashcards: {
    totalCards: number;
    masteredCards: number;
    dueForReview: number;
    decksCompleted: number;
  };
  
  // Quiz
  quiz: {
    questionsAttempted: number;
    correctAnswers: number;
    averageScore: number;
    topicScores: Record<string, number>;
  };
  
  // Study Plan
  studyPlan: {
    completionPercentage: number;
    tasksCompleted: number;
    tasksTotal: number;
    streakDays: number;
  };
  
  // Calendar
  calendar: {
    sessionsScheduled: number;
    sessionsCompleted: number;
    attendanceRate: number;
  };
  
  // Weak areas
  weakTopics: {
    topicId: string;
    topicName: string;
    subject: string;
    score: number;
    recommendation: string;
  }[];
}
```

---

## 5. Frontend Components

### 5.1 New Components

| Component | Purpose |
|-----------|---------|
| `ProgressOverview` | Summary cards (XP, streak, level) |
| `AiTutorProgressCard` | AI Tutor stats visualization |
| `FlashcardProgressCard` | Flashcard mastery progress |
| `QuizPerformanceCard` | Quiz scores by topic |
| `StudyPlanProgressCard` | Study plan completion |
| `WeakTopicRecommendations` | AI-suggested weak areas |
| `PeerComparisonChart` | Anonymized comparison |

### 5.2 Existing Components (Reuse)

- `ProgressRing` - for completion percentages
- `TopicBadge` - for topic display
- `StatCards` - for metric display

---

## 6. Data Aggregation Strategy

### 6.1 Caching

```typescript
// Cache unified progress for 5 minutes
const CACHE_TTL = 5 * 60 * 1000;

async function getUnifiedProgress(userId: string) {
  const cacheKey = `progress:unified:${userId}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) return JSON.parse(cached);
  
  const progress = await aggregateAllProgress(userId);
  await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(progress));
  
  return progress;
}
```

### 6.2 Parallel Data Fetching

```typescript
const [aiTutor, flashcards, quiz, studyPlan, calendar] = await Promise.all([
  getAiTutorProgress(userId),
  getFlashcardProgress(userId),
  getQuizProgress(userId),
  getStudyPlanProgress(userId),
  getCalendarProgress(userId),
]);
```

---

## 7. UI/UX Design

### 7.1 Layout

- **Header:** User name, total XP, streak, level badge
- **Grid:** 2x3 responsive grid on desktop, single column on mobile
- **Sections:** Collapsible with smooth animations

### 7.2 Color Scheme

- Primary: Platform brand color
- Success: Green for completed/mastered
- Warning: Yellow for needs attention
- Danger: Red for weak areas

### 7.3 Interactions

- Hover on card: Show detailed tooltip
- Click on weak topic: Navigate to recommended action
- Time period selector: Week/Month/Semester/Year

---

## 8. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| No data yet | Show onboarding prompts |
| Partial data | Show available data + loading for others |
| API timeout | Show cached data + "last updated" timestamp |
| New user | Show getting started guide |

---

## 9. Testing Requirements

- [ ] Unit tests for progress aggregation
- [ ] Integration tests for unified endpoint
- [ ] E2E: navigate to progress → view all cards
- [ ] Performance test: <2s load time
- [ ] Accessibility test: screen reader compatible

---

## 10. Dependencies

- **Blocked by:** None
- **Dependencies:** Analytics APIs, Study Plan APIs, Flashcard APIs

---

## 11. Timeline Estimate

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1 | Unified API + data aggregation | 5 pts |
| Phase 2 | Frontend dashboard + cards | 8 pts |
| Phase 3 | Weak topic detection + recommendations | 3 pts |
| Phase 4 | Parent dashboard integration | 3 pts |
| **Total** | | **19 pts** |

---

## 12. Files to Modify/Create

### New Files
- `src/app/api/progress/unified/route.ts`
- `src/app/api/progress/peer-comparison/route.ts`
- `src/app/progress/page.tsx`
- `src/components/Progress/UnifiedDashboard.tsx`
- `src/components/Progress/ProgressCard.tsx` (various)

### Modified Files
- `src/app/parent-dashboard/page.tsx` (enhance)
- `src/lib/progress-aggregator.ts` (new utility)

---

## 13. Rollout Strategy

1. **Alpha:** Internal testing with 5 users
2. **Beta:** 20% of users (feature flag)
3. **GA:** 100% rollout after optimization