# MatricMaster AI Feature Roadmap Specification

> Version 1.0 | Q2-Q3 2026

---

## 1. Executive Summary

This document defines the prioritized feature improvements for MatricMaster AI, focusing on high-impact integrations between existing features and new capabilities. The roadmap addresses P0 (critical), P1 (important), and P2 (valuable) features.

---

## 2. Priority Matrix

| Priority | Feature | Impact | Effort | Dependencies |
|----------|---------|--------|--------|--------------|
| **P0** | AI Tutor ↔ Flashcard Integration | High | Medium | AI Tutor, Flashcard system |
| **P0** | Unified Progress Dashboard | High | Medium | Analytics APIs, Study plans |
| **P1** | Smart Scheduler ↔ Calendar Sync | High | Medium | Google Calendar API |
| **P1** | Quiz ← Past Paper Auto-generation | High | High | PDF extraction, Quiz engine |
| **P2** | Parent Dashboard ↔ AI Insights | Medium | Medium | Notification system |
| **P2** | Study Buddy Matching | Medium | High | Buddy system, AI |
| **P3** | Offline Quiz Mode | Medium | Medium | Offline storage (IDB) |
| **P3** | Multi-language Support | Medium | High | i18n infrastructure |

---

## 3. P0 Features - Detailed Specifications

### 3.1 AI Tutor ↔ Flashcard Integration

**Current State:** Partially implemented - `handleGenerateFlashcards` exists in `useAiTutor.ts`

**Gap Analysis:**
- "Save as Flashcard" button not in AI responses
- No concept extraction from conversation for automatic flashcard creation
- Flashcard modal shows but no inline action buttons

**Requirements:**
1. Inline "Save as Flashcard" button on assistant messages with key concepts
2. Auto-detect concepts from conversation and prompt user to create flashcards
3. Batch generate flashcards from conversation summary
4. Link generated flashcards to study plan automatically

**API Changes:**
- `POST /api/ai-tutor/extract-concepts` - Returns concepts for flashcard generation
- `POST /api/flashcards/from-conversation` - Create flashcards from conversation

**Success Metrics:**
- Flashcard creation rate: 15% → 40% of conversations

---

### 3.2 Unified Progress Dashboard

**Current State:** Multiple fragmented analytics views exist

**Requirements:**
1. Single view aggregating:
   - Topics studied (AI Tutor)
   - Flashcards mastered
   - Quiz performance by topic
   - Study plan progress
2. Visual indicators for weak areas
3. Comparison with peers (anonymized)
4. Exportable progress reports

**API Changes:**
- `GET /api/progress/unified` - Aggregates all learning metrics

**Success Metrics:**
- Study Plan Completion: 45% → 65%

---

## 4. P1 Features - Detailed Specifications

### 4.1 Smart Scheduler ↔ Calendar Sync

**Requirements:**
1. Two-way sync with Google Calendar
2. Auto-create calendar events for scheduled study sessions
3. Pull external events into Smart Scheduler
4. Focus Mode auto-activation when scheduled study starts

**API Changes:**
- `POST /api/calendar/sync` - Sync with external calendars
- `GET /api/calendar/external-events` - Fetch external calendar events

**Success Metrics:**
- Focus session completion: +25%

---

### 4.2 Quiz ← Past Paper Auto-generation

**Requirements:**
1. PDF text extraction from past papers
2. Question identification and classification
3. Auto-generate quizzes from extracted questions
4. Link to curriculum topics

**API Changes:**
- `POST /api/past-papers/extract-questions` - Extract questions from PDF
- `POST /api/quiz/from-past-paper` - Generate quiz from past paper

**Success Metrics:**
- Past paper engagement: +35%

---

## 5. Cross-Feature Data Flows

```
AI Tutor Conversation
        ↓
   Extract key concepts
        ↓
   → Generate Flashcards (new)
   → Add to Study Plan (new)
   → Recommend Past Papers (link to existing)
   → Create Quiz (link to existing)
```

---

## 6. Architectural Implications

### 6.1 Unified Learning State

Create a LearningContext that tracks:
- Topics studied (AI Tutor)
- Flashcards mastered
- Quiz performance by topic
- Study plan progress

### 6.2 API Contract Changes

- `POST /api/ai-tutor/extract-concepts` - Returns concepts for flashcard generation
- `GET /api/progress/unified` - Aggregates all learning metrics
- `POST /api/study-plan/link-quiz` - Links quiz to study plan topic

### 6.3 Backward Compatibility

- All new APIs return versioning in headers
- Frontend feature flags for gradual rollout
- Graceful degradation when integrations unavailable

---

## 7. Synergy Map

| Feature A | Feature B | Synergy Scenario | Value |
|-----------|-----------|------------------|-------|
| AI Tutor | Flashcards | "Save as Flashcard" button in AI responses | +40% flashcard creation |
| Smart Scheduler | Focus Mode | Auto-enable focus when scheduled study starts | +25% focus session completion |
| Quiz | Analytics | Post-quiz weak topic → AI Tutor recommendation | +30% remedial learning |
| Parent Dashboard | Study Plan | Parents see child's upcoming schedule | +15% parental engagement |
| Study Buddies | Focus Rooms | Join focus room with buddy | +20% social study retention |
| Snap & Solve | Past Papers | Solve → "Similar questions in past papers" | +35% past paper engagement |

---

## 8. Edge Case & Risk Register

| Category | Risk | Likelihood | Impact | Mitigation |
|----------|------|------------|--------|------------|
| Performance | AI tutor timeout on slow connections | High | Medium | Cache common explanations; progressive UI |
| Scalability | Database connection limits during exam season | Medium | High | Connection pooling; read replicas |
| Security | AI-generated content hallucinations | High | High | Source citations required; user feedback loop |
| Privacy | Parent accessing minor data without consent | Low | High | Explicit consent flow; age verification |
| Compliance | POPIA - storing student performance data | Medium | High | Data minimization; opt-in analytics |
| Accessibility | Screen reader incompatibility | Medium | Medium | WCAG audit; ARIA labels |
| Offline | Load shedding - loss of study time | High | Medium | Offline content caching; study reminders |
| Availability | Third-party API failures (Gemini, Paystack) | Medium | High | Fallback models; retry logic |

---

## 9. Validation Plan

| Metric | Target | Measurement |
|--------|--------|-------------|
| Daily Active Users (DAU) | 10,000 → 25,000 | Analytics |
| AI Tutor Sessions per User | 3 → 8/week | Event tracking |
| Flashcard Creation Rate | 15% → 40% of conversations | Conversion funnel |
| Study Plan Completion | 45% → 65% | Progress tracking |
| Parent Dashboard Adoption | 10% → 30% of families | Feature usage |
| Quiz Completion Rate | 60% → 80% | Quiz events |
| Offline Usage | N/A → 20% of sessions | Offline events |

**Decision Gates:**
- P0 features require >80% unit test coverage
- P1 features require user testing with 5+ students
- All features require WCAG AA compliance

---

## 10. Near-Term Roadmap (Q2-Q3 2026)

### Month 1-2 (Quick Wins)
- AI Tutor → Flashcard integration
- Unified progress dashboard
- Fix critical performance issues

### Month 3-4 (Integration)
- Calendar sync (Google Calendar)
- Parent AI insights
- Quiz from past papers (Beta)

### Month 5-6 (Scale)
- Study buddy matching
- Offline quiz mode
- Afrikaans interface

---

## 11. Information Gaps

- User analytics data: Current usage patterns by feature are not visible in codebase
- Conversion metrics: Free-to-paid funnel data needed
- A/B testing infrastructure: Not evident in current implementation
- Error tracking: Sentry is configured but need clarity on error volume