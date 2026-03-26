# Data Consolidation — Single Source of Truth

## Problem

Data is spread across **5+ locations** with significant duplication:

- `src/content/` — the intended single source (JSON + barrel), partially adopted
- `src/constants/` — duplicate subject types, achievement definitions, gamification config, lessons, quiz data
- `src/data/` — duplicate curriculum, questions, elements, setworks, exam dates, mock data
- `data/` (root) — SQLite database
- `drizzle/` — PostgreSQL schema/migrations
- 7+ scattered `mock-*.json` files

A `content-adapter.ts` bridge exists but signals incomplete migration. Three competing "source of truth" directories cause confusion, stale data, and maintenance burden.

## Goal

Create a single source of truth using a **hybrid architecture**:

- **Static/curriculum data** → JSON files in `src/content/`
- **User/dynamic data** → PostgreSQL database
- **Mock data** → Consolidated into `src/content/mock/`
- Remove all duplication, delete `src/constants/` data files and `src/data/` entirely

## Design

### Data Ownership Map

Every data type has exactly one home:

| Data Type | Source of Truth | Runtime Access | DB Role |
|-----------|----------------|---------------|---------|
| Subjects | `content/subjects.json` | `from '@/content'` | Seeded at deploy |
| Achievements | `content/achievements.json` | `from '@/content'` | Seeded at deploy |
| Gamification | `content/gamification.json` | `from '@/content'` | Seeded at deploy |
| Exam dates | `content/exam-dates.json` | `from '@/content'` | Seeded at deploy |
| Topic weightages | `content/topic-weightages.json` | `from '@/content'` | Seeded at deploy |
| Past papers | `content/past-papers.json` | `from '@/content'` | Seeded at deploy |
| Lessons | `content/lessons/*.json` | `from '@/content'` | Seeded at deploy |
| Questions | `content/questions/*.json` | `from '@/content'` | Seeded at deploy |
| Curriculum | `content/curriculum/*.ts` | `from '@/content'` | Seeded at deploy |
| Setworks | `content/setworks/*.json` | `from '@/content'` | Seeded at deploy |
| Elements | `content/elements/*.ts` | `from '@/content'` | Seeded at deploy |
| User progress | DB only | `db.select().from(progress)` | Runtime only |
| Quiz results | DB only | `db.select().from(quizResults)` | Runtime only |
| Flashcards | DB only | `db.select().from(flashcards)` | Runtime only |
| Sessions | DB only | `db.select().from(studySessions)` | Runtime only |

### Target Directory Structure

```
src/content/
├── index.ts              # barrel: types, exports, lookup helpers
├── subjects.json
├── achievements.json
├── gamification.json
├── exam-dates.json
├── past-papers.json
├── topic-weightages.json
├── quick-tips.json
├── lessons/              # moved from constants/lessons/ + data/lessons/
│   ├── index.ts
│   ├── mathematics.json
│   ├── physics.json
│   ├── chemistry.json
│   ├── life-sciences.json
│   ├── life-orientation.json
│   ├── geography.json
│   ├── history.json
│   ├── economics.json
│   ├── business-studies.json
│   └── accounting.json
├── questions/            # moved from data/questions/
│   ├── index.ts
│   ├── mathematics.json
│   ├── physics.json
│   ├── chemistry.json
│   └── ...
├── curriculum/           # moved from data/curriculum/
│   ├── index.ts
│   ├── types.ts
│   ├── mathematics.ts
│   └── ...
├── elements/             # moved from data/elements/
│   ├── index.ts
│   └── ...
├── setworks/             # moved from data/setworks/
│   ├── index.ts
│   ├── types.ts
│   └── ...
├── landing.ts            # moved from data/landing.ts
├── mindmaps.ts           # moved from data/mindmaps.ts
├── exam-dates.ts         # moved from data/exam-dates.ts (if non-JSON logic needed)
└── mock/                 # consolidated mock data
    ├── index.ts          # exports + helpers
    ├── seed-data.json    # single consolidated mock file
    └── README.md         # documents mock data structure
```

### Files to Delete

**`src/constants/` (data files only):**
- `subjects.ts` — types + constants moved to `content/index.ts`
- `achievements.ts` — definitions moved to `content/achievements.json`
- `gamification.ts` — config moved to `content/gamification.json`
- `mock-data.ts` — replaced by `content/mock/`
- `levels.ts` — merge unique parts into `content/index.ts`
- `rewards.ts` — merge unique parts into `content/index.ts`
- `common-questions.ts` — merge into `content/` or `content/questions/`
- `lessons/` — moved to `content/lessons/`
- `quiz-data.ts` — merged into `content/questions/`
- `index.ts` — updated to only re-export remaining UI config

**`src/constants/` (keeps — UI config, not curriculum data):**
- `themes.ts`
- `interactions.json`
- `mobile-nav.ts`
- `map-data.ts`
- `periodic-table.ts` (or move to `content/elements/`)

**`src/data/` (entire directory):**
- `index.ts` — delete (mock barrel)
- `mock-data.json` — replaced by `content/mock/`
- `mock-*.json` (7 files) — replaced by `content/mock/`
- `curriculum-data.json` — replaced by `content/curriculum/`
- `useMockData.ts` — update to import from `content/mock/`
- All other files moved to `content/`

**Bridge files:**
- `src/lib/content-adapter.ts` — delete after migration

### Content Barrel (`src/content/index.ts`)

Single import point for all static content:

```ts
// Types
export interface SubjectContent { ... }
export interface AchievementContent { ... }
export interface GamificationConfig { ... }

// Static data
export const SUBJECTS = subjectsData as SubjectContent[];
export const ACHIEVEMENTS = achievementsData as AchievementContent[];
export const GAMIFICATION = gamificationData as GamificationConfig;

// Lookup helpers
export function getSubjectById(id: string): SubjectContent | undefined;
export function getSubjectName(id: string): string;
export function getSubjectEmoji(id: string): string;
export function getSubjectColor(id: string): string;
export function getSubjectGradient(id: string): { primary, secondary, accent };

// Lesson/Question getters (lazy-loaded from subdirectory JSON)
export function getLessonsForSubject(subjectId: string): Lesson[];
export function getQuestionsForSubject(subjectId: string): Question[];
```

### Mock Data Structure

Replace 7+ scattered mock files with one consolidated structure:

```ts
// src/content/mock/index.ts
import seedData from './seed-data.json';

export const mockData = {
  subjects: seedData.subjects,
  users: seedData.users,
  progress: seedData.progress,
  quizResults: seedData.quizResults,
  flashcards: seedData.flashcards,
  notifications: seedData.notifications,
  leaderboard: seedData.leaderboard,
  // ... all mock data in one place
};

// Helpers matching the old mock-data.ts pattern
export const getMockQuestionsWithOptions = () => { ... };
export const getMockProgressBySubject = (id: number) => { ... };
```

## Implementation Phases

### Phase 1: Subject Consolidation
- Move subject types/constants from `constants/subjects.ts` into `content/index.ts`
- Ensure `content/subjects.json` has all fields from both sources
- Update all imports: `@/constants/subjects` → `@/content`
- Update `constants/mock-data.ts` to import from `@/content`
- Delete `constants/subjects.ts` and `content-adapter.ts`
- Run `bun run lint:fix`

### Phase 2: Achievements + Gamification
- Merge `constants/achievements.ts` unique logic into `content/index.ts`
- Merge `constants/gamification.ts` unique logic into `content/index.ts`
- Ensure JSON files are canonical
- Update all imports
- Delete old files

### Phase 3: Lessons, Questions, Curriculum, Elements, Setworks
- Move `constants/lessons/` to `content/lessons/`
- Move `data/questions/` to `content/questions/`
- Move `data/curriculum/` to `content/curriculum/`
- Move `data/elements/` to `content/elements/`
- Move `data/setworks/` to `content/setworks/`
- Move `data/landing.ts`, `data/mindmaps.ts`, `data/exam-dates.ts` to `content/`
- Update seed scripts (`lib/db/seed/`) to read from new locations
- Update all imports
- Delete `data/` directory

### Phase 4: Mock Data Consolidation
- Merge 7+ mock files into `content/mock/seed-data.json`
- Create `content/mock/index.ts` with exports and helpers
- Update `data/useMockData.ts` → `content/mock/useMockData.ts`
- Update all imports
- Delete scattered mock files and `data/` directory

### Phase 5: Cleanup
- Remove `content-adapter.ts`
- Clean up `constants/` to only UI config files
- Update `constants/index.ts` to only export remaining UI config
- Remove dead imports and unused exports
- Run `bun run lint:fix` and verify build
- Update `AGENTS.md` if data conventions change

## Seed Script Updates

The existing seed scripts in `src/lib/db/seed/` already import from `@/content/` in some places (e.g., `seed/curriculum-data.ts`). After consolidation:

- All seed scripts import from `@/content` or `@/content/lessons`, `@/content/questions`, etc.
- No seed script imports from `@/constants` or `@/data`
- The DB schema (`lib/db/schema.ts`) stays unchanged — it's already correct

## Import Migration Map

| Old Import | New Import |
|-----------|-----------|
| `@/constants/subjects` | `@/content` |
| `@/constants/achievements` | `@/content` |
| `@/constants/gamification` | `@/content` |
| `@/constants/levels` | `@/content` |
| `@/constants/rewards` | `@/content` |
| `@/constants/mock-data` | `@/content/mock` |
| `@/data/index` | `@/content` or `@/content/mock` |
| `@/data/curriculum` | `@/content/curriculum` |
| `@/data/questions` | `@/content/questions` |
| `@/data/elements` | `@/content/elements` |
| `@/data/setworks` | `@/content/setworks` |
| `@/data/mindmaps` | `@/content/mindmaps` |
| `@/data/landing` | `@/content/landing` |
| `@/data/exam-dates` | `@/content` |
| `@/lib/content-adapter` | `@/content` |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Breaking imports across many files | High | Use grep to find all old imports before deleting. Phase-by-phase approach limits blast radius. |
| Seed scripts break | High | Update seed scripts in same phase as data moves. Test seed after each phase. |
| Lost data during moves | Medium | Git tracks all changes. Verify JSON content matches before deleting originals. |
| Large JSON files slow build | Low | Questions JSON already exists. Lazy-load where needed. |

## Success Criteria

- Zero duplicate data definitions across codebase
- `src/content/` is the single import point for all static/curriculum data
- DB is the single source for user/dynamic data
- `src/constants/` contains only UI config (themes, navigation, interactions)
- `src/data/` directory is deleted entirely
- `content-adapter.ts` is deleted
- All mock data lives in `src/content/mock/`
- Seed scripts work with new import paths
- `bun run lint:fix` passes
- App builds and runs correctly
