# Data Consolidation — Single Source of Truth

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate data spread across 5+ locations (`src/content/`, `src/constants/`, `src/data/`, `src/lib/content-adapter.ts`, `data/`) into a single source of truth: `src/content/` for static/curriculum data, DB for user/dynamic data.

**Architecture:** Hybrid approach — JSON files in `src/content/` are the canonical source for subjects, achievements, gamification, lessons, questions, curriculum, etc. The PostgreSQL database is seeded from these files at deploy time and serves as the runtime source for user data (progress, sessions, flashcards). The `content-adapter.ts` bridge is eliminated by merging its functionality directly into `src/content/index.ts`.

**Tech Stack:** Next.js 16, TypeScript, Drizzle ORM, Bun

---

## File Mapping

### What moves into `src/content/`

| Source | Destination | Importers |
|--------|------------|-----------|
| `src/constants/lessons/*.json` (10 files) | `src/content/lessons/` | `hooks/useLessons.ts`, `lib/lessons.ts` |
| `src/constants/quiz/` (9 files) | `src/content/questions/types.ts` + `src/content/questions/quiz/` | 8 files |
| `src/constants/quiz-data.ts` | `src/content/questions/quiz-data.ts` | 4 files |
| `src/constants/common-questions.ts` | `src/content/common-questions.ts` | 3 files |
| `src/constants/study-paths.json` | `src/content/study-paths.json` | 1 file |
| `src/data/curriculum/` (6 files) | `src/content/curriculum/` | 7 files |
| `src/data/elements/` (8 files) | `src/content/elements/` | 6 files |
| `src/data/element-details.ts` | `src/content/element-details.ts` | 3 files |
| `src/data/setworks/` (3 files) | `src/content/setworks/` | 10 files |
| `src/data/mindmaps.ts` | `src/content/mindmaps.ts` | 3 files |
| `src/data/landing.ts` | `src/content/landing.ts` | 3 files |
| `src/data/quick-tips.json` | `src/content/quick-tips.json` | 2 files |
| `src/data/index.ts` (mock barrel) | `src/content/mock/index.ts` | 2 files |
| `src/data/mock-data.json` | `src/content/mock/seed-data.json` | via barrel |
| `src/data/mock-*.json` (7 files) | merged into `src/content/mock/seed-data.json` | via barrel |
| `src/data/exam-dates.ts` | merged into `src/content/exam-dates.json` or kept as `.ts` | 1 file |
| `src/constants/mock-dashboard.ts` | `src/content/mock/dashboard.ts` | 2 files |

### What stays in `src/constants/` (UI config, NOT data)

- `themes.ts` — UI theme definitions
- `interactions.json` — UI interaction config
- `mobile-nav.ts` — navigation config
- `map-data.ts` — map visualization data
- `periodic-table.ts` — element types/colors (UI config for periodic table display)

### What gets deleted

- `src/lib/content-adapter.ts` — functionality merged into `src/content/index.ts`
- `src/constants/subjects.ts` — types/data in `content/index.ts`
- `src/constants/achievements.ts` — in `content/achievements.json`
- `src/constants/gamification.ts` — in `content/gamification.json`
- `src/constants/levels.ts` — in `content/index.ts`
- `src/constants/rewards.ts` — in `content/index.ts`
- `src/constants/mock-data.ts` — in `content/mock/`
- `src/data/` (entire directory) — all contents moved to `content/`
- `src/data/useMockData.ts` — moved to `content/mock/useMockData.ts`

### Import migration map (48 files from content-adapter alone)

| Old Import | New Import |
|-----------|-----------|
| `@/lib/content-adapter` | `@/content` |
| `@/constants/subjects` | `@/content` |
| `@/constants/mock-data` | `@/content/mock` |
| `@/constants/lessons/*` | `@/content/lessons/*` |
| `@/constants/quiz-data` | `@/content/questions` |
| `@/constants/quiz/types` | `@/content/questions/types` |
| `@/constants/common-questions` | `@/content/common-questions` |
| `@/constants/study-paths.json` | `@/content/study-paths.json` |
| `@/data/curriculum` | `@/content/curriculum` |
| `@/data/elements` | `@/content/elements` |
| `@/data/element-details` | `@/content/element-details` |
| `@/data/setworks` | `@/content/setworks` |
| `@/data/mindmaps` | `@/content/mindmaps` |
| `@/data/landing` | `@/content/landing` |
| `@/data/quick-tips.json` | `@/content/quick-tips.json` |
| `@/data` (barrel) | `@/content/mock` |

---

## Phase 1: Expand Content Barrel + Migrate Content-Adapter (8 files affected)

The `content-adapter.ts` has 48 importing files. We merge its exports into `content/index.ts` so all 48 files just change `@/lib/content-adapter` → `@/content`.

### Task 1.1: Merge content-adapter exports into content/index.ts

**Files:**
- Modify: `src/content/index.ts`

- [ ] **Step 1: Add missing types from content-adapter to content/index.ts**

Add these type exports that content-adapter provides but content/index.ts doesn't:

```ts
// Add after existing types in content/index.ts

export type SubjectId =
  | 'mathematics'
  | 'physics'
  | 'chemistry'
  | 'life-sciences'
  | 'english'
  | 'afrikaans'
  | 'geography'
  | 'history'
  | 'accounting'
  | 'economics'
  | 'lo'
  | 'business-studies';

export interface Subject {
  id: SubjectId;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  icon: string;
  fluentEmoji: string;
  imgSrc?: string;
  fontFamily: string;
  gradient?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface CurriculumSubject {
  id: SubjectId;
  name: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  subtopics: string[];
  status?: 'not_started' | 'in_progress' | 'completed';
}

export type TopicStatus = 'not_started' | 'in_progress' | 'completed';

export interface StudyRecommendation {
  topicId: string;
  reason: string;
  priority: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}
```

- [ ] **Step 2: Add SUBJECTS record (Record<SubjectId, Subject>) and helpers from content-adapter**

```ts
// Convert SubjectContent[] to Record<SubjectId, Subject> format
function toSubject(s: SubjectContent): Subject {
  return {
    id: s.id as SubjectId,
    name: s.name,
    emoji: s.emoji,
    color: s.color,
    bgColor: s.bgColor,
    icon: s.icon,
    fluentEmoji: s.fluentEmoji,
    imgSrc: s.imgSrc,
    fontFamily: s.fontFamily,
    gradient: {
      primary: s.gradientPrimary,
      secondary: s.gradientSecondary,
      accent: s.gradientAccent,
    },
  };
}

export const SUBJECTS_MAP: Record<SubjectId, Subject> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, toSubject(s)])
) as Record<SubjectId, Subject>;

// Keep SUBJECTS as array (existing) and add SUBJECTS_MAP as record
// Also export aliases that content-adapter provided
export const SUBJECT_NAMES: Record<SubjectId, string> = Object.fromEntries(
  SUBJECTS.map((s) => [s.id, s.name])
) as Record<SubjectId, string>;

export const NSC_SUPPORTED_SUBJECTS: SubjectId[] = [
  'mathematics', 'physics', 'chemistry', 'life-sciences',
  'english', 'afrikaans', 'geography', 'history', 'accounting', 'economics',
];

export function isNSCSupportedSubject(subjectIdOrName: string): boolean {
  const normalizedInput = subjectIdOrName.toLowerCase().trim();
  return NSC_SUPPORTED_SUBJECTS.some((id) => {
    const subject = subjectsById.get(id);
    return subject && (
      id === normalizedInput ||
      subject.name.toLowerCase() === normalizedInput
    );
  });
}
```

- [ ] **Step 3: Add gamification constants from content-adapter**

```ts
// Gamification constants (derived from GAMIFICATION config)
export const MAX_LEVEL = 100;
export const LEVEL_MILESTONES = GAMIFICATION.levelMilestones;
export const LEVEL_TITLES = GAMIFICATION.levelTitles;
export const LEVEL_COLORS = GAMIFICATION.levelColors;
export const LEVEL_BADGE_ICONS = GAMIFICATION.levelBadgeIcons;
export const MAX_STREAK_FREEZES = GAMIFICATION.maxStreakFreezes;
export const STREAK_FREEZE_COST_XP = GAMIFICATION.streakFreezeCostXp;

// Achievement helpers
export const ACHIEVEMENT_DEFS: Record<string, Achievement> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, {
    id: a.id,
    title: a.name,
    description: a.description,
    icon: a.icon,
  }])
);

export const ACHIEVEMENT_POINTS_MAP: Record<string, number> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a.points])
);

export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENT_DEFS[id];
}
```

- [ ] **Step 4: Add exam dates alias**

```ts
// Already exists but verify:
export const NSC_EXAM_DATES = EXAM_DATES;
```

- [ ] **Step 5: Verify content/index.ts compiles**

Run: `bun run lint:fix`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/content/index.ts
git commit -m "refactor: merge content-adapter exports into content barrel"
```

### Task 1.2: Update all 48 files importing from @/lib/content-adapter

**Files:** 48 files (see grep results above)

- [ ] **Step 1: Replace all `@/lib/content-adapter` imports with `@/content`**

Use a global find-and-replace:
- Find: `from '@/lib/content-adapter'`
- Replace: `from '@/content'`

This covers all 48 files. The exports are identical (merged in Task 1.1).

- [ ] **Step 2: Verify no remaining content-adapter imports**

Run: `grep -r "content-adapter" src/`
Expected: No matches (except content-adapter.ts itself)

- [ ] **Step 3: Run lint and typecheck**

Run: `bun run lint:fix`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: migrate all content-adapter imports to @/content"
```

### Task 1.3: Delete content-adapter.ts and constants/subjects.ts

**Files:**
- Delete: `src/lib/content-adapter.ts`
- Delete: `src/constants/subjects.ts`

- [ ] **Step 1: Delete content-adapter.ts**

```bash
rm src/lib/content-adapter.ts
```

- [ ] **Step 2: Delete constants/subjects.ts**

```bash
rm src/constants/subjects.ts
```

- [ ] **Step 3: Update constants/index.ts to remove subjects export**

Edit `src/constants/index.ts`:
```ts
// Remove: export * from './subjects';
// Keep all other exports
```

- [ ] **Step 4: Verify build**

Run: `bun run lint:fix`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: delete content-adapter.ts and constants/subjects.ts"
```

---

## Phase 2: Achievements + Gamification Constants (4 files affected)

### Task 2.1: Update imports from constants/achievements and constants/gamification

**Files:**
- No files directly import `@/constants/achievements` or `@/constants/gamification` (verified by grep)
- `constants/index.ts` re-exports them, but no direct consumers found

- [ ] **Step 1: Verify no direct imports exist**

Run: `grep -r "from '@/constants/achievements'" src/` and `grep -r "from '@/constants/gamification'" src/`
Expected: No matches

- [ ] **Step 2: Delete constants/achievements.ts and constants/gamification.ts**

```bash
rm src/constants/achievements.ts
rm src/constants/gamification.ts
```

- [ ] **Step 3: Update constants/index.ts**

Edit `src/constants/index.ts`:
```ts
// Remove:
// export * from './achievements';
// export * from './gamification';
// Keep: themes, periodic-table, mobile-nav, map-data, common-questions, levels, rewards
```

- [ ] **Step 4: Handle constants/levels.ts and constants/rewards.ts**

Check if they're imported directly:

Run: `grep -r "from '@/constants/levels'" src/` and `grep -r "from '@/constants/rewards'" src/`
- If no direct imports: delete them (their logic is now in content/index.ts)
- If imported: update imports to `@/content`

- [ ] **Step 5: Verify build**

Run: `bun run lint:fix`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor: delete constants/achievements.ts and gamification.ts (replaced by content/)"
```

---

## Phase 3: Lessons + Quiz + Questions (8 files affected)

### Task 3.1: Move lesson JSON files to content/lessons/

**Files:**
- Move: `src/constants/lessons/*.json` (10 files) → `src/content/lessons/`
- Note: `src/content/lessons/` already has lesson JSON files. Check for duplicates.

- [ ] **Step 1: Compare constants/lessons/ with content/lessons/**

```bash
ls src/constants/lessons/
ls src/content/lessons/
```

If content/lessons/ already has all files from constants/lessons/, just delete constants/lessons/. If not, copy missing files.

- [ ] **Step 2: Update imports in hooks/useLessons.ts and lib/lessons.ts**

```ts
// hooks/useLessons.ts - BEFORE
import chemistryData from '@/constants/lessons/chemistry.json';
// AFTER
import chemistryData from '@/content/lessons/chemistry.json';

// lib/lessons.ts - BEFORE
import accounting from '@/constants/lessons/accounting.json';
// AFTER
import accounting from '@/content/lessons/accounting.json';
```

- [ ] **Step 3: Delete constants/lessons/ directory**

```bash
rm -rf src/constants/lessons/
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move lesson JSON from constants/ to content/lessons/"
```

### Task 3.2: Move quiz types and data to content/questions/

**Files:**
- Move: `src/constants/quiz/` (9 files) → `src/content/questions/quiz/`
- Move: `src/constants/quiz-data.ts` → `src/content/questions/quiz-data.ts`
- Modify: `src/content/questions/index.ts`

- [ ] **Step 1: Create content/questions/quiz/ directory and move files**

```bash
mkdir -p src/content/questions/quiz
cp src/constants/quiz/*.ts src/content/questions/quiz/
```

- [ ] **Step 2: Create content/questions/quiz-data.ts**

```bash
cp src/constants/quiz-data.ts src/content/questions/quiz-data.ts
```

Update internal imports in the new file:
```ts
// src/content/questions/quiz-data.ts
import { ACCOUNTING_QUIZ } from './quiz/accounting';
import { CHEMISTRY_QUIZ } from './quiz/chemistry';
import { GEOGRAPHY_QUIZ } from './quiz/geography';
import { LIFE_SCIENCES_QUIZ } from './quiz/life-sciences';
import { MATHEMATICS_QUIZ } from './quiz/mathematics';
import { PHYSICS_QUIZ } from './quiz/physics';
import { PRACTICE_QUIZ } from './quiz/practice';
import { SHORT_ANSWER_QUIZ } from './quiz/sample-short-answer';
import type { QuizData } from './quiz/types';

export * from './quiz/types';

export const QUIZ_DATA: QuizData = {
  ...MATHEMATICS_QUIZ,
  ...PHYSICS_QUIZ,
  ...CHEMISTRY_QUIZ,
  ...LIFE_SCIENCES_QUIZ,
  ...GEOGRAPHY_QUIZ,
  ...ACCOUNTING_QUIZ,
  ...PRACTICE_QUIZ,
  ...SHORT_ANSWER_QUIZ,
};
```

- [ ] **Step 3: Update content/questions/index.ts to re-export quiz data**

```ts
// src/content/questions/index.ts - add:
export { QUIZ_DATA, type QuizData, type QuizQuestion, type ShortAnswerQuestion, type MatchingQuestion, type QuestionType } from './quiz-data';
```

- [ ] **Step 4: Update 8 importing files**

| File | Old Import | New Import |
|------|-----------|-----------|
| `components/Quiz/useQuizState.ts` | `@/constants/quiz/types` | `@/content/questions` |
| `components/Quiz/QuizContent.tsx` | `@/constants/quiz/types` | `@/content/questions` |
| `lib/quiz-grader.ts` | `@/constants/quiz/types` | `@/content/questions` |
| `content/questions/index.ts` | `@/constants/quiz/types` | `./quiz/types` |
| `app/quiz/[id]/page.tsx` | `@/constants/quiz-data` | `@/content/questions` |
| `app/api/search/route.ts` | `@/constants/quiz-data` | `@/content/questions` |
| `data/questions/index.ts` | `@/constants/quiz-data` | `@/content/questions` |

- [ ] **Step 5: Delete old files**

```bash
rm -rf src/constants/quiz/
rm src/constants/quiz-data.ts
```

- [ ] **Step 6: Verify build**

Run: `bun run lint:fix`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: move quiz types and data from constants/ to content/questions/"
```

### Task 3.3: Move common-questions and study-paths

**Files:**
- Move: `src/constants/common-questions.ts` → `src/content/common-questions.ts`
- Move: `src/constants/study-paths.json` → `src/content/study-paths.json`

- [ ] **Step 1: Copy files**

```bash
cp src/constants/common-questions.ts src/content/common-questions.ts
cp src/constants/study-paths.json src/content/study-paths.json
```

- [ ] **Step 2: Update 4 importing files**

| File | Old Import | New Import |
|------|-----------|-----------|
| `components/CommonQuestions/QuestionDialog.tsx` | `@/constants/common-questions` | `@/content/common-questions` |
| `components/CommonQuestions/QuestionCard.tsx` | `@/constants/common-questions` | `@/content/common-questions` |
| `app/common-questions/page.tsx` | `@/constants/common-questions` | `@/content/common-questions` |
| `screens/StudyPath.tsx` | `@/constants/study-paths.json` | `@/content/study-paths.json` |

- [ ] **Step 3: Delete old files**

```bash
rm src/constants/common-questions.ts
rm src/constants/study-paths.json
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move common-questions and study-paths to content/"
```

---

## Phase 4: Curriculum + Elements + Setworks + Landing + Mindmaps (22 files affected)

### Task 4.1: Move data/curriculum/ to content/curriculum/

**Files:**
- Move: `src/data/curriculum/` (6 files) → `src/content/curriculum/`
- Move: `src/data/curriculum.ts` → `src/content/curriculum.ts`

- [ ] **Step 1: Copy files**

```bash
cp -r src/data/curriculum/ src/content/curriculum/
cp src/data/curriculum.ts src/content/curriculum.ts
```

- [ ] **Step 2: Update internal imports**

In the moved files, update `@/lib/content-adapter` → `@/content` (already done in Phase 1).

- [ ] **Step 3: Update 7 importing files**

| File | Old Import | New Import |
|------|-----------|-----------|
| `lib/ai/citations.ts` | `@/data/curriculum` | `@/content/curriculum` |
| `lib/content-adapter.ts` (deleted) | N/A | N/A |
| `hooks/use-curriculum-progress.ts` | `@/data/curriculum` | `@/content/curriculum` |
| `screens/CurriculumMap.tsx` | `@/data/curriculum` | `@/content/curriculum` |
| `components/Curriculum/TopicFilters.tsx` | `@/data/curriculum` | `@/content/curriculum` |

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move curriculum data from data/ to content/curriculum/"
```

### Task 4.2: Move data/elements/ and element-details.ts to content/

**Files:**
- Move: `src/data/elements/` (8 files) → `src/content/elements/`
- Move: `src/data/element-details.ts` → `src/content/element-details.ts`

- [ ] **Step 1: Copy files**

```bash
cp -r src/data/elements/ src/content/elements/
cp src/data/element-details.ts src/content/element-details.ts
```

- [ ] **Step 2: Update 6 importing files**

| File | Old Import | New Import |
|------|-----------|-----------|
| `components/PeriodicTable/usePeriodicTable.ts` | `@/data/elements` | `@/content/elements` |
| `screens/PeriodicTable.tsx` | `@/data/elements` | `@/content/elements` |
| `components/PeriodicTable/ElementDetail.tsx` | `@/data/element-details` | `@/content/element-details` |
| `components/PeriodicTable/ElementComparison.tsx` | `@/data/element-details` | `@/content/element-details` |
| `components/PeriodicTable/ElementCard.tsx` | `@/data/elements` | `@/content/elements` |
| `utils/periodic-table.ts` | `@/data/elements` | `@/content/elements` |
| `constants/periodic-table.ts` | `@/data/element-details` | `@/content/element-details` |

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move elements data from data/ to content/elements/"
```

### Task 4.3: Move data/setworks/ to content/setworks/

**Files:**
- Move: `src/data/setworks/` (3 files) → `src/content/setworks/`

- [ ] **Step 1: Copy files**

```bash
cp -r src/data/setworks/ src/content/setworks/
```

- [ ] **Step 2: Update 10 importing files**

| File | Old Import | New Import |
|------|-----------|-----------|
| `components/SetworkLibrary/ThemeComparator.tsx` | `@/data/setworks/types` | `@/content/setworks/types` |
| `components/SetworkLibrary/ThemeCard.tsx` | `@/data/setworks/types` | `@/content/setworks/types` |
| `components/SetworkLibrary/SetworkCard.tsx` | `@/data/setworks/types` | `@/content/setworks/types` |
| `components/SetworkLibrary/QuoteCard.tsx` | `@/data/setworks/types` | `@/content/setworks/types` |
| `components/SetworkLibrary/QuoteBank.tsx` | `@/data/setworks/types` | `@/content/setworks/types` |
| `components/SetworkLibrary/QuizEngine.tsx` | `@/data/setworks/types` | `@/content/setworks/types` |
| `components/SetworkLibrary/CharacterMap.tsx` | `@/data/setworks/types` | `@/content/setworks/types` |
| `components/SetworkLibrary/CharacterList.tsx` | `@/data/setworks/types` | `@/content/setworks/types` |
| `app/setwork-library/[id]/page.tsx` | `@/data/setworks` | `@/content/setworks` |
| `app/setwork-library/quiz/page.tsx` | `@/data/setworks` | `@/content/setworks` |
| `app/setwork-library/page.tsx` | `@/data/setworks` | `@/content/setworks` |
| `app/setwork-library/essays/page.tsx` | `@/data/setworks` | `@/content/setworks` |
| `app/setwork-library/essays/essays-content.tsx` | `@/data/setworks/types` | `@/content/setworks/types` |
| `app/setwork-library/analysis/page.tsx` | `@/data/setworks` | `@/content/setworks` |
| `app/setwork-library/analysis/analysis-content.tsx` | `@/data/setworks/types` | `@/content/setworks/types` |
| `app/setwork-library/quiz/quiz-content.tsx` | `@/data/setworks/types` | `@/content/setworks/types` |

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move setworks data from data/ to content/setworks/"
```

### Task 4.4: Move landing.ts, mindmaps.ts, quick-tips.json, exam-dates.ts

**Files:**
- Move: `src/data/landing.ts` → `src/content/landing.ts`
- Move: `src/data/mindmaps.ts` → `src/content/mindmaps.ts`
- Move: `src/data/quick-tips.json` → `src/content/quick-tips.json`
- Move: `src/data/exam-dates.ts` → `src/content/exam-dates.ts` (if it has logic beyond the JSON)

- [ ] **Step 1: Copy files**

```bash
cp src/data/landing.ts src/content/landing.ts
cp src/data/mindmaps.ts src/content/mindmaps.ts
cp src/data/quick-tips.json src/content/quick-tips.json
cp src/data/exam-dates.ts src/content/exam-dates.ts
```

- [ ] **Step 2: Update 8 importing files**

| File | Old Import | New Import |
|------|-----------|-----------|
| `components/Landing/TestimonialsSection.tsx` | `@/data/landing` | `@/content/landing` |
| `components/Landing/StatsSection.tsx` | `@/data/landing` | `@/content/landing` |
| `components/Landing/FeaturesSection.tsx` | `@/data/landing` | `@/content/landing` |
| `components/MindMap/MindMapSVG.tsx` | `@/data/mindmaps` | `@/content/mindmaps` |
| `components/MindMap/mindmap-utils.ts` | `@/data/mindmaps` | `@/content/mindmaps` |
| `components/MindMap/mindmap-data.ts` | `@/data/mindmaps` | `@/content/mindmaps` |
| `components/Dashboard/TipOfTheDay.tsx` | `@/data/quick-tips.json` | `@/content/quick-tips.json` |
| `lib/offline.ts` | `@/data/quick-tips.json` | `@/content/quick-tips.json` |

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move landing, mindmaps, quick-tips, exam-dates to content/"
```

---

## Phase 5: Mock Data Consolidation (3 files affected)

### Task 5.1: Consolidate mock data into content/mock/

**Files:**
- Create: `src/content/mock/index.ts`
- Create: `src/content/mock/seed-data.json`
- Move: `src/data/useMockData.ts` → `src/content/mock/useMockData.ts`

- [ ] **Step 1: Create content/mock/ directory**

```bash
mkdir -p src/content/mock
```

- [ ] **Step 2: Copy src/data/mock-data.json as content/mock/seed-data.json**

```bash
cp src/data/mock-data.json src/content/mock/seed-data.json
```

- [ ] **Step 3: Create content/mock/index.ts (barrel file)**

Copy the exports from `src/data/index.ts` but update imports:

```ts
// src/content/mock/index.ts
import seedData from './seed-data.json';

// Re-export all types from data/index.ts
export interface Subject {
  id: number;
  name: string;
  description: string | null;
  curriculumCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ... (copy all interfaces from data/index.ts)

// Mock data exports
export const mockSubjects = seedData.subjects as Subject[];
export const mockQuestions = seedData.questions as Question[];
// ... (copy all mock exports from data/index.ts)

// Helper functions
export const getQuestionsWithOptions = () => { /* ... */ };
export const getQuestionsBySubject = (subjectId: number) => { /* ... */ };
// ... (copy all helpers from data/index.ts)
```

- [ ] **Step 4: Merge scattered mock-*.json files into seed-data.json**

For each `src/data/mock-*.json` file:
- Read its content
- Add it as a key in `seed-data.json`
- Example: `mock-flashcards.json` → `seed-data.json.flashcards`

Files to merge:
- `mock-flashcards.json`
- `mock-ai-chat.json`
- `mock-buddy-requests.json`
- `mock-notifications.json`
- `mock-aps-milestones.json`
- `mock-focus-rooms.json`
- `mock-exam-attempts.json`

- [ ] **Step 5: Move useMockData.ts**

```bash
cp src/data/useMockData.ts src/content/mock/useMockData.ts
```

Update its imports to use `./index` instead of `@/data`.

- [ ] **Step 6: Update 2 importing files**

| File | Old Import | New Import |
|------|-----------|-----------|
| `lib/api/data-source.ts` | `@/data` | `@/content/mock` |
| `app/demo/page.tsx` | `@/data` | `@/content/mock` |
| `components/Demo/SubjectsGrid.tsx` | `@/data` (type Subject) | `@/content/mock` |

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: consolidate mock data into content/mock/"
```

### Task 5.2: Move mock-dashboard.ts

**Files:**
- Move: `src/constants/mock-dashboard.ts` → `src/content/mock/dashboard.ts`

- [ ] **Step 1: Copy and update imports**

```bash
cp src/constants/mock-dashboard.ts src/content/mock/dashboard.ts
```

Update the new file's import: `@/lib/content-adapter` → `@/content`

- [ ] **Step 2: Update 2 importing files**

| File | Old Import | New Import |
|------|-----------|-----------|
| `screens/Dashboard.tsx` | `@/constants/mock-dashboard` | `@/content/mock/dashboard` |
| `components/Dashboard/TodayTab.tsx` | `@/constants/mock-dashboard` | `@/content/mock/dashboard` |

- [ ] **Step 3: Delete old file**

```bash
rm src/constants/mock-dashboard.ts
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: move mock-dashboard.ts to content/mock/"
```

---

## Phase 6: Final Cleanup

### Task 6.1: Delete src/data/ directory

- [ ] **Step 1: Verify all imports from @/data are migrated**

Run: `grep -r "from '@/data" src/`
Expected: No matches (all replaced in Phases 4-5)

- [ ] **Step 2: Delete entire data/ directory**

```bash
rm -rf src/data/
```

- [ ] **Step 3: Verify build**

Run: `bun run lint:fix` and `bun run build`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: delete src/data/ directory (all contents moved to content/)"
```

### Task 6.2: Clean up constants/index.ts

- [ ] **Step 1: Update constants/index.ts to only export UI config**

```ts
// src/constants/index.ts — final state
export { COMMON_QUESTIONS, type CommonQuestion } from '../content/common-questions';
export {
  CATEGORY_LABELS,
  type ElementComparisonData,
  type ElementDetail,
  type ElementType,
  GROUP_COLORS,
  type QuizQuestion,
  type TrendMode,
} from './periodic-table';
export * from './themes';
```

Wait — common-questions is now in content/. Let me re-check what remains in constants/.

Files remaining in `src/constants/`:
- `themes.ts` — KEEP (UI config)
- `periodic-table.ts` — KEEP (UI types/colors, imports from `@/content/element-details`)
- `interactions.json` — KEEP (UI config)
- `mobile-nav.ts` — KEEP (navigation config)
- `map-data.ts` — KEEP (map visualization)
- `index.ts` — UPDATE to only export remaining files

- [ ] **Step 2: Update constants/index.ts**

```ts
// src/constants/index.ts — final state
export * from './themes';
export {
  CATEGORY_LABELS,
  type ElementComparisonData,
  type ElementDetail,
  type ElementType,
  GROUP_COLORS,
  type QuizQuestion,
  type TrendMode,
} from './periodic-table';
export { MOBILE_NAV_SECTIONS, type MobileNavItem } from './mobile-nav';
export { BIOMES, BATTLE_SITES, CLIMATE_REGIONS, CONSERVATION_AREAS, TIMELINE_EVENTS, REGIONAL_ZOOM, DEFAULT_ZOOM, SOUTH_AFRICA_CENTER } from './map-data';
```

- [ ] **Step 3: Verify no broken imports remain**

Run: `grep -r "from '@/constants/" src/` — verify all remaining imports point to files that still exist.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: clean up constants/index.ts (UI config only)"
```

### Task 6.3: Final verification

- [ ] **Step 1: Run full lint**

Run: `bun run lint:fix`
Expected: No errors

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck` (or `npx tsc --noEmit`)
Expected: No errors

- [ ] **Step 3: Run build**

Run: `bun run build`
Expected: Successful build

- [ ] **Step 4: Run dev server and spot-check**

Run: `bun run dev`
Verify: Pages load correctly, no import errors in console

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: resolve remaining issues after data consolidation"
```

---

## Verification Checklist

After all phases:

- [ ] No files import from `@/lib/content-adapter`
- [ ] No files import from `@/data` (directory deleted)
- [ ] No files import from `@/constants/subjects`
- [ ] No files import from `@/constants/achievements`
- [ ] No files import from `@/constants/gamification`
- [ ] No files import from `@/constants/lessons/`
- [ ] No files import from `@/constants/quiz/`
- [ ] No files import from `@/constants/quiz-data`
- [ ] No files import from `@/constants/mock-data`
- [ ] `src/data/` directory does not exist
- [ ] `src/lib/content-adapter.ts` does not exist
- [ ] `src/constants/` only contains: themes.ts, periodic-table.ts, interactions.json, mobile-nav.ts, map-data.ts, index.ts
- [ ] `src/content/` is the single import point for all static data
- [ ] `bun run lint:fix` passes
- [ ] `bun run build` passes
- [ ] Dev server runs without errors
