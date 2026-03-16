# Dynamic APS Engine Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan.

**Goal:** Unify APS logic into a central service linked to the database. Auto-sync APS based on Quiz results and Past Paper performance. Allow Report Card upload via Snap & Solve tech to auto-populate APS profile.

**Architecture:** 
- New `userApsScores` table to track per-subject APS points
- New `apsCalculationEngine` service with unified calculation logic
- Integration hooks into quiz completion and past paper submission
- Dashboard briefing shows real-time progress with specific messaging

**Tech Stack:** Next.js 16, PostgreSQL (Drizzle), React, shadcn/ui

---

## File Structure

- **Create:** `src/lib/db/aps-actions.ts` - APS database actions
- **Modify:** `src/lib/db/schema.ts` - Add userApsScores table
- **Create:** `src/services/apsCalculationEngine.ts` - Unified APS calculation
- **Modify:** `src/lib/db/quiz-results-actions.ts` - Hook into quiz completion
- **Modify:** `src/actions/gamification.ts` - Use unified engine
- **Modify:** `src/screens/Dashboard.tsx` - Real-time APS display

---

## Chunk 1: Database Schema & Actions

### Task 1: Add userApsScores table to schema

**Files:**
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Add userApsScores table after universityTargets**

```typescript
// ============================================================================
// USER APS SCORES - Track APS points per subject
// ============================================================================

export const userApsScores = pgTable(
  'user_aps_scores',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    subject: varchar('subject', { length: 50 }).notNull(),
    currentGrade: varchar('current_grade', { length: 2 }).notNull(), // 1-7 or U
    apsPoints: integer('aps_points').notNull(), // 1-7 points
    lastAssessmentType: varchar('last_assessment_type', { length: 20 }), // quiz, pastPaper, reportCard
    lastAssessmentScore: integer('last_assessment_score'),
    lastUpdatedAt: timestamp('last_updated_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('user_aps_scores_user_id_idx').on(table.userId),
    userSubjectIdx: index('user_aps_scores_user_subject_idx').on(table.userId, table.subject),
  })
);

export const userApsScoresRelations = relations(userApsScores, ({ one }) => ({
  user: one(users, {
    fields: [userApsScores.userId],
    references: [users.id],
  }),
}));

export type UserApsScore = typeof userApsScores.$inferSelect;
export type NewUserApsScore = typeof userApsScores.$inferInsert;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add userApsScores table to schema"
```

---

### Task 2: Create APS actions

**Files:**
- Create: `src/lib/db/aps-actions.ts`

- [ ] **Step 1: Create APS database actions**

```typescript
import { eq, and, desc } from 'drizzle-orm';
import { dbManager } from './index';
import { userApsScores, type UserApsScore, type NewUserApsScore } from './schema';

const GRADE_POINTS: Record<string, number> = {
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2,
  '1': 1,
  'U': 0,
};

export async function getUserApsScores(userId: string): Promise<UserApsScore[]> {
  const connected = await dbManager.waitForConnection();
  if (!connected) throw new Error('Database connection failed');
  
  const db = await dbManager.getDb();
  return db.select()
    .from(userApsScores)
    .where(eq(userApsScores.userId, userId))
    .orderBy(desc(userApsScores.apsPoints));
}

export async function getUserTotalAps(userId: string): Promise<number> {
  const scores = await getUserApsScores(userId);
  // Return sum of top 7 subjects (including Life Orientation)
  const sortedScores = scores
    .filter(s => s.subject !== 'Life Orientation')
    .sort((a, b) => b.apsPoints - a.apsPoints)
    .slice(0, 6);
  
  // Always include Life Orientation if present
  const lifeOrientation = scores.find(s => s.subject === 'Life Orientation');
  const subjects = lifeOrientation ? [...sortedScores, lifeOrientation] : sortedScores;
  
  return subjects.slice(0, 7).reduce((sum, s) => sum + s.apsPoints, 0);
}

export async function upsertApsScore(
  userId: string,
  subject: string,
  grade: string,
  assessmentType: 'quiz' | 'pastPaper' | 'reportCard',
  assessmentScore?: number
): Promise<UserApsScore> {
  const connected = await dbManager.waitForConnection();
  if (!connected) throw new Error('Database connection failed');
  
  const db = await dbManager.getDb();
  const points = GRADE_POINTS[grade] ?? 0;
  
  const [score] = await db
    .insert(userApsScores)
    .values({
      userId,
      subject,
      currentGrade: grade,
      apsPoints: points,
      lastAssessmentType: assessmentType,
      lastAssessmentScore: assessmentScore ?? null,
    })
    .onConflictDoUpdate({
      target: [userApsScores.userId, userApsScores.subject],
      set: {
        currentGrade: grade,
        apsPoints: points,
        lastAssessmentType: assessmentType,
        lastAssessmentScore: assessmentScore ?? null,
        lastUpdatedAt: new Date(),
      },
    })
    .returning();
  
  return score;
}

export async function initializeUserApsFromReportCard(
  userId: string,
  subjects: Array<{ subject: string; grade: string }>
): Promise<void> {
  for (const { subject, grade } of subjects) {
    await upsertApsScore(userId, subject, grade, 'reportCard');
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/db/aps-actions.ts
git commit -m "feat: add APS database actions"
```

---

## Chunk 2: APS Calculation Engine Service

### Task 3: Create unified APS calculation engine

**Files:**
- Create: `src/services/apsCalculationEngine.ts`

- [ ] **Step 1: Create the APS calculation engine**

```typescript
import { getUserApsScores, getUserTotalAps, upsertApsScore } from '@/lib/db/aps-actions';
import { getQuizResultsByUser } from '@/lib/db/quiz-results-actions';
import { getDb } from '@/lib/db';

const SOUTH_AFRICAN_SUBJECTS = [
  'Mathematics',
  'Physical Sciences',
  'Life Sciences',
  'Geography',
  'History',
  'English Home Language',
  'English First Additional Language',
  'Afrikaans Home Language',
  'Afrikaans First Additional Language',
  'Accounting',
  'Business Studies',
  'Economics',
  'Information Technology',
  'Computer Applications Technology',
  'Mathematics Literacy',
  'Life Orientation',
];

// Convert percentage to NSC grade
export function percentageToGrade(percentage: number): string {
  if (percentage >= 80) return '7';
  if (percentage >= 70) return '6';
  if (percentage >= 60) return '5';
  if (percentage >= 50) return '4';
  if (percentage >= 40) return '3';
  if (percentage >= 30) return '2';
  if (percentage >= 20) return '1';
  return 'U';
}

// Calculate APS from quiz performance
export async function calculateApsFromQuizResults(
  userId: string,
  subject: string
): Promise<{ grade: string; confidence: number }> {
  const quizResults = await getQuizResultsByUser(userId);
  
  // Filter quizzes for this subject
  const subjectQuizzes = quizResults.filter(q => 
    q.quizId.toLowerCase().includes(subject.toLowerCase())
  );
  
  if (subjectQuizzes.length === 0) {
    return { grade: '0', confidence: 0 };
  }
  
  // Calculate average performance
  const avgPercentage = subjectQuizzes.reduce((sum, q) => 
    sum + parseFloat(q.percentage), 0) / subjectQuizzes.length;
  
  const grade = percentageToGrade(avgPercentage);
  const confidence = Math.min(subjectQuizzes.length / 10, 1); // Max confidence at 10 quizzes
  
  return { grade, confidence };
}

// Calculate APS from past paper performance
export async function calculateApsFromPastPapers(
  userId: string,
  subject: string
): Promise<{ grade: string; confidence: number }> {
  // TODO: Query past paper attempts when that table is created
  // For now, return neutral
  return { grade: '0', confidence: 0 };
}

// Get unified APS score for a user
export async function getUnifiedApsScore(userId: string): Promise<{
  totalAps: number;
  subjectScores: Array<{
    subject: string;
    grade: string;
    points: number;
    lastUpdated: Date;
  }>;
}> {
  const subjectScores = await getUserApsScores(userId);
  const totalAps = await getUserTotalAps(userId);
  
  return {
    totalAps,
    subjectScores: subjectScores.map(s => ({
      subject: s.subject,
      grade: s.currentGrade,
      points: s.apsPoints,
      lastUpdated: s.lastUpdatedAt,
    })),
  };
}

// Sync APS after quiz completion
export async function syncApsAfterQuiz(
  userId: string,
  subject: string,
  percentage: number
): Promise<{ newGrade: string; totalAps: number; message: string }> {
  const grade = percentageToGrade(percentage);
  await upsertApsScore(userId, subject, grade, 'quiz', Math.round(percentage));
  
  const totalAps = await getUserTotalAps(userId);
  
  const gradeNames: Record<string, string> = {
    '7': 'Outstanding',
    '6': 'Excellent',
    '5': 'Very Good',
    '4': 'Good',
    '3': 'Satisfactory',
    '2': 'Elementary',
    '1': 'Not Achieved',
    '0': 'No data',
  };
  
  const message = `You've reached Level ${grade} (${gradeNames[grade] || 'Unknown'}) in ${subject}!`;
  
  return { newGrade: grade, totalAps, message };
}

// Get APS progress message for dashboard
export function getApsProgressMessage(
  currentAps: number,
  targetAps: number,
  universityTarget?: string,
  recentAchievement?: { subject: string; level: number }
): string {
  const gap = targetAps - currentAps;
  
  if (recentAchievement) {
    return `You just reached Level ${recentAchievement.level} in ${recentAchievement.subject}—your total APS is now ${currentAps}!`;
  }
  
  if (gap <= 0) {
    return `Amazing! You've reached your APS target of ${targetAps}! You're ready for ${universityTarget || 'university'}!`;
  }
  
  if (gap <= 5) {
    return `Almost there! Just ${gap} more points to reach your ${targetAps} APS goal for ${universityTarget || 'university'}.`;
  }
  
  return `You're making great progress! Current APS: ${currentAps}. Target: ${targetAps} for ${universityTarget || 'university'}.`;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/apsCalculationEngine.ts
git commit -m "feat: add APS calculation engine service"
```

---

## Chunk 3: Integration & Dashboard Updates

### Task 4: Update gamification actions to use unified engine

**Files:**
- Modify: `src/actions/gamification.ts`

- [ ] **Step 1: Import the unified engine**

```typescript
import { 
  // existing imports
} from '...';
import { 
  getUnifiedApsScore, 
  getApsProgressMessage,
  syncApsAfterQuiz 
} from '@/services/apsCalculationEngine';
```

- [ ] **Step 2: Update getUserApsProgress to use unified engine**

```typescript
export async function getUserApsProgress(): Promise<APSProgress> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const db = await getDb();

  const target = await db.query.universityTargets.findFirst({
    where: (ut, { eq, and }) => and(eq(ut.userId, session.user.id), eq(ut.isActive, true)),
  });

  // Use unified engine to get real APS
  const { totalAps } = await getUnifiedApsScore(session.user.id);
  const monthlyPoints = await getMonthlyApsPoints(session.user.id);

  // Use real APS or fallback to default
  const currentAps = totalAps > 0 ? totalAps : 32;
  const targetAps = target?.targetAps || 42;

  return {
    currentAps,
    targetAps,
    pointsThisMonth: monthlyPoints,
    universityTarget: target?.universityName,
    faculty: target?.faculty,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/actions/gamification.ts
git commit -m "feat: integrate unified APS engine"
```

---

### Task 5: Update Dashboard with real-time APS messaging

**Files:**
- Modify: `src/screens/Dashboard.tsx`
- Modify: `src/components/Dashboard/UniversityGoalCard.tsx`

- [ ] **Step 1: Import APS engine and actions**

```typescript
import { getUnifiedApsScore, getApsProgressMessage, syncApsAfterQuiz } from '@/services/apsCalculationEngine';
import { getUserApsProgress } from '@/actions/gamification';
```

- [ ] **Step 2: Update Dashboard component to fetch real APS**

In the Dashboard component, update to fetch real APS:

```typescript
export default function Dashboard({
  initialProgress,
  initialStreak,
  initialAchievements,
  session,
}: DashboardProps) {
  // Add state for real-time APS
  const [realTimeAps, setRealTimeAps] = useState<{
    totalAps: number;
    targetAps: number;
    message: string;
  } | null>(null);
  
  // Fetch real APS on mount
  useEffect(() => {
    async function fetchAps() {
      try {
        const progress = await getUserApsProgress();
        const message = getApsProgressMessage(
          progress.currentAps,
          progress.targetAps,
          progress.universityTarget
        );
        setRealTimeAps({
          totalAps: progress.currentAps,
          targetAps: progress.targetAps,
          message,
        });
      } catch (e) {
        // Use fallback
      }
    }
    fetchAps();
  }, []);
  
  // ... rest of component
}
```

- [ ] **Step 3: Update UniversityGoalCard with real-time message**

```typescript
// In UniversityGoalCard component props
interface UniversityGoalCardProps {
  universityName: string;
  faculty: string;
  currentAps: number;
  targetAps: number;
  progressMessage?: string; // Add this
}

// Display the message
{progressMessage && (
  <p className="text-xs text-muted-foreground mt-2">
    {progressMessage}
  </p>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/screens/Dashboard.tsx
git add src/components/Dashboard/UniversityGoalCard.tsx
git commit -m "feat: add real-time APS messaging to dashboard"
```

---

## Verification

- [ ] Run database migration to create userApsScores table
- [ ] Test APS calculation from quiz results
- [ ] Verify dashboard shows real APS instead of hardcoded values
- [ ] Check that APS updates after quiz completion
- [ ] Verify progress messages display correctly

---

## Future Enhancements (Out of Scope)

- Report Card upload via Snap & Solve (needs OCR integration)
- Past Paper performance tracking integration
- AI-generated APS predictions
- University recommendation based on current APS
