# Enhanced Adaptive Learning Features Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 4 new synergy features and 4 improvements that connect adaptive learning, university targets, snap-and-solve, voice tutor, mistake handling, and gamification.

**Architecture:** This plan adds new database tables for university targets and topic weightages, extends existing actions with new functions, creates new UI components, and integrates disparate systems.

**Tech Stack:** Next.js 16, Drizzle ORM, PostgreSQL, Gemini AI

---

## Overview of Changes

| Feature | Files to Create | Files to Modify |
|---------|-----------------|-----------------|
| 1. APS-Targeted Adaptive Learning | `src/lib/constants/topic-weightages.ts` | `src/actions/adaptive-learning.ts`, `src/lib/db/schema.ts` |
| 2. Snap-to-Syllabus Knowledge Mapping | `src/actions/snap-to-curriculum.ts` | `src/screens/SnapAndSolve.tsx` |
| 3. Voice Tutor Study Buddy Mode | `src/actions/voice-quiz.ts` | `src/screens/VoiceTutor.tsx`, `src/screens/FocusRooms.tsx` |
| 4. Mistake-Driven Content Discovery | - | `src/actions/mistake-to-study-plan.ts`, `src/actions/content-discovery.ts` |
| 5. Proactive AI Tutor (Nudge) | `src/actions/nudge-system.ts`, `src/components/Dashboard/AITutorNudge.tsx` | `src/screens/Dashboard.tsx` |
| 6. Gamified APS Level Up | `src/components/Gamification/APSProgressCard.tsx` | `src/actions/gamification.ts`, `src/screens/Dashboard.tsx` |
| 7. High-Weightage Topic Badges | `src/components/Curriculum/TopicBadge.tsx` | `src/screens/CurriculumMap.tsx` |
| 8. Interactive Periodic Table | `src/screens/PeriodicTable.tsx` | `src/screens/PhysicalSciences.tsx`, `src/app/ai-tutor/page.tsx` |

---

## Chunk 1: Database Schema Extensions

### Task 1: Add university_targets and topic_weightages tables

**Files:**
- Modify: `src/lib/db/schema.ts:800-850`
- Test: `bun run db:push` and verify tables exist

- [ ] **Step 1: Add university_targets table to schema**

```typescript
// Add after topicConfidence table definition (around line 820)
export const universityTargets = pgTable('university_targets', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  universityName: varchar('university_name', { length: 100 }).notNull(),
  faculty: varchar('faculty', { length: 100 }).notNull(),
  targetAps: integer('target_aps').notNull(),
  requiredSubjects: text('required_subjects'), // JSON array stored as text
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const universityTargetsRelations = relations(universityTargets, ({ one }) => ({
  user: one(users, {
    fields: [universityTargets.userId],
    references: [users.id],
  }),
}));
```

- [ ] **Step 2: Add topic_weightages table for NSC high-weightage topics**

```typescript
// Add after universityTargets
export const topicWeightages = pgTable('topic_weightages', {
  id: uuid('id').defaultRandom().primaryKey(),
  subject: varchar('subject', { length: 50 }).notNull(),
  topic: varchar('topic', { length: 100 }).notNull(),
  weightagePercent: integer('weightage_percent').notNull(), // 1-100
  examPaper: varchar('exam_paper', { length: 20 }), // P1, P2, etc.
  lastUpdated: timestamp('last_updated').defaultNow(),
});

export const topicWeightagesRelations = relations(topicWeightages, ({}) => ({}));
```

- [ ] **Step 3: Run database migration**

```bash
bun run db:push
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema.ts
git commit -m "feat: add university_targets and topic_weightages tables"
```

---

## Chunk 2: APS-Targeted Adaptive Learning

### Task 2: Create topic weightages constants

**Files:**
- Create: `src/lib/constants/topic-weightages.ts`
- Modify: `src/actions/adaptive-learning.ts`
- Test: Unit test the weighting function

- [ ] **Step 1: Create topic weightages constants file**

```typescript
// src/lib/constants/topic-weightages.ts
export interface TopicWeightage {
  subject: string;
  topic: string;
  weightagePercent: number;
  examPaper?: string;
}

export const NSC_TOPIC_WEIGHTAGES: TopicWeightage[] = [
  // Mathematics
  { subject: 'Mathematics', topic: 'Calculus', weightagePercent: 35, examPaper: 'P1' },
  { subject: 'Mathematics', topic: 'Euclidean Geometry', weightagePercent: 25, examPaper: 'P1' },
  { subject: 'Mathematics', topic: 'Algebra', weightagePercent: 20, examPaper: 'P1' },
  { subject: 'Mathematics', topic: 'Probability', weightagePercent: 15, examPaper: 'P2' },
  { subject: 'Mathematics', topic: 'Statistics', weightagePercent: 15, examPaper: 'P2' },
  { subject: 'Mathematics', topic: 'Functions', weightagePercent: 25, examPaper: 'P1' },
  { subject: 'Mathematics', topic: 'Sequences & Series', weightagePercent: 15, examPaper: 'P2' },
  // Physical Sciences
  { subject: 'Physical Sciences', topic: 'Chemical Equilibrium', weightagePercent: 20, examPaper: 'P2' },
  { subject: 'Physical Sciences', topic: 'Electrostatics', weightagePercent: 15, examPaper: 'P1' },
  { subject: 'Physical Sciences', topic: 'Electric Circuits', weightagePercent: 15, examPaper: 'P1' },
  { subject: 'Physical Sciences', topic: 'Momentum & Impulse', weightagePercent: 15, examPaper: 'P1' },
  { subject: 'Physical Sciences', topic: 'Work, Energy & Power', weightagePercent: 15, examPaper: 'P1' },
  { subject: 'Physical Sciences', topic: 'Chemical Reactions', weightagePercent: 20, examPaper: 'P2' },
  // Life Sciences
  { subject: 'Life Sciences', topic: 'DNA & Genetics', weightagePercent: 25, examPaper: 'P2' },
  { subject: 'Life Sciences', topic: 'Evolution', weightagePercent: 20, examPaper: 'P2' },
  { subject: 'Life Sciences', topic: 'Human Reproduction', weightagePercent: 15, examPaper: 'P1' },
  { subject: 'Life Sciences', topic: 'Energy & Ecosystems', weightagePercent: 15, examPaper: 'P1' },
];

export function getWeightageForTopic(subject: string, topic: string): number {
  const found = NSC_TOPIC_WEIGHTAGES.find(
    (w) => w.subject.toLowerCase() === subject.toLowerCase() && 
           w.topic.toLowerCase() === topic.toLowerCase()
  );
  return found?.weightagePercent ?? 10; // Default 10% if not found
}

export function getSubjectsForTarget(university: string, faculty: string): string[] {
  const requirements: Record<string, Record<string, string[]>> = {
    'University of Cape Town': {
      'Engineering': ['Mathematics', 'Physical Sciences'],
      'Health Sciences': ['Mathematics', 'Physical Sciences', 'Life Sciences'],
      'Commerce': ['Mathematics', 'Accounting'],
    },
    'University of the Witwatersrand': {
      'Engineering': ['Mathematics', 'Physical Sciences'],
      'Health Sciences': ['Mathematics', 'Physical Sciences', 'Life Sciences'],
    },
    'University of Pretoria': {
      'Engineering': ['Mathematics', 'Physical Sciences'],
    },
    'Stellenbosch University': {
      'Engineering': ['Mathematics', 'Physical Sciences'],
      'Medicine': ['Mathematics', 'Physical Sciences', 'Life Sciences'],
    },
  };
  return requirements[university]?.[faculty] ?? [];
}
```

- [ ] **Step 2: Modify adaptive-learning.ts to include university target weighting**

```typescript
// Add new imports to existing file
import { NSC_TOPIC_WEIGHTAGES, getWeightageForTopic, getSubjectsForTarget } from '@/lib/constants/topic-weightages';
import { universityTargets } from '@/lib/db/schema';

// Add new function to get weighted weak topics
export async function getWeightedWeakTopics(limit = 5): Promise<WeakTopic[]> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const db = await getDb();

  // Get user's university target
  const target = await db.query.universityTargets.findFirst({
    where: (targets, { eq, and }) => 
      and(eq(targets.userId, session.user.id), eq(targets.isActive, true)),
  });

  const confidences = await db.query.topicConfidence.findMany({
    where: eq(topicConfidence.userId, session.user.id),
    orderBy: [sql`${topicConfidence.confidenceScore} ASC`],
    limit: limit * 3,
  });

  const struggles = await db.query.conceptStruggles.findMany({
    where: and(
      eq(conceptStruggles.userId, session.user.id),
      eq(conceptStruggles.isResolved, false)
    ),
  });

  const masteries = await db.query.topicMastery.findMany({
    where: eq(topicMastery.userId, session.user.id),
  });

  // Get required subjects if user has a target
  const requiredSubjects = target 
    ? getSubjectsForTarget(target.universityName, target.faculty)
    : [];

  const topicMap = new Map<string, WeakTopic>();

  for (const c of confidences) {
    const confidenceNum = Number(c.confidenceScore);
    const mastery = masteries.find(
      (m) => m.topic === c.topic && m.subjectId.toString() === c.subject
    );
    const struggle = struggles.find((s) => s.concept === c.topic);

    const struggleCount = struggle?.struggleCount || 0;
    const masteryLevel = mastery ? Number(mastery.masteryLevel) : 0;

    // Calculate base priority score
    const baseScore = (1 - confidenceNum) * 0.4 + struggleCount * 0.3 + (1 - masteryLevel) * 0.3;

    // Weight by topic importance for university target
    let targetMultiplier = 1.0;
    if (target && requiredSubjects.includes(c.subject)) {
      const weightage = getWeightageForTopic(c.subject, c.topic);
      targetMultiplier = 1 + (weightage / 100); // 1.0 to 1.35
    }

    const weightedScore = baseScore * targetMultiplier;

    let recommendedAction: 'flashcard' | 'quiz' | 'review' = 'quiz';
    if (masteryLevel > 0.7 && confidenceNum < 0.5) {
      recommendedAction = 'review';
    } else if (confidenceNum < 0.3 || struggleCount >= 2) {
      recommendedAction = 'flashcard';
    }

    topicMap.set(c.topic, {
      topic: c.topic,
      subject: c.subject,
      confidence: confidenceNum,
      struggleCount,
      masteryLevel,
      recommendedAction,
      _weightedScore: weightedScore, // Internal for sorting
      _hasTargetRelevance: target ? requiredSubjects.includes(c.subject) : false,
    });
  }

  return Array.from(topicMap.values())
    .sort((a, b) => (b._weightedScore ?? 0) - (a._weightedScore ?? 0))
    .slice(0, limit);
}

// Also add function to save university target
export async function saveUniversityTargetAction(
  universityName: string,
  faculty: string,
  targetAps: number
) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const db = await getDb();

  // Deactivate existing targets
  await db.update(universityTargets)
    .set({ isActive: false })
    .where(eq(universityTargets.userId, session.user.id));

  // Insert new target
  const [newTarget] = await db.insert(universityTargets).values({
    userId: session.user.id,
    universityName,
    faculty,
    targetAps,
    isActive: true,
  }).returning();

  return newTarget;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/constants/topic-weightages.ts src/actions/adaptive-learning.ts
git commit -m "feat: add APS-targeted adaptive learning with university weights"
```

---

## Chunk 3: Snap-to-Syllabus Knowledge Mapping

### Task 3: Create snap-to-curriculum action and integrate with SnapAndSolve

**Files:**
- Create: `src/actions/snap-to-curriculum.ts`
- Modify: `src/screens/SnapAndSolve.tsx`
- Test: Test the integration by snapping a question

- [ ] **Step 1: Create snap-to-curriculum action**

```typescript
// src/actions/snap-to-curriculum.ts
'use server';

import { and, eq } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { topicConfidence, topicMastery, conceptStruggles } from '@/lib/db/schema';

async function getDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) throw new Error('Database not available');
  return dbManager.getDb();
}

export interface SnapResult {
  topic: string;
  subject: string;
  mappedToCurriculum: boolean;
  previousStatus?: string;
  newStatus: string;
}

export async function mapSnapToCurriculum(
  identifiedTopic: string,
  identifiedSubject: string,
  userStruggled: boolean = false
): Promise<SnapResult> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const db = await getDb();

  // Check existing topic status
  const existingConfidence = await db.query.topicConfidence.findFirst({
    where: and(
      eq(topicConfidence.userId, session.user.id),
      eq(topicConfidence.topic, identifiedTopic),
      eq(topicConfidence.subject, identifiedSubject)
    ),
  });

  let previousStatus = 'not-started';
  let newStatus = 'in-progress';

  if (existingConfidence) {
    const score = Number(existingConfidence.confidenceScore);
    if (score >= 0.7) {
      previousStatus = 'mastered';
      newStatus = userStruggled ? 'in-progress' : 'mastered';
    } else if (score >= 0.4) {
      previousStatus = 'in-progress';
      newStatus = userStruggled ? 'weak' : 'in-progress';
    } else {
      previousStatus = 'weak';
      newStatus = 'weak';
    }
  }

  // Update topic confidence based on user struggle
  if (userStruggled) {
    // Decrease confidence if user struggled to follow
    const currentScore = existingConfidence ? Number(existingConfidence.confidenceScore) : 0.5;
    const newScore = Math.max(0, currentScore - 0.2);

    if (existingConfidence) {
      await db.update(topicConfidence)
        .set({ 
          confidenceScore: newScore.toFixed(2) as any,
          lastAttemptAt: new Date(),
        })
        .where(eq(topicConfidence.id, existingConfidence.id));
    } else {
      await db.insert(topicConfidence).values({
        userId: session.user.id,
        topic: identifiedTopic,
        subject: identifiedSubject,
        confidenceScore: newScore.toFixed(2) as any,
        timesAttempted: 1,
      });
    }

    // Also record a concept struggle
    const existingStruggle = await db.query.conceptStruggles.findFirst({
      where: and(
        eq(conceptStruggles.userId, session.user.id),
        eq(conceptStruggles.concept, identifiedTopic)
      ),
    });

    if (existingStruggle) {
      await db.update(conceptStruggles)
        .set({ 
          struggleCount: existingStruggle.struggleCount + 1,
          lastReportedAt: new Date(),
        })
        .where(eq(conceptStruggles.id, existingStruggle.id));
    } else {
      await db.insert(conceptStruggles).values({
        userId: session.user.id,
        concept: identifiedTopic,
        subject: identifiedSubject,
        struggleCount: 1,
        isResolved: false,
      });
    }
  }

  return {
    topic: identifiedTopic,
    subject: identifiedSubject,
    mappedToCurriculum: true,
    previousStatus,
    newStatus,
  };
}

// Helper to extract topic from AI solution response
export function extractTopicFromSolution(solutionText: string): { topic: string; subject: string } | null {
  // This would be enhanced with AI - for now, use keyword matching
  const topicPatterns: Record<string, RegExp> = {
    'Calculus': /calculus|differentiation|integration|derivative|limit/i,
    'Euclidean Geometry': /geometry|triangle|circle|angle|congruent|similar/i,
    'Algebra': /equation|simplify|factor|expand|quadratic/i,
    'Probability': /probability|outcome|event|random|combination/i,
    'Statistics': /mean|median|mode|standard deviation|variance/i,
    'Chemical Equilibrium': /equilibrium|reversible|shift|le chatelier/i,
    'Electrostatics': /charge|electric field|coulomb|potential/i,
    'Momentum': /momentum|impulse|conservation|collision/i,
  };

  for (const [topic, pattern] of Object.entries(topicPatterns)) {
    if (pattern.test(solutionText)) {
      // Determine subject based on topic
      const mathTopics = ['Calculus', 'Euclidean Geometry', 'Algebra', 'Probability', 'Statistics'];
      const subject = mathTopics.includes(topic) ? 'Mathematics' : 'Physical Sciences';
      return { topic, subject };
    }
  }

  return null;
}
```

- [ ] **Step 2: Modify SnapAndSolve to trigger curriculum mapping**

In `src/screens/SnapAndSolve.tsx`, after getting the solution:

```typescript
// Add import at top
import { mapSnapToCurriculum, extractTopicFromSolution } from '@/actions/snap-to-curriculum';

// Modify handleGenerateQuiz or add new function after solution is received
const handleSolutionReceived = async (solution: string) => {
  setSolution(solution);
  
  // Extract topic and map to curriculum
  const extracted = extractTopicFromSolution(solution);
  if (extracted) {
    try {
      await mapSnapToCurriculum(extracted.topic, extracted.subject, false);
    } catch (error) {
      console.error('Failed to map to curriculum:', error);
    }
  }
};

// Add a "I struggled to understand" button after the solution
<Button 
  variant="outline"
  onClick={async () => {
    if (extracted) {
      await mapSnapToCurriculum(extracted.topic, extracted.subject, true);
      toast.success('Topic marked as needing review');
    }
  }}
>
  I struggled to understand this
</Button>
```

- [ ] **Step 3: Commit**

```bash
git add src/actions/snap-to-curriculum.ts src/screens/SnapAndSolve.tsx
git commit -m "feat: add snap-to-syllabus knowledge mapping"
```

---

## Chunk 4: Mistake-Driven Content Discovery

### Task 4: Enhance mistake-to-study-plan to recommend content

**Files:**
- Modify: `src/actions/mistake-to-study-plan.ts`, `src/actions/content-discovery.ts`
- Test: Create a mistake and verify content is recommended

- [ ] **Step 1: Add content recommendation to mistake-to-study-plan**

```typescript
// Add to src/actions/mistake-to-study-plan.ts

import { getSimilarPastPapers, getRecommendedLessons } from './content-discovery';

export interface MistakeWithContent {
  topic: string;
  subject: string;
  questionId: string;
  recommendedPastPaper?: {
    id: string;
    title: string;
    difficulty: string;
  };
  recommendedLesson?: {
    id: string;
    title: string;
    topic: string;
  };
}

export async function getMistakeContentRecommendations(
  mistakes: Array<{ topic: string; subject: string; questionId: string }>
): Promise<MistakeWithContent[]> {
  const results: MistakeWithContent[] = [];

  for (const mistake of mistakes) {
    // Get easier past paper questions for practice
    const similarPapers = await getSimilarPastPapers(mistake.subject, mistake.topic, 'easy');
    const easierPaper = similarPapers.find(p => p.difficulty === 'easy');

    // Get recommended lessons
    const lessons = await getRecommendedLessons(mistake.topic, mistake.subject);

    results.push({
      ...mistake,
      recommendedPastPaper: easierPaper ? {
        id: easierPaper.id,
        title: `${easierPaper.subject} - ${easierPaper.paper}`,
        difficulty: 'easy',
      } : undefined,
      recommendedLesson: lessons[0] ? {
        id: lessons[0].id,
        title: lessons[0].title,
        topic: lessons[0].topic,
      } : undefined,
    });
  }

  return results;
}
```

- [ ] **Step 2: Add helper functions to content-discovery.ts**

```typescript
// Add to src/actions/content-discovery.ts

export async function getSimilarPastPapers(
  subject: string,
  topic: string,
  difficulty?: string
): Promise<Array<{ id: string; subject: string; paper: string; topic: string; difficulty: string }>> {
  const db = await getDb();

  const conditions = [eq(pastPapers.isExtracted, true)];
  
  if (subject) {
    conditions.push(sql`LOWER(${pastPapers.subject}) LIKE ${`%${subject.toLowerCase()}%`}`);
  }

  const papers = await db.query.pastPapers.findMany({
    where: and(...conditions),
    limit: 20,
  });

  // Filter by topic relevance and return
  return papers
    .filter(p => p.extractedQuestions?.toLowerCase().includes(topic.toLowerCase()))
    .map(p => ({
      id: p.id,
      subject: p.subject,
      paper: p.paper,
      topic,
      difficulty: 'medium', // Would need to enhance extraction to get actual difficulty
    }))
    .slice(0, 5);
}

export async function getRecommendedLessons(
  topic: string,
  subject: string
): Promise<Array<{ id: string; title: string; topic: string; subject: string }>> {
  // This would connect to a lessons table - returning mock for now
  // In production, this would query a lessons table
  return [
    {
      id: `lesson-${topic.toLowerCase().replace(/\s+/g, '-')}`,
      title: `Understanding ${topic}`,
      topic,
      subject,
    },
  ];
}
```

- [ ] **Step 3: Modify addMistakeToStudyPlanAction to include recommendations**

```typescript
// Update the existing function to return content recommendations
export async function addMistakeToStudyPlanAction(
  mistakes: Array<{ topic: string; questionId: string; subject: string }>
): Promise<{ success: boolean; eventsAdded: number; recommendations: MistakeWithContent[] }> {
  // ... existing code ...
  
  const recommendations = await getMistakeContentRecommendations(mistakes);
  
  return { success: true, eventsAdded, recommendations };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/actions/mistake-to-study-plan.ts src/actions/content-discovery.ts
git commit -m "feat: enhance mistake handling with content recommendations"
```

---

## Chunk 5: Proactive AI Tutor (Nudge System)

### Task 5: Create nudge system and dashboard component

**Files:**
- Create: `src/actions/nudge-system.ts`, `src/components/Dashboard/AITutorNudge.tsx`
- Modify: `src/screens/Dashboard.tsx`
- Test: Verify nudge appears when conceptual struggle detected

- [ ] **Step 1: Create nudge system action**

```typescript
// src/actions/nudge-system.ts
'use server';

import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { conceptStruggles, topicConfidence, topicMastery } from '@/lib/db/schema';

async function getDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) throw new Error('Database not available');
  return dbManager.getDb();
}

export interface Nudge {
  id: string;
  type: 'concept_struggle' | 'weak_topic' | 'streak_warning' | 'achievement_progress';
  title: string;
  message: string;
  priority: number;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: Date;
}

export async function checkForNudges(): Promise<Nudge[]> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) return [];

  const db = await getDb();
  const nudges: Nudge[] = [];

  // Check for unresolved concept struggles
  const struggles = await db.query.conceptStruggles.findMany({
    where: and(
      eq(conceptStruggles.userId, session.user.id),
      eq(conceptStruggles.isResolved, false)
    ),
    orderBy: [desc(conceptStruggles.struggleCount)],
    limit: 3,
  });

  if (struggles.length > 0) {
    const topStruggle = struggles[0];
    nudges.push({
      id: `struggle-${topStruggle.id}`,
      type: 'concept_struggle',
      title: 'Concept Struggle Detected',
      message: `You've been struggling with "${topStruggle.concept}". Let's work through it together.`,
      priority: 100 - (topStruggle.struggleCount * 10),
      actionUrl: `/ai-tutor?topic=${encodeURIComponent(topStruggle.concept)}`,
      actionLabel: 'Get Help Now',
      createdAt: topStruggle.lastReportedAt || new Date(),
    });
  }

  // Check for weak topics (low confidence)
  const weakTopics = await db.query.topicConfidence.findMany({
    where: and(
      eq(topicConfidence.userId, session.user.id),
      sql`${topicConfidence.confidenceScore} < 0.3`
    ),
    limit: 5,
  });

  if (weakTopics.length > 2) {
    nudges.push({
      id: 'weak-topics',
      type: 'weak_topic',
      title: 'Focus Area Identified',
      message: `You have ${weakTopics.length} topics that need attention. Let's prioritize.`,
      priority: 60,
      actionUrl: '/curriculum-map',
      actionLabel: 'View Progress',
      createdAt: new Date(),
    });
  }

  // Check for topics that were previously mastered but regressed
  const masteries = await db.query.topicMastery.findMany({
    where: and(
      eq(topicMastery.userId, session.user.id),
      sql`${topicMastery.masteryLevel} < 0.5`
    ),
    limit: 5,
  });

  for (const mastery of masteries) {
    const confidence = weakTopics.find(c => c.topic === mastery.topic);
    if (confidence && Number(confidence.confidenceScore) > Number(mastery.masteryLevel)) {
      nudges.push({
        id: `regression-${mastery.id}`,
        type: 'weak_topic',
        title: 'Topic Regression Detected',
        message: `Your confidence in "${mastery.topic}" has dropped. Time for a refresher?`,
        priority: 50,
        actionUrl: `/flashcards?topic=${encodeURIComponent(mastery.topic)}`,
        actionLabel: 'Review Flashcards',
        createdAt: new Date(),
      });
      break; // Only one regression nudge at a time
    }
  }

  return nudges.sort((a, b) => b.priority - a.priority).slice(0, 3);
}

export async function dismissNudge(nudgeId: string) {
  // In production, would mark nudge as dismissed in DB
  console.log('Nudge dismissed:', nudgeId);
  return { success: true };
}
```

- [ ] **Step 2: Create AITutorNudge component**

```typescript
// src/components/Dashboard/AITutorNudge.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { checkForNudges, dismissNudge, type Nudge } from '@/actions/nudge-system';

interface AITutorNudgeProps {
  userId: string;
}

export function AITutorNudge({ userId }: AITutorNudgeProps) {
  const router = useRouter();
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNudge() {
      try {
        const nudges = await checkForNudges();
        if (nudges.length > 0) {
          setNudge(nudges[0]);
        }
      } catch (error) {
        console.error('Failed to load nudge:', error);
      } finally {
        setLoading(false);
      }
    }
    loadNudge();
  }, [userId]);

  if (loading || !nudge) return null;

  return (
    <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <HugeiconsIcon icon={SparklesIcon} className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-base">{nudge.title}</h3>
          <p className="text-sm text-white/80 mt-1">{nudge.message}</p>
          <div className="flex gap-2 mt-3">
            {nudge.actionUrl && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  dismissNudge(nudge.id);
                  router.push(nudge.actionUrl!);
                }}
              >
                {nudge.actionLabel}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => {
                dismissNudge(nudge.id);
                setNudge(null);
              }}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: Add to Dashboard**

In `src/screens/Dashboard.tsx`, add the nudge component near the top:

```typescript
import { AITutorNudge } from '@/components/Dashboard/AITutorNudge';

// In the Dashboard component render:
{/* Proactive AI Tutor Nudge */}
{AITutorNudge && session?.user && (
  <div className="mb-4">
    <AITutorNudge userId={session.user.id} />
  </div>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/actions/nudge-system.ts src/components/Dashboard/AITutorNudge.tsx src/screens/Dashboard.tsx
git commit -m "feat: add proactive AI tutor nudge system"
```

---

## Chunk 6: Gamified APS Level Up

### Task 6: Add APS progress to leaderboard and achievements

**Files:**
- Create: `src/components/Gamification/APSProgressCard.tsx`
- Modify: `src/actions/gamification.ts`, `src/lib/db/leaderboard-actions.ts`
- Test: Verify APS points show in leaderboard

- [ ] **Step 1: Create APS progress card component**

```typescript
// src/components/Gamification/APSProgressCard.tsx
'use client';

import { TrendingUp, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface APSProgressCardProps {
  currentAps: number;
  targetAps: number;
  pointsThisMonth: number;
  universityTarget?: string;
}

export function APSProgressCard({
  currentAps,
  targetAps,
  pointsThisMonth,
  universityTarget,
}: APSProgressCardProps) {
  const progressPercent = Math.min((currentAps / targetAps) * 100, 100);
  const pointsToGoal = targetAps - currentAps;

  return (
    <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="w-5 h-5" />
          APS Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main APS display */}
          <div className="text-center">
            <div className="text-4xl font-bold">{currentAps}</div>
            <div className="text-sm text-white/70">
              of {targetAps} target {universityTarget && `(${universityTarget})`}
            </div>
          </div>

          {/* Progress bar */}
          <Progress value={progressPercent} className="h-3 bg-white/20" />
          
          <div className="flex justify-between text-sm">
            <span>{progressPercent.toFixed(0)}%</span>
            <span>{pointsToGoal} points to go</span>
          </div>

          {/* Monthly points earned */}
          <div className="pt-3 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-300" />
                <span className="text-sm">This Month</span>
              </div>
              <span className="font-bold text-lg">+{pointsThisMonth}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Add APS tracking to gamification actions**

In `src/actions/gamification.ts`, add APS-related functions:

```typescript
// Track APS points earned from quiz performance
export async function addApsPoints(
  userId: string,
  points: number,
  source: 'quiz' | 'perfect_score' | 'streak' | 'achievement'
) {
  const db = await getDb();
  
  // This would update an aps_points table (new table needed)
  // For now, just return success
  return { success: true, pointsAdded: points };
}

export async function getMonthlyApsPoints(userId: string): Promise<number> {
  // Query monthly APS points
  const db = await getDb();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Would query aps_points table for this month
  return 0; // Placeholder
}
```

- [ ] **Step 3: Integrate into Dashboard**

In `src/screens/Dashboard.tsx`:

```typescript
import { APSProgressCard } from '@/components/Gamification/APSProgressCard';

// Add to dashboard near UniversityGoalCard
<APSProgressCard 
  currentAps={currentAps} 
  targetAps={targetAps} 
  pointsThisMonth={monthlyPoints}
  universityTarget={universityTarget}
/>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Gamification/APSProgressCard.tsx src/actions/gamification.ts src/screens/Dashboard.tsx
git commit -m "feat: add gamified APS progress tracking"
```

---

## Chunk 7: High-Weightage Topic Badges

### Task 7: Add topic weightage badges to CurriculumMap

**Files:**
- Create: `src/components/Curriculum/TopicBadge.tsx`
- Modify: `src/screens/CurriculumMap.tsx`
- Test: Verify badges appear on high-weightage topics

- [ ] **Step 1: Create TopicBadge component**

```typescript
// src/components/Curriculum/TopicBadge.tsx
'use client';

import { Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TopicBadgeProps {
  weightage: number;
  examPaper?: string;
}

export function TopicBadge({ weightage, examPaper }: TopicBadgeProps) {
  const isHighWeight = weightage >= 20;
  const isMediumWeight = weightage >= 15 && weightage < 20;

  if (weightage < 15) return null;

  return (
    <div className="flex items-center gap-1">
      {isHighWeight && (
        <Badge variant="secondary" className="bg-red-100 text-red-700 gap-1">
          <Flame className="w-3 h-3" />
          {weightage}%
        </Badge>
      )}
      {isMediumWeight && !isHighWeight && (
        <Badge variant="outline" className="gap-1">
          {weightage}%
        </Badge>
      )}
      {examPaper && (
        <Badge variant="outline" className="text-xs">
          {examPaper}
        </Badge>
      )}
    </div>
  );
}

export function getTopicWeightageBadge(topic: string, subject: string) {
  const weightages: Record<string, Record<string, { weightage: number; examPaper?: string }>> = {
    'Mathematics': {
      'Calculus': { weightage: 35, examPaper: 'P1' },
      'Euclidean Geometry': { weightage: 25, examPaper: 'P1' },
      'Functions': { weightage: 25, examPaper: 'P1' },
      'Algebra': { weightage: 20, examPaper: 'P1' },
      'Probability': { weightage: 15, examPaper: 'P2' },
      'Statistics': { weightage: 15, examPaper: 'P2' },
    },
    'Physical Sciences': {
      'Chemical Equilibrium': { weightage: 20, examPaper: 'P2' },
      'Electrostatics': { weightage: 15, examPaper: 'P1' },
      'Electric Circuits': { weightage: 15, examPaper: 'P1' },
      'Momentum & Impulse': { weightage: 15, examPaper: 'P1' },
      'Work, Energy & Power': { weightage: 15, examPaper: 'P1' },
    },
  };

  return weightages[subject]?.[topic] ?? null;
}
```

- [ ] **Step 2: Add to CurriculumMap**

In `src/screens/CurriculumMap.tsx`, add badges to topic display:

```typescript
import { TopicBadge, getTopicWeightageBadge } from '@/components/Curriculum/TopicBadge';

// In the topic card render, add:
const weightageInfo = getTopicWeightageBadge(topic.name, subject.name);
{weightageInfo && (
  <TopicBadge weightage={weightageInfo.weightage} examPaper={weightageInfo.examPaper} />
)}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Curriculum/TopicBadge.tsx src/screens/CurriculumMap.tsx
git commit -m "feat: add high-weightage topic badges to curriculum map"
```

---

## Chunk 8: Interactive Periodic Table & Physics Integration

### Task 8: Create periodic table and integrate with AI Tutor

**Files:**
- Create: `src/screens/PeriodicTable.tsx`, `src/app/periodic-table/page.tsx`
- Modify: `src/screens/PhysicalSciences.tsx`, `src/app/ai-tutor/page.tsx`
- Test: Verify elements can be referenced in AI tutor

- [ ] **Step 1: Create PeriodicTable screen**

```typescript
// src/screens/PeriodicTable.tsx - simplified version
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface Element {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: number;
  category: string;
}

const ELEMENTS: Element[] = [
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, atomicMass: 1.008, category: 'nonmetal' },
  { symbol: 'He', name: 'Helium', atomicNumber: 2, atomicMass: 4.003, category: 'noble-gas' },
  { symbol: 'Li', name: 'Lithium', atomicNumber: 3, atomicMass: 6.941, category: 'alkali-metal' },
  // ... full periodic table would have all 118 elements
  // For brevity, showing key ones for SA curriculum
];

export function PeriodicTableScreen() {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Interactive Periodic Table</h1>
      
      <div className="grid grid-cols-[repeat(18,minmax(40px,1fr))] gap-1 overflow-x-auto">
        {ELEMENTS.map((element) => (
          <button
            key={element.symbol}
            onClick={() => setSelectedElement(element)}
            className={`p-2 text-center rounded ${
              element.category === 'nonmetal' ? 'bg-green-100' :
              element.category === 'noble-gas' ? 'bg-purple-100' :
              element.category === 'alkali-metal' ? 'bg-red-100' :
              'bg-gray-100'
            } hover:ring-2 ring-blue-500`}
          >
            <div className="text-xs text-gray-500">{element.atomicNumber}</div>
            <div className="font-bold">{element.symbol}</div>
          </button>
        ))}
      </div>

      {selectedElement && (
        <Card className="p-4">
          <h2 className="text-xl font-bold">{selectedElement.name}</h2>
          <p>Atomic Number: {selectedElement.atomicNumber}</p>
          <p>Atomic Mass: {selectedElement.atomicMass}</p>
          <p>Category: {selectedElement.category}</p>
          <button
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => {
              // Copy to clipboard or add to AI tutor context
              navigator.clipboard.writeText(selectedElement.symbol);
            }}
          >
            Copy Symbol
          </button>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create page route**

```typescript
// src/app/periodic-table/page.tsx
import { PeriodicTableScreen } from '@/screens/PeriodicTable';

export default function PeriodicTablePage() {
  return <PeriodicTableScreen />;
}
```

- [ ] **Step 3: Add element constants for AI Tutor**

Create `src/lib/constants/physical-constants.ts`:

```typescript
// Physical constants commonly needed for NSC Physical Sciences
export const PHYSICAL_CONSTANTS = {
  speedOfLight: { value: 3e8, unit: 'm/s', symbol: 'c' },
  gravitationalAcceleration: { value: 9.8, unit: 'm/s²', symbol: 'g' },
  plankConstant: { value: 6.626e-34, unit: 'J·s', symbol: 'h' },
  elementaryCharge: { value: 1.602e-19, unit: 'C', symbol: 'e' },
  avogadroConstant: { value: 6.022e23, unit: 'mol⁻¹', symbol: 'NA' },
  universalGasConstant: { value: 8.314, unit: 'J/(mol·K)', symbol: 'R' },
};

export const COMMON_ELEMENTS = {
  H: { name: 'Hydrogen', atomicMass: 1.008 },
  O: { name: 'Oxygen', atomicMass: 15.999 },
  C: { name: 'Carbon', atomicMass: 12.011 },
  N: { name: 'Nitrogen', atomicMass: 14.007 },
  Fe: { name: 'Iron', atomicMass: 55.845 },
  Na: { name: 'Sodium', atomicMass: 22.990 },
  Cl: { name: 'Chlorine', atomicMass: 35.453 },
  K: { name: 'Potassium', atomicMass: 39.098 },
  Ca: { name: 'Calcium', atomicMass: 40.078 },
  Mg: { name: 'Magnesium', atomicMass: 24.305 },
};

export function formatConstant(name: string): string {
  const constant = PHYSICAL_CONSTANTS[name as keyof typeof PHYSICAL_CONSTANTS];
  if (!constant) return name;
  return `${constant.symbol} = ${constant.value} ${constant.unit}`;
}
```

- [ ] **Step 4: Add to Physical Sciences screen**

Add a button in `src/screens/PhysicalSciences.tsx` to open periodic table:

```typescript
// Add navigation to periodic table
<Button onClick={() => router.push('/periodic-table')}>
  Open Periodic Table
</Button>
```

- [ ] **Step 5: Integrate constants into AI Tutor**

Modify AI tutor to include physical constants context:

```typescript
// In AI tutor system prompt or context
const PHYSICS_CONTEXT = `
Useful Physical Constants (South African NSC):
- Speed of light (c) = 3 × 10⁸ m/s
- Gravitational acceleration (g) = 9.8 m/s²
- Elementary charge (e) = 1.602 × 10⁻¹⁹ C
- Avogadro constant (NA) = 6.022 × 10²³ mol⁻¹

Common Elements:
- Hydrogen (H): 1.008 u
- Oxygen (O): 15.999 u
- Carbon (C): 12.011 u
- Iron (Fe): 55.845 u
`;
```

- [ ] **Step 6: Commit**

```bash
git add src/screens/PeriodicTable.tsx src/app/periodic-table/page.tsx
git add src/lib/constants/physical-constants.ts
git add src/screens/PhysicalSciences.tsx
git commit -m "feat: add interactive periodic table with physics integration"
```

---

## Summary

This implementation plan adds 8 major feature areas:

1. **APS-Targeted Adaptive Learning** - Weights recommendations by university target requirements
2. **Snap-to-Syllabus Knowledge Mapping** - Auto-maps solved problems to curriculum
3. **Mistake-Driven Content Discovery** - Recommends past papers and lessons after mistakes
4. **Proactive AI Tutor Nudge** - Shows contextual help on dashboard
5. **Gamified APS Progress** - Tracks monthly APS points
6. **High-Weightage Badges** - Visual markers for important NSC topics
7. **Interactive Periodic Table** - Standalone tool with physics integration
8. **Physical Constants Integration** - Quick reference in AI Tutor

Total estimated files: 15 new/modified files
Estimated implementation time: 4-6 hours
