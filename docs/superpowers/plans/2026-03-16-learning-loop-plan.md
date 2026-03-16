# Learning Loop Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect quiz mistakes to flashcard generation - users can convert wrong answers to flashcards from quiz results and dashboard.

**Architecture:** 
- Use existing `useQuizResultStore` to get wrong answers from quiz session
- Create server actions to generate flashcards from mistakes
- Add UI to LessonComplete screen and dashboard widget
- Use existing flashcard deck system with "Mistake Master" deck

**Tech Stack:** Next.js, Server Actions, Zustand, shadcn/ui

---

## Chunk 1: Server Actions (Core Logic)

### Task 1: Create learning-loop-actions.ts

**Files:**
- Create: `src/lib/db/learning-loop-actions.ts`

- [ ] **Step 1: Create the server actions file**

```typescript
'use server';

import { and, eq } from 'drizzle-orm';
import { ensureAuthenticated } from './actions';
import { getDb, dbManager } from './index';
import { flashcards, flashcardDecks, questions, options, topicMastery } from './schema';

export interface MistakeInfo {
  questionId: string;
  questionText: string;
  correctAnswer: string;
  explanation: string | null;
  topic: string;
  subject: string;
}

export interface WeakTopic {
  topic: string;
  masteryLevel: number;
  subjectId: number;
}

async function getConnectedDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) {
    throw new Error('Database not available');
  }
  return getDb();
}

export async function getWeakTopicsForUser(): Promise<WeakTopic[]> {
  try {
    const user = await ensureAuthenticated();
    const db = await getConnectedDb();

    const masteryRecords = await db
      .select()
      .from(topicMastery)
      .where(
        and(
          eq(topicMastery.userId, user.id),
          eq(topicMastery.consecutiveCorrect, 0)
        )
      );

    const weakTopics: WeakTopic[] = [];
    for (const record of masteryRecords) {
      if (record.questionsAttempted && record.questionsAttempted >= 3) {
        const accuracy = Number(record.masteryLevel) || 0;
        if (accuracy < 50) {
          weakTopics.push({
            topic: record.topic,
            masteryLevel: accuracy,
            subjectId: record.subjectId,
          });
        }
      }
    }

    return weakTopics.sort((a, b) => a.masteryLevel - b.masteryLevel).slice(0, 10);
  } catch (error) {
    console.error('[Learning Loop] Error getting weak topics:', error);
    return [];
  }
}

export async function getMistakesFromStore(): Promise<MistakeInfo[]> {
  try {
    const user = await ensureAuthenticated();
    const db = await getConnectedDb();

    const { useQuizResultStore } = await import('@/stores/useQuizResultStore');
    const mistakes = useQuizResultStore.getState().getLastMistakes();

    if (mistakes.length === 0) {
      return [];
    }

    const mistakeInfos: MistakeInfo[] = [];

    for (const mistake of mistakes) {
      const questionRecords = await db
        .select()
        .from(questions)
        .where(eq(questions.id, mistake.questionId))
        .limit(1);

      if (!questionRecords[0]) continue;

      const question = questionRecords[0];
      
      const optionRecords = await db
        .select()
        .from(options)
        .where(
          and(
            eq(options.questionId, question.id),
            eq(options.isCorrect, true)
          )
        )
        .limit(1);

      const correctOption = optionRecords[0];

      mistakeInfos.push({
        questionId: question.id,
        questionText: question.questionText || '',
        correctAnswer: correctOption?.optionText || '',
        explanation: correctOption?.explanation || null,
        topic: mistake.topic,
        subject: mistake.subject,
      });
    }

    return mistakeInfos;
  } catch (error) {
    console.error('[Learning Loop] Error getting mistakes from store:', error);
    return [];
  }
}

export async function generateFlashcardsFromMistakes(): Promise<{
  success: boolean;
  cardsCreated: number;
  error?: string;
}> {
  try {
    const user = await ensureAuthenticated();
    const db = await getConnectedDb();

    const mistakes = await getMistakesFromStore();

    if (mistakes.length === 0) {
      return { success: true, cardsCreated: 0, error: 'no_mistakes' };
    }

    let deck = await db.query.flashcardDecks.findFirst({
      where: eq(flashcardDecks.userId, user.id),
    });

    if (!deck) {
      const [newDeck] = await db
        .insert(flashcardDecks)
        .values({
          userId: user.id,
          name: 'Mistake Master',
          description: 'Flashcards generated from quiz mistakes for focused practice',
        })
        .returning();
      deck = newDeck;
    }

    let cardsCreated = 0;

    for (const mistake of mistakes) {
      const existingCards = await db
        .select()
        .from(flashcards)
        .where(
          and(
            eq(flashcards.deckId, deck.id),
            eq(flashcards.front, mistake.questionText.substring(0, 500))
          )
        )
        .limit(1);

      if (existingCards.length > 0) {
        continue;
      }

      const back = mistake.explanation
        ? `${mistake.correctAnswer}\n\nExplanation: ${mistake.explanation}`
        : mistake.correctAnswer;

      await db.insert(flashcards).values({
        deckId: deck.id,
        front: mistake.questionText.substring(0, 1000),
        back: back.substring(0, 2000),
        difficulty: 'medium',
        easeFactor: '2.5',
        intervalDays: 1,
        repetitions: 0,
        nextReview: new Date(),
      });

      cardsCreated++;
    }

    if (deck.cardCount !== undefined) {
      await db
        .update(flashcardDecks)
        .set({ cardCount: (deck.cardCount || 0) + cardsCreated })
        .where(eq(flashcardDecks.id, deck.id));
    }

    return { success: true, cardsCreated };
  } catch (error) {
    console.error('[Learning Loop] Error generating flashcards:', error);
    return { success: false, cardsCreated: 0, error: 'Generation failed' };
  }
}

export async function generateFlashcardsFromWeakTopics(): Promise<{
  success: boolean;
  cardsCreated: number;
  error?: string;
}> {
  try {
    const user = await ensureAuthenticated();
    const db = await getConnectedDb();

    const weakTopics = await getWeakTopicsForUser();

    if (weakTopics.length === 0) {
      return { success: true, cardsCreated: 0, error: 'no_weak_topics' };
    }

    let deck = await db.query.flashcardDecks.findFirst({
      where: eq(flashcardDecks.userId, user.id),
    });

    if (!deck) {
      const [newDeck] = await db
        .insert(flashcardDecks)
        .values({
          userId: user.id,
          name: 'Mistake Master',
          description: 'Flashcards generated from weak topics for focused practice',
        })
        .returning();
      deck = newDeck;
    }

    let cardsCreated = 0;

    for (const weakTopic of weakTopics) {
      const topicQuestions = await db
        .select()
        .from(questions)
        .where(
          and(
            eq(questions.topic, weakTopic.topic),
            eq(questions.isActive, true)
          )
        )
        .limit(5);

      for (const question of topicQuestions) {
        const existingCards = await db
          .select()
          .from(flashcards)
          .where(
            and(
              eq(flashcards.deckId, deck.id),
              eq(flashcards.front, question.questionText.substring(0, 500))
            )
          )
          .limit(1);

        if (existingCards.length > 0) continue;

        const correctOption = await db
          .select()
          .from(options)
          .where(
            and(
              eq(options.questionId, question.id),
              eq(options.isCorrect, true)
            )
          )
          .limit(1);

        if (!correctOption[0]) continue;

        const back = correctOption[0].explanation
          ? `${correctOption[0].optionText}\n\nExplanation: ${correctOption[0].explanation}`
          : correctOption[0].optionText;

        await db.insert(flashcards).values({
          deckId: deck.id,
          front: question.questionText.substring(0, 1000),
          back: back.substring(0, 2000),
          difficulty: 'medium',
          easeFactor: '2.5',
          intervalDays: 1,
          repetitions: 0,
          nextReview: new Date(),
        });

        cardsCreated++;
      }
    }

    if (deck.cardCount !== undefined) {
      await db
        .update(flashcardDecks)
        .set({ cardCount: (deck.cardCount || 0) + cardsCreated })
        .where(eq(flashcardDecks.id, deck.id));
    }

    return { success: true, cardsCreated };
  } catch (error) {
    console.error('[Learning Loop] Error generating flashcards from weak topics:', error);
    return { success: false, cardsCreated: 0, error: 'Generation failed' };
  }
}
```

- [ ] **Step 2: Verify file is created correctly**

Run: `ls -la src/lib/db/learning-loop-actions.ts`

- [ ] **Step 3: Commit**

```bash
git add src/lib/db/learning-loop-actions.ts
git commit -m "feat: add learning loop server actions for flashcard generation"
```

---

## Chunk 2: LessonComplete Screen Update

### Task 2: Add flashcard generation button to LessonComplete

**Files:**
- Modify: `src/screens/LessonComplete.tsx`

- [ ] **Step 1: Add imports for learning loop actions**

Add to the imports section (around line 21):
```typescript
import { generateFlashcardsFromMistakes, getMistakesFromStore } from '@/lib/db/learning-loop-actions';
import { Layers01Icon } from '@hugeicons/core-free-icons';
```

- [ ] **Step 2: Add state for flashcard generation**

After line 50 (after `const { completeQuiz, isCompleting } = useQuizCompletion();`):
```typescript
  const [mistakeCount, setMistakeCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<{
    success: boolean;
    cardsCreated: number;
  } | null>(null);
```

- [ ] **Step 3: Load mistake count on mount**

In the `loadResult` function (around line 90), after `setResult(quizResult);`:
```typescript
      const mistakes = await getMistakesFromStore();
      setMistakeCount(mistakes.length);
```

- [ ] **Step 4: Add flashcard generation handler**

After the `handleCheck` function would go, add:
```typescript
  const handleGenerateFlashcards = async () => {
    setIsGenerating(true);
    try {
      const result = await generateFlashcardsFromMistakes();
      setGenerationResult(result);
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
      setGenerationResult({ success: false, cardsCreated: 0 });
    } finally {
      setIsGenerating(false);
    }
  };
```

- [ ] **Step 5: Add the flashcard button to UI**

After line 256 (after the `newAchievement` AnimatePresence block, before the Level Progress section), add:
```typescript
          {mistakeCount > 0 && !generationResult && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="w-full max-w-md space-y-3 mb-8"
            >
              <Button
                variant="outline"
                className="w-full h-16 rounded-2xl text-lg font-black shadow-lg border-primary-orange/30 hover:bg-primary-orange/10 flex items-center justify-center gap-3"
                onClick={handleGenerateFlashcards}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-orange border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={Layers01Icon} className="w-6 h-6 text-primary-orange" />
                    Create Flashcards from Mistakes
                  </>
                )}
              </Button>
              <p className="text-center text-sm text-muted-foreground font-medium">
                {mistakeCount} {mistakeCount === 1 ? 'mistake' : 'mistakes'} to review
              </p>
            </m.div>
          )}

          {generationResult && (
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md space-y-3 mb-8"
            >
              <div className="bg-card p-6 rounded-[2rem] flex items-center gap-4 shadow-lg border border-green-500/20">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="font-bold text-foreground">
                    {generationResult.cardsCreated > 0
                      ? `${generationResult.cardsCreated} Flashcards Created!`
                      : 'No New Cards'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {generationResult.cardsCreated > 0
                      ? 'Added to your Mistake Master deck'
                      : 'All mistakes already have flashcards'}
                  </p>
                </div>
              </div>
            </m.div>
          )}

          {result.accuracy === 100 && mistakeCount === 0 && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="w-full max-w-md mb-8"
            >
              <div className="bg-accent-lime/10 p-4 rounded-2xl border border-accent-lime/20">
                <p className="text-center font-bold text-accent-lime">
                  Perfect Score! No mistakes to review.
                </p>
              </div>
            </m.div>
          )}
```

- [ ] **Step 6: Commit**

```bash
git add src/screens/LessonComplete.tsx
git commit -m "feat: add flashcard generation to lesson complete screen"
```

---

## Chunk 3: Dashboard Widget

### Task 3: Create Focus Areas Dashboard Widget

**Files:**
- Create: `src/components/Dashboard/FocusAreasWidget.tsx`

- [ ] **Step 1: Create the dashboard widget component**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Layers01Icon,
  Warning01Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getWeakTopicsForUser,
  generateFlashcardsFromWeakTopics,
  type WeakTopic,
} from '@/lib/db/learning-loop-actions';
import { useRouter } from 'next/navigation';

export function FocusAreasWidget() {
  const router = useRouter();
  const [weakTopics, setWeakTopics] = useState<WeakTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<{
    success: boolean;
    cardsCreated: number;
  } | null>(null);

  useEffect(() => {
    async function loadWeakTopics() {
      try {
        const topics = await getWeakTopicsForUser();
        setWeakTopics(topics);
      } catch (error) {
        console.error('Failed to load weak topics:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadWeakTopics();
  }, []);

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    try {
      const result = await generateFlashcardsFromWeakTopics();
      setGenerationResult(result);
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateForTopic = async (topic: WeakTopic) => {
    setIsGenerating(true);
    try {
      const result = await generateFlashcardsFromWeakTopics();
      setGenerationResult(result);
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 rounded-3xl bg-card border border-border/50">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      </Card>
    );
  }

  if (weakTopics.length === 0) {
    return (
      <Card className="p-6 rounded-3xl bg-card border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-foreground">Focus Areas</h3>
          <HugeiconsIcon icon={Warning01Icon} className="w-5 h-5 text-green-500" />
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-8 h-8 text-green-500" />
          </div>
          <p className="font-bold text-foreground">Great job!</p>
          <p className="text-sm text-muted-foreground">No weak topics identified</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 rounded-3xl bg-card border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-foreground">Focus Areas</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/flashcards')}
          className="text-muted-foreground hover:text-foreground"
        >
          View All
          <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {generationResult && (
        <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-sm font-medium text-green-600">
            {generationResult.cardsCreated > 0
              ? `${generationResult.cardsCreated} flashcards created!`
              : 'All topics already have flashcards'}
          </p>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {weakTopics.slice(0, 5).map((topic) => (
          <div
            key={topic.topic}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{topic.topic}</p>
              <p className="text-xs text-muted-foreground">
                {topic.masteryLevel.toFixed(0)}% mastery
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleGenerateForTopic(topic)}
              disabled={isGenerating}
              className="shrink-0 ml-2"
            >
              <HugeiconsIcon icon={Layers01Icon} className="w-4 h-4 text-primary-orange" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full rounded-xl font-bold"
        onClick={handleGenerateAll}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-orange border-t-transparent rounded-full animate-spin mr-2" />
            Generating...
          </>
        ) : (
          <>
            <HugeiconsIcon icon={Layers01Icon} className="w-4 h-4 mr-2" />
            Generate All as Flashcards
          </>
        )}
      </Button>
    </Card>
  );
}

import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
```

- [ ] **Step 2: Find where dashboard widgets are rendered**

Run: `grep -r "DashboardWidgets\|dashboard.*widget" src/ --include="*.tsx" | head -10`

- [ ] **Step 3: Add widget to dashboard**

Add the FocusAreasWidget to the dashboard page. Run: `grep -l "dashboard\|Dashboard" src/app/ --include="page.tsx" | head -5`

- [ ] **Step 4: Commit**

```bash
git add src/components/Dashboard/FocusAreasWidget.tsx
git commit -m "feat: add focus areas dashboard widget"
```

---

## Chunk 4: Testing & Integration

### Task 4: Test the complete flow

**Files:**
- Test: Manual browser testing

- [ ] **Step 1: Run typecheck**

Run: `bun run typecheck` (or check package.json for the command)

- [ ] **Step 2: Run lint**

Run: `bun run lint:fix`

- [ ] **Step 3: Test quiz completion flow**

1. Start a quiz
2. Answer some questions incorrectly
3. Complete the quiz
4. Verify flashcard generation button appears
5. Click "Create Flashcards from Mistakes"
6. Verify success message

- [ ] **Step 4: Test dashboard widget**

1. Navigate to dashboard
2. Verify Focus Areas widget appears
3. Verify weak topics are shown
4. Click "Generate All as Flashcards"
5. Navigate to flashcards to verify cards were created

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: implement automated learning loops - quiz to flashcard integration"
```

---

## Completion Criteria

- [ ] Server actions created and working
- [ ] LessonComplete screen shows flashcard generation button
- [ ] Dashboard shows Focus Areas widget
- [ ] Flashcards are created in "Mistake Master" deck
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Manual testing completed
