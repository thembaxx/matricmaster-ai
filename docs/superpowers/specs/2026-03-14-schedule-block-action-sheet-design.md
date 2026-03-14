# Schedule Block Action Sheet - Design Specification

**Date:** 2026-03-14  
**Topic:** Schedule Block Action Sheet Integration  
**Status:** Approved

---

## Overview

When a user taps or clicks on a study block in the schedule, an action sheet opens with integrated actions that connect to other parts of the MatricMaster app. This creates a seamless workflow from planning (schedule) to execution (study sessions, flashcards, past papers, AI tutor).

---

## User Experience

### Trigger
- **Mobile:** Tap anywhere on the block card
- **Desktop:** Click anywhere on the block in the grid view

### Action Sheet Behavior

**Mobile (Drawer):**
- Slides up from bottom (like existing Add Block modal)
- Rounded top corners
- Scrollable if content exceeds viewport

**Desktop (Dialog):**
- Centered modal
- Grid layout for action buttons
- Maximum width: 500px

---

## Action Buttons

### 1. Start Study Session
- **Icon:** Timer/Clock icon
- **Description:** "Begin a focused study session"
- **Behavior:** Navigate to Focus page with pre-filled duration from block's scheduled time
- **Always available**

### 2. View Flashcards
- **Icon:** Cards/Grid icon
- **Description:** "Review flashcards for this subject"
- **Behavior:** Navigate to flashcards page filtered by subject
- **Requires:** Subject linked to block

### 3. Past Papers
- **Icon:** Document/File icon
- **Description:** "Practice with past exam papers"
- **Behavior:** Navigate to past-papers page filtered by subject
- **Requires:** Subject linked to block

### 4. AI Tutor
- **Icon:** Chat/Bot icon
- **Description:** "Ask the AI about this topic"
- **Behavior:** Navigate to AI Tutor with block title as initial context
- **Always available**

### 5. Mark Complete
- **Icon:** Check circle
- **Description:** Toggle completion status
- **Behavior:** Updates `isCompleted` field in database, shows checkmark on block
- **Always available**

### 6. Edit Block
- **Icon:** Pencil
- **Description:** "Change block details"
- **Behavior:** Opens existing Edit modal with pre-filled data

### 7. Delete Block
- **Icon:** Trash
- **Description:** "Remove this block"
- **Behavior:** Confirmation dialog, then deletes from database

---

## Data Model Updates

### Block Schema Enhancement
The `calendarEvents` table already has `subjectId` field. We need to:

1. **Add subject selector to Add/Edit Modal**
   - Dropdown to select from enrolled subjects
   - Optional field (blocks can exist without subject)

2. **Store subject in block data**
   - Update `BlockData` interface to include `subjectId`
   - Pass subjectId to action buttons

---

## Component Architecture

```
SchedulePage
├── AddBlockModal (create/edit)
└── BlockActionSheet (new)
    ├── StudySessionButton
    ├── FlashcardsButton
    ├── PastPapersButton
    ├── AITutorButton
    ├── CompletionToggle
    ├── EditButton
    └── DeleteButton
```

---

## Implementation Priorities

### Phase 1 - Core
1. Add subject selector to AddBlockModal
2. Create BlockActionSheet component
3. Wire up Edit and Delete (already exist, move to action sheet)

### Phase 2 - Navigation Actions
4. Start Study Session button (navigate to /focus)
5. View Flashcards button (navigate to /flashcards?subject=X)
6. Past Papers button (navigate to /past-papers?subject=X)

### Phase 3 - AI Integration
7. AI Tutor button (navigate to /ai-tutor?topic=X)

### Phase 4 - Completion
8. Mark Complete toggle functionality
9. Visual indicator on completed blocks

---

## Success Criteria

- [ ] User can tap block to open action sheet
- [ ] Action sheet works on mobile (drawer) and desktop (dialog)
- [ ] Subject selector appears in Add/Edit modal
- [ ] All 7 action buttons render correctly
- [ ] Navigation buttons route to correct pages with context
- [ ] Completion status persists in database
- [ ] Edit and Delete work from action sheet
- [ ] Visual feedback for completed blocks

---

## Notes

- Current edit functionality opens on block click - this should change to open action sheet
- Subject selector should only show subjects the user is enrolled in
- Action buttons that require subject should show disabled state with tooltip if no subject linked
