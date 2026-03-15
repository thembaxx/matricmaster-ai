# AI Study Buddy - Phase 2: Quiz Flow Enhancement

## Overview
Enhance the quiz experience with better feedback, visual progress, adaptive difficulty, and spaced repetition for weak areas.

## Goals
1. Step-by-step answer breakdowns with detailed explanations
2. Visual progress dashboard showing performance in real-time
3. Adaptive difficulty that adjusts based on performance
4. Spaced repetition to prioritize weak topics

---

## Architecture

### Database Extensions

```sql
-- Track question attempts for spaced repetition
CREATE TABLE question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id),
  question_id VARCHAR(100) NOT NULL,
  topic VARCHAR(200) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  response_time_ms INT,
  attempted_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- Calculate spaced repetition intervals
-- Based on SM-2 algorithm simplified:
-- - Correct: increase interval (1 day -> 3 days -> 7 days -> 14 days)
-- - Wrong: reset to 1 day
```

### Quiz Enhancements

1. **Progress Dashboard** - Real-time stats during quiz
2. **Answer Breakdown** - Detailed step-by-step solution after answering
3. **Adaptive Difficulty** - Skip easier questions if doing well
4. **Spaced Repetition** - Prioritize questions from weak topics

---

## Implementation Components

### New Files

```
src/
├── components/
│   └── Quiz/
│       ├── QuizProgressDashboard.tsx  -- Real-time stats
│       └── AnswerBreakdown.tsx        -- Step-by-step solutions
├── hooks/
│   └── useAdaptiveQuiz.ts             -- Quiz logic with adaptation
├── services/
│   └── spacedRepetition.ts            -- SM-2 algorithm
```

### Modified Files
- `src/screens/Quiz.tsx` - Integrate new components
- `src/lib/db/schema.ts` - Add question_attempts table

---

## Acceptance Criteria

1. [ ] Real-time progress dashboard shows correct/incorrect count
2. [ ] Answer breakdown shows step-by-step solution after answering
3. [ ] Difficulty adapts based on performance (skip easy if doing well)
4. [ ] Weak topics are prioritized in question selection
5. [ ] Question attempts are tracked for spaced repetition

---

## Out of Scope (Future Phases)
- Full spaced repetition queue system
- Detailed analytics dashboard
- Question generation with AI
