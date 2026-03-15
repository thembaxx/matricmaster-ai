# AI Study Buddy - Phase 1 Design

## Overview
Transform the one-time AI explanations into an ongoing, personalized study companion that remembers student struggles, adapts to their learning style, and provides contextual guidance.

## Goals
1. Create persistent AI memory per user
2. Enable personality selection (mentor/tutor/friend)
3. Track confidence patterns per topic
4. Provide adaptive hints based on history

---

## Architecture

### Database Schema

```sql
-- Core: Study Buddy Profile (one per user)
CREATE TABLE study_buddy_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  personality VARCHAR(20) DEFAULT 'mentor', -- 'mentor' | 'tutor' | 'friend'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track conceptual struggles
CREATE TABLE concept_struggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  concept VARCHAR(200) NOT NULL, -- e.g., "quadratic equations", "organic chemistry reactions"
  struggle_count INT DEFAULT 1,
  last_struggle_at TIMESTAMP DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, concept)
);

-- Confidence tracking per topic
CREATE TABLE topic_confidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  topic VARCHAR(200) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 to 1.0
  times_correct INT DEFAULT 0,
  times_attempted INT DEFAULT 0,
  last_attempt_at TIMESTAMP,
  UNIQUE(user_id, topic, subject)
);

-- Conversation history (lightweight)
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_message TEXT NOT NULL,
  topic VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Personality System

Three personalities with distinct prompt templates:

| Personality | Tone | Best For |
|-------------|------|----------|
| `mentor` | Patient, encouraging, explains slowly | Beginners, struggling students |
| `tutor` | Direct, efficient, focuses on accuracy | Exam prep, advanced students |
| `friend` | Casual, supportive, uses emojis | Casual learners, motivation |

---

## User Experience

### Onboarding Flow
1. First-time user sees personality selector
2. Choose: "Guide me gently (Mentor)" / "Be direct with me (Tutor)" / "Make it fun (Friend)"
3. Selection stored in profile

### During Quiz/Practice
- AI monitors correct/incorrect answers
- After 2+ wrong on same concept → auto-suggests "Struggle Alert" card
- Before similar question → shows personalized hint based on history

### Study Buddy Panel
- Sidebar component showing:
  - Current streak with buddy
  - "Concepts you're mastering" list
  - "Keep practicing" items
- Click to start conversation about any topic

---

## Implementation Components

### 1. New Files to Create

```
src/
├── components/
│   └── StudyBuddy/
│       ├── BuddyPanel.tsx       -- Main sidebar component
│       ├── PersonalitySelector.tsx
│       ├── StruggleAlert.tsx    -- Auto-shown when struggling
│       ├── ConfidenceMeter.tsx  -- Visual topic confidence
│       └── BuddyChat.tsx        -- Conversation UI
├── lib/
│   └── study-buddy/
│       ├── memory.ts            -- Load/save memory logic
│       ├── personalities.ts     -- Prompt templates
│       └── hints.ts             -- Hint generation
├── services/
│   └── buddyActions.ts          -- Server actions for DB ops
```

### 2. Modified Files
- `Quiz.tsx` - Integrate struggle tracking
- `Dashboard.tsx` - Add buddy widget

---

## API / Server Actions

```typescript
// src/services/buddyActions.ts

// Get or create user's study buddy profile
export async function getBuddyProfile(userId: string): Promise<BuddyProfile>

// Update personality
export async function setBuddyPersonality(userId: string, personality: 'mentor' | 'tutor' | 'friend'): Promise<void>

// Record struggle with a concept
export async function recordStruggle(userId: string, concept: string): Promise<void>

// Mark concept as resolved
export async function resolveConcept(userId: string, concept: string): Promise<void>

// Update topic confidence after answer
export async function updateConfidence(userId: string, topic: string, subject: string, isCorrect: boolean): Promise<void>

// Get personalized hint for topic
export async function getAdaptiveHint(userId: string, topic: string): Promise<string | null>

// Get user's struggling concepts
export async function getStrugglingConcepts(userId: string): Promise<ConceptStruggle[]>
```

---

## Integration Points

### Quiz Flow (Quiz.tsx)
```typescript
// After checking answer:
await updateConfidence(userId, topic, subject, isCorrect);

if (!isCorrect) {
  await recordStruggle(userId, topic);
  // Show StruggleAlert component
}

// Before showing question:
const hint = await getAdaptiveHint(userId, topic);
if (hint) showPersonalizedHint(hint);
```

### Dashboard Widget
- Shows top 3 concepts needing practice
- Quick-start chat with buddy about any
- Current personality + streak display

---

## Acceptance Criteria

1. [ ] User can select personality on first use
2. [ ] Personality persists across sessions
3. [ ] Wrong answers tracked per concept in DB
4. [ ] After 2+ struggles, UI shows "Struggle Alert"
5. [ ] Confidence score updates after each answer
6. [ ] Adaptive hints shown before questions on weak topics
7. [ ] Buddy panel shows current struggles
8. [ ] Chat works with selected personality tone
9. [ ] Data persists between sessions

---

## Out of Scope (Future Phases)
- Voice interaction with buddy
- Peer study groups
- AI-generated practice questions
- Advanced spaced repetition algorithm
