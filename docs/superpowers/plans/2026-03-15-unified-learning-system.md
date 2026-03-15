# Unified Learning System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 6 integrated subsystems that connect all data sources for a unified adaptive learning experience: Adaptive Learning, Smart Study Planning, Social Learning, Gamification, B2B Schools, and Content Discovery.

**Architecture:** Build modular service actions in `src/actions/` that orchestrate database operations across existing schema tables. Create unified APIs that combine multiple data sources for intelligent recommendations and cross-system insights.

**Tech Stack:** Next.js 16, Server Actions, Drizzle ORM, PostgreSQL, TypeScript

---

## Architecture Overview

### File Organization

```
src/
├── actions/                    # Server actions (new)
│   ├── adaptive-learning.ts   # Adaptive learning system
│   ├── study-planning.ts      # Study planning & calendar
│   ├── social-learning.ts     # Study buddies & groups
│   ├── gamification.ts        # Achievements & streaks
│   ├── school-sync.ts         # B2B school integration
│   └── content-discovery.ts   # Search & recommendations
├── services/                   # Existing services
│   ├── spacedRepetition.ts    # SM-2 algorithm
│   └── buddyActions.ts        # Study buddy logic
├── lib/db/
│   ├── actions/              # DB action wrappers
│   │   ├── flashcard-actions.ts
│   │   ├── study-plan-actions.ts
│   │   └── ...
│   └── schema.ts             # Existing schema
└── screens/                  # Existing screens
```

### Data Flow

1. **Quiz Completion** → Triggers: recordQuestionAttempt + updateConfidence + checkAchievements
2. **Flashcard Review** → Triggers: updateMastery + streakUpdate + achievementCheck
3. **Study Plan Created** → Triggers: autoGenerateCalendarEvents + notifyTopicsDue
4. **Buddy Match Found** → Triggers: createGroupChat + shareProgress + competeLeaderboard

---

## Chunk 1: Adaptive Learning System

### Task 1.1: Create Adaptive Learning Actions

**Files:**
- Create: `src/actions/adaptive-learning.ts`
- Modify: `src/services/spacedRepetition.ts`

- [ ] **Step 1: Create adaptive-learning.ts server action**

```typescript
'use server';

import { and, eq, gte, desc, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { 
  questionAttempts, 
  topicMastery, 
  topicConfidence, 
  conceptStruggles,
  flashcards,
  flashcardDecks 
} from '@/lib/db/schema';
import { calculateNextReview } from '@/services/spacedRepetition';

async function getDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) throw new Error('Database not available');
  return dbManager.getDb();
}

export interface WeakTopic {
  topic: string;
  subject: string;
  confidence: number;
  struggleCount: number;
  masteryLevel: number;
  recommendedAction: 'flashcard' | 'quiz' | 'review';
}

export interface AdaptiveRecommendation {
  type: 'flashcard' | 'quiz' | 'pastPaper' | 'lesson';
  topic: string;
  subject: string;
  priority: number;
  reason: string;
  resourceId?: string;
}

export async function getWeakTopics(limit = 5): Promise<WeakTopic[]> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const confidences = await db.query.topicConfidence.findMany({
    where: eq(topicConfidence.userId, session.user.id),
    orderBy: [sql`${topicConfidence.confidenceScore} ASC`],
    limit: limit * 2,
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
  
  const topicMap = new Map<string, WeakTopic>();
  
  for (const c of confidences) {
    const confidenceNum = Number(c.confidenceScore);
    const mastery = masteries.find(m => m.topic === c.topic && m.subject === c.subject);
    const struggle = struggles.find(s => s.concept === c.topic);
    
    const struggleCount = struggle?.struggleCount || 0;
    const masteryLevel = mastery ? Number(mastery.masteryLevel) : 0;
    
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
    });
  }
  
  return Array.from(topicMap.values())
    .sort((a, b) => {
      const aScore = (1 - a.confidence) * 0.4 + a.struggleCount * 0.3 + (1 - a.masteryLevel) * 0.3;
      const bScore = (1 - b.confidence) * 0.4 + b.struggleCount * 0.3 + (1 - b.masteryLevel) * 0.3;
      return bScore - aScore;
    })
    .slice(0, limit);
}

export async function getAdaptiveRecommendations(limit = 10): Promise<AdaptiveRecommendation[]> {
  const weakTopics = await getWeakTopics(10);
  const recommendations: AdaptiveRecommendation[] = [];
  
  for (const topic of weakTopics) {
    if (topic.recommendedAction === 'flashcard') {
      const db = await getDb();
      const auth = await getAuth();
      const session = await auth.api.getSession();
      
      const decks = await db.query.flashcardDecks.findMany({
        where: eq(flashcardDecks.userId, session.user.id),
      });
      
      for (const deck of decks) {
        recommendations.push({
          type: 'flashcard',
          topic: topic.topic,
          subject: topic.subject,
          priority: 100 - topic.confidence * 100,
          reason: `Review flashcards for ${topic.topic} - confidence: ${(topic.confidence * 100).toFixed(0)}%`,
          resourceId: deck.id,
        });
      }
    } else {
      recommendations.push({
        type: topic.recommendedAction === 'review' ? 'lesson' : 'quiz',
        topic: topic.topic,
        subject: topic.subject,
        priority: 100 - topic.confidence * 100,
        reason: `${topic.recommendedAction === 'review' ? 'Review' : 'Practice'} ${topic.topic} - struggles: ${topic.struggleCount}`,
      });
    }
  }
  
  return recommendations.slice(0, limit);
}

export async function generateFlashcardsFromWeakTopics(userId: string, topics: string[]) {
  const db = await getDb();
  
  const existingDecks = await db.query.flashcardDecks.findMany({
    where: eq(flashcardDecks.userId, userId),
  });
  
  let adaptiveDeck = existingDecks.find(d => d.name === 'Adaptive Review');
  
  if (!adaptiveDeck) {
    const [created] = await db.insert(flashcardDecks).values({
      userId,
      name: 'Adaptive Review',
      description: 'Auto-generated flashcards from weak topics',
      cardCount: 0,
    }).returning();
    adaptiveDeck = created;
  }
  
  const confidences = await db.query.topicConfidence.findMany({
    where: sql`${topicConfidence.userId} = ${userId} AND ${topicConfidence.topic} IN ${topics}`,
  });
  
  return {
    deck: adaptiveDeck,
    topicsGenerated: confidences.length,
  };
}

export async function syncMasteryToConfidence(userId: string) {
  const db = await getDb();
  
  const masteries = await db.query.topicMastery.findMany({
    where: eq(topicMastery.userId, userId),
  });
  
  for (const mastery of masteries) {
    const accuracy = mastery.questionsCorrect / mastery.questionsAttempted || 0;
    
    await db
      .insert(topicConfidence)
      .values({
        userId,
        topic: mastery.topic,
        subject: mastery.subjectId.toString(),
        confidenceScore: accuracy.toFixed(2),
        timesCorrect: mastery.questionsCorrect,
        timesAttempted: mastery.questionsAttempted,
      })
      .onConflictDoUpdate({
        target: [topicConfidence.userId, topicConfidence.topic, topicConfidence.subject],
        set: {
          confidenceScore: accuracy.toFixed(2),
          timesCorrect: mastery.questionsCorrect,
          timesAttempted: mastery.questionsAttempted,
          lastAttemptAt: mastery.lastPracticed,
          updatedAt: new Date(),
        },
      });
  }
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `bun run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/actions/adaptive-learning.ts
git commit -m "feat: add adaptive learning system actions"
```

---

### Task 1.2: Create Flashcard Study Session Actions

**Files:**
- Create: `src/actions/flashcard-study.ts`
- Modify: `src/lib/db/schema.ts`

- [ ] **Step 1: Create flashcard-study.ts**

```typescript
'use server';

import { and, eq, gte, lte, desc } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { flashcards, flashcardDecks, flashcardReviews, topicMastery } from '@/lib/db/schema';

async function getDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) throw new Error('Database not available');
  return dbManager.getDb();
}

export interface FlashcardDue {
  id: string;
  deckId: string;
  front: string;
  back: string;
  difficulty: string;
  easeFactor: number;
  intervalDays: number;
  nextReview: Date | null;
}

export async function getFlashcardsDueForReview(limit = 20): Promise<FlashcardDue[]> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  const now = new Date();
  
  const dueCards = await db.query.flashcards.findMany({
    where: and(
      eq(flashcards.deckId, 
        db.query.flashcardDecks.findMany({
          where: eq(flashcardDecks.userId, session.user.id),
        }).then(decks => decks[0]?.id)
      ),
      or(
        lte(flashcards.nextReview, now),
        eq(flashcards.nextReview, null)
      )
    ),
    orderBy: [desc(flashcards.nextReview)],
    limit,
  });
  
  return dueCards.map(card => ({
    id: card.id,
    deckId: card.deckId,
    front: card.front,
    back: card.back,
    difficulty: card.difficulty,
    easeFactor: Number(card.easeFactor),
    intervalDays: card.intervalDays,
    nextReview: card.nextReview,
  }));
}

export async function reviewFlashcard(
  cardId: string, 
  rating: 1 | 2 | 3 | 4 | 5
): Promise<{ intervalDays: number; easeFactor: number; nextReview: Date }> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const card = await db.query.flashcards.findFirst({
    where: eq(flashcards.id, cardId),
  });
  
  if (!card) throw new Error('Card not found');
  
  const currentEase = Number(card.easeFactor);
  const currentInterval = card.intervalDays;
  
  let newEase = currentEase;
  let newInterval = currentInterval;
  
  if (rating >= 4) {
    newEase = Math.min(currentEase + 0.1, 3.0);
    newInterval = Math.round(currentInterval * newEase);
  } else if (rating >= 3) {
    newInterval = Math.max(1, Math.round(currentInterval * 0.5));
  } else {
    newInterval = 1;
    newEase = Math.max(1.3, currentEase - 0.2);
  }
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  
  await db.update(flashcards).set({
    easeFactor: newEase.toFixed(2),
    intervalDays: newInterval,
    nextReview,
    lastReview: new Date(),
    repetitions: card.repetitions + 1,
    timesReviewed: card.timesReviewed + 1,
    timesCorrect: rating >= 3 ? card.timesCorrect + 1 : card.timesCorrect,
  }).where(eq(flashcards.id, cardId));
  
  await db.insert(flashcardReviews).values({
    userId: session.user.id,
    flashcardId: cardId,
    rating,
    intervalBefore: currentInterval,
    intervalAfter: newInterval,
    easeFactorBefore: currentEase.toFixed(2),
    easeFactorAfter: newEase.toFixed(2),
  });
  
  return { intervalDays: newInterval, easeFactor: newEase, nextReview };
}

export async function createAdaptiveFlashcardDeck() {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const existing = await db.query.flashcardDecks.findFirst({
    where: and(
      eq(flashcardDecks.userId, session.user.id),
      eq(flashcardDecks.name, 'Adaptive Review')
    ),
  });
  
  if (existing) return existing;
  
  const [deck] = await db.insert(flashcardDecks).values({
    userId: session.user.id,
    name: 'Adaptive Review',
    description: 'Auto-generated from your weak topics',
    cardCount: 0,
  }).returning();
  
  return deck;
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `bun run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/actions/flashcard-study.ts
git commit -m "feat: add flashcard study session actions"
```

---

## Chunk 2: Smart Study Planning

### Task 2.1: Create Study Planning Actions

**Files:**
- Create: `src/actions/study-planning.ts`

- [ ] **Step 1: Create study-planning.ts**

```typescript
'use server';

import { and, eq, gte, desc, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { studyPlans, calendarEvents, studySessions, topicMastery, questionAttempts } from '@/lib/db/schema';

async function getDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) throw new Error('Database not available');
  return dbManager.getDb();
}

export interface StudyPlanWithEvents {
  plan: typeof studyPlans.$inferSelect;
  events: typeof calendarEvents.$inferSelect[];
  progress: {
    totalTopics: number;
    completedTopics: number;
    masteryPercentage: number;
  };
}

export async function getStudyPlanWithEvents(planId: string): Promise<StudyPlanWithEvents | null> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const plan = await db.query.studyPlans.findFirst({
    where: and(eq(studyPlans.id, planId), eq(studyPlans.userId, session.user.id)),
  });
  
  if (!plan) return null;
  
  const events = await db.query.calendarEvents.findMany({
    where: and(
      eq(calendarEvents.studyPlanId, planId),
      eq(calendarEvents.userId, session.user.id)
    ),
    orderBy: [desc(calendarEvents.startTime)],
  });
  
  const focusAreas = plan.focusAreas ? JSON.parse(plan.focusAreas) : [];
  const topics = Array.isArray(focusAreas) ? focusAreas : [];
  
  let completedTopics = 0;
  let totalMastery = 0;
  
  for (const topic of topics) {
    const mastery = await db.query.topicMastery.findFirst({
      where: and(
        eq(topicMastery.userId, session.user.id),
        eq(topicMastery.topic, topic)
      ),
    });
    
    if (mastery && Number(mastery.masteryLevel) >= 0.8) {
      completedTopics++;
    }
    totalMastery += mastery ? Number(mastery.masteryLevel) : 0;
  }
  
  return {
    plan,
    events,
    progress: {
      totalTopics: topics.length,
      completedTopics,
      masteryPercentage: topics.length > 0 ? (totalMastery / topics.length) * 100 : 0,
    },
  };
}

export async function generateCalendarEventsFromPlan(planId: string) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const plan = await db.query.studyPlans.findFirst({
    where: and(eq(studyPlans.id, planId), eq(studyPlans.userId, session.user.id)),
  });
  
  if (!plan || !plan.targetExamDate) return [];
  
  const focusAreas = plan.focusAreas ? JSON.parse(plan.focusAreas) : [];
  if (!Array.isArray(focusAreas) || focusAreas.length === 0) return [];
  
  const examDate = new Date(plan.targetExamDate);
  const now = new Date();
  const daysUntilExam = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const studyDaysPerWeek = 6;
  const totalStudySessions = Math.floor((daysUntilExam / 7) * studyDaysPerWeek);
  const sessionsPerTopic = Math.floor(totalStudySessions / focusAreas.length);
  
  const events: typeof calendarEvents.$inferInsert[] = [];
  
  for (let i = 0; i < focusAreas.length; i++) {
    const topic = focusAreas[i];
    
    for (let j = 0; j < sessionsPerTopic; j++) {
      const sessionDate = new Date(now);
      sessionDate.setDate(sessionDate.getDate() + Math.floor((i * sessionsPerTopic + j) * (daysUntilExam / totalStudySessions)));
      sessionDate.setHours(16 + (j % 3), 0, 0, 0);
      
      const endTime = new Date(sessionDate);
      endTime.setHours(endTime.getHours() + 1);
      
      events.push({
        userId: session.user.id,
        title: `Study: ${topic}`,
        description: `Focus session for ${topic}`,
        eventType: 'study',
        startTime: sessionDate,
        endTime,
        isAllDay: false,
        studyPlanId: planId,
        isCompleted: false,
      });
    }
  }
  
  if (events.length > 0) {
    await db.insert(calendarEvents).values(events);
  }
  
  return events;
}

export async function trackStudySession(
  subjectId: number,
  topic: string,
  durationMinutes: number,
  questionsAttempted: number,
  correctAnswers: number
) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const [studySession] = await db.insert(studySessions).values({
    userId: session.user.id,
    subjectId,
    sessionType: 'practice',
    topic,
    durationMinutes,
    questionsAttempted,
    correctAnswers,
    marksEarned: correctAnswers * 2,
    completedAt: new Date(),
  }).returning();
  
  const mastery = await db.query.topicMastery.findFirst({
    where: and(
      eq(topicMastery.userId, session.user.id),
      eq(topicMastery.subjectId, subjectId),
      eq(topicMastery.topic, topic)
    ),
  });
  
  const totalAttempted = (mastery?.questionsAttempted || 0) + questionsAttempted;
  const totalCorrect = (mastery?.questionsCorrect || 0) + correctAnswers;
  const accuracy = totalAttempted > 0 ? totalCorrect / totalAttempted : 0;
  
  if (mastery) {
    await db.update(topicMastery).set({
      questionsAttempted: totalAttempted,
      questionsCorrect: totalCorrect,
      masteryLevel: accuracy.toFixed(2),
      lastPracticed: new Date(),
      consecutiveCorrect: accuracy >= 0.8 ? (mastery.consecutiveCorrect || 0) + 1 : 0,
      updatedAt: new Date(),
    }).where(eq(topicMastery.id, mastery.id));
  } else {
    await db.insert(topicMastery).values({
      userId: session.user.id,
      subjectId,
      topic,
      questionsAttempted: totalAttempted,
      questionsCorrect: totalCorrect,
      masteryLevel: accuracy.toFixed(2),
      lastPracticed: new Date(),
    });
  }
  
  return studySession;
}

export async function getStudyStats() {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const recentSessions = await db.query.studySessions.findMany({
    where: eq(studySessions.userId, session.user.id),
    orderBy: [desc(studySessions.startedAt)],
    limit: 30,
  });
  
  const totalMinutes = recentSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const totalQuestions = recentSessions.reduce((sum, s) => sum + s.questionsAttempted, 0);
  const totalCorrect = recentSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
  
  return {
    totalSessions: recentSessions.length,
    totalMinutes,
    totalQuestions,
    accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
    averageSessionLength: recentSessions.length > 0 ? totalMinutes / recentSessions.length : 0,
  };
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `bun run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/actions/study-planning.ts
git commit -m "feat: add smart study planning actions"
```

---

## Chunk 3: Social Learning Network

### Task 3.1: Create Social Learning Actions

**Files:**
- Create: `src/actions/social-learning.ts`

- [ ] **Step 1: Create social-learning.ts**

```typescript
'use server';

import { and, eq, desc, sql, or } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { 
  studyBuddyProfiles, 
  studyBuddyRequests, 
  studyBuddies, 
  channels, 
  channelMembers,
  leaderboardEntries,
  users 
} from '@/lib/db/schema';

async function getDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) throw new Error('Database not available');
  return dbManager.getDb();
}

export interface BuddyMatch {
  user: {
    id: string;
    name: string;
    personality: string;
  };
  compatibilityScore: number;
  complementaryTopics: { strong: string[]; weak: string[] };
}

export async function findBuddyMatches(limit = 10): Promise<BuddyMatch[]> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const myProfile = await db.query.studyBuddyProfiles.findFirst({
    where: eq(studyBuddyProfiles.userId, session.user.id),
  });
  
  if (!myProfile) return [];
  
  const potentialBuddies = await db.query.studyBuddyProfiles.findMany({
    where: and(
      eq(studyBuddyProfiles.isVisible, true),
      sql`${studyBuddyProfiles.userId} != ${session.user.id}`
    ),
  });
  
  const myBuddies = await db.query.studyBuddies.findMany({
    where: sql`${studyBuddies.userId1} = ${session.user.id} OR ${studyBuddies.userId2} = ${session.user.id}`,
  });
  
  const existingBuddyIds = new Set(
    myBuddies.flatMap(b => [b.userId1, b.userId2])
  );
  
  const matches: BuddyMatch[] = [];
  
  for (const buddy of potentialBuddies) {
    if (existingBuddyIds.has(buddy.userId)) continue;
    
    const compatibilityScore = calculateCompatibility(myProfile, buddy);
    
    const complementaryTopics = findComplementaryTopics(myProfile, buddy);
    
    if (compatibilityScore > 50 || complementaryTopics.weak.length > 0) {
      const user = await db.query.users.findFirst({
        where: eq(users.id, buddy.userId),
      });
      
      matches.push({
        user: {
          id: buddy.userId,
          name: user?.name || 'Anonymous',
          personality: buddy.personality,
        },
        compatibilityScore,
        complementaryTopics,
      });
    }
  }
  
  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore).slice(0, limit);
}

function calculateCompatibility(
  profile1: typeof studyBuddyProfiles.$inferSelect,
  profile2: typeof studyBuddyProfiles.$inferSelect
): number {
  let score = 0;
  
  const prefs1 = profile1.matchPreferences ? JSON.parse(profile1.matchPreferences) : {};
  const prefs2 = profile2.matchPreferences ? JSON.parse(profile2.matchPreferences) : {};
  
  if (profile1.personality === profile2.personality) {
    score += 20;
  } else {
    score += 10;
  }
  
  if (prefs1.preferredSubjects?.some((s: string) => prefs2.preferredSubjects?.includes(s))) {
    score += 30;
  }
  
  if (prefs1.studySchedule === prefs2.studySchedule) {
    score += 25;
  }
  
  return Math.min(100, score);
}

function findComplementaryTopics(
  profile1: typeof studyBuddyProfiles.$inferSelect,
  profile2: typeof studyBuddyProfiles.$inferSelect
): { strong: string[]; weak: string[] } {
  const subjects1 = profile1.preferredSubjects ? JSON.parse(profile1.preferredSubjects) : [];
  const subjects2 = profile2.preferredSubjects ? JSON.parse(profile2.preferredSubjects) : [];
  
  const strong1 = subjects1.filter((s: string) => !subjects2.includes(s));
  const strong2 = subjects2.filter((s: string) => !subjects1.includes(s));
  
  return {
    strong: strong1,
    weak: strong2,
  };
}

export async function sendBuddyRequest(toUserId: string, message?: string) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const existing = await db.query.studyBuddyRequests.findFirst({
    where: sql`
      (${studyBuddyRequests.requesterId} = ${session.user.id} AND ${studyBuddyRequests.recipientId} = ${toUserId})
      OR
      (${studyBuddyRequests.requesterId} = ${toUserId} AND ${studyBuddyRequests.recipientId} = ${session.user.id})
    `,
  });
  
  if (existing) throw new Error('Request already exists');
  
  const [request] = await db.insert(studyBuddyRequests).values({
    requesterId: session.user.id,
    recipientId: toUserId,
    message,
  }).returning();
  
  return request;
}

export async function respondToBuddyRequest(requestId: string, accept: boolean) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const request = await db.query.studyBuddyRequests.findFirst({
    where: eq(studyBuddyRequests.id, requestId),
  });
  
  if (!request || request.recipientId !== session.user.id) {
    throw new Error('Request not found or unauthorized');
  }
  
  if (accept) {
    await db.update(studyBuddyRequests).set({
      status: 'accepted',
      respondedAt: new Date(),
    }).where(eq(studyBuddyRequests.id, requestId));
    
    await db.insert(studyBuddies).values({
      userId1: request.requesterId,
      userId2: request.recipientId,
    });
    
    const myChannels = await db.query.channels.findMany({
      where: sql`${channels.id} IN (
        SELECT ${channelMembers.channelId} FROM ${channelMembers} WHERE ${channelMembers.userId} = ${session.user.id}
      )`,
    });
    
    const theirChannels = await db.query.channels.findMany({
      where: sql`${channels.id} IN (
        SELECT ${channelMembers.channelId} FROM ${channelMembers} WHERE ${channelMembers.userId} = ${request.requesterId}
      )`,
    });
    
    const mutualChannels = myChannels.filter(c => 
      theirChannels.some(tc => tc.id === c.id)
    );
    
    if (mutualChannels.length === 0) {
      const [channel] = await db.insert(channels).values({
        name: 'Study Buddies',
        description: 'Auto-created study buddy channel',
        createdBy: session.user.id,
        isPublic: false,
        memberCount: 2,
      }).returning();
      
      await db.insert(channelMembers).values([
        { channelId: channel.id, userId: session.user.id },
        { channelId: channel.id, userId: request.requesterId },
      ]);
    }
  } else {
    await db.update(studyBuddyRequests).set({
      status: 'rejected',
      respondedAt: new Date(),
    }).where(eq(studyBuddyRequests.id, requestId));
  }
}

export async function getStudyGroupLeaderboard(groupId: string, periodType = 'weekly') {
  const db = await getDb();
  
  const members = await db.query.channelMembers.findMany({
    where: eq(channelMembers.channelId, groupId),
  });
  
  const memberIds = members.map(m => m.userId);
  const periodStart = getPeriodStart(periodType);
  
  const leaderboard = await db.query.leaderboardEntries.findMany({
    where: and(
      sql`${leaderboardEntries.userId} IN ${memberIds}`,
      eq(leaderboardEntries.periodType, periodType),
      gte(leaderboardEntries.periodStart, periodStart)
    ),
    orderBy: [desc(leaderboardEntries.totalPoints)],
    limit: 20,
  });
  
  return leaderboard;
}

function getPeriodStart(periodType: string): Date {
  const now = new Date();
  switch (periodType) {
    case 'daily':
      now.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      now.setDate(now.getDate() - now.getDay());
      now.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      now.setDate(1);
      now.setHours(0, 0, 0, 0);
      break;
  }
  return now;
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `bun run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/actions/social-learning.ts
git commit -m "feat: add social learning network actions"
```

---

## Chunk 4: Gamification Engine

### Task 4.1: Create Gamification Actions

**Files:**
- Create: `src/actions/gamification.ts`

- [ ] **Step 1: Create gamification.ts**

```typescript
'use server';

import { and, eq, gte, desc, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { 
  userAchievements, 
  userProgress, 
  streakDays,
  loginBonuses,
  leaderboardEntries,
  flashcardReviews,
  studySessions,
  questionAttempts
} from '@/lib/db/schema';

async function getDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) throw new Error('Database not available');
  return dbManager.getDb();
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

export const ACHIEVEMENTS = {
  FIRST_QUIZ: { id: 'first_quiz', title: 'First Steps', description: 'Complete your first quiz', icon: '🎯' },
  STREAK_7: { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥' },
  STREAK_30: { id: 'streak_30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '💎' },
  PERFECT_QUIZ: { id: 'perfect_quiz', title: 'Perfect Score', description: 'Get 100% on a quiz', icon: '⭐' },
  FLASHCARD_100: { id: 'flashcard_100', title: 'Flashcard Pro', description: 'Review 100 flashcards', icon: '📚' },
  TOPIC_MASTER: { id: 'topic_master', title: 'Topic Master', description: 'Achieve 90%+ mastery on 5 topics', icon: '🏆' },
  STUDY_BUDDY: { id: 'study_buddy', title: 'Social Learner', description: 'Connect with a study buddy', icon: '🤝' },
  EARLY_BIRD: { id: 'early_bird', title: 'Early Bird', description: 'Study before 7am', icon: '🌅' },
  NIGHT_OWL: { id: 'night_owl', title: 'Night Owl', description: 'Study after 10pm', icon: '🦉' },
  CONSISTENT: { id: 'consistent', title: 'Consistent', description: 'Study for 7 days in a row', icon: '📈' },
};

export async function checkAndUnlockAchievements(): Promise<Achievement[]> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  const userId = session.user.id;
  const newAchievements: Achievement[] = [];
  
  const existingAchievements = await db.query.userAchievements.findMany({
    where: eq(userAchievements.userId, userId),
  });
  const existingIds = new Set(existingAchievements.map(a => a.achievementId));
  
  const quizCount = await db.query.quizResults.findMany({
    where: eq(quizResults.userId, userId),
  });
  
  if (quizCount.length >= 1 && !existingIds.has('first_quiz')) {
    await unlockAchievement(userId, ACHIEVEMENTS.FIRST_QUIZ);
    newAchievements.push({ ...ACHIEVEMENTS.FIRST_QUIZ, unlockedAt: new Date() });
  }
  
  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });
  
  if (progress && progress.streakDays >= 7 && !existingIds.has('streak_7')) {
    await unlockAchievement(userId, ACHIEVEMENTS.STREAK_7);
    newAchievements.push({ ...ACHIEVEMENTS.STREAK_7, unlockedAt: new Date() });
  }
  
  if (progress && progress.streakDays >= 30 && !existingIds.has('streak_30')) {
    await unlockAchievement(userId, ACHIEVEMENTS.STREAK_30);
    newAchievements.push({ ...ACHIEVEMENTS.STREAK_30, unlockedAt: new Date() });
  }
  
  const perfectQuizzes = quizCount.filter(q => Number(q.percentage) === 100);
  if (perfectQuizzes.length >= 1 && !existingIds.has('perfect_quiz')) {
    await unlockAchievement(userId, ACHIEVEMENTS.PERFECT_QUIZ);
    newAchievements.push({ ...ACHIEVEMENTS.PERFECT_QUIZ, unlockedAt: new Date() });
  }
  
  const flashcardCount = await db.query.flashcardReviews.findMany({
    where: eq(flashcardReviews.userId, userId),
  });
  
  if (flashcardCount.length >= 100 && !existingIds.has('flashcard_100')) {
    await unlockAchievement(userId, ACHIEVEMENTS.FLASHCARD_100);
    newAchievements.push({ ...ACHIEVEMENTS.FLASHCARD_100, unlockedAt: new Date() });
  }
  
  const hour = new Date().getHours();
  if (hour < 7 && !existingIds.has('early_bird')) {
    await unlockAchievement(userId, ACHIEVEMENTS.EARLY_BIRD);
    newAchievements.push({ ...ACHIEVEMENTS.EARLY_BIRD, unlockedAt: new Date() });
  }
  
  if (hour >= 22 && !existingIds.has('night_owl')) {
    await unlockAchievement(userId, ACHIEVEMENTS.NIGHT_OWL);
    newAchievements.push({ ...ACHIEVEMENTS.NIGHT_OWL, unlockedAt: new Date() });
  }
  
  return newAchievements;
}

async function unlockAchievement(userId: string, achievement: typeof ACHIEVEMENTS.FIRST_QUIZ) {
  const db = await getDb();
  
  await db.insert(userAchievements).values({
    userId,
    achievementId: achievement.id,
    title: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
  });
}

export async function updateStreak(): Promise<{ streakDays: number; bonusPoints: number }> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  const userId = session.user.id;
  
  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });
  
  const lastActivity = progress?.lastActivityAt ? new Date(progress.lastActivityAt) : null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let streakDays = progress?.streakDays || 0;
  let bonusPoints = 0;
  
  if (lastActivity) {
    const lastDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
    const daysDiff = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      return { streakDays, bonusPoints: 0 };
    } else if (daysDiff === 1) {
      streakDays++;
      bonusPoints = Math.min(streakDays * 10, 100);
    } else {
      streakDays = 1;
      bonusPoints = 10;
    }
  } else {
    streakDays = 1;
    bonusPoints = 10;
  }
  
  const bestStreak = Math.max(streakDays, progress?.bestStreak || 0);
  
  await db
    .insert(userProgress)
    .values({
      userId,
      streakDays,
      bestStreak,
      lastActivityAt: now,
    })
    .onConflictDoUpdate({
      target: [userProgress.userId],
      set: {
        streakDays,
        bestStreak,
        lastActivityAt: now,
        updatedAt: now,
      },
    });
  
  await checkAndUnlockAchievements();
  
  return { streakDays, bonusPoints };
}

export async function claimLoginBonus(): Promise<{ bonus: number; streakDays: number; totalBonuses: number }> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  const userId = session.user.id;
  
  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });
  
  const lastBonus = progress?.lastLoginBonusAt;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (lastBonus) {
    const lastBonusDay = new Date(lastBonus.getFullYear(), lastBonus.getMonth(), lastBonus.getDate());
    if (lastBonusDay.getTime() === today.getTime()) {
      throw new Error('Bonus already claimed today');
    }
  }
  
  const streakDays = progress?.consecutiveLoginDays || 0;
  const bonus = Math.min(50 + streakDays * 10, 200);
  const totalBonuses = (progress?.totalLoginBonusesClaimed || 0) + 1;
  
  await db
    .insert(userProgress)
    .values({
      userId,
      lastLoginBonusAt: now,
      consecutiveLoginDays: streakDays + 1,
      totalLoginBonusesClaimed: totalBonuses,
      totalMarksEarned: (progress?.totalMarksEarned || 0) + bonus,
    })
    .onConflictDoUpdate({
      target: [userProgress.userId],
      set: {
        lastLoginBonusAt: now,
        consecutiveLoginDays: streakDays + 1,
        totalLoginBonusesClaimed: totalBonuses,
        totalMarksEarned: (progress?.totalMarksEarned || 0) + bonus,
        updatedAt: now,
      },
    });
  
  await checkAndUnlockAchievements();
  
  return { bonus, streakDays: streakDays + 1, totalBonuses };
}

export async function calculateLeaderboardPoints(): Promise<number> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  const userId = session.user.id;
  
  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });
  
  const achievements = await db.query.userAchievements.findMany({
    where: eq(userAchievements.userId, userId),
  });
  
  const recentSessions = await db.query.studySessions.findMany({
    where: and(
      eq(studySessions.userId, userId),
      gte(studySessions.startedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    ),
  });
  
  const pointsFromProgress = (progress?.totalMarksEarned || 0) / 10;
  const pointsFromAchievements = achievements.length * 50;
  const pointsFromStreak = (progress?.streakDays || 0) * 5;
  const pointsFromActivity = recentSessions.length * 10;
  
  return Math.floor(
    pointsFromProgress + 
    pointsFromAchievements + 
    pointsFromStreak + 
    pointsFromActivity
  );
}

export async function syncLeaderboard(periodType = 'weekly') {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  const userId = session.user.id;
  
  const points = await calculateLeaderboardPoints();
  const periodStart = getPeriodStart(periodType);
  
  await db
    .insert(leaderboardEntries)
    .values({
      userId,
      periodType,
      periodStart,
      totalPoints: points,
      rank: 0,
    })
    .onConflictDoUpdate({
      target: [leaderboardEntries.userId, leaderboardEntries.periodType, leaderboardEntries.periodStart],
      set: {
        totalPoints: points,
        updatedAt: new Date(),
      },
    });
  
  const allEntries = await db.query.leaderboardEntries.findMany({
    where: and(
      eq(leaderboardEntries.periodType, periodType),
      eq(leaderboardEntries.periodStart, periodStart)
    ),
    orderBy: [desc(leaderboardEntries.totalPoints)],
  });
  
  for (let i = 0; i < allEntries.length; i++) {
    await db
      .update(leaderboardEntries)
      .set({ rank: i + 1 })
      .where(eq(leaderboardEntries.id, allEntries[i].id));
  }
}

function getPeriodStart(periodType: string): Date {
  const now = new Date();
  switch (periodType) {
    case 'daily':
      now.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      now.setDate(now.getDate() - now.getDay());
      now.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      now.setDate(1);
      now.setHours(0, 0, 0, 0);
      break;
  }
  return now;
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `bun run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/actions/gamification.ts
git commit -m "feat: add gamification engine actions"
```

---

## Chunk 5: B2B School Integration

### Task 5.1: Create School Sync Actions

**Files:**
- Create: `src/actions/school-sync.ts`

- [ ] **Step 1: Create school-sync.ts**

```typescript
'use server';

import { and, eq, gte, desc, sql, inArray } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { 
  schools, 
  schoolAdmins, 
  schoolLicenses,
  users,
  userProgress,
  topicMastery,
  quizResults,
  studySessions
} from '@/lib/db/schema';

async function getDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) throw new Error('Database not available');
  return dbManager.getDb();
}

export interface SchoolAnalytics {
  schoolId: string;
  schoolName: string;
  totalLearners: number;
  averageAccuracy: number;
  mostChallengingTopics: { topic: string; averageMastery: number }[];
  strongestTopics: { topic: string; averageMastery: number }[];
  activeUsers: number;
  totalStudyMinutes: number;
}

export interface LearnerProgress {
  learnerId: string;
  learnerName: string;
  progress: number;
  accuracy: number;
  topicsMastered: number;
  weakTopics: string[];
  studyStreak: number;
}

export async function getSchoolAnalytics(schoolId: string): Promise<SchoolAnalytics> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const school = await db.query.schools.findFirst({
    where: eq(schools.id, schoolId),
  });
  
  if (!school) throw new Error('School not found');
  
  const adminCheck = await db.query.schoolAdmins.findFirst({
    where: and(
      eq(schoolAdmins.schoolId, schoolId),
      eq(schoolAdmins.userId, session.user.id)
    ),
  });
  
  if (!adminCheck) throw new Error('Not authorized for this school');
  
  const schoolUsers = await db.query.users.findMany({
    where: sql`${users.id} IN (
      SELECT user_id FROM ${schoolLicenses} 
      WHERE ${schoolLicenses.schoolId} = ${schoolId} 
      AND ${schoolLicenses.status} = 'active'
    )`,
  });
  
  const userIds = schoolUsers.map(u => u.id);
  
  if (userIds.length === 0) {
    return {
      schoolId,
      schoolName: school.name,
      totalLearners: 0,
      averageAccuracy: 0,
      mostChallengingTopics: [],
      strongestTopics: [],
      activeUsers: 0,
      totalStudyMinutes: 0,
    };
  }
  
  const recentQuizzes = await db.query.quizResults.findMany({
    where: and(
      sql`${quizResults.userId} IN ${userIds}`,
      gte(quizResults.completedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    ),
  });
  
  const recentSessions = await db.query.studySessions.findMany({
    where: and(
      sql`${studySessions.userId} IN ${userIds}`,
      gte(studySessions.startedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    ),
  );
  
  const totalQuestions = recentQuizzes.reduce((sum, q) => sum + q.totalQuestions, 0);
  const totalCorrect = recentQuizzes.reduce((sum, q) => sum + q.score, 0);
  const averageAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
  
  const masteries = await db.query.topicMastery.findMany({
    where: sql`${topicMastery.userId} IN ${userIds}`,
  });
  
  const topicStats = new Map<string, { total: number; count: number }>();
  for (const m of masteries) {
    const existing = topicStats.get(m.topic) || { total: 0, count: 0 };
    existing.total += Number(m.masteryLevel);
    existing.count++;
    topicStats.set(m.topic, existing);
  }
  
  const topicAverages = Array.from(topicStats.entries()).map(([topic, stats]) => ({
    topic,
    averageMastery: stats.count > 0 ? (stats.total / stats.count) * 100 : 0,
  }));
  
  const mostChallenging = topicAverages
    .filter(t => t.count >= 5)
    .sort((a, b) => a.averageMastery - b.averageMastery)
    .slice(0, 5);
  
  const strongest = topicAverages
    .filter(t => t.count >= 5)
    .sort((a, b) => b.averageMastery - a.averageMastery)
    .slice(0, 5);
  
  const uniqueActiveUsers = new Set(recentSessions.map(s => s.userId)).size;
  const totalStudyMinutes = recentSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  
  return {
    schoolId,
    schoolName: school.name,
    totalLearners: schoolUsers.length,
    averageAccuracy,
    mostChallengingTopics: mostChallenging,
    strongestTopics: strongest,
    activeUsers: uniqueActiveUsers,
    totalStudyMinutes,
  };
}

export async function assignLicenseToLearner(licenseKey: string, learnerEmail: string) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const license = await db.query.schoolLicenses.findFirst({
    where: eq(schoolLicenses.licenseKey, licenseKey),
  });
  
  if (!license || license.status !== 'active') {
    throw new Error('Invalid or expired license');
  }
  
  const learner = await db.query.users.findFirst({
    where: eq(users.email, learnerEmail),
  });
  
  if (!learner) throw new Error('Learner not found');
  
  await db
    .update(schoolLicenses)
    .set({
      assignedTo: learner.id,
      assignedAt: new Date(),
    })
    .where(eq(schoolLicenses.id, license.id));
  
  return { success: true, learnerId: learner.id };
}

export async function getSchoolLeaderboard(schoolId: string, limit = 20): Promise<LearnerProgress[]> {
  const db = await getDb();
  
  const schoolUsers = await db.query.users.findMany({
    where: sql`${users.id} IN (
      SELECT user_id FROM ${schoolLicenses} 
      WHERE ${schoolLicenses.schoolId} = ${schoolId} 
      AND ${schoolLicenses.status} = 'active'
    )`,
  });
  
  const userIds = schoolUsers.map(u => u.id);
  
  const progressList = await db.query.userProgress.findMany({
    where: sql`${userProgress.userId} IN ${userIds}`,
  });
  
  const quizList = await db.query.quizResults.findMany({
    where: sql`${quizResults.userId} IN ${userIds}`,
  });
  
  const masteries = await db.query.topicMastery.findMany({
    where: sql`${topicMastery.userId} IN ${userIds}`,
  });
  
  const learnerProgress: LearnerProgress[] = schoolUsers.map(user => {
    const progress = progressList.find(p => p.userId === user.id);
    const quizzes = quizList.filter(q => q.userId === user.id);
    const userMasteries = masteries.filter(m => m.userId === user.id);
    
    const totalQuestions = quizzes.reduce((sum, q) => sum + q.totalQuestions, 0);
    const totalCorrect = quizzes.reduce((sum, q) => sum + q.score, 0);
    
    const topicsMastered = userMasteries.filter(m => Number(m.masteryLevel) >= 0.8).length;
    const weakTopics = userMasteries
      .filter(m => Number(m.masteryLevel) < 0.5)
      .map(m => m.topic);
    
    return {
      learnerId: user.id,
      learnerName: user.name || 'Anonymous',
      progress: progress ? Number(progress.totalMarksEarned) : 0,
      accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
      topicsMastered,
      weakTopics: weakTopics.slice(0, 5),
      studyStreak: progress?.streakDays || 0,
    };
  });
  
  return learnerProgress
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit);
}

export async function createSchoolLicense(schoolId: string, count: number, expiresAt?: Date) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const adminCheck = await db.query.schoolAdmins.findFirst({
    where: and(
      eq(schoolAdmins.schoolId, schoolId),
      eq(schoolAdmins.userId, session.user.id)
    ),
  });
  
  if (!adminCheck) throw new Error('Not authorized');
  
  const licenses = [];
  for (let i = 0; i < count; i++) {
    const licenseKey = `SCH-${schoolId.slice(0, 8)}-${Date.now()}-${i}`.toUpperCase();
    
    const [license] = await db.insert(schoolLicenses).values({
      schoolId,
      licenseType: 'student',
      licenseKey,
      status: 'active',
      expiresAt,
    }).returning();
    
    licenses.push(license);
  }
  
  return licenses;
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `bun run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/actions/school-sync.ts
git commit -m "feat: add B2B school integration actions"
```

---

## Chunk 6: Content Discovery Pipeline

### Task 6.1: Create Content Discovery Actions

**Files:**
- Create: `src/actions/content-discovery.ts`

- [ ] **Step 1: Create content-discovery.ts**

```typescript
'use server';

import { and, eq, gte, desc, sql } from 'drizzle-orm';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { 
  searchHistory, 
  pastPapers, 
  bookmarks, 
  aiConversations,
  subjects,
  questions
} from '@/lib/db/schema';

async function getDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) throw new Error('Database not available');
  return dbManager.getDb();
}

export interface ContentRecommendation {
  type: 'pastPaper' | 'topic' | 'question' | 'conversation';
  id: string;
  title: string;
  subject?: string;
  relevanceScore: number;
  reason: string;
}

export interface SearchInsight {
  popularTopics: { topic: string; count: number }[];
  trendingSubjects: { subject: string; growth: number }[];
  relatedQueries: string[];
}

export async function recordSearch(query: string) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) return;
  
  const db = await getDb();
  
  await db.insert(searchHistory).values({
    userId: session.user.id,
    query,
  });
}

export async function getSearchInsights(): Promise<SearchInsight> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const recentSearches = await db.query.searchHistory.findMany({
    where: gte(searchHistory.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    orderBy: [desc(searchHistory.createdAt)],
  });
  
  const topicCounts = new Map<string, number>();
  for (const search of recentSearches) {
    const words = search.query.toLowerCase().split(' ');
    for (const word of words) {
      topicCounts.set(word, (topicCounts.get(word) || 0) + 1);
    }
  }
  
  const popularTopics = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));
  
  const mySearches = recentSearches.filter(s => s.userId === session.user.id);
  const myTopics = new Set(mySearches.flatMap(s => s.query.toLowerCase().split(' ')));
  
  const allSearches = await db.query.searchHistory.findMany({
    where: sql`${searchHistory.userId} != ${session.user.id}`,
  });
  
  const trendingSubjects: { subject: string; growth: number }[] = [];
  
  const relatedQueries = Array.from(myTopics)
    .filter(topic => topicCounts.has(topic) && topicCounts.get(topic)! > 3)
    .slice(0, 5);
  
  return {
    popularTopics,
    trendingSubjects,
    relatedQueries,
  };
}

export async function getPersonalizedRecommendations(limit = 10): Promise<ContentRecommendation[]> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const recentSearches = await db.query.searchHistory.findMany({
    where: eq(searchHistory.userId, session.user.id),
    orderBy: [desc(searchHistory.createdAt)],
    limit: 20,
  });
  
  const searchTopics = new Set(
    recentSearches.flatMap(s => s.query.toLowerCase().split(' ')).filter(t => t.length > 2)
  );
  
  const bookmarksList = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, session.user.id),
  });
  
  const bookmarkedTypes = new Set(bookmarksList.map(b => b.bookmarkType));
  
  const recommendations: ContentRecommendation[] = [];
  
  const pastPapersList = await db.query.pastPapers.findMany({
    where: eq(pastPapers.isExtracted, true),
    orderBy: [desc(pastPapers.createdAt)],
    limit: 20,
  });
  
  for (const paper of pastPapersList) {
    let relevanceScore = 10;
    
    for (const topic of searchTopics) {
      if (paper.subject.toLowerCase().includes(topic)) {
        relevanceScore += 20;
      }
    }
    
    if (!bookmarkedTypes.has('pastPaper')) {
      relevanceScore += 5;
    }
    
    recommendations.push({
      type: 'pastPaper',
      id: paper.id,
      title: `${paper.subject} - ${paper.paper} ${paper.year}`,
      subject: paper.subject,
      relevanceScore,
      reason: searchTopics.size > 0 
        ? 'Based on your recent searches' 
        : 'Popular this week',
    });
  }
  
  const subjectsList = await db.query.subjects.findMany({
    where: eq(subjects.isActive, true),
  });
  
  for (const subject of subjectsList) {
    let relevanceScore = 15;
    
    for (const topic of searchTopics) {
      if (subject.name.toLowerCase().includes(topic)) {
        relevanceScore += 25;
      }
    }
    
    recommendations.push({
      type: 'topic',
      id: subject.id.toString(),
      title: subject.name,
      subject: subject.name,
      relevanceScore,
      reason: 'Subject overview',
    });
  }
  
  const conversations = await db.query.aiConversations.findMany({
    where: eq(aiConversations.userId, session.user.id),
    orderBy: [desc(aiConversations.updatedAt)],
    limit: 5,
  });
  
  for (const conv of conversations) {
    recommendations.push({
      type: 'conversation',
      id: conv.id,
      title: conv.title,
      subject: conv.subject || undefined,
      relevanceScore: 30,
      reason: 'Continue your previous learning',
    });
  }
  
  return recommendations
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}

export async function discoverPastPapers(
  subject?: string,
  year?: number,
  paper?: string
): Promise<typeof pastPapers.$inferSelect[]> {
  const db = await getDb();
  
  let query = db.query.pastPapers.findMany({
    where: eq(pastPapers.isExtracted, true),
    orderBy: [desc(pastPapers.year), desc(pastPapers.createdAt)],
  });
  
  if (subject || year || paper) {
    const conditions = [eq(pastPapers.isExtracted, true)];
    
    if (subject) {
      conditions.push(sql`LOWER(${pastPapers.subject}) LIKE ${`%${subject.toLowerCase()}%`}`);
    }
    if (year) {
      conditions.push(eq(pastPapers.year, year));
    }
    if (paper) {
      conditions.push(sql`LOWER(${pastPapers.paper}) LIKE ${`%${paper.toLowerCase()}%`}`);
    }
    
    query = db.query.pastPapers.findMany({
      where: and(...conditions),
      orderBy: [desc(pastPapers.year), desc(pastPapers.createdAt)],
    });
  }
  
  return query;
}

export async function getSimilarQuestions(questionId: string, limit = 5) {
  const db = await getDb();
  
  const question = await db.query.questions.findFirst({
    where: eq(questions.id, questionId),
  });
  
  if (!question) return [];
  
  const similar = await db.query.questions.findMany({
    where: and(
      eq(questions.subjectId, question.subjectId),
      eq(questions.topic, question.topic),
      sql`${questions.id} != ${questionId}`
    ),
    limit,
  });
  
  return similar;
}

export async function saveBookmark(
  bookmarkType: string,
  referenceId: string,
  note?: string
) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const existing = await db.query.bookmarks.findFirst({
    where: and(
      eq(bookmarks.userId, session.user.id),
      eq(bookmarks.referenceId, referenceId)
    ),
  });
  
  if (existing) {
    return existing;
  }
  
  const [bookmark] = await db.insert(bookmarks).values({
    userId: session.user.id,
    bookmarkType,
    referenceId,
    note,
  }).returning();
  
  return bookmark;
}

export async function saveAIConversation(
  title: string,
  subject: string,
  messages: string
) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');
  
  const db = await getDb();
  
  const messageCount = (messages.match(/"role"/g) || []).length;
  
  const [conversation] = await db.insert(aiConversations).values({
    userId: session.user.id,
    title,
    subject,
    messages,
    messageCount,
  }).returning();
  
  return conversation;
}
```

- [ ] **Step 2: Verify with typecheck**

Run: `bun run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/actions/content-discovery.ts
git commit -m "feat: add content discovery pipeline actions"
```

---

## Chunk 7: Integration Hooks

### Task 7.1: Create Unified Integration Actions

**Files:**
- Create: `src/actions/integrations.ts`

- [ ] **Step 1: Create integrations.ts - unified hooks**

```typescript
'use server';

import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { checkAndUnlockAchievements, updateStreak, syncLeaderboard, claimLoginBonus } from './gamification';
import { trackStudySession } from './study-planning';
import { syncMasteryToConfidence, generateFlashcardsFromWeakTopics } from './adaptive-learning';

export async function onQuizCompleted(
  subjectId: number,
  topic: string,
  durationMinutes: number,
  questionsAttempted: number,
  correctAnswers: number,
  isPerfect: boolean
) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) return;
  
  await trackStudySession(subjectId, topic, durationMinutes, questionsAttempted, correctAnswers);
  
  const newAchievements = await checkAndUnlockAchievements();
  
  const { streakDays } = await updateStreak();
  
  await syncLeaderboard('weekly');
  
  if (streakDays === 1) {
    await claimLoginBonus();
  }
  
  return {
    achievementsUnlocked: newAchievements,
    streakDays,
  };
}

export async function onFlashcardReviewed(
  rating: number,
  topic: string,
  subject: string
) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) return;
  
  const newAchievements = await checkAndUnlockAchievements();
  
  await updateStreak();
  
  await syncMasteryToConfidence(session.user.id);
  
  const weakTopics = await getWeakTopicsFromDb();
  if (weakTopics.some(w => w.topic === topic)) {
    await generateFlashcardsFromWeakTopics(session.user.id, [topic]);
  }
  
  return {
    achievementsUnlocked: newAchievements,
  };
}

async function getWeakTopicsFromDb() {
  const db = await dbManager.getDb();
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) return [];
  
  const { topicConfidence } = await import('@/lib/db/schema');
  
  return db.query.topicConfidence.findMany({
    where: sql`${topicConfidence.userId} = ${session.user.id} AND ${topicConfidence.confidenceScore} < 0.5`,
  });
}

export async function onStudyPlanCreated(planId: string, focusAreas: string[]) {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) return;
  
  const { generateCalendarEventsFromPlan } = await import('./study-planning');
  await generateCalendarEventsFromPlan(planId);
  
  await generateFlashcardsFromWeakTopics(session.user.id, focusAreas);
  
  await checkAndUnlockAchievements();
}

export async function onBuddyMatched(buddyId: string) {
  const newAchievements = await checkAndUnlockAchievements();
  
  await syncLeaderboard('weekly');
  
  return {
    achievementsUnlocked: newAchievements,
  };
}

import { sql } from 'drizzle-orm';
```

- [ ] **Step 2: Verify with typecheck**

Run: `bun run typecheck`
Expected: No errors (may need minor fixes)

- [ ] **Step 3: Commit**

```bash
git add src/actions/integrations.ts
git commit -m "feat: add unified integration hooks"
```

---

## Summary

This implementation creates 7 new server action files:

1. **adaptive-learning.ts** - Unified adaptive learning with weak topic detection and recommendations
2. **flashcard-study.ts** - Flashcard review with SM-2 algorithm integration
3. **study-planning.ts** - Smart study planning with calendar event generation
4. **social-learning.ts** - Study buddy matching and group leaderboards
5. **gamification.ts** - Achievements, streaks, login bonuses, and leaderboard sync
6. **school-sync.ts** - B2B school analytics and license management
7. **content-discovery.ts** - Personalized recommendations from search history
8. **integrations.ts** - Unified hooks that trigger multiple systems

All actions use the existing database schema and follow the server action pattern for client-side usage.
