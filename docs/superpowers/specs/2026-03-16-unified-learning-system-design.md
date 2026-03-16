# Unified Learning System Design

**Date:** 2026-03-16
**Goal:** Connect existing features into a seamless learning loop + build solid infrastructure for scale

## Overview

This design connects MatricMaster AI's core features into a unified learning system that addresses two primary user challenges:
1. Understanding complex concepts
2. Staying motivated and consistent

The system creates a continuous learning loop where mistakes become study plan items, solved problems become flashcards, and past paper questions trigger AI explanations on demand.

---

## Phase 1: Feature Synergies (The Learning Loop)

### 1.1 Past Papers → AI Explanations

**User Flow:**
- User browses past papers by subject/year
- Each question displays an "Explain" button
- Tapping "Explain" opens AI-generated step-by-step breakdown
- Explanation includes key concepts, formula references, and worked solution

**Technical Requirements:**
- Gemini API integration for question context
- UI: Inline expandable panel or modal
- Store explanation history for offline access

### 1.2 Snap & Solve → Flashcards

**User Flow:**
- User solves problem via Snap & Solve
- After solution displays, show "Save as Flashcard" button
- Flashcard auto-generated with problem + solution
- User can edit before saving
- Saved to user's flashcard deck for spaced repetition

**Technical Requirements:**
- Flashcard creation API
- Deck management UI
- Integration with spaced repetition service (already exists: `src/services/spacedRepetition.ts`)

### 1.3 Mistakes → Study Plan Auto-Generation

**User Flow:**
- User completes a quiz
- Wrong answers are flagged
- Each wrong answer generates a "Micro-Lesson" entry in study plan
- Study plan shows "Suggested Review" section based on mistakes
- User can accept (schedules lesson) or dismiss

**Technical Requirements:**
- Quiz result store (`useQuizResultStore` already exists)
- Study plan integration
- Auto-generate lesson titles from question topics
- Scheduling logic for micro-lessons

---

## Phase 2: Infrastructure

### 2.1 PWA (Progressive Web App)

**Requirements:**
- Service worker for offline capability
- Web app manifest for installability
- App icon and splash screen
- Offline fallback UI

### 2.2 Smart Caching

**Strategy:**
- Cache user's saved flashcards
- Cache recently accessed past papers
- Pre-cache next likely-needed content based on:
  - Current study plan
  - Subject preferences
  - Time of day patterns

### 2.3 Offline Mode

**Supported Offline Features:**
- View saved flashcards
- Review saved past papers
- Complete scheduled flashcard reviews
- Mark study sessions complete (syncs when online)

**Online-Only Features:**
- AI explanations
- New past paper downloads
- Snap & Solve
- Leaderboard updates

---

## Phase 3: Voice AI

### 3.1 Voice Explanations

**User Flow:**
- User taps "Listen" on AI explanation
- Text-to-speech reads the explanation aloud
- Controls: Play, Pause, Speed (1x, 1.5x, 2x)

**Technical Requirements:**
- Web Speech API or TTS service
- Cache audio for replay
- Respect data Saver mode

---

## User Experience Goals

1. **Seamless Learning Loop**: User moves between features without friction
2. **Reduced Cognitive Load**: Clear CTAs guide next actions
3. **Motivation**: Visual progress indicators, streak-friendly design
4. **Accessibility**: Works on low-end devices, offline-capable

---

## Architecture Notes

- All new features maintain existing separation of concerns (stores, services, screens)
- Feature flags for gradual rollout
- Analytics events for each synergy touchpoint (measure usage)
- Mobile-first approach (existing pattern)

---

## Out of Scope

- Voice quiz practice (speaking answers)
- Social features (study buddies, group rooms)
- Payment/monetization features