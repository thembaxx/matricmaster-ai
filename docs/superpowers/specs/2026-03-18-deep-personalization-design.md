# Deep Personalization - Design Specification

**Date:** 2026-03-18  
**Feature:** Deep Personalization (Growth Map + Adaptive Schedule)  
**Status:** Design Approved

---

## Overview

Implement personalization features that automatically identify student weaknesses and adapt the study schedule accordingly. Growth Map visualizes recurring mistakes, while Adaptive Schedule auto-adjusts when students miss goals or struggle with topics.

---

## Architecture

### Components

1. **GrowthMap** - Visual component showing weakness topics
2. **AdaptiveScheduler** - Service for rescheduling missed goals
3. **StruggleDetector** - Identifies when student is struggling with a topic

### Data Flow

```
Quiz/SnapSolve → Mistakes logged → Growth Map Analysis
                                          ↓
                              Identify recurring topics
                                          ↓
                              StruggleDetector → AdaptiveScheduler
                                          ↓
                              Reschedule + Add Extra Practice
```

---

## Functionality Specification

### 1. Growth Map

**Behavior:**
- Aggregate mistakes from quizzes and Snap & Solve
- Count mistakes per topic
- Show top 5-10 weakest topics
- Display as horizontal bar chart

**Data Sources:**
- Quiz mistakes (existing)
- Snap & Solve mistakes (new)
- Topic mastery scores (existing)

**UI:**
- Bar chart showing topics by mistake count
- Color coding: red (high mistakes), yellow (medium), green (low)
- Click topic to see detail

### 2. Adaptive Schedule

**Behavior:**
- Check daily for missed study goals
- Check quiz scores for struggling topics (score < 60%)
- When detected:
  1. Reschedule missed goal to next available day
  2. Add "Extra Practice" task for struggling topic
- Notify student of schedule changes

**Triggers:**
- Study goal not completed by scheduled time
- Quiz score < 60% on a topic
- 3+ mistakes on same topic in one week

---

## Acceptance Criteria

1. Growth Map shows top topics by mistake count
2. Growth Map includes data from both Quiz and Snap & Solve
3. Adaptive scheduler detects missed goals
4. Adaptive scheduler adds extra practice when struggling
5. Student notified of schedule changes

---

## Out of Scope

- Full AI-powered study plan generation
- Complex multi-goal rescheduling algorithms
- Parent notifications
