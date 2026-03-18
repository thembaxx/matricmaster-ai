# Offline Mode Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement robust offline mode that caches next 3 study tasks and provides Quick Tips database for South African students during load-shedding.

**Architecture:** Use IndexedDB (via idb library) for persistent client-side storage. Background fetch next 3 tasks from study plan API. Pre-generate static tips stored in IndexedDB for offline access.

**Tech Stack:** IndexedDB (idb), React Context for offline state, existing offline.ts utilities

---

## File Structure

### New Files
- `src/lib/offline/task-cache.ts` - Task caching logic
- `src/lib/offline/quick-tips.ts` - Quick tips database
- `src/contexts/OfflineContext.tsx` - Offline state management
- `src/components/ui/offline-indicator.tsx` - Connection status component
- `src/data/quick-tips.json` - Pre-generated tips data

### Modified Files
- `src/lib/offline.ts` - Extend existing utilities
- `src/app/offline/page.tsx` - Enhance offline page UI
- `src/app/layout.tsx` - Add offline indicator
- `src/screens/StudyPlanWizard.tsx` - Add task caching triggers

---

## Task 1: Quick Tips Database

**Files:**
- Create: `src/data/quick-tips.json`
- Create: `src/lib/offline/quick-tips.ts`
- Test: Manual verification

- [ ] **Step 1: Create quick-tips.json data file**

```json
{
  "tips": [
    {
      "id": "math-grade11-algebra-1",
      "subject": "Mathematics",
      "topic": "Algebra",
      "grade": 11,
      "title": "Factorising Quadratics",
      "content": "When factorising ax² + bx + c = 0, find two numbers that multiply to ac and add to b.",
      "priority": 1
    },
    {
      "id": "math-grade12-calculus-1",
      "subject": "Mathematics", 
      "topic": "Calculus",
      "grade": 12,
      "title": "Differentiation Rules",
      "content": "Power rule: d/dx(xⁿ) = nxⁿ⁻¹. Product rule: (fg)' = f'g + fg'",
      "priority": 1
    },
    {
      "id": "phys-grade11-mechanics-1",
      "subject": "Physical Sciences",
      "topic": "Mechanics",
      "grade": 11,
      "title": "Newton's Second Law",
      "content": "F = ma. Force equals mass times acceleration. Units: Newton (N) = kg·m/s²",
      "priority": 1
    },
    {
      "id": "phys-grade12-electrostatics-1",
      "subject": "Physical Sciences",
      "topic": "Electrostatics",
      "grade": 12,
      "title": "Coulomb's Law",
      "content": "F = kq₁q₂/r². Force between two charges is proportional to product of charges and inversely proportional to square of distance.",
      "priority": 1
    },
    {
      "id": "chem-grade11-matter-1",
      "subject": "Physical Sciences",
      "topic": "Matter",
      "grade": 11,
      "title": "Atomic Structure",
      "content": "Protons determine element identity, neutrons add mass, electrons determine reactivity.",
      "priority": 1
    },
    {
      "id": "eng-grade12-literature-1",
      "subject": "English",
      "topic": "Literature",
      "grade": 12,
      "title": "Essay Structure",
      "content": "PQE: Point, Quote, Explanation. State your point, support with evidence, explain how it answers the question.",
      "priority": 1
    }
  ]
}
```

- [ ] **Step 2: Create quick-tips.ts module**

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface QuickTip {
  id: string;
  subject: string;
  topic: string;
  grade: number;
  title: string;
  content: string;
  priority: number;
}

interface QuickTipsDB extends DBSchema {
  tips: {
    key: string;
    value: QuickTip;
    indexes: { 'by-subject': string };
  };
}

let dbPromise: Promise<IDBPDatabase<QuickTipsDB>> | null = null;

async function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<QuickTipsDB>('matricmaster-tips', 1, {
      upgrade(db) {
        const store = db.createObjectStore('tips', { keyPath: 'id' });
        store.createIndex('by-subject', 'subject');
      },
    });
  }
  return dbPromise;
}

export async function initQuickTips(tips: QuickTip[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('tips', 'readwrite');
  await Promise.all(tips.map((tip) => tx.store.put(tip)));
  await tx.done;
}

export async function getTipsBySubject(subject: string): Promise<QuickTip[]> {
  const db = await getDB();
  return db.getAllFromIndex('tips', 'by-subject', subject);
}

export async function getAllTips(): Promise<QuickTip[]> {
  const db = await getDB();
  return db.getAll('tips');
}

export async function searchTips(query: string): Promise<QuickTip[]> {
  const all = await getAllTips();
  const lower = query.toLowerCase();
  return all.filter(
    (tip) =>
      tip.topic.toLowerCase().includes(lower) ||
      tip.title.toLowerCase().includes(lower) ||
      tip.content.toLowerCase().includes(lower)
  );
}

export { QuickTip };
```

- [ ] **Step 3: Verify file creation**
  Run: `ls src/lib/offline/ src/data/quick-tips.json`

- [ ] **Step 4: Commit**
  ```
  git add src/lib/offline/quick-tips.ts src/data/quick-tips.json
  git commit -m "feat(offline): add quick tips database structure"
  ```

---

## Task 2: Task Caching System

**Files:**
- Create: `src/lib/offline/task-cache.ts`
- Modify: `src/lib/offline.ts`
- Test: Manual verification with study plan

- [ ] **Step 1: Create task-cache.ts module**

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface CachedTask {
  id: string;
  title: string;
  description: string;
  subject: string;
  topic: string;
  type: 'lesson' | 'quiz' | 'flashcards' | 'past-paper';
  content?: string;
  flashcards?: { front: string; back: string }[];
  completed: boolean;
  cachedAt: number;
}

interface TaskCacheDB extends DBSchema {
  tasks: {
    key: string;
    value: CachedTask;
    indexes: { 'by-subject': string; 'by-completed': number };
  };
  syncQueue: {
    key: string;
    value: { action: string; data: unknown; timestamp: number };
  };
}

let dbPromise: Promise<IDBPDatabase<TaskCacheDB>> | null = null;

async function getTaskDB() {
  if (!dbPromise) {
    dbPromise = openDB<TaskCacheDB>('matricmaster-tasks', 1, {
      upgrade(db) {
        const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
        taskStore.createIndex('by-subject', 'subject');
        taskStore.createIndex('by-completed', 'completed');
        db.createObjectStore('syncQueue', { keyPath: 'action' });
      },
    });
  }
  return dbPromise;
}

export async function cacheTasks(tasks: CachedTask[]): Promise<void> {
  const db = await getTaskDB();
  const tx = db.transaction('tasks', 'readwrite');
  await Promise.all(tasks.map((task) => tx.store.put({ ...task, cachedAt: Date.now() })));
  await tx.done;
}

export async function getCachedTasks(): Promise<CachedTask[]> {
  const db = await getTaskDB();
  return db.getAll('tasks');
}

export async function getCachedTasksBySubject(subject: string): Promise<CachedTask[]> {
  const db = await getTaskDB();
  return db.getAllFromIndex('tasks', 'by-subject', subject);
}

export async function updateTaskCompletion(taskId: string, completed: boolean): Promise<void> {
  const db = await getTaskDB();
  const task = await db.get('tasks', taskId);
  if (task) {
    task.completed = completed;
    await db.put('tasks', task);
  }
}

export async function clearOldTasks(): Promise<void> {
  const db = await getTaskDB();
  const tasks = await db.getAll('tasks');
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  
  const tx = db.transaction('tasks', 'readwrite');
  for (const task of tasks) {
    if (now - task.cachedAt > 7 * DAY_MS) {
      await tx.store.delete(task.id);
    }
  }
  await tx.done;
}

export async function getCachedTaskCount(): Promise<number> {
  const db = await getTaskDB();
  return db.count('tasks');
}

export async function addToSyncQueue(action: string, data: unknown): Promise<void> {
  const db = await getTaskDB();
  await db.put('syncQueue', { action, data, timestamp: Date.now() });
}

export async function getSyncQueue(): Promise<{ action: string; data: unknown; timestamp: number }[]> {
  const db = await getTaskDB();
  return db.getAll('syncQueue');
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getTaskDB();
  await db.clear('syncQueue');
}

export { CachedTask };
```

- [ ] **Step 2: Extend offline.ts with new functions**

Add to `src/lib/offline.ts`:

```typescript
import { cacheTasks, getCachedTasks, getCachedTaskCount } from './offline/task-cache';
import { initQuickTips, getTipsBySubject, getAllTips, QuickTip } from './offline/quick-tips';
import quickTipsData from '@/data/quick-tips.json';

export async function initializeOfflineData(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  // Initialize quick tips
  const tips = await getAllTips();
  if (tips.length === 0) {
    await initQuickTips(quickTipsData.tips);
  }
}

export async function prefetchNextTasks(tasks: CachedTask[]): Promise<void> {
  await cacheTasks(tasks.slice(0, 3));
}

export { getCachedTasks, getCachedTaskCount, getTipsBySubject, getAllTips, CachedTask, QuickTip };
```

- [ ] **Step 3: Verify imports work**
  Run: `bun run typecheck`

- [ ] **Step 4: Commit**
  ```
  git add src/lib/offline/task-cache.ts src/lib/offline.ts
  git commit -m "feat(offline): add task caching system"
  ```

---

## Task 3: Offline Context & State Management

**Files:**
- Create: `src/contexts/OfflineContext.tsx`
- Modify: `src/app/layout.tsx`
- Test: Check offline indicator appears

- [ ] **Step 1: Create OfflineContext.tsx**

```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { isOffline } from '@/lib/offline';
import { getCachedTaskCount } from '@/lib/offline/task-cache';
import { initializeOfflineData } from '@/lib/offline';

interface OfflineContextType {
  isOffline: boolean;
  cachedTaskCount: number;
  isSyncing: boolean;
}

const OfflineContext = createContext<OfflineContextType>({
  isOffline: false,
  cachedTaskCount: 0,
  isSyncing: false,
});

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [offline, setOffline] = useState(false);
  const [cachedCount, setCachedCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    initializeOfflineData().then(async () => {
      const count = await getCachedTaskCount();
      setCachedCount(count);
    });

    setOffline(!navigator.onLine);

    const handleOnline = async () => {
      setOffline(false);
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 1000);
    };
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(async () => {
      const count = await getCachedTaskCount();
      setCachedCount(count);
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isOffline: offline, cachedTaskCount: cachedCount, isSyncing }}>
      {children}
    </OfflineContext.Provider>
  );
}

export const useOffline = () => useContext(OfflineContext);
```

- [ ] **Step 2: Create OfflineIndicator component**

```typescript
'use client';

import { useOffline } from '@/contexts/OfflineContext';
import { Wifi01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function OfflineIndicator() {
  const { isOffline, cachedTaskCount, isSyncing } = useOffline();

  if (!isOffline && !isSyncing) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className={`
        mx-auto max-w-md px-4 py-2 rounded-lg flex items-center justify-center gap-2
        ${isOffline 
          ? 'bg-black/80 text-white dark:bg-white/90 dark:text-black' 
          : 'bg-green-600 text-white'}
      `}>
        <HugeiconsIcon 
          icon={isOffline ? Wifi01Icon : CheckmarkCircle02Icon} 
          className="w-4 h-4" 
        />
        <span className="text-sm font-medium">
          {isOffline 
            ? `Offline • ${cachedTaskCount} tasks available` 
            : 'Syncing...'}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update layout.tsx to include provider**

Modify `src/app/layout.tsx`:
- Import `OfflineProvider` and wrap children
- Add `<OfflineIndicator />` above the navbar

- [ ] **Step 4: Verify components render**
  Run: `bun run dev` and check browser console for errors

- [ ] **Step 5: Commit**
  ```
  git add src/contexts/OfflineContext.tsx src/components/ui/offline-indicator.tsx src/app/layout.tsx
  git commit -m "feat(offline): add offline context and indicator"
  ```

---

## Task 4: Integrate with Study Plan

**Files:**
- Modify: `src/screens/StudyPlanWizard.tsx`
- Modify: `src/screens/Dashboard.tsx`
- Test: Complete task, verify cache refreshes

- [ ] **Step 1: Add task caching trigger to StudyPlanWizard**

In `StudyPlanWizard.tsx`, after a task is completed:
```typescript
import { prefetchNextTasks } from '@/lib/offline';
import { CachedTask } from '@/lib/offline/task-cache';

// After completing a task:
const handleTaskComplete = async (taskId: string) => {
  // ... existing completion logic
  
  // Cache next 3 tasks
  const upcomingTasks = getUpcomingTasks(); // existing function
  const tasksToCache: CachedTask[] = upcomingTasks.slice(0, 3).map(t => ({
    id: t.id,
    title: t.title,
    description: t.description,
    subject: t.subject,
    topic: t.topic,
    type: t.type as CachedTask['type'],
    completed: false,
    cachedAt: Date.now(),
  }));
  await prefetchNextTasks(tasksToCache);
};
```

- [ ] **Step 2: Add offline badge to task cards**

In Dashboard task cards, add offline indicator:
```typescript
// When rendering task cards:
{cachedTasks.includes(task.id) && (
  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
    Available Offline
  </span>
)}
```

- [ ] **Step 3: Test cache refresh behavior**
  Run: Complete 3 tasks, check IndexedDB in browser DevTools

- [ ] **Step 4: Commit**
  ```
  git add src/screens/StudyPlanWizard.tsx src/screens/Dashboard.tsx
  git commit -m "feat(offline): integrate task caching with study plan"
  ```

---

## Task 5: Offline Page Enhancement

**Files:**
- Modify: `src/app/offline/page.tsx`
- Test: Verify enhanced offline experience

- [ ] **Step 1: Enhance offline page with Quick Tips panel**

In `src/app/offline/page.tsx`, add Quick Tips section:
```typescript
import { getTipsBySubject } from '@/lib/offline/quick-tips';
import { useEffect, useState } from 'react';

// Add to component:
const [tips, setTips] = useState<QuickTip[]>([]);

useEffect(() => {
  async function loadTips() {
    const subjectTips = await getTipsBySubject('Mathematics'); // Or get from context
    setTips(subjectTips.slice(0, 5));
  }
  loadTips();
}, []);

// Add to JSX, after existing content:
{tips.length > 0 && (
  <div className="mt-4">
    <h3 className="font-semibold mb-2">Quick Tips (Offline)</h3>
    {tips.map((tip) => (
      <div key={tip.id} className="p-3 bg-muted rounded-lg mb-2">
        <p className="font-medium">{tip.title}</p>
        <p className="text-sm text-muted-foreground">{tip.content}</p>
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 2: Commit**
  ```
  git add src/app/offline/page.tsx
  git commit -m "feat(offline): enhance offline page with quick tips"
  ```

---

## Task 6: Final Verification

**Files:**
- Test: Full offline flow

- [ ] **Step 1: Test offline flow**
  1. Go online, complete a few study tasks
  2. Open DevTools > Application > IndexedDB to verify cached data
  3. Disconnect network (or use Chrome DevTools offline mode)
  4. Navigate to dashboard - should show cached tasks
  5. Navigate to offline page - should show Quick Tips

- [ ] **Step 2: Run typecheck and lint**
  Run: `bun run typecheck && bun run lint`

- [ ] **Step 3: Final commit**
  ```
  git add -A
  git commit -m "feat: implement offline mode with task caching and quick tips"
  ```

---

## Summary

This plan implements:
1. Quick Tips database with pre-generated study tips
2. Task caching system for next 3 study tasks  
3. Offline context and indicator UI
4. Study plan integration for auto-caching
5. Enhanced offline page

**Estimated total tasks:** 6 major tasks, ~20 steps
