# Smart Scheduler Implementation Plan

> **For agentic workers:** Execute this plan step by step. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a hybrid AI-powered study calendar with exam countdown and drag-drop scheduling

**Architecture:** 
- React components with Zustand store for state management
- API routes for AI scheduling and block CRUD operations
- Leverage existing `calendarEvents` table with new smart scheduler extensions
- Gemini API for intelligent schedule generation

**Tech Stack:** Next.js 16, Zustand, Radix UI, Gemini API, date-fns

---

## File Structure

### New Files to Create

1. **Types:** `src/types/smart-scheduler.ts`
   - StudyBlock, ExamCountdown, AISuggestion interfaces

2. **Store:** `src/stores/useSmartSchedulerStore.ts`
   - Calendar view state (current week, selected day)
   - Study blocks
   - AI suggestions
   - Exam countdowns

3. **Service:** `src/services/scheduleAIService.ts`
   - Generate study blocks from user context
   - Optimize schedule based on performance
   - Conflict detection

4. **Components:**
   - `src/components/SmartScheduler/CalendarView.tsx`
   - `src/components/SmartScheduler/WeekView.tsx`
   - `src/components/SmartScheduler/DayView.tsx`
   - `src/components/SmartScheduler/StudyBlockCard.tsx`
   - `src/components/SmartScheduler/BlockEditor.tsx`
   - `src/components/SmartScheduler/ExamCountdownPanel.tsx`
   - `src/components/SmartScheduler/AISuggestionsPanel.tsx`

5. **API Routes:**
   - `src/app/api/smart-scheduler/generate/route.ts`
   - `src/app/api/smart-scheduler/blocks/route.ts`
   - `src/app/api/smart-scheduler/optimize/route.ts`

6. **Page:** `src/app/smart-scheduler/page.tsx`

---

## Implementation Tasks

### Task 1: Create Types and Store

**Files:**
- Create: `src/types/smart-scheduler.ts`
- Create: `src/stores/useSmartSchedulerStore.ts`

- [ ] **Step 1: Create types file**

```typescript
// src/types/smart-scheduler.ts

export interface StudyBlock {
  id: string;
  subject: string;
  subjectId?: number;
  topic?: string;
  date: Date;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  duration: number;  // minutes
  type: 'study' | 'review' | 'practice' | 'break';
  isCompleted: boolean;
  isAISuggested: boolean;
  calendarEventId?: string;
}

export interface ExamCountdown {
  id: string;
  subject: string;
  subjectId?: number;
  date: Date;
  daysRemaining: number;
  priority: 'high' | 'medium' | 'low';
}

export interface AISuggestion {
  id: string;
  type: 'add' | 'reschedule' | 'remove';
  block: Partial<StudyBlock>;
  reason: string;
  confidence: number; // 0-1
}

export interface SmartSchedulerState {
  // View state
  currentWeek: Date;
  selectedDate: Date;
  viewMode: 'week' | 'day';
  
  // Data
  blocks: StudyBlock[];
  suggestions: AISuggestion[];
  exams: ExamCountdown[];
  
  // Loading states
  isLoading: boolean;
  isGenerating: boolean;
  
  // Actions
  setCurrentWeek: (date: Date) => void;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'week' | 'day') => void;
  setBlocks: (blocks: StudyBlock[]) => void;
  addBlock: (block: StudyBlock) => void;
  updateBlock: (id: string, updates: Partial<StudyBlock>) => void;
  removeBlock: (id: string) => void;
  toggleBlockComplete: (id: string) => void;
  setSuggestions: (suggestions: AISuggestion[]) => void;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  setExams: (exams: ExamCountdown[]) => void;
  setLoading: (loading: boolean) => void;
  setGenerating: (generating: boolean) => void;
  loadSchedule: () => Promise<void>;
  generateSchedule: () => Promise<void>;
  optimizeSchedule: () => Promise<void>;
}
```

- [ ] **Step 2: Create Zustand store**

```typescript
// src/stores/useSmartSchedulerStore.ts
import { create } from 'zustand';
import { startOfWeek, addDays, format } from 'date-fns';
import type { StudyBlock, ExamCountdown, AISuggestion, SmartSchedulerState } from '@/types/smart-scheduler';

export const useSmartSchedulerStore = create<SmartSchedulerState>((set, get) => ({
  // Initial state
  currentWeek: startOfWeek(new Date(), { weekStartsOn: 1 }),
  selectedDate: new Date(),
  viewMode: 'week',
  blocks: [],
  suggestions: [],
  exams: [],
  isLoading: false,
  isGenerating: false,

  // Actions
  setCurrentWeek: (date) => set({ currentWeek: date }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setBlocks: (blocks) => set({ blocks }),
  
  addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
  
  updateBlock: (id, updates) => set((state) => ({
    blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
  })),
  
  removeBlock: (id) => set((state) => ({
    blocks: state.blocks.filter((b) => b.id !== id),
  })),
  
  toggleBlockComplete: (id) => set((state) => ({
    blocks: state.blocks.map((b) => 
      b.id === id ? { ...b, isCompleted: !b.isCompleted } : b
    ),
  })),
  
  setSuggestions: (suggestions) => set({ suggestions }),
  
  acceptSuggestion: (id) => {
    const { suggestions, addBlock } = get();
    const suggestion = suggestions.find((s) => s.id === id);
    if (suggestion) {
      const newBlock: StudyBlock = {
        id: crypto.randomUUID(),
        subject: suggestion.block.subject || '',
        topic: suggestion.block.topic,
        date: suggestion.block.date || new Date(),
        startTime: suggestion.block.startTime || '09:00',
        endTime: suggestion.block.endTime || '10:00',
        duration: suggestion.block.duration || 60,
        type: suggestion.block.type || 'study',
        isCompleted: false,
        isAISuggested: true,
      };
      addBlock(newBlock);
      set((state) => ({
        suggestions: state.suggestions.filter((s) => s.id !== id),
      }));
    }
  },
  
  dismissSuggestion: (id) => set((state) => ({
    suggestions: state.suggestions.filter((s) => s.id !== id),
  })),
  
  setExams: (exams) => set({ exams }),
  setLoading: (loading) => set({ isLoading: loading }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  
  loadSchedule: async () => {
    const { currentWeek } = get();
    set({ isLoading: true });
    try {
      const weekStr = format(currentWeek, 'yyyy-II');
      const response = await fetch(`/api/smart-scheduler/blocks?week=${weekStr}`);
      const data = await response.json();
      set({ blocks: data.blocks || [], exams: data.exams || [] });
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  generateSchedule: async () => {
    set({ isGenerating: true });
    try {
      const response = await fetch('/api/smart-scheduler/generate', {
        method: 'POST',
      });
      const data = await response.json();
      set({ 
        blocks: data.blocks || [],
        suggestions: data.suggestions || [],
      });
    } catch (error) {
      console.error('Failed to generate schedule:', error);
    } finally {
      set({ isGenerating: false });
    }
  },
  
  optimizeSchedule: async () => {
    const { blocks } = get();
    set({ isGenerating: true });
    try {
      const completedBlocks = blocks.filter((b) => b.isCompleted).map((b) => b.id);
      const response = await fetch('/api/smart-scheduler/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completedBlocks }),
      });
      const data = await response.json();
      set((state) => ({
        blocks: [...state.blocks.filter((b) => !completedBlocks.includes(b.id)), ...data.rescheduled],
        suggestions: data.newSuggestions || [],
      }));
    } catch (error) {
      console.error('Failed to optimize schedule:', error);
    } finally {
      set({ isGenerating: false });
    }
  },
}));
```

---

### Task 2: Create AI Scheduling Service

**Files:**
- Create: `src/services/scheduleAIService.ts`

- [ ] **Step 1: Create the AI scheduling service**

```typescript
// src/services/scheduleAIService.ts
'use server';

import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { calendarEvents, topicConfidence, conceptStruggles, subjects } from '@/lib/db/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
import { addDays, startOfWeek, format, differenceInDays, setHours, setMinutes } from 'date-fns';
import type { StudyBlock, ExamCountdown, AISuggestion } from '@/types/smart-scheduler';

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': '#3b82f6',
  'Physical Sciences': '#10b981',
  'Life Sciences': '#8b5cf6',
  'Geography': '#f59e0b',
  'History': '#ef4444',
  'English': '#06b6d4',
  'Afrikaans': '#84cc16',
};

async function getDb() {
  const connected = await dbManager.waitForConnection(3, 2000);
  if (!connected) throw new Error('Database not available');
  return dbManager.getDb();
}

export async function getWeakAreas(): Promise<{ topic: string; score: number }[]> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) return [];

  const db = await getDb();
  const confidence = await db.query.topicConfidence.findMany({
    where: eq(topicConfidence.userId, session.user.id),
    orderBy: [asc(topicConfidence.confidenceScore)],
    limit: 10,
  });

  return confidence.map((c) => ({
    topic: c.topic,
    score: Number.parseFloat(String(c.confidenceScore)),
  }));
}

export async function getExamCountdowns(): Promise<ExamCountdown[]> {
  // Placeholder - would integrate with exam dates when available
  // For now, return empty array
  return [];
}

export function generateStudyBlocks(
  weakAreas: { topic: string; score: number }[],
  examCountdowns: ExamCountdown[],
  weeklyHours: number = 20
): StudyBlock[] {
  const blocks: StudyBlock[] = [];
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  
  // Distribute study time across weak areas
  const totalScore = weakAreas.reduce((sum, w) => sum + (1 - w.score), 0);
  
  for (let day = 0; day < 5; day++) { // Mon-Fri
    const date = addDays(weekStart, day);
    let dayMinutes = weeklyHours * 60 / 5; // Equal distribution
    
    for (const weakArea of weakAreas.slice(0, 3)) {
      if (dayMinutes <= 0) break;
      
      const sessionDuration = Math.min(90, Math.max(25, Math.round(dayMinutes * (1 - weakArea.score) / totalScore)));
      const startHour = 9 + (blocks.filter(b => format(new Date(b.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')).length * 2);
      
      if (startHour >= 21) continue;
      
      blocks.push({
        id: crypto.randomUUID(),
        subject: weakArea.topic.split(' ')[0] || 'General', // Simplified
        topic: weakArea.topic,
        date,
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${(startHour + Math.floor(sessionDuration / 60)).toString().padStart(2, '0')}:${(sessionDuration % 60).toString().padStart(2, '0')}`,
        duration: sessionDuration,
        type: weakArea.score < 0.5 ? 'study' : 'practice',
        isCompleted: false,
        isAISuggested: true,
      });
      
      dayMinutes -= sessionDuration;
    }
  }
  
  return blocks;
}

export function detectConflicts(blocks: StudyBlock[]): AISuggestion[] {
  const suggestions: AISuggestion[] = [];
  const sorted = [...blocks].sort((a, b) => {
    const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    
    if (
      format(new Date(current.date), 'yyyy-MM-dd') === format(new Date(next.date), 'yyyy-MM-dd') &&
      current.startTime < next.endTime &&
      current.endTime > next.startTime
    ) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'reschedule',
        block: { id: next.id },
        reason: `Overlaps with ${current.subject} session`,
        confidence: 0.9,
      });
    }
  }
  
  return suggestions;
}

export async function saveBlocksToCalendar(blocks: StudyBlock[]): Promise<void> {
  const auth = await getAuth();
  const session = await auth.api.getSession();
  if (!session?.user) throw new Error('Unauthorized');

  const db = await getDb();
  
  for (const block of blocks) {
    const [startHour, startMin] = block.startTime.split(':').map(Number);
    const [endHour, endMin] = block.endTime.split(':').map(Number);
    
    const startDate = new Date(block.date);
    startDate.setHours(startHour, startMin, 0, 0);
    
    const endDate = new Date(block.date);
    endDate.setHours(endHour, endMin, 0, 0);
    
    await db.insert(calendarEvents).values({
      userId: session.user.id,
      title: block.topic ? `${block.subject}: ${block.topic}` : block.subject,
      description: block.isAISuggested ? 'AI-generated study session' : undefined,
      eventType: block.type,
      startTime: startDate,
      endTime: endDate,
      isCompleted: block.isCompleted,
    });
  }
}
```

---

### Task 3: Create API Routes

**Files:**
- Create: `src/app/api/smart-scheduler/generate/route.ts`
- Create: `src/app/api/smart-scheduler/blocks/route.ts`
- Create: `src/app/api/smart-scheduler/optimize/route.ts`

- [ ] **Step 1: Create generate route**

```typescript
// src/app/api/smart-scheduler/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getWeakAreas, getExamCountdowns, generateStudyBlocks } from '@/services/scheduleAIService';

export async function POST(_request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const weakAreas = await getWeakAreas();
    const examCountdowns = await getExamCountdowns();
    
    const blocks = generateStudyBlocks(weakAreas, examCountdowns);
    
    return NextResponse.json({
      blocks,
      suggestions: [],
    });
  } catch (error) {
    console.error('Error generating schedule:', error);
    return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create blocks route**

```typescript
// src/app/api/smart-scheduler/blocks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { calendarEvents } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { startOfWeek, endOfWeek, parseISO } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const weekStr = searchParams.get('week'); // Format: yyyy-II
    
    // Parse week string or use current week
    // Format: yyyy-Wxx (e.g., 2026-W12)
    let targetDate = new Date();
    if (weekStr) {
      const [year, week] = weekStr.split('-W').map(Number);
      if (year && week) {
        // Calculate date from ISO week number
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        targetDate = addDays(startOfWeek(simple, { weekStartsOn: 1 }), 0);
      }
    }
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });
    
    await dbManager.initialize();
    const db = dbManager.getDb();
    const events = await db.query.calendarEvents.findMany({
      where: and(
        eq(calendarEvents.userId, session.user.id),
        gte(calendarEvents.startTime, weekStart),
        lte(calendarEvents.endTime, weekEnd)
      ),
      orderBy: [calendarEvents.startTime],
    });

    const blocks = events.map((e) => ({
      id: e.id,
      subject: e.title.split(':')[0] || 'General',
      topic: e.title.includes(':') ? e.title.split(':')[1]?.trim() : undefined,
      date: e.startTime,
      startTime: `${e.startTime.getHours().toString().padStart(2, '0')}:${e.startTime.getMinutes().toString().padStart(2, '0')}`,
      endTime: `${e.endTime.getHours().toString().padStart(2, '0')}:${e.endTime.getMinutes().toString().padStart(2, '0')}`,
      duration: Math.round((e.endTime.getTime() - e.startTime.getTime()) / 60000),
      type: e.eventType as 'study' | 'review' | 'practice' | 'break',
      isCompleted: e.isCompleted,
      isAISuggested: false,
      calendarEventId: e.id,
    }));

    return NextResponse.json({ blocks, exams: [] });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return NextResponse.json({ error: 'Failed to fetch blocks' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create optimize route**

```typescript
// src/app/api/smart-scheduler/optimize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { detectConflicts } from '@/services/scheduleAIService';
import type { StudyBlock } from '@/types/smart-scheduler';
import { addDays } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { completedBlocks = [], blocks = [] } = body;
    
    // Check for conflicts
    const suggestions = detectConflicts(blocks as StudyBlock[]);
    
    // Find missed blocks (past due, not completed)
    const now = new Date();
    const missedBlocks = (blocks as StudyBlock[])
      .filter((b: StudyBlock) => !completedBlocks.includes(b.id) && new Date(b.date) < now);
    
    // Suggest rescheduling missed blocks
    const rescheduleSuggestions = missedBlocks.map((b: StudyBlock) => ({
      ...b,
      date: addDays(new Date(), 1), // Reschedule to tomorrow
    }));
    
    return NextResponse.json({
      rescheduled: rescheduleSuggestions,
      newSuggestions: suggestions,
    });
  } catch (error) {
    console.error('Error optimizing schedule:', error);
    return NextResponse.json({ error: 'Failed to optimize' }, { status: 500 });
  }
}
```

---

### Task 4: Create Calendar Components

**Files:**
- Create: `src/components/SmartScheduler/CalendarView.tsx`
- Create: `src/components/SmartScheduler/WeekView.tsx`
- Create: `src/components/SmartScheduler/DayView.tsx`
- Create: `src/components/SmartScheduler/StudyBlockCard.tsx`

- [ ] **Step 1: Create main CalendarView component**

```typescript
// src/components/SmartScheduler/CalendarView.tsx
'use client';

import { useEffect } from 'react';
import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ExamCountdownPanel } from './ExamCountdownPanel';
import { AISuggestionsPanel } from './AISuggestionsPanel';

export function CalendarView() {
  const { 
    viewMode, 
    isLoading, 
    loadSchedule,
    generateSchedule,
    isGenerating,
    currentWeek,
  } = useSmartSchedulerStore();

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule, currentWeek]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Main calendar */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {viewMode === 'week' ? 'Weekly Schedule' : 'Daily Schedule'}
          </h2>
          <button
            onClick={() => generateSchedule()}
            disabled={isGenerating}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </button>
        </div>
        
        {viewMode === 'week' ? <WeekView /> : <DayView />}
      </div>

      {/* Side panel */}
      <div className="space-y-4">
        <ExamCountdownPanel />
        <AISuggestionsPanel />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create WeekView component**

```typescript
// src/components/SmartScheduler/WeekView.tsx
'use client';

import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import { format, addDays, startOfWeek, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { StudyBlockCard } from './StudyBlockCard';

export function WeekView() {
  const { currentWeek, blocks, setSelectedDate, selectedDate, viewMode, setViewMode, setCurrentWeek } = useSmartSchedulerStore();
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentWeek, { weekStartsOn: 1 }), i));
  
  const getBlocksForDay = (day: Date) => {
    return blocks.filter(
      (b) => isSameDay(new Date(b.date), day)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const goToPrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      {/* Header with navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={() => setViewMode('day')}
          className="text-sm px-3 py-1 rounded-lg bg-muted hover:bg-muted/80"
        >
          Day View
        </button>
        <div className="flex items-center gap-2">
          <button onClick={goToPrevWeek} className="p-1 hover:bg-muted rounded-lg">
            <HugeiconsIcon icon={ChevronLeftIcon} className="w-5 h-5" />
          </button>
          <span className="font-medium min-w-[180px] text-center">
            {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
          </span>
          <button onClick={goToNextWeek} className="p-1 hover:bg-muted rounded-lg">
            <HugeiconsIcon icon={ChevronRightIcon} className="w-5 h-5" />
          </button>
        </div>
        <div className="w-20" /> {/* Spacer for alignment */}
      </div>

      {/* Week grid - simplified list view */}
      <div className="grid grid-cols-7 min-h-[300px]">
        {weekDays.map((day) => {
          const dayBlocks = getBlocksForDay(day);
          const isSelected = isSameDay(selectedDate, day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div 
              key={day.toISOString()} 
              className={`border-r ${isSelected ? 'bg-primary/5' : ''}`}
            >
              {/* Day header */}
              <div 
                className="h-16 p-2 text-center cursor-pointer hover:bg-muted/50 border-b"
                onClick={() => {
                  setSelectedDate(day);
                  setViewMode('day');
                }}
              >
                <div className="text-xs text-muted-foreground">{format(day, 'EEE')}</div>
                <div className={`text-lg font-semibold ${isToday ? 'text-primary' : ''}`}>
                  {format(day, 'd')}
                </div>
              </div>

              {/* Blocks for this day */}
              <div className="p-1 space-y-1 max-h-[280px] overflow-y-auto">
                {dayBlocks.length === 0 ? (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    No sessions
                  </div>
                ) : (
                  dayBlocks.slice(0, 4).map((block) => (
                    <StudyBlockCard
                      key={block.id}
                      block={block}
                      compact
                    />
                  ))
                )}
                {dayBlocks.length > 4 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayBlocks.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create DayView component**

```typescript
// src/components/SmartScheduler/DayView.tsx
'use client';

import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import { format, addDays, isSameDay } from 'date-fns';
import { StudyBlockCard } from './StudyBlockCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7);

export function DayView() {
  const { selectedDate, setSelectedDate, blocks, setViewMode } = useSmartSchedulerStore();
  
  const dayBlocks = blocks.filter((b) => isSameDay(new Date(b.date), selectedDate));
  
  const goToPrevDay = () => setSelectedDate(addDays(selectedDate, -1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={goToPrevDay} className="p-2 hover:bg-muted rounded-lg">
          <HugeiconsIcon icon={ChevronLeftIcon} className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="font-semibold">{format(selectedDate, 'EEEE')}</div>
          <div className="text-sm text-muted-foreground">{format(selectedDate, 'MMMM d, yyyy')}</div>
        </div>
        <button onClick={goToNextDay} className="p-2 hover:bg-muted rounded-lg">
          <HugeiconsIcon icon={ChevronRightIcon} className="w-5 h-5" />
        </button>
      </div>

      {/* Day timeline */}
      <div className="max-h-[500px] overflow-y-auto">
        {HOURS.map((hour) => {
          const hourBlocks = dayBlocks.filter((b) => {
            const blockHour = parseInt(b.startTime.split(':')[0]);
            return blockHour === hour;
          });
          
          return (
            <div key={hour} className="flex border-b min-h-[80px]">
              <div className="w-16 p-2 text-xs text-muted-foreground border-r flex-shrink-0">
                {hour}:00
              </div>
              <div className="flex-1 p-2 space-y-2">
                {hourBlocks.map((block) => (
                  <StudyBlockCard key={block.id} block={block} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create StudyBlockCard component**

```typescript
// src/components/SmartScheduler/StudyBlockCard.tsx
'use client';

import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import type { StudyBlock } from '@/types/smart-scheduler';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface StudyBlockCardProps {
  block: StudyBlock;
  compact?: boolean;
}

const SUBJECT_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  'Mathematics': { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-600' },
  'Physical Sciences': { bg: 'bg-emerald-500/10', border: 'border-emerald-500', text: 'text-emerald-600' },
  'Life Sciences': { bg: 'bg-purple-500/10', border: 'border-purple-500', text: 'text-purple-600' },
  'Geography': { bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-600' },
  'History': { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-600' },
};

export function StudyBlockCard({ block, compact = false }: StudyBlockCardProps) {
  const { toggleBlockComplete } = useSmartSchedulerStore();
  const style = SUBJECT_STYLES[block.subject] || SUBJECT_STYLES['Mathematics'];

  if (compact) {
    return (
      <div
        className={cn(
          'rounded px-2 py-1 text-xs cursor-pointer hover:opacity-80 transition-opacity border',
          style.bg,
          block.isCompleted && 'opacity-50 line-through'
        )}
        onClick={() => toggleBlockComplete(block.id)}
      >
        <div className={cn('font-medium truncate', style.text)}>{block.subject}</div>
        <div className="text-[10px] text-muted-foreground">{block.startTime}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-3 cursor-pointer hover:shadow-md transition-shadow',
        style.bg,
        style.border,
        block.isCompleted && 'opacity-60'
      )}
      onClick={() => toggleBlockComplete(block.id)}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className={cn('font-medium', style.text)}>{block.subject}</h4>
          {block.topic && (
            <p className="text-sm text-muted-foreground mt-0.5">{block.topic}</p>
          )}
        </div>
        <div className={cn(
          'w-6 h-6 rounded-full border-2 flex items-center justify-center',
          block.isCompleted ? 'bg-green-500 border-green-500' : 'border-muted-foreground/30'
        )}>
          {block.isCompleted && <HugeiconsIcon icon={CheckIcon} className="w-4 h-4 text-white" />}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <span>{block.startTime} - {block.endTime}</span>
        <span>·</span>
        <span>{block.duration} min</span>
        {block.isAISuggested && (
          <>
            <span>·</span>
            <span className="text-primary">AI</span>
          </>
        )}
      </div>
    </div>
  );
}
```

---

### Task 5: Create Side Panel Components

**Files:**
- Create: `src/components/SmartScheduler/ExamCountdownPanel.tsx`
- Create: `src/components/SmartScheduler/AISuggestionsPanel.tsx`

- [ ] **Step 1: Create ExamCountdownPanel**

```typescript
// src/components/SmartScheduler/ExamCountdownPanel.tsx
'use client';

import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import { Card } from '@/components/ui/card';

export function ExamCountdownPanel() {
  const { exams } = useSmartSchedulerStore();

  if (exams.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Exam Countdown</h3>
        <p className="text-sm text-muted-foreground">
          No exams scheduled yet. Add your exam dates to get personalized study recommendations.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Exam Countdown</h3>
      <div className="space-y-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className={`p-3 rounded-lg border ${
              exam.priority === 'high'
                ? 'border-red-200 bg-red-50 dark:bg-red-950/20'
                : exam.priority === 'medium'
                ? 'border-amber-200 bg-amber-50 dark:bg-amber-950/20'
                : 'border-green-200 bg-green-50 dark:bg-green-950/20'
            }`}
          >
            <div className="font-medium">{exam.subject}</div>
            <div className="text-2xl font-bold mt-1">{exam.daysRemaining}</div>
            <div className="text-xs text-muted-foreground">days remaining</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Create AISuggestionsPanel**

```typescript
// src/components/SmartScheduler/AISuggestionsPanel.tsx
'use client';

import { useSmartSchedulerStore } from '@/stores/useSmartSchedulerStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckIcon, Cancel01Icon as CloseIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

export function AISuggestionsPanel() {
  const { suggestions, acceptSuggestion, dismissSuggestion } = useSmartSchedulerStore();

  if (suggestions.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-2">AI Suggestions</h3>
        <p className="text-sm text-muted-foreground">
          AI suggestions will appear here to help optimize your schedule.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">AI Suggestions</h3>
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-3 rounded-lg bg-muted/50 border"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">
                  {suggestion.type === 'add' && 'Add Session'}
                  {suggestion.type === 'reschedule' && 'Reschedule'}
                  {suggestion.type === 'remove' && 'Remove'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{suggestion.reason}</p>
                {suggestion.block.subject && (
                  <div className="text-sm mt-2">
                    {suggestion.block.subject}: {suggestion.block.topic}
                  </div>
                )}
              </div>
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => acceptSuggestion(suggestion.id)}
                  className="p-1.5 rounded-full bg-green-500/20 text-green-600 hover:bg-green-500/30"
                >
                  <HugeiconsIcon icon={CheckIcon} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => dismissSuggestion(suggestion.id)}
                  className="p-1.5 rounded-full bg-red-500/20 text-red-600 hover:bg-red-500/30"
                >
                  <HugeiconsIcon icon={CloseIcon} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

---

### Task 6: Create Page Route

**Files:**
- Create: `src/app/smart-scheduler/page.tsx`

- [ ] **Step 1: Create the Smart Scheduler page**

```typescript
// src/app/smart-scheduler/page.tsx
import { CalendarView } from '@/components/SmartScheduler/CalendarView';

export default function SmartSchedulerPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold">Smart Scheduler</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered study planning with exam countdown
        </p>
      </header>
      
      <CalendarView />
    </div>
  );
}
```

- [ ] **Step 2: Add navigation link**

Modify: `src/components/Layout/DesktopSidebar.tsx`

Add to Learning section:
```tsx
{ href: '/smart-scheduler', label: 'Smart Scheduler', icon: Calendar01Icon },
```

Modify: `src/components/Layout/MobileNavDrawer.tsx` (if exists)

Add similar link to mobile navigation.

---

### Task 7: Testing & Verification

- [ ] **Step 1: Run typecheck**
```
bun run typecheck
```

- [ ] **Step 2: Run lint**
```
bun run lint
```

- [ ] **Step 3: Commit changes**
```
git add -A
git commit -m "feat: add smart scheduler with AI-powered study planning"
```

---

## Summary

This plan implements a Smart Scheduler with:

1. ✅ Type definitions for StudyBlock, ExamCountdown, AISuggestion
2. ✅ Zustand store for state management
3. ✅ AI scheduling service for generating study blocks
4. ✅ API routes for generate, blocks, optimize
5. ✅ Calendar views (week and day)
6. ✅ Study block cards with completion toggle
7. ✅ Exam countdown panel (placeholder)
8. ✅ AI suggestions panel
9. ✅ Navigation integration

**Dependencies leveraged:**
- `calendarEvents` table for persistence
- `topicConfidence` for weak areas
- Existing UI components (Card, Button)
- date-fns for date handling

---

## Future Enhancements (Post-MVP)

### Integration with useScheduleStore
To sync blocks with focus timer:
1. Add `startFocusSession(blockId)` action to `useSmartSchedulerStore`
2. On click, update `useScheduleStore` with block data
3. Navigate to focus page or start timer in-place

### Integration with adaptive-schedule.ts
The existing `adaptive-schedule.ts` provides:
- `detectMissedGoals()` - Find overdue calendar events
- `rescheduleMissedGoals()` - Auto-reschedule to tomorrow
- `addExtraPracticeForStruggling()` - Add practice for weak topics

**Recommended:** Import and call these functions in the optimize route for richer rescheduling logic.

### Drag-Drop & Resize (Phase 2)
Add `@dnd-kit/core` for:
- Drag blocks between days
- Resize blocks by dragging edges
- Visual drop zones

### Exam Countdown Data (Phase 2)
Connect to actual NSC exam date data when available:
- Integrate with `exams` table or external API
- Calculate priority based on days remaining
- Auto-suggest review sessions before exams
