# Morning Briefing Timeline Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visual Timeline of the day's study tasks to the BriefingGreeting component

**Architecture:** Extend BriefingGreeting to accept scheduled tasks and display them in a horizontal timeline with time slots, subjects, and completion status

**Tech Stack:** Next.js 16, React, Tailwind CSS, Framer Motion, shadcn/ui

---

## Overview

This plan adds a visual "Timeline" showing today's scheduled study tasks directly in the BriefingGreeting component on the Dashboard. The timeline will show:
- Time slots for each task
- Subject icons and colors
- Duration estimates
- Completion status

---

## File Structure

- **Modify:** `src/components/Dashboard/BriefingGreeting.tsx` - Add timeline display
- **Modify:** `src/screens/Dashboard.tsx` - Pass timeline data to BriefingGreeting
- **New:** `src/types/timeline.ts` - Timeline types

---

## Implementation Steps

### Task 1: Create Timeline Types

**Files:**
- Create: `src/types/timeline.ts`

- [ ] **Step 1: Create timeline types**

```typescript
// src/types/timeline.ts

export interface TimelineTask {
  id: string;
  title: string;
  subject: string;
  subjectEmoji: string;
  subjectColor: string;
  startTime: string;
  endTime: string;
  duration: number;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface TimelineData {
  date: string;
  tasks: TimelineTask[];
  totalTasks: number;
  completedTasks: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/timeline.ts
git commit -m "feat: add timeline types"
```

---

### Task 2: Update BriefingGreeting Props & Add Timeline

**Files:**
- Modify: `src/components/Dashboard/BriefingGreeting.tsx`

- [ ] **Step 1: Update imports**

Add import for TimelineTask type and necessary icons:

```typescript
import { 
  Calendar01Icon, 
  Clock01Icon, 
  SparklesIcon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { TrendingUp, CheckCircle2, Circle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NotificationBell } from '@/components/Notifications/NotificationBell';
import type { TimelineTask } from '@/types/timeline';
```

- [ ] **Step 2: Update interface to include timeline data**

```typescript
interface BriefingGreetingProps {
  userName?: string | null;
  completedCount: number;
  totalCount: number;
  streakDays: number;
  suggestedSubject?: string | null;
  timelineTasks?: TimelineTask[];  // NEW: Add timeline tasks prop
}
```

- [ ] **Step 3: Update component to receive timeline data**

```typescript
export function BriefingGreeting({
  userName,
  completedCount,
  totalCount,
  streakDays,
  suggestedSubject,
  timelineTasks = [],  // NEW: Default to empty array
}: BriefingGreetingProps) {
```

- [ ] **Step 4: Add timeline rendering after the cards row**

Find the closing `</div>` after the cards row (line ~160) and add the timeline section:

```tsx
{/* Timeline Section - Only show if there are tasks */}
{timelineTasks.length > 0 && (
  <m.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="mt-6"
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-bold text-tiimo-gray-muted uppercase tracking-widest flex items-center gap-2">
        <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4" />
        Today's Timeline
      </h3>
      <span className="text-xs font-medium text-muted-foreground">
        {timelineTasks.filter(t => t.completed).length}/{timelineTasks.length} completed
      </span>
    </div>
    
    {/* Horizontal Timeline */}
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary" />
      
      {/* Timeline Items */}
      <div className="flex justify-between relative">
        {timelineTasks.map((task, index) => (
          <m.div
            key={task.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex flex-col items-center cursor-pointer group"
          >
            {/* Time Label */}
            <span className="text-[10px] font-bold text-muted-foreground mb-2">
              {task.startTime}
            </span>
            
            {/* Circle Indicator */}
            <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all group-hover:scale-110 ${
              task.completed 
                ? 'bg-tiimo-green text-white' 
                : `${task.subjectColor} text-white`
            }`}>
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <span className="text-lg">{task.subjectEmoji}</span>
              )}
            </div>
            
            {/* Task Title */}
            <div className="mt-3 text-center max-w-[80px]">
              <p className={`text-xs font-semibold line-clamp-2 ${
                task.completed ? 'text-muted-foreground line-through' : 'text-foreground'
              }`}>
                {task.title}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {task.duration} min
              </p>
            </div>
            
            {/* Connector Line */}
            {index < timelineTasks.length - 1 && (
              <div className="absolute top-5 -right-1/2 w-[calc(100%-20px)] h-0.5 bg-transparent" />
            )}
          </m.div>
        ))}
      </div>
    </div>
    
    {/* Progress Bar */}
    <div className="mt-4">
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
        <m.div
          initial={{ width: 0 }}
          animate={{ 
            width: `${timelineTasks.length > 0 
              ? (timelineTasks.filter(t => t.completed).length / timelineTasks.length) * 100 
              : 0}%` 
          }}
          className="h-full bg-tiimo-green"
        />
      </div>
    </div>
  </m.div>
)}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Dashboard/BriefingGreeting.tsx
git commit -m "feat: add timeline to BriefingGreeting"
```

---

### Task 3: Update Dashboard to Pass Timeline Data

**Files:**
- Modify: `src/screens/Dashboard.tsx`

- [ ] **Step 1: Import TimelineTask type**

```typescript
import { type TimelineTask } from '@/types/timeline';
```

- [ ] **Step 2: Create sample timeline data for demo**

Add after the DEMO_TASKS constant:

```typescript
const DEMO_TIMELINE: TimelineTask[] = [
  {
    id: 't1',
    title: 'Calculus',
    subject: 'Mathematics',
    subjectEmoji: '🧮',
    subjectColor: 'bg-tiimo-yellow',
    startTime: '08:00',
    endTime: '09:00',
    duration: 60,
    completed: true,
    priority: 'high',
  },
  {
    id: 't2',
    title: 'Mechanics',
    subject: 'Physics',
    subjectEmoji: '⚛️',
    subjectColor: 'bg-tiimo-blue',
    startTime: '10:00',
    endTime: '11:00',
    duration: 60,
    completed: false,
    priority: 'high',
  },
  {
    id: 't3',
    title: 'Essay Review',
    subject: 'English',
    subjectEmoji: '📝',
    subjectColor: 'bg-tiimo-lavender',
    startTime: '13:00',
    endTime: '14:00',
    duration: 60,
    completed: false,
    priority: 'medium',
  },
  {
    id: 't4',
    title: 'Cell Biology',
    subject: 'Life Sciences',
    subjectEmoji: '🧬',
    subjectColor: 'bg-tiimo-green',
    startTime: '15:00',
    endTime: '16:00',
    duration: 60,
    completed: false,
    priority: 'medium',
  },
];
```

- [ ] **Step 3: Update BriefingGreeting usage in Dashboard**

Find the BriefingGreeting component call and add the timelineTasks prop:

```tsx
<BriefingGreeting
  userName={session?.user?.name}
  completedCount={completedCount}
  totalCount={totalCount}
  streakDays={streak.currentStreak}
  suggestedSubject={suggestedSubject}
  timelineTasks={DEMO_TIMELINE}
/>
```

- [ ] **Step 4: Commit**

```bash
git add src/screens/Dashboard.tsx
git commit -m "feat: pass timeline data to BriefingGreeting"
```

---

## Verification

- [ ] Run the development server: `bun run dev`
- [ ] Navigate to Dashboard
- [ ] Verify the timeline appears below the greeting cards
- [ ] Check that completed tasks show checkmarks
- [ ] Verify progress bar updates based on completion
- [ ] Check responsiveness on mobile

---

## Future Enhancements (Out of Scope)

This plan focuses on the core timeline display. Future enhancements could include:
- Connect to real schedule data from useScheduleStore
- Add click-to-navigate to specific tasks
- Add drag-and-drop reordering
- Show AI-generated task suggestions
- Integrate with APS engine for priority ranking

