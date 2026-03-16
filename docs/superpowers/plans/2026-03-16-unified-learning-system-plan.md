# Unified Learning System Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect existing features into a seamless learning loop + build PWA/offline infrastructure + voice AI explanations

**Architecture:** Three-phase implementation. Phase 1 leverages existing code (Past Paper AI, Snap-to-Flashcard already exist). Phase 2 adds PWA/offline. Phase 3 adds Voice AI.

**Tech Stack:** Next.js 16, Gemini API, Web Speech API, Service Workers, Zustand, Tailwind CSS 4

---

## Chunk 1: Feature Synergies - Existing Features Validation

### Task 1: Verify Past Paper → AI Explanation Flow

**Files:**
- Modify: `src/screens/PastPaperViewer.tsx:1-80`
- Reference: `src/services/geminiService.ts`

- [ ] **Step 1: Review PastPaperViewer AI explanation flow**

Read `src/screens/PastPaperViewer.tsx` lines 50-150 to verify existing AI explanation flow.
Expected: Should find `getExplanation` calls, `showAiExplanation` state, and UI buttons.

- [ ] **Step 2: Test the flow works**

Check that the "Explain" button exists on each question.
Run: `bun run dev` and navigate to `/past-papers` → select paper → check for AI explanation button.

- [ ] **Step 3: Commit findings**

```bash
git add -A
git commit -m "chore: verify Past Paper AI explanation feature exists"
```

---

### Task 2: Verify Snap & Solve → Flashcards Flow

**Files:**
- Modify: `src/screens/SnapAndSolve.tsx:61-90`
- Reference: `src/lib/db/flashcard-actions.ts`

- [ ] **Step 1: Review SnapAndSolve flashcard save flow**

Read `src/screens/SnapAndSolve.tsx` lines 61-100.
Expected: Should find `handleSaveFlashcard` function using `saveToFlashcardsAction`.

- [ ] **Step 2: Test the flow works**

Run dev server and test Snap & Solve → verify "Save as Flashcard" button exists.

- [ ] **Step 3: Commit findings**

```bash
git commit -m "chore: verify Snap-to-Flashcard feature exists"
```

---

## Chunk 2: Feature Synergies - Mistakes to Study Plan (NEW)

### Task 3: Create Quiz Mistakes to Study Plan Integration

**Files:**
- Create: `src/lib/db/mistake-to-study-plan.ts`
- Modify: `src/screens/Quiz.tsx:177-240`
- Test: `src/__tests__/mistake-to-study-plan.test.ts`

- [ ] **Step 1: Create mistake-to-study-plan service**

```typescript
// src/lib/db/mistake-to-study-plan.ts
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { studyPlans, calendarEvents } from '@/lib/db/schema';
import { v4 as uuidv4 } from 'uuid';

interface MistakeEntry {
  topic: string;
  questionId: string;
  subject: string;
}

export async function addMistakeToStudyPlan(
  mistakes: MistakeEntry[]
): Promise<{ success: boolean; eventsAdded: number }> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const db = await dbManager.getDb();
  
  // Find active study plan or create one
  const activePlan = await db.query.studyPlans.findFirst({
    where: (plans, { eq, and }) => and(
      eq(plans.userId, session.user.id),
      eq(plans.isActive, true)
    ),
  });

  if (!activePlan) {
    return { success: false, eventsAdded: 0 };
  }

  const now = new Date();
  let eventsAdded = 0;

  for (const mistake of mistakes) {
    // Create a "Review" event for this mistake
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() + 1); // Schedule for tomorrow

    await db.insert(calendarEvents).values({
      id: uuidv4(),
      userId: session.user.id,
      studyPlanId: activePlan.id,
      title: `Review: ${mistake.topic}`,
      description: `Auto-generated from quiz mistakes. Review this topic to improve.`,
      eventType: 'study',
      startTime: eventDate,
      endTime: new Date(eventDate.getTime() + 30 * 60 * 1000), // 30 min
      isCompleted: false,
    });
    eventsAdded++;
  }

  return { success: true, eventsAdded };
}

export async function getRecentMistakes(limit = 10): Promise<MistakeEntry[]> {
  // Query questionAttempts where isCorrect = false
  // Return topic, questionId, subject
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) return [];

  const db = await dbManager.getDb();
  const attempts = await db.query.questionAttempts.findMany({
    where: (attempts, { eq, and }) => and(
      eq(attempts.userId, session.user.id),
      eq(attempts.isCorrect, false)
    ),
    orderBy: (attempts, { desc }) => [desc(attempts.attemptedAt)],
    limit,
  });

  return attempts.map(a => ({
    topic: a.topic,
    questionId: a.questionId,
    subject: a.topic.split(' ')[0] || 'General', // Extract subject from topic
  }));
}
```

- [ ] **Step 2: Write failing test**

```typescript
// src/__tests__/mistake-to-study-plan.test.ts
import { addMistakeToStudyPlan, getRecentMistakes } from '@/lib/db/mistake-to-study-plan';

describe('mistake-to-study-plan', () => {
  it('should add mistakes to study plan', async () => {
    const mistakes = [
      { topic: 'Calculus - Derivatives', questionId: 'q1', subject: 'Mathematics' },
    ];
    const result = await addMistakeToStudyPlan(mistakes);
    expect(result.success).toBe(true);
    expect(result.eventsAdded).toBe(1);
  });

  it('should get recent mistakes', async () => {
    const mistakes = await getRecentMistakes();
    expect(Array.isArray(mistakes)).toBe(true);
  });
});
```

Run: `bun test src/__tests__/mistake-to-study-plan.test.ts`
Expected: FAIL - functions don't exist yet

- [ ] **Step 3: Run test to verify it fails**

```bash
bun test src/__tests__/mistake-to-study-plan.test.ts
```
Expected: FAIL with "Cannot find module" or test failures

- [ ] **Step 4: Add the service file**

Create `src/lib/db/mistake-to-study-plan.ts` with the code from Step 1.

- [ ] **Step 5: Run test to verify it passes**

```bash
bun test src/__tests__/mistake-to-study-plan.test.ts
```
Expected: PASS

- [ ] **Step 6: Integrate into Quiz screen**

In `src/screens/Quiz.tsx`, after quiz completion (around line 188-200), add:

```typescript
// After quiz completes, check for mistakes and suggest adding to study plan
if (incorrectCount > 0) {
  // Trigger the mistake-to-study-plan flow
  // Show a prompt: "We found X topics to review. Add to Study Plan?"
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/db/mistake-to-study-plan.ts src/__tests__/mistake-to-study-plan.test.ts
git commit -m "feat: add mistake-to-study-plan integration"
```

---

### Task 4: Create Study Plan "Suggested Review" Section

**Files:**
- Modify: `src/screens/StudyPlanWizard.tsx`
- Create: `src/components/StudyPlan/SuggestedReview.tsx`

- [ ] **Step 1: Create SuggestedReview component**

```typescript
// src/components/StudyPlan/SuggestedReview.tsx
'use client';

import { useEffect, useState } from 'react';
import { getRecentMistakes } from '@/lib/db/mistake-to-study-plan';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function SuggestedReview() {
  const [mistakes, setMistakes] = useState<Array<{ topic: string; questionId: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMistakes() {
      try {
        const recent = await getRecentMistakes(5);
        setMistakes(recent);
      } catch (error) {
        console.error('Failed to load mistakes:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMistakes();
  }, []);

  if (loading || mistakes.length === 0) return null;

  return (
    <Card className="p-4 rounded-2xl border-amber-500/30 bg-amber-50 dark:bg-amber-950/30">
      <div className="flex items-center gap-2 mb-3">
        <HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-amber-500" />
        <h4 className="font-bold text-sm">Suggested Review</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Based on your recent quiz mistakes, we recommend reviewing:
      </p>
      <ul className="space-y-2">
        {mistakes.map((m, i) => (
          <li key={i} className="text-sm font-medium">
            • {m.topic}
          </li>
        ))}
      </ul>
      <Button size="sm" className="mt-4 rounded-full">
        Add to Study Plan
      </Button>
    </Card>
  );
}
```

- [ ] **Step 2: Integrate into StudyPlanWizard**

In `src/screens/StudyPlanWizard.tsx`, add `<SuggestedReview />` component after the main content.

- [ ] **Step 3: Commit**

```bash
git add src/components/StudyPlan/SuggestedReview.tsx
git commit -m "feat: add suggested review section to study plan"
```

---

## Chunk 3: PWA & Offline Infrastructure

### Task 5: Service Worker Setup

**Files:**
- Create: `public/sw.js`
- Create: `public/workbox-*.js`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create service worker**

```javascript
// public/sw.js
const CACHE_NAME = 'matricmaster-v1';
const OFFLINE_URL = '/offline';

const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/flashcards',
  '/study-plan',
  '/offline',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API calls
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache successful responses
        if (networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Return offline page for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match(OFFLINE_URL);
      }
    })
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});
```

- [ ] **Step 2: Create Web App Manifest**

```json
// public/manifest.json
{
  "name": "MatricMaster AI",
  "short_name": "MatricMaster",
  "description": "Master your Matric exams through interactive practice",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#f59e0b",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- [ ] **Step 3: Register service worker in layout**

In `src/app/layout.tsx`, add:

```typescript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js');
  }
}, []);
```

- [ ] **Step 4: Create offline fallback page**

Create `src/app/offline/page.tsx` with a simple offline message UI.

- [ ] **Step 5: Commit**

```bash
git add public/sw.js public/manifest.json src/app/offline/
git commit -m "feat: add PWA service worker and manifest"
```

---

### Task 6: Smart Caching Layer

**Files:**
- Create: `src/lib/caching/strategies.ts`
- Modify: `src/screens/Dashboard.tsx`

- [ ] **Step 1: Create caching strategies**

```typescript
// src/lib/caching/strategies.ts
const CACHE_PREFIX = 'matricmaster-cache';

export interface CacheStrategy {
  key: string;
  data: unknown;
  expiresAt: number;
}

export function setCache(key: string, data: unknown, ttlMinutes = 60): void {
  const cacheData: CacheStrategy = {
    key,
    data,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000,
  };
  localStorage.setItem(`${CACHE_PREFIX}-${key}`, JSON.stringify(cacheData));
}

export function getCache<T>(key: string): T | null {
  const stored = localStorage.getItem(`${CACHE_PREFIX}-${key}`);
  if (!stored) return null;

  try {
    const cacheData: CacheStrategy = JSON.parse(stored);
    if (Date.now() > cacheData.expiresAt) {
      localStorage.removeItem(`${CACHE_PREFIX}-${key}`);
      return null;
    }
    return cacheData.data as T;
  } catch {
    return null;
  }
}

export function preCacheStudyPlan(): void {
  // Pre-cache study plan data
  import('@/lib/db/study-plan-actions').then(({ getUserStudyPlans }) => {
    getUserStudyPlans().then((plans) => {
      setCache('study-plans', plans, 30);
    }).catch(() => {});
  });
}

export function preCacheFlashcards(): void {
  import('@/lib/api/data-source').then(({ api }) => {
    api.flashcards.getDecks().then((decks) => {
      setCache('flashcard-decks', decks, 60);
    }).catch(() => {});
  });
}
```

- [ ] **Step 2: Integrate caching into Dashboard**

In `src/screens/Dashboard.tsx`, add:

```typescript
import { preCacheStudyPlan, preCacheFlashcards } from '@/lib/caching/strategies';

useEffect(() => {
  // Pre-cache on mount
  preCacheStudyPlan();
  preCacheFlashcards();
}, []);
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/caching/
git commit -m "feat: add smart caching layer"
```

---

## Chunk 4: Voice AI Explanations

### Task 7: Voice Explanation Component

**Files:**
- Create: `src/components/AI/VoiceExplanation.tsx`
- Modify: `src/screens/PastPaperViewer.tsx`
- Modify: `src/screens/Quiz.tsx`

- [ ] **Step 1: Create VoiceExplanation component**

```typescript
// src/components/AI/VoiceExplanation.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { VolumeHighIcon, PauseIcon, StopIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { cn } from '@/lib/utils';

interface VoiceExplanationProps {
  text: string;
  className?: string;
}

type PlaybackSpeed = 1 | 1.5 | 2;

export function VoiceExplanation({ text, className }: VoiceExplanationProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
    
    // Load voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      setVoice(englishVoice);
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = () => {
    if (!isSupported || !text) return;
    
    window.speechSynthesis.cancel();
    
    const utt = new SpeechSynthesisUtterance(text);
    utt.voice = voice;
    utt.rate = speed;
    utt.pitch = 1;
    
    utt.onend = () => setIsPlaying(false);
    utt.onerror = () => setIsPlaying(false);
    
    setUtterance(utt);
    window.speechSynthesis.speak(utt);
    setIsPlaying(true);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const toggleSpeed = () => {
    const speeds: PlaybackSpeed[] = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSpeed(speeds[nextIndex]);
  };

  if (!isSupported) return null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!isPlaying ? (
        <Button
          size="sm"
          variant="outline"
          className="rounded-full gap-2"
          onClick={speak}
        >
          <HugeiconsIcon icon={VolumeHighIcon} className="w-4 h-4" />
          Listen
        </Button>
      ) : (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="rounded-full" onClick={pause}>
            <HugeiconsIcon icon={PauseIcon} className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" className="rounded-full" onClick={stop}>
            <HugeiconsIcon icon={StopIcon} className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      <Button
        size="sm"
        variant="ghost"
        className="text-xs"
        onClick={toggleSpeed}
      >
        {speed}x
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Integrate into PastPaperViewer**

In `src/screens/PastPaperViewer.tsx`, after the AI explanation text, add:

```typescript
import { VoiceExplanation } from '@/components/AI/VoiceExplanation';

// After AI explanation is displayed:
{aiExplanation && (
  <div className="mt-4">
    <VoiceExplanation text={aiExplanation} />
  </div>
)}
```

- [ ] **Step 3: Integrate into Quiz**

In `src/screens/Quiz.tsx`, in the `AIExplanation` component area, add `VoiceExplanation`.

- [ ] **Step 4: Test voice**

Run dev server and test the Listen button on Past Papers and Quiz.

- [ ] **Step 5: Commit**

```bash
git add src/components/AI/VoiceExplanation.tsx
git commit -m "feat: add voice explanation component"
```

---

## Chunk 5: Integration & Polish

### Task 8: Dashboard "Learning Loop" Summary

**Files:**
- Modify: `src/screens/Dashboard.tsx`

- [ ] **Step 1: Add Learning Loop indicator to Dashboard**

Add a section showing:
- "X flashcards due for review"
- "Y mistakes to review"
- Quick actions to access each

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add learning loop summary to dashboard"
```

---

### Task 9: Final Testing & Verification

- [ ] **Step 1: Run full test suite**

```bash
bun test
```

- [ ] **Step 2: Run linting**

```bash
bun run lint:fix
```

- [ ] **Step 3: Run typecheck**

```bash
bun run typecheck
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete unified learning system implementation"
```

---

**Plan complete.** Ready to execute?
