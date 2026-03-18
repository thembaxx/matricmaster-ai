# Exam Simulation - Focus Mode Design Specification

**Date:** 2026-03-18  
**Feature:** Exam Simulation - Focus Mode  
**Status:** Design Approved

---

## Overview

Implement a "No Distractions" exam simulation mode that mimics the NSC exam environment. Full-screen focus mode with integrated timer and soft AI blocking until exam completion.

---

## Architecture

### Components

1. **FocusModeProvider** - Context for managing exam session state
2. **FocusModeLayout** - Full-screen layout that hides distractions
3. **AIBlockOverlay** - Tooltip/component shown when AI is accessed during focus
4. **ExamCompleteScreen** - Results screen shown when timer ends

### Data Flow

```
User starts exam → FocusModeProvider.active = true
                                   ↓
                    FocusModeLayout hides sidebar/navbar
                                   ↓
                    AI features show "Available after exam"
                                   ↓
Timer ends → FocusModeProvider.active = false
                  ↓
        ExamCompleteScreen shown, AI unlocked
```

---

## Functionality Specification

### 1. Focus Mode Activation

**Behavior:**
- User clicks "Start Focus Mode" on exam timer
- App transitions to full-screen focus layout
- Sidebar, header, and all non-essential UI hidden
- Only question/timer visible
- ESC key or "Exit Early" button available (logs incomplete)

**States:**
- `inactive` - Normal app usage
- `active` - Focus mode running
- `completed` - Timer finished, results shown

### 2. Timer Integration

**Behavior:**
- Uses existing exam timer presets
- Timer runs in minimal UI (always visible)
- Warning at configured minutes remaining
- Auto-transition to completed state when timer hits 0

### 3. Soft AI Block

**Behavior:**
- When focus mode active, all AI features show tooltip:
  - "Focus Mode Active: Available after exam ends"
- AI functions still exist but return blocked state
- Button/feature disabled but visible
- After exam complete, normal AI access restored

### 4. Exam Completion

**Behavior:**
- Timer reaching 0 shows "Time's Up" overlay
- Option to "Review Answers" (AI now available)
- Option to "Exit" (returns to dashboard)
- Session logged as "completed"

---

## UI/UX Specification

### Focus Mode Layout

- **Position:** Fixed full-screen overlay
- **Background:** Solid background color (no distractions)
- **Content:** Question content + timer bar at top
- **Exit:** Small "Exit Focus Mode" button in corner

### AI Blocked Tooltip

- **Trigger:** Hover/click on AI features during focus
- **Content:** "Focus Mode Active" + lock icon
- **Style:** Subtle, non-intrusive

### Timer Bar

- **Position:** Fixed top of focus mode
- **Height:** 48px
- **Shows:** Time remaining + progress bar
- **Colors:** Green → Orange → Red as time depletes

---

## Acceptance Criteria

1. Focus mode hides all UI distractions (sidebar, header)
2. Timer runs correctly in focus mode
3. AI features show blocked tooltip when accessed
4. Timer completion unlocks AI and shows completion screen
5. Exiting early logs session as incomplete

---

## Out of Scope

- Question navigation system
- Answer marking for review
- PDF generation
- Multiple question papers
