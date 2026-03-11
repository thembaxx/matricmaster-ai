# Tiimo-Style Redesign for MatricMaster AI

**Date:** 2026-03-11  
**Status:** Approved for Implementation

## 1. Overview

Transform MatricMaster AI into a visual planning app inspired by Tiimo, while maintaining its focus on South African Grade 12 students. The app will combine visual schedule planning with AI-powered study assistance to help students manage their time, reduce overwhelm, and build consistent study routines.

## 2. Core Features

### 2.1 Visual Daily Schedule

**Dual View System:**
- **Active Task View**: Shows single current task prominently with focus timer, upcoming tasks stacked below
- **Full Day Timeline Grid**: Complete day overview with all scheduled tasks in chronological order
- **Toggle**: Users can switch between views via tab/pill selector

**Schedule Elements:**
- Task blocks with subject color coding (Mathematics=blue, Physics=purple, etc.)
- Emoji icons for activity types
- Duration display on each block
- Drag-and-drop reordering on desktop/web
- Day/Week/Month view options

**Time Indicators:**
- Current time marker line
- Visual gradient showing morning/afternoon/evening
- Transition warnings (configurable: 5/10/15 min before)

### 2.2 Focus Timer

**Visual Design:**
- Large circular progress ring (center screen)
- Time remaining in center (MM:SS format)
- Task title above timer
- Step checklist below timer

**Controls:**
- Start/Pause/Resume button
- Skip to next task
- Add time / Reduce time (quick adjust)
- Stop timer (returns to schedule)

**Features:**
- Optional ticking sound
- Transition alerts (visual + audio)
- Auto-advance to next task option
- Lock screen Live Activity (iOS)

### 2.3 Study Routines (Pre-built Templates)

**Template Structure:**

| Routine | Time | Blocks |
|---------|------|--------|
| Morning Boost | 6:00-9:00 | Quick review (15min) → Main subject (90min) → Breakfast break → Next subject (45min) |
| Afternoon Focus | 12:00-17:00 | Lunch → Past paper practice (90min) → Break → Review answers (45min) |
| Evening Revision | 18:00-21:00 | Light review (30min) → Weak topics (60min) → Preview next day (30min) |
| Exam Prep | Custom | Intensive sessions with breaks |

**Customization:**
- Adjust start/end times
- Add/remove blocks
- Set preferred subjects per routine
- Save as custom routine

### 2.4 AI Co-Planner

**Interface:**
- Dedicated "Study Planner" tab/screen
- Chat-style interface with quick prompts
- Natural language input

**Capabilities:**
- Break down large goals: "I have Math Paper 1 in 2 weeks"
- Generate step-by-step study plans
- Estimate time for each topic
- Suggest optimal schedule based on available time
- Recommend routine templates
- Adapt plans based on progress

**Quick Prompts:**
- "Plan my study session"
- "I need help starting"
- "What's next on my schedule?"
- "Make my plan for tomorrow"

### 2.5 Widgets

**Widget Set:**
1. **Next Task** - Shows current/upcoming task with subject color
2. **Focus Timer** - Live countdown with progress ring
3. **Daily Progress** - Tasks completed / total
4. **Streak** - Current streak count with flame icon

### 2.6 Daily Review

**End-of-Day Prompt:**
- Triggered at configurable time (default: 20:00)
- "Review your day" notification
- Show completed vs pending tasks
- Option to move unfinished tasks forward
- Quick mood/energy check-in

### 2.7 Subject Customization

**Color Scheme:**
- Mathematics: Blue (#3B82F6)
- Physics: Purple (#8B5CF6)
- Life Sciences: Green (#10B981)
- English: Orange (#F97316)
- Geography: Teal (#14B8A6)
- History: Amber (#F59E0B)
- Accounting: Pink (#EC4899)

**Icons:**
- Subject-specific emojis/icons
- Activity type icons (reading, practice, review, break)

## 3. User Experience

### 3.1 Navigation

- **Mobile**: Bottom tab bar with 4 items
  - Schedule (home)
  - Study (AI + Practice)
  - Focus Timer
  - Profile
- **Desktop**: Sidebar navigation with same items

### 3.2 Visual Language

- **Glassmorphism**: Floating cards with blur backgrounds
- **Rounded corners**: Large border-radius (16-24px)
- **Color-coded**: Tasks colored by subject
- **Minimal**: Clean whitespace, clear hierarchy
- **Accessible**: High contrast, clear typography

### 3.3 Onboarding

- Welcome flow explaining visual planning
- Subject selection (pick 3-5)
- Daily schedule preference (morning/afternoon/evening)
- Goal setting (upcoming exams)

## 4. Technical Architecture

### 4.1 Components

```
src/
├── components/
│   ├── Schedule/
│   │   ├── ScheduleView.tsx      # Main container
│   │   ├── ActiveTaskView.tsx    # Single task focus view
│   │   ├── TimelineGridView.tsx  # Full day grid
│   │   ├── TaskBlock.tsx         # Individual task card
│   │   ├── TimeIndicator.tsx     # Current time marker
│   │   └── ViewToggle.tsx        # Grid/List toggle
│   ├── Timer/
│   │   ├── FocusTimer.tsx        # Main timer component
│   │   ├── ProgressRing.tsx      # SVG progress ring
│   │   ├── TimerControls.tsx      # Start/Pause/Skip
│   │   └── TaskChecklist.tsx      # Step checklist
│   ├── Routines/
│   │   ├── RoutineCard.tsx        # Display routine
│   │   ├── RoutineTemplates.tsx   # Pre-built options
│   │   └── RoutineEditor.tsx      # Customize routine
│   ├── AIPlanner/
│   │   ├── AICoPlanner.tsx        # Main AI interface
│   │   ├── ChatInterface.tsx      # Chat messages
│   │   ├── QuickPrompts.tsx       # Prompt buttons
│   │   └── PlanOutput.tsx         # Generated plan display
│   ├── Widgets/
│   │   ├── NextTaskWidget.tsx
│   │   ├── TimerWidget.tsx
│   │   └── ProgressWidget.tsx
│   └── DailyReview/
│       ├── ReviewModal.tsx
│       ├── TaskSummary.tsx
│       └── MoodCheckIn.tsx
```

### 4.2 State Management

- Use existing React Context + hooks
- New contexts:
  - `ScheduleContext` - Tasks, routines, schedule state
  - `TimerContext` - Timer state, progress, controls

### 4.3 Data Models

```typescript
interface StudyTask {
  id: string;
  title: string;
  subject: Subject;
  duration: number; // minutes
  startTime?: Date;
  endTime?: Date;
  completed: boolean;
  steps: TaskStep[];
  color: string;
  emoji: string;
}

interface TaskStep {
  id: string;
  title: string;
  completed: boolean;
}

interface Routine {
  id: string;
  name: string;
  type: 'morning' | 'afternoon' | 'evening' | 'custom';
  blocks: RoutineBlock[];
}

interface RoutineBlock {
  id: string;
  title: string;
  duration: number;
  subject?: Subject;
  type: 'study' | 'break' | 'review' | 'practice';
}
```

## 5. Implementation Phases

### Phase 1: Visual Schedule + Focus Timer (Week 1-2)
- Schedule view components
- Task CRUD operations
- Focus timer with progress ring
- Task checklist

### Phase 2: AI Co-Planner + Routines (Week 2-3)
- AI planner interface
- Gemini integration for plan generation
- Routine templates
- Routine editor

### Phase 3: Widgets + Daily Review (Week 3-4)
- Widget components
- Daily review flow
- Push notification integration

## 6. Success Metrics

- Daily active schedule users
- Average tasks completed per day
- Focus timer session duration
- AI planner usage
- User retention (7-day, 30-day)

## 7. Future Enhancements

- Calendar sync (Google, Outlook)
- Apple Watch app
- Collaboration features (study groups)
- Analytics dashboard
- Export to PDF study plan
