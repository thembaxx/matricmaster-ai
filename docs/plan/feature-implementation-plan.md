# MatricMaster AI - Feature Implementation Plan

## Executive Summary

This plan outlines all unimplemented or partially implemented features in the MatricMaster AI application.

---

## Current Feature Status

### Fully Implemented (Connected to Database)
- Dashboard, Leaderboard, Achievements
- Study Buddies, AI Tutor, Study Plan
- Bookmarks, Notifications, Calendar
- Past Papers

### Partially Implemented (Need Data/Mock)
- Lessons (hardcoded mock data)
- Study Path (DEMO_JOURNEY hardcoded)
- Study Companion (hardcoded cards)
- Flashcards (needs data population)
- Quizzes (limited questions)
- Interactive Quiz, Practice Quiz

### Needs Implementation
- Comments System
- Study Channels
- Focus Mode, Planner, Schedule
- Search
- Review Dashboard

---

## Mock Data Requirements

### 1. Lesson Content
Create JSON files in src/constants/lessons/ for:
- Math (50+ lessons)
- Physics (40+ lessons)  
- Chemistry (30+ lessons)
- Life Sciences (35+ lessons)

### 2. Quiz Question Bank
Expand quiz-data.ts from ~20 to 500+ questions covering:
- Mathematics, Physical Sciences, Life Sciences
- Geography, Accounting, English HL

### 3. Study Paths
Create study-paths.json with curated learning sequences

### 4. Study Companion
Create interactions.json with prompts linked to AI Tutor

---

## Implementation Phases

### Phase 1: Core Content (Week 1-2)
1. Expand quiz question bank
2. Create lesson content JSON files
3. Build study path data

### Phase 2: Interactive Features (Week 2-3)
1. Connect Study Companion to AI Tutor
2. Implement full quiz engine with timer/scoring
3. Add spaced repetition for Practice Quiz

### Phase 3: Social Features (Week 3-4)
1. Build Study Channels with Ably
2. Implement Comments system
3. Enhance Study Buddy features

### Phase 4: Advanced (Week 4-5)
1. Focus Mode (Pomodoro timer)
2. Planner/Schedule
3. Global Search
4. Review Dashboard

---

## Data Sources for Web Scraping
- education.gov.za (NSC Past Papers)
- sacai.co.za (Subject resources)
- Education department curriculum docs

---

## API Endpoints Needed
- GET/POST /api/lessons
- GET/POST /api/quiz/*
- GET/POST /api/study-paths
- GET/POST /api/search
- GET/POST /api/comments

---

## Priority Order

### HIGH
1. Quiz question bank expansion
2. Interactive quiz engine
3. Study Companion AI integration
4. Lesson content

### MEDIUM
5. Study Channels
6. Search functionality
7. Review Dashboard

### LOW
8. Focus Mode
9. Planner/Schedule
10. Comments

---

## Files to Create
- src/constants/lessons/math.json
- src/constants/lessons/physics.json
- src/constants/lessons/chemistry.json
- src/constants/lessons/life-sciences.json
- src/constants/study-paths.json
- src/constants/interactions.json
