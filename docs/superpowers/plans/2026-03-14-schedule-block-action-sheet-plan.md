# Schedule Block Action Sheet Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an action sheet that appears when tapping a schedule block, with integrated actions for study sessions, flashcards, past papers, AI tutor, and completion tracking.

**Architecture:** Create a new BlockActionSheet component that displays as a drawer on mobile and dialog on desktop. Modify AddBlockModal to include subject selection. Update SchedulePage to trigger action sheet on block tap.

**Tech Stack:** Next.js 16, React, shadcn/ui (Drawer, Dialog, Select), Hugeicons, Framer Motion

---

## File Structure

### New Files
- `src/components/Schedule/BlockActionSheet.tsx` - Action sheet component with all action buttons

### Modified Files
- `src/components/Schedule/AddBlockModal.tsx` - Add subject selector dropdown
- `src/app/schedule/page.tsx` - Change block click to open action sheet, add completion visual

---

## Chunk 1: Subject Selector in AddBlockModal

### Task 1: Add Subject Selector to AddBlockModal

**Files:**
- Modify: `src/components/Schedule/AddBlockModal.tsx`

- [ ] **Step 1: Add Select import and getEnrolledSubjectsAction import**

```typescript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getEnrolledSubjectsAction } from '@/lib/db/actions';
```

- [ ] **Step 2: Add subjectId to BlockData interface**

```typescript
interface BlockData {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  eventType: string;
  subjectId?: number; // Add this
}
```

- [ ] **Step 3: Add subject state and fetch subjects**

```typescript
const [subjects, setSubjects] = useState<{ id: number; name: string }[]>([]);
const [subjectId, setSubjectId] = useState<string>('');

useEffect(() => {
  async function loadSubjects() {
    const data = await getEnrolledSubjectsAction();
    setSubjects(data);
  }
  loadSubjects();
}, []);
```

- [ ] **Step 4: Add subject selector in form (after title field)**

```typescript
<div className="space-y-3">
  <Label htmlFor={subjectId} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
    Subject (optional)
  </Label>
  <Select value={subjectId} onValueChange={setSubjectId}>
    <SelectTrigger className="h-12">
      <SelectValue placeholder="Select a subject" />
    </SelectTrigger>
    <SelectContent>
      {subjects.map((subject) => (
        <SelectItem key={subject.id} value={String(subject.id)}>
          {subject.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

- [ ] **Step 5: Update handleSubmit to include subjectId**

```typescript
// In create action
{
  title: title.trim(),
  startTime: startDateTime,
  endTime: endDateTime,
  eventType: repeatable ? 'recurring' : 'study_session',
  subjectId: subjectId ? parseInt(subjectId) : undefined,
}

// In update action - add subjectId to the update data
```

- [ ] **Step 6: Pre-fill subject in edit mode**

```typescript
// In the useEffect that handles editMode
if (editMode) {
  setTitle(editMode.title);
  // ... existing fields
  setSubjectId(editMode.subjectId ? String(editMode.subjectId) : '');
}
```

- [ ] **Step 7: Update resetForm to include subjectId**

```typescript
setSubjectId('');
```

---

## Chunk 2: Create BlockActionSheet Component

### Task 2: Create BlockActionSheet Component

**Files:**
- Create: `src/components/Schedule/BlockActionSheet.tsx`

- [ ] **Step 1: Create the component file with imports**

```typescript
'use client';

import {
  BookOpenIcon,
  CheckmarkCircleIcon,
  Clock01Icon,
  Delete02Icon,
  Document01Icon,
  Edit01Icon,
  MessageChatBotIcon,
  Timer01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { deleteCalendarEventAction, updateCalendarEventAction } from '@/lib/db/actions';
import { useEffect, useState } from 'react';
import { AddBlockModal } from './AddBlockModal';
import type { CalendarEvent } from '@/lib/db/schema';
```

- [ ] **Step 2: Define interfaces**

```typescript
interface BlockEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  eventType: string;
  subjectId?: number;
  subjectName?: string;
  isCompleted: boolean;
}

interface BlockActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: BlockEvent | null;
  onSuccess: () => void;
}
```

- [ ] **Step 3: Create media query hook**

```typescript
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(true);
  useEffect(() => {
    const check = () => setMatches(window.matchMedia(query).matches);
    check();
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener('change', check);
    return () => mediaQuery.removeEventListener('change', check);
  }, [query]);
  return matches;
}
```

- [ ] **Step 4: Build main component**

```typescript
export function BlockActionSheet({ open, onOpenChange, event, onSuccess }: BlockActionSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Pre-fill data for edit modal
  const editModeData = event ? {
    id: event.id,
    title: event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    eventType: event.eventType,
  } : null;
  
  // Navigation handlers
  const handleStudySession = () => {
    const duration = Math.round((new Date(event!.endTime).getTime() - new Date(event!.startTime).getTime()) / 60000);
    router.push(`/focus?duration=${duration}&subject=${event?.subjectId || ''}`);
  };
  
  const handleFlashcards = () => {
    router.push(`/flashcards?subject=${event?.subjectId || ''}`);
  };
  
  const handlePastPapers = () => {
    router.push(`/past-papers?subject=${event?.subjectId || ''}`);
  };
  
  const handleAITutor = () => {
    router.push(`/ai-tutor?topic=${encodeURIComponent(event?.title || '')}&subject=${event?.subjectId || ''}`);
  };
  
  // Completion toggle
  const handleToggleComplete = async () => {
    if (!event) return;
    const result = await updateCalendarEventAction(event.id, {
      eventType: event.isCompleted ? 'study_session' : 'completed',
    });
    if (result.success) {
      toast.success(event.isCompleted ? 'Marked as incomplete' : 'Marked as complete!');
      onSuccess();
    }
  };
  
  // Delete handler
  const handleDelete = async () => {
    if (!event || !confirm('Are you sure you want to delete this study block?')) return;
    setIsDeleting(true);
    const result = await deleteCalendarEventAction(event.id);
    if (result.success) {
      toast.success('Study block deleted');
      onSuccess();
      onOpenChange(false);
    } else {
      toast.error('Failed to delete');
    }
    setIsDeleting(false);
  };
  
  // Action button styling
  const actionButtonClass = "flex flex-col items-center justify-center p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors gap-2";
  
  const actions = (
    <div className="space-y-6">
      {/* Navigation Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="ghost" onClick={handleStudySession} className={actionButtonClass}>
          <HugeiconsIcon icon={Timer01Icon} className="w-6 h-6 text-primary" />
          <span className="text-xs font-semibold">Study Session</span>
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={handleFlashcards} 
          disabled={!event?.subjectId}
          className={actionButtonClass}
        >
          <HugeiconsIcon icon={BookOpenIcon} className="w-6 h-6 text-primary" />
          <span className="text-xs font-semibold">Flashcards</span>
        </Button>
        
        <Button 
          variant="ghost" 
          onClick={handlePastPapers}
          disabled={!event?.subjectId}
          className={actionButtonClass}
        >
          <HugeiconsIcon icon={Document01Icon} className="w-6 h-6 text-primary" />
          <span className="text-xs font-semibold">Past Papers</span>
        </Button>
        
        <Button variant="ghost" onClick={handleAITutor} className={actionButtonClass}>
          <HugeiconsIcon icon={MessageChatBotIcon} className="w-6 h-6 text-primary" />
          <span className="text-xs font-semibold">AI Tutor</span>
        </Button>
      </div>
      
      {/* Completion Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
        <div className="flex items-center gap-3">
          <HugeiconsIcon icon={CheckmarkCircleIcon} className="w-5 h-5 text-primary" />
          <div className="text-left">
            <p className="text-sm font-semibold">Mark Complete</p>
            <p className="text-xs text-muted-foreground">Toggle completion status</p>
          </div>
        </div>
        <Switch checked={event?.isCompleted || false} onCheckedChange={handleToggleComplete} />
      </div>
      
      {/* Edit/Delete */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="h-12">
          <HugeiconsIcon icon={Edit01Icon} className="w-4 h-4 mr-2" />
          Edit Block
        </Button>
        <Button 
          variant="outline" 
          onClick={handleDelete} 
          disabled={isDeleting}
          className="h-12 text-destructive border-destructive/30 hover:bg-destructive/10"
        >
          <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-2" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
      
      {/* Edit Modal */}
      <AddBlockModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSuccess={() => {
          onSuccess();
          onOpenChange(false);
        }}
        editMode={editModeData}
      />
    </div>
  );
  
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{event?.title}</DialogTitle>
            <DialogDescription className="text-sm">
              {event?.subjectName ? `Subject: ${event.subjectName}` : 'No subject linked'}
            </DialogDescription>
          </DialogHeader>
          {actions}
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="rounded-t-[2rem] px-4 pb-6">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle className="text-xl font-bold">{event?.title}</DrawerTitle>
          <DrawerDescription className="text-sm">
            {event?.subjectName ? `Subject: ${event.subjectName}` : 'No subject linked'}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-1 overflow-y-auto max-h-[70vh]">{actions}</div>
      </DrawerContent>
    </Drawer>
  );
}
```

---

## Chunk 3: Update SchedulePage

### Task 3: Integrate BlockActionSheet into SchedulePage

**Files:**
- Modify: `src/app/schedule/page.tsx`

- [ ] **Step 1: Import BlockActionSheet**

```typescript
import { BlockActionSheet } from '@/components/Schedule/BlockActionSheet';
```

- [ ] **Step 2: Add state for action sheet**

```typescript
const [actionSheetEvent, setActionSheetEvent] = useState<BlockEvent | null>(null);
const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
```

- [ ] **Step 3: Add BlockEvent interface**

```typescript
interface BlockEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  eventType: string;
  subjectId?: number;
  subjectName?: string;
  isCompleted: boolean;
}
```

- [ ] **Step 4: Update mapDbEventToUI to include new fields**

```typescript
const mapDbEventToUI = (e: CalendarEvent): UIEvent & BlockEvent => {
  const start = new Date(e.startTime);
  const end = new Date(e.endTime);
  const dayName = DAYS[start.getDay() === 0 ? 6 : start.getDay() - 1];
  return {
    id: e.id,
    day: dayName,
    start: start.getHours() + start.getMinutes() / 60,
    end: end.getHours() + end.getMinutes() / 60,
    title: e.title,
    subject: 'Study',
    color: e.isCompleted ? 'bg-green-500/80' : 'bg-primary',
    startTime: start,
    endTime: end,
    eventType: e.eventType,
    subjectId: e.subjectId ?? undefined,
    isCompleted: e.isCompleted,
  };
};
```

- [ ] **Step 5: Add handler to open action sheet**

```typescript
const handleBlockClick = (event: UIEvent & BlockEvent) => {
  setActionSheetEvent({
    id: event.id,
    title: event.title,
    startTime: event.startTime,
    endTime: event.endTime,
    eventType: event.eventType,
    subjectId: event.subjectId,
    isCompleted: event.isCompleted,
  });
  setIsActionSheetOpen(true);
};
```

- [ ] **Step 6: Add BlockActionSheet component**

```tsx
<BlockActionSheet
  open={isActionSheetOpen}
  onOpenChange={setIsActionSheetOpen}
  event={actionSheetEvent}
  onSuccess={refreshEvents}
/>
```

- [ ] **Step 7: Update mobile card onClick**

```typescript
// Change from handleEditBlock to handleBlockClick
<Card
  className="shadow-tiimo border-border/50 overflow-hidden cursor-pointer"
  onClick={() => handleBlockClick(event as UIEvent & BlockEvent)}
>
```

- [ ] **Step 8: Update desktop grid onClick**

```typescript
// Change from handleEditBlock to handleBlockClick
onClick={() => handleBlockClick(event as UIEvent & BlockEvent)}
```

- [ ] **Step 9: Remove old edit/delete button handlers that are now in action sheet**

- [ ] **Step 10: Remove MoreVerticalIcon import if no longer needed**

---

## Chunk 4: Add Subject Name to Events

### Task 4: Fetch subject names for blocks

**Files:**
- Modify: `src/lib/db/actions.ts`

- [ ] **Step 1: Add getSubjectsAction or enhance calendar event fetch**

Add a new action to get subjects by IDs, or update getCalendarEventsAction to include subject name via join.

```typescript
export async function getCalendarEventsWithSubjectsAction() {
  try {
    const user = await ensureAuthenticated();
    const db = await getDb();
    const events = await db
      .select({
        id: calendarEvents.id,
        title: calendarEvents.title,
        startTime: calendarEvents.startTime,
        endTime: calendarEvents.endTime,
        eventType: calendarEvents.eventType,
        subjectId: calendarEvents.subjectId,
        isCompleted: calendarEvents.isCompleted,
        subjectName: subjects.name,
      })
      .from(calendarEvents)
      .leftJoin(subjects, eq(calendarEvents.subjectId, subjects.id))
      .where(eq(calendarEvents.userId, user.id));
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}
```

- [ ] **Step 2: Update SchedulePage to use new action**

Replace getCalendarEventsAction with getCalendarEventsWithSubjectsAction.

---

## Testing Checklist

- [ ] Add a block with subject - subject shows in action sheet
- [ ] Add a block without subject - shows "No subject linked"
- [ ] Tap block opens action sheet
- [ ] Study Session navigates to /focus with params
- [ ] Flashcards button disabled when no subject
- [ ] Flashcards navigates to /flashcards with subject param
- [ ] Past Papers disabled when no subject
- [ ] Past Papers navigates to /past-papers with subject param
- [ ] AI Tutor navigates to /ai-tutor with topic
- [ ] Mark Complete toggles and persists
- [ ] Edit opens modal with correct data
- [ ] Delete removes block
- [ ] Works on mobile (drawer) and desktop (dialog)
