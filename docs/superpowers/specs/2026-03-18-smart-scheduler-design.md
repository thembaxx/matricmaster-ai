# Smart Scheduler - Design Specification

**Date:** 2026-03-18  
**Feature:** Smart Scheduler  
**Status:** Approved

---

## Overview

A hybrid AI-powered study calendar that automatically generates optimal study schedules based on exam dates, weak areas, and study goals. Users can manually adjust blocks while AI provides intelligent suggestions and rescheduling.

---

## Core Features

### 1. AI Study Calendar View
- Weekly/monthly calendar view showing study blocks
- Color-coded by subject
- Drag-drop rescheduling
- Resize blocks by dragging edges

### 2. Smart Block Generation
AI generates study blocks based on:
- **Exam dates** - Prioritize subjects with upcoming exams
- **Weak areas** - More time on struggling topics
- **Weekly hours target** - Distribute hours across subjects
- **Subject weights** - User-defined importance per subject

### 3. Exam Countdown Integration
- Shows countdown to each NSC exam
- Suggests review sessions before exams
- Color-coded urgency (red/amber/green)

### 4. Schedule Optimization
- Auto-reschedule missed sessions
- Detect conflicts and suggest fixes
- Adjust based on completed sessions

### 5. Integration with Existing
- Sync with `useScheduleStore` for focus timer
- Use existing `calendarEvents` table
- Leverage `adaptive-schedule.ts` for rescheduling logic

---

## Data Model

### Schedule Block
```typescript
interface StudyBlock {
  id: string;
  subject: string;
  topic?: string;
  date: Date;
  startTime: string; // "09:00"
  endTime: string;    // "10:30"
  duration: number;   // minutes
  type: 'study' | 'review' | 'practice' | 'break';
  isCompleted: boolean;
  isAISuggested: boolean;
}
```

> **Note:** AI service maps between StudyBlock (time strings) and calendarEvents (datetime fields).

### API Contract
```
POST /api/smart-scheduler/generate
- Body: { subjects: string[], weeklyHours: number, examDates: Date[] }
- Response: { blocks: StudyBlock[], suggestions: AISuggestion[] }

GET /api/smart-scheduler/blocks?week=2026-W12
- Response: { blocks: StudyBlock[] }

POST /api/smart-scheduler/optimize
- Body: { completedBlocks: string[], missedBlocks: string[] }
- Response: { rescheduled: StudyBlock[], newSuggestions: AISuggestion[] }
```

### Exam Countdown
```typescript
interface ExamCountdown {
  subject: string;
  date: Date;
  daysRemaining: number;
  priority: 'high' | 'medium' | 'low';
}
```

---

## Architecture

### Frontend Components
- `src/components/SmartScheduler/CalendarView.tsx` - Main calendar grid
- `src/components/SmartScheduler/BlockEditor.tsx` - Create/edit study blocks
- `src/components/SmartScheduler/ExamCountdown.tsx` - Exam countdown cards
- `src/components/SmartScheduler/AISuggestions.tsx` - AI suggestion panel
- `src/app/smart-scheduler/page.tsx` - Main page

### Backend Services
- `src/services/scheduleAIService.ts` - AI scheduling logic
- `src/app/api/smart-scheduler/route.ts` - API endpoints

### Integration Points
- `useScheduleStore` - Focus timer sync
- `calendarEvents` - Data persistence
- `adaptive-schedule.ts` - Rescheduling logic

---

## Algorithm Details

### AI Suggestion Logic
- **Inputs**: subjects[], weeklyHours, examDates[], weakAreas[], topicConfidence[]
- **Outputs**: StudyBlock[] with scheduling algorithm considering:
  - Exam proximity (prioritize high-stakes)
  - Topic confidence (more time on low scores)
  - Study session limits (max 90 min, min 25 min)
  - Rest breaks (15 min between sessions)

### Conflict Detection Rules
- No overlapping blocks on same day
- Minimum 15-minute gap between sessions
- Maximum 4 hours study per day
- No sessions after 10 PM

### Mobile Behavior
- **Primary view**: Day view with vertical timeline
- **Swipe navigation**: Left/right for previous/next day
- **Week view**: Toggle button available
- **Bottom sheet**: Block editor opens as bottom sheet

---

## UI/UX Specification

### Calendar View
- **Desktop**: Full week/month view with side panel
- **Mobile**: Day view with swipe navigation
- **Block styling**: Subject-colored with gradient borders

### Block Cards
- Subject name & icon
- Topic (if specific)
- Duration badge
- Completion checkbox
- Drag handle

### AI Suggestion Panel
- Suggested new blocks
- Why suggestions are made (context)
- Accept/dismiss buttons

### Exam Countdown Cards
- Subject name
- Days remaining
- Progress bar
- Quick "Add Review" button

---

## User Flow

1. **Open Smart Scheduler** - View current week's schedule
2. **See Exam Countdowns** - Know what's coming up
3. **AI Suggests Blocks** - Review suggested study sessions
4. **Accept/Modify** - Drag blocks to preferred times
5. **Start Focus Session** - Tap block to start timer
6. **Mark Complete** - Check off as you study

---

## Acceptance Criteria

1. ✅ View weekly/monthly calendar
2. ✅ AI generates study block suggestions
3. ✅ Drag-drop to reschedule blocks
4. ✅ Exam countdown with priority colors
5. ✅ Sync with focus timer
6. ✅ Mark blocks as complete
7. ✅ Auto-reschedule missed sessions
8. ✅ Mobile-responsive design

---

## Implementation Priority

1. Calendar view component
2. Block editor
3. AI scheduling service
4. Exam countdown
5. Drag-drop functionality
6. Focus mode integration
