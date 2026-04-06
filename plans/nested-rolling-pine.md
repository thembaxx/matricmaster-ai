# Implementation Plan: MatricMaster AI — P0 & P1 Feature Improvements

## Context

The strategic assessment identified that MatricMaster AI has strong feature breadth but weak *integration depth*. The three highest-leverage improvements are:
1. **AI Tutor ↔ Flashcard bridge** — the `handleGenerateFlashcards` hook calls the wrong endpoint (generates-only vs. persist)
2. **Exam Countdown Mode** — the most emotionally salient feature for Matric students is buried, not prominent
3. **Calendar Sync completion** — external events are mocked, push to Google Calendar is missing, auto-focus activation needs wiring

---

## Phase 1: AI Tutor → Flashcard Persistence Fix

### Problem
`useAiTutor.handleGenerateFlashcards` calls `POST /api/ai-tutor/flashcards` which generates cards in-memory and opens a modal for *playback only* — cards are never saved to the database. The correct endpoint `POST /api/flashcards/from-conversation` (already implemented) extracts concepts via AI and persists cards to a user deck.

The `SaveAsFlashcardButton` in `AiTutorChat` already calls the persistence endpoint. The hook needs to be updated.

### Files to Change

| File | Change |
|------|--------|
| `src/hooks/useAiTutor.ts` | In `handleGenerateFlashcards` (lines 284–317): replace the API call from `POST /api/ai-tutor/flashcards` to `POST /api/flashcards/from-conversation`. Update the response handling to match the new API's return shape (`{ success, flashcards, deck, count }` instead of `{ flashcards, subject }`). |
| `src/hooks/useAiTutor.ts` | Update `Flashcard` interface (line 33) to include SM-2 fields that the persistence endpoint returns: `deckId?`, `nextReview?`, `easeFactor?` (optional, for display in modal after save). |

### Implementation Details
- The existing `SaveAsFlashcardButton` component handles the "manual save" flow — it has its own DeckSelector, preview, and save logic
- The `handleGenerateFlashcards` in the hook is the "quick generate" path (e.g., "Generate flashcards from our conversation" button)
- After fix: quick generate → concepts extracted + cards saved → confirmation shown → user can review in `FlashcardModal`
- Add a `toast.success()` on save confirming number of cards created and deck name
- If API returns `errors[]` (partial failure), show a warning toast listing failed cards

### Verification
1. Run `handleGenerateFlashcards` in AI Tutor → cards appear in flashcard deck under "AI Tutor" deck
2. Check `flashcardDecks` and `flashcards` tables for new rows with `sourceType = 'ai_tutor'`
3. Verify `SaveAsFlashcardButton` still works independently

---

## Phase 2: Exam Countdown Hero Widget

### Problem
The exam countdown exists (`ExamCountdownPanel`) but is buried in the Smart Scheduler sidebar. For a Matric student, the number of days until exams is the most important number in their life. It should be surfaced prominently on the main Dashboard.

### Files to Change

| File | Change |
|------|--------|
| `src/screens/Dashboard.tsx` | Import and render `<ExamCountdownHero />` at the top of the Today tab. The hero should show: days/hours/minutes until next exam, subject name, paper number, and a "Study Now" CTA that deep-links to the relevant subject's study plan. |
| `src/components/Dashboard/ExamCountdownHero.tsx` (new) | Create a new hero component. Reads `NSC_EXAM_DATES` from `src/content/exam-dates.ts` and `targetExamDate` from `GET /api/study-plans/active`. Shows live countdown (updates every second). Uses `useProgressStore` to get the user's strongest/weakest subject relative to the upcoming exam. |

### Design Decisions
- **Color urgency** (per existing `ExamCountdown.tsx`): red ≤7 days, amber ≤30 days, default >30 days
- **CTA**: "Start Studying" → routes to `/study-plan?subject=X`
- **No exam date set**: Show gentle prompt "Set your exam date in Study Plan to see your countdown"
- **Mobile-first**: Single row, large countdown digits, subject name

### Verification
1. Dashboard renders countdown with correct days/hours/minutes/seconds
2. Countdown updates every second
3. "Start Studying" CTA links to correct subject
4. Responsive at mobile breakpoints

---

## Phase 3: Calendar Sync — Push Study Blocks to Google Calendar

### Problem
The Google Calendar OAuth flow exists, external event fetching is mocked, but pushing study blocks as calendar events is missing. Students need study sessions to appear in their external calendar so they get reminders.

### Files to Change

| File | Change |
|------|--------|
| `src/app/api/calendar/sync/push/route.ts` (new) | Create new route handler. Reads user's `calendarConnections`, exchanges refresh token for valid access token, calls Google Calendar API `POST /calendars/primary/events` for each study block. Returns `{ success, syncedCount, errors[] }`. |
| `src/stores/useScheduleIntegrationStore.ts` | Add `syncToCalendar()` action that calls `POST /api/calendar/sync/push` with the current week's study blocks. |
| `src/components/Calendar/ConnectCalendarButton.tsx` | Add "Push to Calendar" button that calls `syncToCalendar()`. Show toast with result: "5 study sessions synced to Google Calendar". |

### Google Calendar API Payload for Study Block
```
{
  summary: "📚 Mathematics — Quadratic Equations",
  start: { dateTime: "2026-04-07T14:00:00", timeZone: "Africa/Johannesburg" },
  end: { dateTime: "2026-04-07T15:00:00", timeZone: "Africa/Johannesburg" },
  description: "Study session for: Quadratic Equations\nTopic mastery: 65%\nGenerated by MatricMaster AI",
  colorId: "9" (blue),
  reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 15 }] }
}
```

### Verification
1. Connect Google Calendar via OAuth flow
2. Create a study block in Smart Scheduler
3. Click "Push to Calendar" → block appears in Google Calendar
4. Token refresh handles expiration gracefully with user notification

---

## Phase 4: Focus Mode Auto-Activation (Wire Up)

### Problem
`useFocusModeAuto` in `useFocusMode.ts` polls `/api/calendar/external-events` and has auto-activation logic, but it's not integrated into the Focus page. When a scheduled study session starts (detected via external events), Focus Mode should auto-activate.

### Files to Change

| File | Change |
|------|--------|
| `src/app/focus/page.tsx` | Import and call `useFocusModeAuto()` hook on mount. When external event is detected within 5 minutes, show a toast: "Scheduled study session starting in 5 minutes — enter Focus Mode?" with [Enter] / [Skip] buttons. On [Enter], calls `enableAuto()` from `useFocusMode`. |
| `src/hooks/useFocusMode.ts` | The `useFocusModeAuto` hook (lines 76–95) already exists. It needs to: (a) detect study-block-shaped events (by title keyword filter: "study", "math", "physics", etc.), (b) emit an event/callback instead of just `enableAuto()` — so the focus page can show the toast prompt. Refactor to accept a `onUpcomingSession` callback prop. |
| `src/app/focus/page.tsx` | When `isAutoEnabled=true` from the store, auto-start the timer immediately without requiring manual start. |

### Verification
1. User has a study block in Google Calendar for "Mathematics study" in 5 minutes
2. User opens Focus page
3. Toast appears: "Your Mathematics study session starts in 5 minutes — enter Focus Mode?"
4. User accepts → Focus Mode activates, timer auto-starts
5. User declines → timer stays manual

---

## Phase 5: Parent Dashboard — Wire AI Insights

### Problem
`/api/parent-insights` route exists but the Parent Dashboard page doesn't call it. Parents get data but no *recommendations*.

### Files to Change

| File | Change |
|------|--------|
| `src/app/api/parent-insights/route.ts` | Verify the route handler is complete and returns structured insights. Read the file to confirm. |
| `src/screens/ParentDashboard.tsx` | Add a new "AI Insights" section that calls `GET /api/parent-insights`. Render insights as action cards: "Your child struggled with X last week — here are 3 practice problems to try". Each card has a CTA. |
| `src/lib/db/parent-insights.ts` (new if missing) | Create if the route handler requires a new lib file. Should aggregate: child's weak topics (from `topicMastery`), recent quiz scores (from `quizResults`), study streak (from `userProgress`), and generate 2–3 actionable insights. |

### Verification
1. Parent logs in with linked child account
2. Parent Dashboard shows "Insights" tab
3. Shows 2–3 specific, actionable recommendations
4. CTAs link to relevant study content

---

## Phase 6: Unified Progress Dashboard — UX Polish

### Problem
`GET /api/progress/unified` and `UnifiedDashboard.tsx` exist, but the dashboard doesn't surface it prominently. The "Progress" tab on the main Dashboard is underutilized.

### Files to Change

| File | Change |
|------|--------|
| `src/screens/Dashboard.tsx` | Add a prominent "View Full Progress Report" link in the Today tab that navigates to `/progress` (or expands the Progress tab). The Progress tab should render the `UnifiedDashboard` component. |
| `src/components/Progress/UnifiedDashboard.tsx` | Apply "Good news first" principle: reorder cards to show summary → what's improved → what needs attention. Add an "Export Report" button (downloads a simple PDF/print view of the dashboard). |
| `src/app/progress/page.tsx` | Create this page if it doesn't exist. It should render `<UnifiedDashboard fullPage />` for a dedicated URL parents can access. |

### Verification
1. Dashboard Today tab shows a progress summary widget with a "See full report" link
2. `/progress` page renders the full unified dashboard
3. Print/Export produces a clean PDF-friendly view

---

## Critical Files Summary

| File | Purpose |
|------|---------|
| `src/hooks/useAiTutor.ts` | Phase 1: Fix flashcard persistence endpoint |
| `src/screens/Dashboard.tsx` | Phase 2 + 6: Add countdown hero, wire progress tab |
| `src/content/exam-dates.ts` | Phase 2: Read exam dates |
| `src/components/Dashboard/ExamCountdownHero.tsx` | Phase 2: New hero component |
| `src/app/api/calendar/sync/push/route.ts` | Phase 3: New push-to-calendar route |
| `src/stores/useScheduleIntegrationStore.ts` | Phase 3: Add sync action |
| `src/components/Calendar/ConnectCalendarButton.tsx` | Phase 3: Add push button |
| `src/app/focus/page.tsx` | Phase 4: Wire auto-activation toast |
| `src/hooks/useFocusMode.ts` | Phase 4: Refactor auto-activation callback |
| `src/app/api/parent-insights/route.ts` | Phase 5: Verify completeness |
| `src/screens/ParentDashboard.tsx` | Phase 5: Wire AI insights |
| `src/components/Progress/UnifiedDashboard.tsx` | Phase 6: Polish UX |
| `src/app/progress/page.tsx` | Phase 6: Create dedicated page |

## Dependencies

- Phase 3 (Calendar push) depends on Google OAuth tokens being valid — requires `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` env vars
- Phase 5 (Parent Insights) depends on parent-child account linking existing in the auth system
- All phases: PostHog events should be tracked for each user action to measure impact

## Effort Estimate

| Phase | Effort | Notes |
|-------|--------|-------|
| Phase 1: Flashcard fix | 1 day | Simple endpoint swap + toast |
| Phase 2: Exam Countdown hero | 2 days | New component + dashboard integration |
| Phase 3: Calendar push | 2–3 days | New API route + UI button |
| Phase 4: Focus auto-activation | 1 day | Refactor hook + focus page toast |
| Phase 5: Parent AI insights | 2 days | Wire existing API + UI |
| Phase 6: Progress dashboard polish | 2 days | UX reordering + export |

**Total: ~10–12 engineering days** (can be parallelized across 2 engineers)

## Risks & Mitigations

1. **Phase 1**: AI concept extraction quality varies — user confirmation before batch save mitigates
2. **Phase 3**: Google Calendar API quotas — handle 403/429 gracefully with user notification
3. **Phase 4**: Auto-starting timer feels invasive — explicit opt-in + toast prompt first
4. **Phase 5**: Parent Insights requires linked accounts — show empty state with linking instructions if unlinked

## Out of Scope (P1+)

- Quiz ← Past Paper Auto-generation (separate initiative)
- Study Buddy Matching Engine (social team)
- A/B testing infrastructure (platform team)
- WCAG audit (accessibility team)
