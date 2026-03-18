# Offline Mode - Design Specification

**Date:** 2026-03-18  
**Feature:** Offline Mode Enhancement  
**Status:** Design Approved

---

## Overview

Implement a robust offline mode that allows South African students to continue studying during load-shedding or data constraints. Cache the next 3 study tasks and provide a Quick Tips database for offline assistance.

---

## Architecture

### Components

1. **TaskCacheManager** - Service for caching study tasks
2. **QuickTipsDatabase** - IndexedDB store for pre-generated tips
3. **OfflineIndicator** - Subtle UI component showing connection status
4. **SyncQueue** - Queue for syncing progress when back online

### Data Flow

```
Online: Study Plan → TaskCacheManager → IndexedDB
                                    ↓
                              QuickTipsDatabase
                                    ↓
Offline: IndexedDB → Cached Content Display
                    ↓
         Quick Tips (static, no AI needed)
```

---

## Functionality Specification

### 1. Smart Task Caching

**Behavior:**
- On app load (online), fetch next 3 upcoming tasks from study plan
- Store task content, flashcards, lesson summaries in IndexedDB
- When user completes a task, refresh cache with next task
- Maximum cache: 3 tasks per subject active in study plan

**Cached Data:**
- Task ID, title, description
- Associated flashcards (front/back)
- Lesson content (text, not video)
- Topic tags for quick tips matching

### 2. Quick Tips Database

**Behavior:**
- Pre-generate 20-50 static tips per subject/topic combination
- Store in IndexedDB on first app use (download in background)
- When offline + viewing a subject, show relevant tips

**Tip Structure:**
```typescript
interface QuickTip {
  id: string;
  subject: string;
  topic: string;
  title: string;
  content: string; // Markdown supported
  priority: number; // For sorting
}
```

### 3. Offline Indicator

**Behavior:**
- Subtle banner at bottom of screen (above navbar)
- Shows "Offline - X tasks available" when disconnected
- Green dot + "Synced" when online and data fresh
- Auto-hides after 3 seconds if online

### 4. Sync Queue (Future)

**Behavior:**
- Queue user actions (completed tasks, quiz scores) when offline
- Process queue when connection restored
- Show "Syncing..." indicator during sync

*Note: This is a v1 feature - full sync implementation out of scope*

---

## UI/UX Specification

### Offline Indicator

- Position: Fixed bottom, above navbar (z-index below navbar)
- Height: 32px
- Background: `rgba(0,0,0,0.8)` (dark) / `rgba(255,255,255,0.9)` (light)
- Content: WiFi icon + "Offline" text + task count
- Animation: Slide up on disconnect, slide down on connect

### Cached Content Display

- When accessing cached content offline:
  - Show "Available Offline" badge on task cards
  - Display Quick Tips panel below content
  - Disable AI tutor buttons (show "Available Online" tooltip)

---

## Acceptance Criteria

1. User can view next 3 study tasks when completely offline
2. Quick Tips display correctly for each subject when offline
3. Offline indicator shows correct status
4. Cache refreshes automatically when task is completed
5. App works seamlessly transitioning between online/offline

---

## Out of Scope

- Full sync queue implementation (v2)
- Video content caching
- Real-time collaboration features offline
