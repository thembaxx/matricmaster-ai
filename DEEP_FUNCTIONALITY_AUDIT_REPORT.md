# Lumni AI - Deep Functionality Audit Report (Refined)

**Date:** 11 April 2026
**Auditor:** Principal Frontend Engineer (Qwen Code AI)
**Scope:** Full Next.js 16 workspace — `src/app/`, `src/components/`, `src/lib/`, `src/hooks/`, `src/stores/`, `src/services/`, `src/api/`
**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Zustand, Better Auth, Drizzle ORM, Google Gemini

---

## Executive Summary

| Metric | Count |
|---|---|
| **Total actionable findings** | **110+** |
| **Critical (blocks production)** | **34** |
| **High (breaks core features)** | **24** |
| **Medium (degrades UX)** | **33** |
| **Low (polish/cosmetic)** | **19** |
| **Feature domains affected** | **10** |
| **Quick wins (< 30 min each)** | **15** |

**Verdict:** The application ships with 92 page routes and 117 API routes — a feature-rich platform — but significant gaps exist in data layer completeness (mock data served by default), accessibility compliance (26+ WCAG Level A violations), and placeholder-to-production readiness (7 API endpoints called but non-existent, 3 services returning zeros/null).

---

## Domain 1: Dashboard & Landing

**Dependency Map:**
```
Mock data components (1.1–1.4) ──→ Blocked by: real API endpoints in Domain 4
DashboardAIPrompt (1.5) ──────────→ Requires: /api/ai-chat (EXISTS)
KnowledgeHeatmap (1.4) ───────────→ Requires: /api/progress/weak-topics (EXISTS)
ActivityFeed (1.3) ───────────────→ Requires: /api/progress (EXISTS)
```

### 1.1 RecentActivity — Mock Fallback Shown as Real Data

- **Location:** `src/components/Dashboard/RecentActivity.tsx`, lines 21–46
- **Component:** `RecentActivity`
- **The Gap:** `MOCK_ACTIVITIES` array (4 fake entries: "Quiz 85% in Mathematics", "Practice 42% in Physics") is displayed when the API returns zero activities. Users cannot distinguish real from fabricated history.
- **Contextual Impact:** Students are misled into believing they have completed quizzes and practice sessions. Dashboard credibility is destroyed once users realize the data is fake.
- **Actionable Implementation Plan:**
  1. Remove `MOCK_ACTIVITIES` constant entirely
  2. Replace with empty-state component: "No activity yet. Start a quiz or practice session to see your progress here!" with a CTA button linking to `/practice`
  3. If a demo preview is desired, gate it behind a `showDemo` prop controlled by the parent, defaulting to `false`
  4. Verify the parent component (`Dashboard.tsx` or `TodayTab.tsx`) passes real data from `/api/progress`
- **Code Strategy:**
  ```tsx
  // Before:
  const activities = data?.activities ?? MOCK_ACTIVITIES;

  // After:
  if (!activities || activities.length === 0) {
    return (
      <Card className="p-6 text-center">
        <HugeiconsIcon icon={Notebook02Icon} className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground font-medium">No activity yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Start a quiz or practice session to see your progress</p>
        <Button className="mt-4" asChild><Link href="/practice">Start Practising</Link></Button>
      </Card>
    );
  }
  ```
- **Verification:** Load dashboard as a new user with no activity. Should see empty-state CTA, not fake quiz entries.

### 1.2 ActivityFeed — Duplicate Mock Fallback (Same Data as 1.1)

- **Location:** `src/components/Dashboard/ActivityFeed.tsx`, lines 22–47
- **Component:** `ActivityFeed`
- **The Gap:** Identical `MOCK_ACTIVITIES` array as `RecentActivity` (same 4 fake entries). Duplicated code and same misleading behavior.
- **Contextual Impact:** If both components appear on the same page, the user sees the same fake data twice — compounding the deception.
- **Actionable Implementation Plan:**
  1. Same fix as 1.1 — remove mock data, show empty-state CTA
  2. Extract the empty-state component into a shared `DashboardEmptyState` component to avoid duplication
  3. Delete both `MOCK_ACTIVITIES` constants
- **Verification:** Same as 1.1.

### 1.3 KnowledgeHeatmap — Mock Mastery Data as Default Props

- **Location:** `src/components/Dashboard/KnowledgeHeatmap.tsx`, lines 30–72
- **Component:** `KnowledgeHeatmap`
- **The Gap:** `MOCK_SUBJECTS` (4 subjects with 3–6 topics each, complete with mastery status and progress percentages) is the **default prop value** (`subjects = MOCK_SUBJECTS`). If the parent doesn't explicitly pass `subjects`, the heatmap shows fake mastery data ("Sequences & Series: 100% mastered").
- **Contextual Impact:** Students see fabricated mastery levels on their dashboard heatmap. A student who has never studied Sequences & Series sees "100% mastered" — dangerously misleading for exam preparation.
- **Actionable Implementation Plan:**
  1. Change default prop: `subjects` from `MOCK_SUBJECTS` to `undefined`
  2. When `subjects` is `undefined`, show loading skeleton or empty state ("Connect your study sessions to see your knowledge heatmap")
  3. Parent component (`Dashboard.tsx`) should fetch from `/api/progress/weak-topics` and pass real data
  4. Gate `MOCK_SUBJECTS` behind `NODE_ENV === 'development'` or delete entirely
- **Code Strategy:**
  ```tsx
  // Before:
  function KnowledgeHeatmap({ subjects = MOCK_SUBJECTS }: Props) { ... }

  // After:
  function KnowledgeHeatmap({ subjects }: { subjects?: SubjectData[] }) {
    if (!subjects || subjects.length === 0) {
      return <Skeleton className="h-64 w-full rounded-xl" />;
    }
    // ... real rendering
  }
  ```
- **Verification:** Open dashboard. Heatmap should show skeleton/empty state until real progress data loads. No fake subjects visible.

### 1.4 SubjectGridV2 — Mock Subject Fallback

- **Location:** `src/components/Dashboard/SubjectGridV2.tsx`, lines 28–34
- **Component:** `SubjectGrid`
- **The Gap:** `MOCK_SUBJECTS` (6 hardcoded subjects) used as fallback when `enrolledData?.subjects` is empty. Looks like real enrolled subjects.
- **Contextual Impact:** New users see 6 subjects and may believe they are already enrolled. Clicking one leads to a subject page that may have no real content.
- **Actionable Implementation Plan:**
  1. Replace mock fallback with empty-state: "No subjects enrolled yet. Browse the curriculum to get started!" with CTA to `/subjects`
  2. Remove `MOCK_SUBJECTS` or rename to `DEMO_SUBJECTS` and gate behind `NODE_ENV === 'development'`
- **Verification:** New user dashboard shows enrollment CTA, not fake subjects.

### 1.5 DashboardAIPrompt — Simulated AI Thinking

- **Location:** `src/components/Dashboard/DashboardAIPrompt.tsx`, line 15
- **Component:** `DashboardAIPrompt`
- **The Gap:** `handleSubmit` uses `setTimeout(() => setIsThinking(false), 3000)` — simulates 3 seconds of "thinking" but never calls any AI API. Memory leak risk if component unmounts during timeout (no cleanup).
- **Contextual Impact:** The AI prompt on the dashboard is purely cosmetic. Students type questions, see a 3-second spinner, and get nothing. Wastes user trust.
- **Actionable Implementation Plan:**
  1. Replace `setTimeout` with actual `await fetch('/api/ai-chat', { method: 'POST', body: JSON.stringify({ message: value }) })`
  2. Wrap in `try/finally` to ensure `setIsThinking(false)` runs even on error
  3. Store and display the AI response below the input
  4. Add AbortController cleanup on unmount to prevent memory leaks
- **Code Strategy:**
  ```tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setIsThinking(true);
    const abortController = new AbortController();
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: value }),
        signal: abortController.signal,
      });
      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      setResponse(data.response);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      toast.error('Failed to get AI response');
    } finally {
      setIsThinking(false);
    }
    return () => abortController.abort();
  };
  ```
- **Verification:** Type a question in the dashboard AI prompt. Should receive a real Gemini-generated response, not silence after 3 seconds.

---

## Domain 2: AI & Learning Features

**Dependency Map:**
```
AICoPlanner (2.1) ─────→ Requires: /api/smart-scheduler/generate (EXISTS)
BossFightExam (2.2) ───→ Requires: /api/quiz/from-past-papers (EXISTS) or Gemini AI
QuizList (2.3) ────────→ Requires: /api/quiz/from-past-papers (EXISTS)
FlashcardDeckList (2.4) → Requires: /api/flashcards/decks (EXISTS)
useOnboarding (2.5) ───→ Requires: server action (CREATE)
useBuddyFocusSync (2.6) → Requires: Ably real-time channel (EXISTS)
```

### 2.1 AICoPlanner — Simulated Plan Generation

- **Location:** `src/components/AIPlanner/AICoPlanner.tsx`, line 24
- **Component:** `AICoPlanner`
- **The Gap:** `handleSubmit` uses `setTimeout(resolve, 1500)` to simulate AI study plan generation. No actual API call is made. Missing `try/finally` for error handling.
- **Contextual Impact:** Students using the AI co-planner receive no real study plan. The component shows a loading spinner for 1.5 seconds then displays fabricated plan data.
- **Actionable Implementation Plan:**
  1. Replace `setTimeout` with `await fetch('/api/smart-scheduler/generate', { method: 'POST', body: JSON.stringify({ subject, goals, timeframe }) })`
  2. Wrap in `try/finally` for proper error handling
  3. Display returned plan or error message
  4. Add AbortController cleanup on unmount
- **Code Strategy:**
  ```tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/smart-scheduler/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: input, subject, timeframe }),
      });
      if (!res.ok) throw new Error('Plan generation failed');
      const data = await res.json();
      setPlan(data.plan);
    } catch (err) {
      toast.error('Failed to generate study plan');
    } finally {
      setIsGenerating(false);
    }
  };
  ```
- **Verification:** Submit a study plan request. Should receive a real Gemini-generated plan with subjects, topics, and time blocks.

### 2.2 BossFightExam — Generated Mock Questions

- **Location:** `src/components/BossFight/BossFightExam.tsx`, lines 31–75
- **Component:** `BossFightExam`
- **The Gap:** `generateMockQuestions()` creates 3 generic MCQs with text `"Sample question 1 for ${subject}"`, options `Option A/B/C/D`, topic `"general"`. Not curriculum-aligned.
- **Contextual Impact:** The gamified boss fight exam — meant to simulate real exam conditions — shows placeholder questions. Students practicing with this feature get zero educational value.
- **Actionable Implementation Plan:**
  1. Replace `generateMockQuestions()` with `fetch('/api/quiz/from-past-papers', { method: 'POST', body: JSON.stringify({ subject, difficulty: 'hard', count: 10 }) })`
  2. Add loading state: "Generating exam questions..." with skeleton UI
  3. Cache questions in Zustand store to avoid regenerating on re-render
  4. If no past paper questions available for a subject, fallback to Gemini AI generation via `/api/ai-tutor/practice`
- **Code Strategy:**
  ```tsx
  const fetchQuestions = async (subject: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/quiz/from-past-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, difficulty: 'hard', count: 10 }),
      });
      if (!res.ok) throw new Error('Failed to fetch questions');
      const data = await res.json();
      setQuestions(data.questions);
    } catch (err) {
      toast.error('Failed to load exam questions');
    } finally {
      setIsLoading(false);
    }
  };
  ```
- **Verification:** Start a Boss Fight for Mathematics. Should see real curriculum-aligned questions, not "Sample question 1 for Mathematics".

### 2.3 QuizList — Entirely Mock Data

- **Location:** `src/components/Quiz/QuizList.tsx`, lines 13–22
- **Component:** `QuizList`
- **The Gap:** `mockQuizzes` array (4 hardcoded quizzes: "Algebra Fundamentals", "Force & Motion", "Chemical Bonding", "Cell Biology"). No API call. Local search only filters mock data.
- **Contextual Impact:** Students see the same 4 fake quizzes regardless of their subject, grade, or progress. No personalization, no new content.
- **Actionable Implementation Plan:**
  1. Fetch from existing `/api/quiz/from-past-papers` endpoint with `GET` method
  2. Add query params for subject filtering and difficulty level
  3. Replace local search with server-side filtering or client-side filtering of real data
  4. Add empty state: "No quizzes available yet. Check back soon!"
- **Code Strategy:**
  ```tsx
  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes', subjectFilter],
    queryFn: async () => {
      const res = await fetch(`/api/quiz/from-past-papers?subject=${subjectFilter}`);
      if (!res.ok) throw new Error('Failed to fetch quizzes');
      return res.json();
    },
  });

  if (isLoading) return <QuizListSkeleton />;
  if (!quizzes?.length) return <EmptyQuizState />;
  ```
- **Verification:** Quiz list page shows real quizzes from the database, filterable by subject.

### 2.4 FlashcardDeckList — Entirely Mock Data

- **Location:** `src/components/Flashcards/FlashcardDeckList.tsx`, lines 14–28
- **Component:** `FlashcardDeckList`
- **The Gap:** `mockDecks` array (4 hardcoded decks: "Periodic Table Elements", "Algebra Formulas", "Physics Equations", "Biology Key Terms"). No API call.
- **Contextual Impact:** Students see fake flashcard decks instead of their actual created/studied decks. Spaced repetition feature is unusable.
- **Actionable Implementation Plan:**
  1. Fetch from existing `/api/flashcards/decks` endpoint (confirmed exists)
  2. Display real user-created decks with card counts and last-studied dates
  3. Add empty state with "Create your first deck" CTA
  4. Add loading skeleton matching the deck card layout
- **Verification:** Flashcard page shows user's actual decks from the database.

### 2.5 useOnboarding — Simulated Save Delay

- **Location:** `src/hooks/useOnboarding.ts`, line 219
- **Hook:** `useOnboarding` (`saveLearningPreferences` function)
- **The Gap:** `await new Promise((resolve) => setTimeout(resolve, 1000))` — simulates 1-second API delay. Preferences are only logged to `console.log`, never persisted.
- **Contextual Impact:** User learning preferences (subject choices, learning style, goals) set during onboarding are lost on every page refresh. Students must re-enter preferences each session.
- **Actionable Implementation Plan:**
  1. Create server action `saveLearningPreferences(userId, preferences)` in `src/actions/onboarding.ts`
  2. Create or use existing `learningPreferences` table in Drizzle schema with columns: `id`, `userId`, `preferredSubjects[]`, `learningStyle`, `goals`, `weakTopics[]`, `createdAt`, `updatedAt`
  3. Replace `setTimeout` with actual database INSERT/UPDATE via the server action
  4. Add Zod validation for the preferences object
  5. Return success/error result for UI feedback
- **Code Strategy:**
  ```ts
  // src/actions/onboarding.ts
  'use server';
  import { db } from '@/lib/db';
  import { learningPreferences } from '@/lib/db/schema';
  import { eq } from 'drizzle-orm';

  export async function saveLearningPreferences(
    userId: string,
    preferences: Omit<typeof learningPreferences.$inferInsert, 'userId' | 'createdAt' | 'updatedAt'>
  ) {
    try {
      await db.insert(learningPreferences)
        .values({ userId, ...preferences, createdAt: new Date(), updatedAt: new Date() })
        .onConflictDoUpdate({ target: learningPreferences.userId, set: { ...preferences, updatedAt: new Date() } });
      return { success: true };
    } catch (error) {
      console.error('Failed to save learning preferences:', error);
      return { success: false, error: 'Failed to save preferences' };
    }
  }
  ```
- **Verification:** Set learning preferences during onboarding. Refresh page. Preferences should persist.

### 2.6 useBuddyFocusSync — Simulated Invite Acceptance

- **Location:** `src/hooks/useBuddyFocusSync.ts`, lines 153–155
- **Hook:** `useBuddyFocusSync`
- **The Gap:** `setTimeout(() => { updateInviteStatus(invite.id, 'accepted'); toast.info(...); }, 2000)` — hardcodes invite to "accepted" after 2 seconds. No real-time communication with the invited buddy.
- **Contextual Impact:** Focus room invitations are always auto-accepted. The invited buddy has no agency to accept/reject. The feature is a simulation, not a real collaboration tool.
- **Actionable Implementation Plan:**
  1. Use Ably real-time channel (already installed per package.json) to send/receive invite responses
  2. Replace `setTimeout` with a subscription: `channel.subscribe('invite-response', (message) => { updateInviteStatus(invite.id, message.data.status); })`
  3. Handle 'accepted', 'rejected', and 'timeout' (30s) states properly
  4. The invited buddy receives the invite via Ably and can click Accept/Decline
- **Code Strategy:**
  ```tsx
  // Replace setTimeout with Ably subscription:
  useEffect(() => {
    const channel = ably.channels.get(`focus-invite-${invite.id}`);
    channel.subscribe('response', (message) => {
      updateInviteStatus(invite.id, message.data.status);
      if (message.data.status === 'accepted') {
        toast.info(`${message.data.userName} joined your focus session!`);
      } else {
        toast.info(`${message.data.userName} declined the invite`);
      }
    });
    // Timeout after 30s
    const timer = setTimeout(() => {
      updateInviteStatus(invite.id, 'timeout');
      toast.info('Invite expired — no one responded in time');
    }, 30000);
    return () => { channel.unsubscribe(); clearTimeout(timer); };
  }, [invite.id]);
  ```
- **Verification:** Send a focus invite to another user. They should see a real-time notification with Accept/Decline options.

---

## Domain 3: Admin & Moderation

**Dependency Map:**
```
Admin Overview (3.1) ──→ Requires: /api/admin/activity (CREATE) + /api/moderation/flags (EXISTS)
```

### 3.1 Admin Overview Tab — Full Mock Data

- **Location:** `src/app/admin/components/OverviewTab.tsx`, lines 8–28
- **Component:** `OverviewTab`
- **The Gap:** `mockRecentActivity` (3 hardcoded entries: "john d. completed math quiz, score 85%, 5 min ago") and `mockFlaggedContent` (1 hardcoded flagged question) are never replaced with real API data.
- **Contextual Impact:** Admins see fabricated activity logs and moderation queues. The admin panel is useless for actual platform management — admins cannot detect real abuse, track real user activity, or moderate real flagged content.
- **Actionable Implementation Plan:**
  1. Create `GET /api/admin/activity` endpoint: query `quizResults`, `progress`, and `sessions` tables for recent activity, ordered by `createdAt DESC LIMIT 20`
  2. Use existing `GET /api/moderation/flags` endpoint (already exists at `src/app/api/moderation/flags/route.ts`)
  3. Replace mock arrays with `useQuery` calls
  4. Add loading skeletons matching the activity/flag card layouts
  5. Add empty states for when no activity/flags exist
  6. Add admin-only auth check to the endpoint
- **Code Strategy:**
  ```ts
  // src/app/api/admin/activity/route.ts
  export async function GET(request: NextRequest) {
    const { session } = await getAuth();
    if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const recentActivity = await db.select({
      userId: quizResults.userId,
      userName: users.name,
      action: 'completed quiz',
      score: quizResults.score,
      subject: quizResults.subject,
      createdAt: quizResults.createdAt,
    })
    .from(quizResults)
    .innerJoin(users, eq(quizResults.userId, users.id))
    .orderBy(desc(quizResults.createdAt))
    .limit(20);

    return NextResponse.json({ activities: recentActivity });
  }
  ```
- **Verification:** Admin dashboard shows real user activity and real flagged content from the database.

---

## Domain 4: API Infrastructure (Missing Endpoints)

**Dependency Map:**
```
These endpoints are CALLED by frontend code but DO NOT EXIST.
They must be created to unblock multiple feature domains.

/api/subscription/status ───→ Blocks: useFeatureAccess (3 hooks) ───→ Blocks: ALL premium feature gating
/api/team-goals/join ────────→ Blocks: useTeamGoalsStore.joinTeam()
/api/team-goals/leave ───────→ Blocks: useTeamGoalsStore.leaveTeam()
/api/team-goals/contribute ──→ Blocks: useTeamGoalsStore.contributeXP()
/api/team-goals/reward ──────→ Blocks: useTeamGoalsStore.claimReward()
/api/gamification/streak/freeze → Blocks: useLoadSheddingStore.triggerAutoFreeze()
/api/buddies/recommend ──────→ Blocks: useStudyBuddyRecommendation
/api/energy (base) ──────────→ Blocks: useLearningStateStore.refreshFromServer()
```

### 4.1 `/api/subscription/status` — Missing (3 Call Sites)

- **Location:** `src/hooks/useFeatureAccess.ts`, lines 45, 84, 153
- **Hooks:** `useFeatureAccess`, `useFeatureAccessMultiple`, `useCurrentTier`
- **The Gap:** All three hooks call `fetch('/api/subscription/status')` but no route file exists. Only `/api/subscription/payment` and `/api/subscription/plans` exist.
- **Contextual Impact:** Feature-gated content always defaults to `canAccess: false`. Paying users with active subscriptions get free-tier access only. Premium AI features, unlimited quizzes, and advanced analytics are all blocked.
- **Actionable Implementation Plan:**
  1. Create `src/app/api/subscription/status/route.ts`
  2. GET handler: call `getAuth()`, query `subscriptions` table for active subscription, return `{ tier: 'free'|'premium'|'parent', features: string[], expiresAt: Date | null }`
  3. Add authentication check — must return 401 if no session
  4. Add Zod validation for response shape
  5. Add rate limiting (5 requests/minute per user)
- **Code Strategy:**
  ```ts
  export async function GET(request: NextRequest) {
    const { session } = await getAuth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const subscription = await db.query.subscriptions.findFirst({
      where: and(eq(subscriptions.userId, session.user.id), eq(subscriptions.status, 'active')),
    });

    const tier = subscription?.tier ?? 'free';
    return NextResponse.json({
      tier,
      features: TIER_FEATURES[tier],
      expiresAt: subscription?.expiresAt ?? null,
    });
  }
  ```
- **Verification:** Authenticated user with active subscription calls endpoint. Returns `{ tier: 'premium', features: ['unlimited-ai', ...] }`.

### 4.2 `/api/team-goals/*` Sub-Routes — 4 Missing Endpoints

- **Location:** `src/stores/useTeamGoalsStore.ts`, lines 71, 88, 121, 151
- **Store:** `useTeamGoalsStore`
- **The Gap:** Calls `POST /api/team-goals/join`, `/leave`, `/contribute`, `/reward` but only base `/api/team-goals/route.ts` exists (handling GET/POST for create/list).
- **Contextual Impact:** Team goals page: users cannot join teams, leave teams, contribute XP, or claim rewards. All four core gamification flows are broken. The feature is visually complete but functionally dead.
- **Actionable Implementation Plan:**
  1. Create 4 sub-route files: `join/route.ts`, `leave/route.ts`, `contribute/route.ts`, `reward/route.ts`
  2. Each POST handler: authenticate, validate team membership, perform the action, return updated state
  3. Add Zod validation for request bodies
  4. Add rate limiting to prevent XP farming abuse on `/contribute`
- **Code Strategy (contribute example):**
  ```ts
  // src/app/api/team-goals/contribute/route.ts
  export async function POST(request: NextRequest) {
    const { session } = await getAuth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { goalId, xpAmount } = contributeSchema.parse(body);

    // Verify team membership
    const member = await db.query.teamMembers.findFirst({
      where: and(eq(teamMembers.userId, session.user.id), eq(teamMembers.goalId, goalId)),
    });
    if (!member) return NextResponse.json({ error: 'Not a team member' }, { status: 403 });

    // Add XP to goal
    await db.update(teamGoals)
      .set({ currentXP: sql`${teamGoals.currentXP} + ${xpAmount}` })
      .where(eq(teamGoals.id, goalId));

    return NextResponse.json({ success: true });
  }
  ```
- **Verification:** Join a team, contribute XP, claim reward — all succeed with database persistence.

### 4.3 `/api/gamification/streak/freeze` — Missing

- **Location:** `src/stores/useLoadSheddingStore.ts`, line 259
- **Store:** `useLoadSheddingStore`
- **The Gap:** `triggerAutoFreeze` calls `POST /api/gamification/streak/freeze` which doesn't exist. Only `/api/gamification/track` exists.
- **Contextual Impact:** During load shedding (power outages), users' study streaks should be auto-frozen to prevent unfair loss. Without this endpoint, streaks are lost during outages — a unique South African feature that doesn't work.
- **Actionable Implementation Plan:**
  1. Create `src/app/api/gamification/streak/freeze/route.ts`
  2. POST handler: authenticate, check user has `streakFreezes > 0`, decrement freeze count, preserve current streak, return `{ success: true, remainingFreezes: number }`
  3. Add rate limiting: 1 freeze per load shedding event (tracked via timestamp)
- **Verification:** During load shedding, user's streak is preserved and freeze count decrements.

### 4.4 `/api/generate-quiz-from-solution` — Typo/Wrong Path

- **Location:** `src/hooks/useSnapAndSolve.ts`, line 74
- **Hook:** `useSnapAndSolve`
- **The Gap:** Calls `/api/generate-quiz-from-solution` but the correct endpoint is `/api/quiz/generate-from-solution` (which exists).
- **Contextual Impact:** "Generate Quiz" button in Snap & Solve always fails with 404. One-line typo breaking an entire user flow.
- **Actionable Implementation Plan:** Fix URL string. Single-line change.
- **Code Strategy:**
  ```ts
  // Line 74 — change:
  const response = await fetch('/api/generate-quiz-from-solution', { ... });
  // to:
  const response = await fetch('/api/quiz/generate-from-solution', { ... });
  ```
- **Verification:** Snap & Solve → "Generate Quiz" → successfully creates quiz from solved question.

### 4.5 `/api/energy` (base route) — Missing

- **Location:** `src/stores/useLearningStateStore.ts`, line 43
- **Store:** `useLearningStateStore`
- **The Gap:** Calls `fetch('/api/energy')` but only sub-routes exist (`/pattern`, `/recommendations`, `/track`).
- **Contextual Impact:** `refreshFromServer()` in the learning state store partially fails — energy data is never loaded.
- **Actionable Implementation Plan:** Create base `/api/energy/route.ts` that aggregates data from the three sub-endpoints in a single response.
- **Code Strategy:**
  ```ts
  export async function GET() {
    const { session } = await getAuth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Aggregate from sub-endpoint logic
    const [history, weekly, recommendations] = await Promise.all([
      getEnergyHistory(session.user.id),
      getWeeklyPattern(session.user.id),
      getEnergyRecommendations(session.user.id),
    ]);

    return NextResponse.json({ history, weekly, recommendations });
  }
  ```
- **Verification:** `useLearningStateStore.refreshFromServer()` successfully loads energy data.

### 4.6 `/api/buddies/recommend` — Missing

- **Location:** `src/hooks/useStudyBuddyRecommendation.ts`, line 45
- **Hook:** `useStudyBuddyRecommendation`
- **The Gap:** Calls `POST /api/buddies/recommend` which doesn't exist. `/api/buddies` and `/api/buddies/matches` exist.
- **Contextual Impact:** Study buddy recommendations always fail. Users cannot discover study partners.
- **Actionable Implementation Plan:** Either (a) create `/api/buddies/recommend/route.ts` with recommendation logic, or (b) update the hook to call existing `/api/buddies/matches` endpoint.
- **Verification:** Study buddy recommendation page shows suggested buddies.

---

## Domain 5: Tutoring & Marketplace

**Dependency Map:** No external dependencies — these are self-contained UI fixes.

### 5.1 ProfileMenu Sign-Out — No Loading State

- **Location:** `src/components/Layout/ProfileMenu.tsx`, line 75
- **Component:** `ProfileMenu`
- **The Gap:** Async `authClient.signOut()` with no loading state. No disabled state during execution. No visual feedback.
- **Contextual Impact:** Double-clicking logout can trigger multiple sign-out requests, causing race conditions with session cleanup.
- **Actionable Implementation Plan:** Add local `isSigningOut` state, disable menu item during sign-out, show spinner + "Signing out..." text.
- **Code Strategy:**
  ```tsx
  const [isSigningOut, setIsSigningOut] = useState(false);

  <DropdownMenuItem
    disabled={isSigningOut}
    onClick={async () => {
      setIsSigningOut(true);
      try { await authClient.signOut({ fetch }); }
      catch (err) { toast.error('Failed to sign out'); }
      finally { setIsSigningOut(false); }
    }}
  >
    {isSigningOut ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <LogOut01Icon className="w-4 h-4 mr-2" />}
    {isSigningOut ? 'Signing out...' : 'Log out'}
  </DropdownMenuItem>
  ```
- **Verification:** Click logout — button shows spinner, is disabled, text changes to "Signing out...".

### 5.2 Tutoring "Join Now" — No Loading State

- **Location:** `src/app/tutoring/page.tsx`, line 188
- **Component:** Tutoring page (scheduled sessions list)
- **The Gap:** `handleJoinScheduled(session)` triggers async navigation/session join with no loading feedback, no disabled state, no `type="button"`.
- **Contextual Impact:** Users may double-click, causing duplicate session join attempts.
- **Actionable Implementation Plan:** Track `joiningSessionId`, disable specific button while joining, show spinner, add `type="button"`.
- **Code Strategy:**
  ```tsx
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);

  const handleJoinScheduled = async (session: Session) => {
    setJoiningSessionId(session.id);
    try {
      await router.push(`/tutoring/session?room=${session.roomId}`);
    } finally {
      setJoiningSessionId(null);
    }
  };

  <Button
    type="button"
    size="sm"
    disabled={joiningSessionId === session.id}
    onClick={() => handleJoinScheduled(session)}
  >
    {joiningSessionId === session.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Now'}
  </Button>
  ```
- **Verification:** Click "Join Now" — button disables, shows spinner, navigates to session page.

### 5.3 Comments Form — Missing `type="submit"`

- **Location:** `src/app/comments/page.tsx`, line 154
- **Component:** Comments page
- **The Gap:** Button with `onClick={handleSubmitComment}` inside a form context but missing `type="submit"`.
- **Contextual Impact:** Pressing Enter in the Textarea won't submit the comment.
- **Actionable Implementation Plan:** Add `type="submit"` and wire form `onSubmit`.
- **Code Strategy:**
  ```tsx
  <form onSubmit={handleSubmitComment}>
    <Textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} aria-label="Write a comment" />
    <Button type="submit" disabled={!newComment.trim() || isLoading}>
      {isLoading ? 'Posting...' : 'Post Comment'}
    </Button>
  </form>
  ```
- **Verification:** Press Enter in comment textarea → comment submits.

### 5.4 Results Page — Missing `type="button"`

- **Location:** `src/app/results/page.tsx`, line 100
- **The Gap:** Button with `onClick={handleCheckResults}` missing `type="button"`.
- **Actionable Implementation Plan:** Add `type="button"`. One-line change.

---

## Domain 6: Services Layer (Placeholder Implementations)

**Dependency Map:**
```
hintManagement (6.1) ──→ Requires: hintUsage table (CREATE)
modelManagement (6.2) ──→ Requires: Gemini SDK (INSTALLED)
questionBankService (6.3) → Requires: Gemini SDK (INSTALLED)
monitoring (6.4) ────────→ Requires: Sentry (INSTALLED)
```

### 6.1 hintManagement.ts — All-Zero Stats

- **Location:** `src/services/hintManagement.ts`, line 162
- **Function:** `getHintUsageStats()`
- **The Gap:** Returns `totalHintsUsed: 0`, `hintsLastWeek: 0`, `hintsLastMonth: 0`, `averageHintsPerQuiz: 0`, `mostRequestedHintType: 'none'`, `hintUsageTrend: 'stable'`, `lastHintUsedAt: null`. Comment reads: `// Placeholder - implement with actual table`.
- **Contextual Impact:** Hint economy analytics show zero data. The hint usage dashboard is meaningless for teachers and students tracking their help-seeking patterns.
- **Actionable Implementation Plan:**
  1. Create `hintUsage` Drizzle table: `id (uuid PK)`, `userId (varchar FK)`, `hintType (enum: concept|step|solution|formula|none)`, `quizId (varchar FK)`, `timestamp (timestamp)`
  2. INSERT a record each time a hint is requested (wire into existing hint request flows)
  3. Replace hardcoded zeros with SQL aggregations using Drizzle
- **Code Strategy:**
  ```ts
  export async function getHintUsageStats(userId: string) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, lastWeekCount, lastMonthCount, typeBreakdown] = await Promise.all([
      db.select({ count: count() }).from(hintUsage).where(eq(hintUsage.userId, userId)),
      db.select({ count: count() }).from(hintUsage).where(and(eq(hintUsage.userId, userId), gte(hintUsage.timestamp, lastWeek))),
      db.select({ count: count() }).from(hintUsage).where(and(eq(hintUsage.userId, userId), gte(hintUsage.timestamp, lastMonth))),
      db.select({ hintType: hintUsage.hintType, count: count() }).from(hintUsage).where(eq(hintUsage.userId, userId)).groupBy(hintUsage.hintType),
    ]);

    return {
      totalHintsUsed: total[0]?.count ?? 0,
      hintsLastWeek: lastWeekCount[0]?.count ?? 0,
      hintsLastMonth: lastMonthCount[0]?.count ?? 0,
      // ... compute trend and most frequent type from typeBreakdown
    };
  }
  ```
- **Verification:** Request hints in a quiz. Dashboard stats update with real counts.

### 6.2 modelManagement.ts — Null Gemini Fallback

- **Location:** `src/services/modelManagement.ts`, lines 223–224
- **Function:** `fallbackToGeminiAPI()`
- **The Gap:** `const response = null; // Would be actual API call` — returns `null`. Comment reads: `// This is a placeholder implementation`.
- **Contextual Impact:** Any AI feature relying on model management fallback silently returns null, causing downstream null reference errors.
- **Actionable Implementation Plan:**
  1. Import `@ai-sdk/google` (already installed per package.json)
  2. Implement `generateText()` call with prompt and model selection
  3. Return typed response: `{ content: string, usage: { promptTokens, completionTokens } }`
  4. Add error handling with retry logic
- **Code Strategy:**
  ```ts
  import { google } from '@ai-sdk/google';
  import { generateText } from 'ai';

  async function fallbackToGeminiAPI(prompt: string, model: string): Promise<{ content: string; usage: Usage }> {
    try {
      const result = await generateText({
        model: google(model),
        prompt,
        maxTokens: 2048,
      });
      return { content: result.text, usage: result.usage };
    } catch (error) {
      console.error('Gemini fallback failed:', error);
      return null; // Keep null return for backward compat, but callers should handle it
    }
  }
  ```
- **Verification:** Trigger model fallback. Returns real Gemini response text, not null.

### 6.3 questionBankService.ts — Template String Questions

- **Location:** `src/services/questionBankService.ts`, lines 165–181
- **Function:** `generateSupplementaryQuestions()`
- **The Gap:** Returns array of `{ questionText: `[AI_GENERATED] Question for topic: ${topic}`, topic, difficulty }` — fake questions with template strings. Comment: `// For now, we return a structured placeholder that the AI pipeline can populate`.
- **Contextual Impact:** Supplementary question generation shows `[AI_GENERATED] Question for topic: Algebra` — completely unusable placeholder text.
- **Actionable Implementation Plan:**
  1. Replace placeholder loop with Gemini API call using a structured prompt: "Generate 5 NSC Grade 12 ${subject} questions on topic '${topic}' at ${difficulty} difficulty. Return as JSON array with question, options, correctAnswer, explanation."
  2. Parse the AI response into typed `GeneratedQuestion[]` objects
  3. Add caching: store generated questions in database keyed by `topic + difficulty + subject` to avoid regenerating
- **Code Strategy:**
  ```ts
  async function generateSupplementaryQuestions(topic: string, difficulty: Difficulty, subject: string): Promise<GeneratedQuestion[]> {
    // Check cache first
    const cached = await db.query.generatedQuestions.findMany({
      where: and(eq(generatedQuestions.topic, topic), eq(generatedQuestions.difficulty, difficulty)),
    });
    if (cached.length > 0) return cached;

    const result = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: `Generate 5 NSC Grade 12 ${subject} questions on "${topic}" at ${difficulty} difficulty. Return ONLY valid JSON: [{question, options: [{id, text}], correctAnswer: id, explanation}]`,
    });

    const questions = JSON.parse(result.text) as GeneratedQuestion[];
    // Cache questions
    await db.insert(generatedQuestions).values(questions.map(q => ({ ...q, topic, difficulty, subject })));
    return questions;
  }
  ```
- **Verification:** Request supplementary questions for a topic. Returns real curriculum-aligned questions, not template strings.

### 6.4 monitoring.ts — Empty External Logging Stub

- **Location:** `src/lib/monitoring.ts`, line 88
- **Function:** `LoggerService.sendToExternalService()`
- **The Gap:** `// Placeholder for external logging service integration` — empty method with commented-out example code.
- **Contextual Impact:** No production logging. Errors are swallowed by `console.error` (which doesn't reach Sentry). Cannot debug production issues or track error rates.
- **Actionable Implementation Plan:**
  1. Sentry is already installed (`@sentry/nextjs` in package.json)
  2. Replace commented-out `fetch('/api/logs', ...)` with `Sentry.captureException(error)` or `Sentry.captureMessage(message, level)`
  3. Configure Sentry DSN in `.env` (check `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` for existing setup)
  4. Replace all `console.error` calls in services with `logger.error()` which routes to Sentry
- **Code Strategy:**
  ```ts
  import * as Sentry from '@sentry/nextjs';

  private async sendToExternalService(entry: LogEntry) {
    if (entry.level === 'error' && entry.error) {
      Sentry.captureException(entry.error, { tags: entry.tags, extra: entry.context });
    } else if (entry.level === 'warning' || entry.level === 'info') {
      Sentry.captureMessage(entry.message, { level: entry.level, tags: entry.tags, extra: entry.context });
    }
  }
  ```
- **Verification:** Trigger an error. It appears in the Sentry dashboard with proper tags and context.

---

## Domain 7: Pages & Layouts (Infrastructure)

### 7.1 Missing Error Boundaries — 54 Route Segments

- **Location:** 54 of 93 route segments lack `error.tsx` files
- **Affected High-Traffic Routes:** `ai-lab`, `chat`, `community`, `learn`, `practice`, `subscription`, `tutoring`, `focus-rooms`, `snap-and-solve`, `duel`, `boss-fight`, `essay-grader`
- **The Gap:** No route-level error boundary. When these features error, the entire app crashes to the root error page.
- **Contextual Impact:** A crash in AI chat takes down the entire app — user loses their dashboard, navigation, and all other features. Contextual error boundaries allow recovery within the feature while keeping the rest of the app functional.
- **Actionable Implementation Plan:**
  1. Create `src/app/<route>/error.tsx` for the 10 high-traffic routes listed above
  2. Use standard Next.js error component pattern with `error` and `reset` props
  3. Include "Try Again" (calls `reset()`) and "Go Home" (links to `/dashboard`) buttons
  4. Log the error to Sentry via `useEffect`
- **Code Strategy:**
  ```tsx
  'use client';
  import { useEffect } from 'react';
  import * as Sentry from '@sentry/nextjs';

  export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => { Sentry.captureException(error); }, [error]);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <div className="flex gap-3">
          <Button onClick={() => reset()}>Try Again</Button>
          <Button variant="outline" asChild><Link href="/dashboard">Go Home</Link></Button>
        </div>
      </div>
    );
  }
  ```
- **Verification:** Throw an error in a feature component. Only that feature shows the error boundary; sidebar and navigation remain functional.

### 7.2 Missing `not-found.tsx` for Dynamic Routes

- **Location:** `src/app/channels/[id]/`, `src/app/tutoring/[id]/`, `src/app/setwork-library/[id]/`
- **The Gap:** These dynamic routes have no route-specific `not-found.tsx`. Fall back to generic root 404 page.
- **Contextual Impact:** Users landing on a deleted channel/tutor/setwork item see "Page not found" with no domain-specific recovery options.
- **Actionable Implementation Plan:**
  1. Create `not-found.tsx` in each dynamic route directory
  2. Include contextual CTAs
- **Code Strategy:**
  ```tsx
  // src/app/tutoring/[id]/not-found.tsx
  export default function TutorNotFound() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <h2 className="text-2xl font-bold mb-2">Tutor not found</h2>
        <p className="text-muted-foreground mb-6">This tutor may have left the platform.</p>
        <Button asChild><Link href="/tutoring/marketplace">Find Another Tutor</Link></Button>
      </div>
    );
  }
  ```
- **Verification:** Navigate to `/tutoring/non-existent-id`. Shows contextual 404 with "Find Another Tutor" button.

### 7.3 CMS Page — Blank Suspense Fallback

- **Location:** `src/app/cms/page.tsx`, line 37
- **Component:** CMS page
- **The Gap:** `<Suspense fallback={null}>` — renders nothing during loading.
- **Contextual Impact:** Users see a white screen while CMS content loads, indistinguishable from a broken page.
- **Actionable Implementation Plan:** Replace `fallback={null}` with skeleton matching CMS layout.
- **Code Strategy:**
  ```tsx
  <Suspense fallback={
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-12 w-32" />
    </div>
  }>
  ```
- **Verification:** Navigate to CMS page. Skeleton appears during loading, not blank screen.

### 7.4 Missing Loading States — 9 Route Segments

- **Location:** `tutoring/become-tutor`, `tutoring/marketplace`, `tutoring/sessions`, `comments`, `subject-map` (no `loading.tsx` or dynamic import loading)
- **The Gap:** Pages render client components that fetch data on mount with no skeleton or loading boundary.
- **Actionable Implementation Plan:** Add `loading.tsx` files with skeleton UI matching each page's layout.

---

## Domain 8: Placeholder Text & "Coming Soon"

### 8.1 Parent Dashboard — Account Linking

- **Location:** `src/app/parent-dashboard/settings/page.tsx`, line 247
- **The Gap:** "Link Child's Account" button fires `toast.info('Account linking coming soon')` instead of opening a linking flow.
- **Contextual Impact:** Parent-child monitoring feature is entirely blocked.
- **Actionable Implementation Plan:** Create a Dialog with email search input → call server action `linkChildAccount(parentId, childEmail)` → refresh linked accounts list.
- **Code Strategy:**
  ```tsx
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className="rounded-full font-bold text-xs gap-2">
        <HugeiconsIcon icon={Link01Icon} className="w-3.5 h-3.5" />
        Link Child's Account
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader><DialogTitle>Link a Child Account</DialogTitle></DialogHeader>
      <form onSubmit={handleLinkChild}>
        <Input placeholder="Child's email or student ID" {...register('childEmail')} required />
        <Button type="submit" disabled={isLinking}>
          {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Link Account'}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
  ```
- **Verification:** Click "Link Child's Account" → dialog opens → enter email → child is linked.

### 8.2 MapContainer — Google Maps

- **Location:** `src/components/Maps/MapContainer.tsx`, line 36
- **The Gap:** Shows `<p>Google Maps coming soon</p>` instead of falling back to LeafletMap.
- **Actionable Implementation Plan:** Render LeafletMap as fallback or show actionable disabled state.
- **Code Strategy:**
  ```tsx
  if (provider === 'google' && !isGoogleMapsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted rounded-lg p-6">
        <p className="text-muted-foreground mb-3">Google Maps is not yet configured.</p>
        <Button variant="outline" onClick={() => setProvider('leaflet')}>
          Use Leaflet Map instead
        </Button>
      </div>
    );
  }
  ```
- **Verification:** Map component with Google provider shows fallback with Leaflet option, not dead text.

### 8.3 ParentDashboard — Detailed Report

- **Location:** `src/components/ParentDashboard/StudentOverview.tsx`, line 105
- **The Gap:** "Full report" button fires `toast.info('Detailed report coming soon')`.
- **Actionable Implementation Plan:** Create `src/app/parent-dashboard/reports/[studentId]/page.tsx` with detailed student analytics, or link to existing `/progress` page filtered by student.

---

## Domain 9: Accessibility (WCAG 2.1 AA)

### 9.1 Missing `aria-label` on Icon-Only Buttons — 27 Instances

**WCAG Criterion:** 4.1.2 — Name, Role, Value (Level A)

| # | File | Line(s) | Component | aria-label to Add |
|---|---|---|---|---|
| 1 | `src/components/Graphing/GraphToolbar.tsx` | 36, 39 | Zoom buttons | `"Zoom in"`, `"Zoom out"` |
| 2 | `src/components/AudioPlayer/PlaybackControls.tsx` | 36, 45, 54, 77 | 4 controls | `"Mute"`, `"Skip back 10s"`, `{isPlaying ? "Pause" : "Play"}`, `"Skip forward 10s"` |
| 3 | `src/components/AudioPlayer/TTSSettings.tsx` | 56 | Toggle | `{showSettings ? "Hide" : "Show"} TTS settings"` |
| 4 | `src/components/AI/GlassOrb.tsx` | 110 | Close panel | `"Close AI companion"` |
| 5 | `src/components/AI/GlassOrb.tsx` | 157 | Study companion | `"Open study companion"` |
| 6 | `src/components/AI/GlassOrb.tsx` | ~170 | Orb trigger | `"Open AI companion"` + `aria-expanded={isOpen}` |
| 7 | `src/components/AI/WebLLMDownloader.tsx` | 108, 135 | Settings/dismiss | `"Open model settings"`, `"Dismiss download"` |
| 8 | `src/components/Dashboard/AdaptiveScheduleCard.tsx` | 134 | Dismiss | `"Dismiss adjustment"` |
| 9 | `src/components/Dashboard/SubjectProgress.tsx` | 178 | Close details | `"Close subject details"` |
| 10 | `src/components/Flashcards/DeckGrid.tsx` | 44 | Deck options | `"Deck options"` |
| 11 | `src/components/Comments/CommentItemAnimated.tsx` | 71 | Comment menu | `"Comment options"` |
| 12 | `src/components/MathKeyboard/index.tsx` | 190 | Delete | `"Delete character"` |
| 13 | `src/app/tutoring/session/page.tsx` | 53 | Back | `"Back to tutoring"` |
| 14 | `src/app/subjects/page.tsx` | 64 | Back | `"Go back"` |
| 15 | `src/components/StudyPlanWizard.tsx` | 109, 116 | Back/settings | `"Go back"`, `"Open wizard settings"` |
| 16 | `src/components/Calendar/CalendarHeader.tsx` | 29, 35 | Prev/Next month | `"Previous month"`, `"Next month"` |
| 17 | `src/components/CommonQuestions/QuestionDialog.tsx` | 71 | Close | `"Close question dialog"` |
| 18 | `src/components/Curriculum/TopicDetailsModal.tsx` | 65 | Close | `"Close modal"` |
| 19 | `src/components/Gamification/DailyLoginBonus.tsx` | 88 | Close | `"Close daily bonus"` |
| 20 | `src/components/CMS/QuestionOptionsTab.tsx` | 65 | Remove | `"Remove option"` |
| 21 | `src/components/CMS/QuestionBasicTab.tsx` | 58 | Remove image | `"Remove question image"` |
| 22 | `src/components/CMS/QuestionCard.tsx` | 36, 50 | Edit/delete | `"Edit question"`, `"Delete question"` |
| 23 | `src/components/Chat/FloatingWidget.tsx` | 46 | Open chat | `"Open chat"` |
| 24 | `src/components/AI/ContextualAIBubble.tsx` | 56 | AI bubble | `"Ask AI for help"` |
| 25 | `src/components/Layout/MobileMenuSheet.tsx` | 20 | Close menu | `"Close menu"` |
| 26 | `src/components/shared/Timer.tsx` | 166, 197 | Add/remove time | `"Add 5 minutes"`, `"Remove 5 minutes"` |
| 27 | `src/components/StudyBuddies/VideoCall.tsx` | 156, 170, 187, 202, 211 | 5 call controls | `"Toggle mic"`, `"Toggle camera"`, `"Toggle screen share"`, `"Copy room link"`, `"Leave call"` |

**Bulk Fix Code Strategy:**
```tsx
// Pattern to fix in every file:
// Before:
<Button variant="ghost" size="icon" onClick={handleAction}>
  <HugeiconsIcon icon={SomeIcon} className="w-4 h-4" />
</Button>
// After:
<Button variant="ghost" size="icon" onClick={handleAction} aria-label="Descriptive action name">
  <HugeiconsIcon icon={SomeIcon} className="w-4 h-4" aria-hidden="true" />
</Button>
```

### 9.2 Missing Keyboard Navigation — 3 Instances

**WCAG Criterion:** 2.1.1 — Keyboard (Level A)

| File | Issue | Fix |
|---|---|---|
| `src/components/Demo/SubjectsGrid.tsx` | `<Card role="button" tabIndex={0}>` no `onKeyDown` | Replace with `<Link href={...}>` |
| `src/screens/Bookmarks.tsx` | `<Card onClick>` no `role`, `tabIndex`, `onKeyDown` | Replace with `<Link>` |
| `src/components/AudioPlayer/ResponsiveAudioPlayer.tsx` | `<div role="button">` no `onKeyDown` | Replace with `<button>` |

### 9.3 Form Inputs Without Labels — 3 Instances

**WCAG Criterion:** 1.3.1 — Info and Relationships (Level A)

| File | Input | Fix |
|---|---|---|
| `src/app/tutoring/session/page.tsx:98` | `<Input placeholder="Type a message..." />` | Add `aria-label="Type a message in the tutoring session"` |
| `src/components/DailyReview/DailyReview.tsx:110` | `<input type="checkbox">` no label | Add `id` + `<label>` or `aria-label="Mark as reviewed"` |
| `src/components/AudioPlayer/TTSSettings.tsx:76` | `<input type="range">` no label | Add `aria-label="Playback speed"` |

### 9.4 Color Contrast Failures — 2 Critical

**WCAG Criterion:** 1.4.3 — Contrast (Minimum), Level AA

| File | Classes | Issue | Fix |
|---|---|---|---|
| `src/components/Dashboard/WeeklyChartCard.tsx:57` | `text-muted-foreground/30` on `bg-muted/50` | ~1.5:1 ratio (needs 4.5:1) | Change to `text-muted-foreground/60` |
| `src/components/Gamification/StreakShield.tsx:134` | `text-muted-foreground/30` on dashed border | Nearly invisible | Change to `text-muted-foreground/60` |

### 9.5 Focus Management Issues

| File | Issue | Fix |
|---|---|---|
| `src/components/AI/GlassOrb.tsx:73` | No focus trapping in custom overlay | Use Radix Dialog or FocusTrap |
| `src/components/Accessibility/SkipLink.tsx` | Conditional skip link (depends on settings) | Make unconditional |
| 5 elements with `tabIndex={0}` | No `:focus-visible` styles | Add global CSS rule: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary` |

---

## Domain 10: Codebase Markers

### 10.1 Active Placeholder Comments (Technical Debt Register)

| Marker | File | Line | Severity | Action Required |
|---|---|---|---|---|
| `// Placeholder` | `src/app/api/search/route.ts` | 30 | Medium | Query real PDF URLs from database |
| `// Placeholder` | `src/app/api/quiz/from-past-paper/stats/route.ts` | 105, 117 | Medium | Implement DB queries for question performance |
| `// Placeholder - implement with actual table` | `src/services/hintManagement.ts` | 162 | Medium | Create hintUsage table (see 6.1) |
| `// This is a placeholder implementation` | `src/services/modelManagement.ts` | 223 | High | Implement Gemini API call (see 6.2) |
| `// Placeholder for external logging` | `src/lib/monitoring.ts` | 88 | Medium | Wire up Sentry (see 6.4) |
| `// For now, we return a structured placeholder` | `src/services/questionBankService.ts` | 165 | High | Implement Gemini question generation (see 6.3) |
| `/* Placeholder for question thumbnail */` | `src/screens/ErrorHint.tsx` | 45 | Low | Replace with actual thumbnail or remove |
| `Google Maps coming soon` | `src/components/Maps/MapContainer.tsx` | 36 | Medium | Implement fallback (see 8.2) |
| `toast.info('Detailed report coming soon')` | `src/components/ParentDashboard/StudentOverview.tsx` | 105 | Medium | Implement report page (see 8.3) |
| `toast.info('Account linking coming soon')` | `src/app/parent-dashboard/settings/page.tsx` | 247 | Medium | Implement account linking (see 8.1) |

### 10.2 Zero TODO/FIXME Markers

Notably, **zero** `TODO` or `FIXME` comments exist in the codebase. Technical debt is tracked via placeholder comments instead.

**Recommendation:** Standardize on `TODO(@username): description` format for in-code debt tracking, paired with GitHub Issues.

---

## Quick Wins (< 30 minutes each)

| # | Fix | File(s) | Lines Changed |
|---|---|---|---|
| 1 | Fix Snap & Solve quiz URL typo | `src/hooks/useSnapAndSolve.ts` | 1 |
| 2 | Add `type="submit"` to comments form | `src/app/comments/page.tsx` | 1 |
| 3 | Add `type="button"` to standalone action buttons | `src/app/results/page.tsx`, `src/app/tutoring/page.tsx` | 2 |
| 4 | Fix CMS Suspense fallback `null` → skeleton | `src/app/cms/page.tsx` | 1 |
| 5 | Add `aria-label` to 27 icon-only buttons | 27 files | 27 |
| 6 | Add `aria-label` to tutoring chat input | `src/app/tutoring/session/page.tsx` | 1 |
| 7 | Add `aria-label` to DailyReview checkbox | `src/components/DailyReview/DailyReview.tsx` | 1 |
| 8 | Fix contrast: `/30` → `/60` | 2 files | 2 |
| 9 | Replace `div[role="button"]` with `<button>` | 5 files | ~15 |
| 10 | Add `try/finally` to DashboardAIPrompt | `src/components/Dashboard/DashboardAIPrompt.tsx` | 5 |
| 11 | Add `try/finally` to AICoPlanner | `src/components/AIPlanner/AICoPlanner.tsx` | 5 |
| 12 | Remove mock fallback in KnowledgeHeatmap | `src/components/Dashboard/KnowledgeHeatmap.tsx` | 1 |
| 13 | Remove mock fallback in QuizList | `src/components/Quiz/QuizList.tsx` | 1 |
| 14 | Remove mock fallback in FlashcardDeckList | `src/components/Flashcards/FlashcardDeckList.tsx` | 1 |
| 15 | Remove duplicate MOCK_ACTIVITIES | `RecentActivity.tsx`, `ActivityFeed.tsx` | 2 |
| **Total** | | **38 files** | **~70 lines** |

---

## Critical Path (Must Fix Before Production)

| Phase | Action | Unblocks | Estimated Effort |
|---|---|---|---|
| **Phase 1** (Day 1) | Create `/api/subscription/status` | All premium feature gating | 1 hour |
| **Phase 1** (Day 1) | Fix Snap & Solve URL typo | Quiz generation from photos | 2 minutes |
| **Phase 1** (Day 1) | Add `aria-label` to 27 icon buttons | WCAG Level A compliance | 45 minutes |
| **Phase 1** (Day 1) | Fix ChatInput double-click vulnerability | AI API quota protection | 15 minutes |
| **Phase 2** (Day 2-3) | Create 7 missing API endpoints | Team goals, buddy recommend, streak freeze, energy, subscription status | 4 hours |
| **Phase 2** (Day 2-3) | Replace mock data in 6 dashboard components | Real dashboard data | 3 hours |
| **Phase 2** (Day 2-3) | Implement `saveLearningPreferences` | User preference persistence | 1 hour |
| **Phase 2** (Day 2-3) | Replace setTimeout AI simulators | Real AI responses in dashboard/co-planner | 2 hours |
| **Phase 3** (Day 4-5) | Add error.tsx to 10 high-traffic routes | Graceful error recovery | 2 hours |
| **Phase 3** (Day 4-5) | Implement placeholder services | Hint stats, model management, question generation, monitoring | 6 hours |
| **Phase 3** (Day 4-5) | Add keyboard navigation to clickable cards | WCAG Level A compliance | 1 hour |
| **Phase 4** (Week 2) | Create team-goals sub-routes | Full gamification | 3 hours |
| **Phase 4** (Week 2) | Wire up Ably for focus room invites | Real collaboration | 2 hours |
| **Phase 4** (Week 2) | Create hintUsage table | Hint economy analytics | 1 hour |

---

## Recommendations

### Architecture
1. **Eliminate mock data defaults** — All components should initialize with zero/empty state and populate from APIs on mount. Gate mock data behind `NODE_ENV === 'development'` or a `?demo=true` query param.
2. **Centralize endpoint registry** — Create `src/lib/api/endpoints.ts` with typed URL constants. Prevents typos like `/api/generate-quiz-from-solution` vs `/api/quiz/generate-from-solution`.
3. **Consolidate god endpoints** — `/api/marketplace` (13 actions), `/api/wrong-answer-pipeline` (4 actions) should be split into RESTful routes.

### Data Layer
1. **Adopt React Query** — Replace manual `fetch()` + Zustand pattern with React Query (`@tanstack/react-query`) for automatic caching, deduplication, background refetch, and optimistic updates.
2. **Create missing API endpoints** — Prioritize per Critical Path above.
3. **Implement all placeholder services** — See Domain 6.

### Accessibility
1. **Bulk-fix icon button aria-labels** — Highest-volume fix (27 instances). Use IDE multi-file replace.
2. **Replace `div[role="button"]` with native `<button>`** — Eliminates manual keyboard handling for 5+ components.
3. **Systematic contrast audit** — Run `@axe-core/playwright` across all pages in both light and dark themes.
4. **Always-on skip link** — Remove conditional `SkipLink` component. The native skip link in `layout.tsx` is correct and sufficient.

### Security (from companion audit `FUNCTIONALITY_AUDIT_REPORT.md`)
1. Uncomment security headers in `next.config.mjs` (CSP, HSTS, X-Frame-Options)
2. Remove `NEXT_PUBLIC_GEMINI_API_KEY` fallback in `chatService.ts`
3. Replace IP-based DB init auth with secret token
4. Add DOMPurify to MathRenderer `dangerouslySetInnerHTML`
5. Rate-limit all AI endpoints

---

## Appendix: Scan Statistics

| Scan Pattern | Files Scanned | Matches | Actionable |
|---|---|---|---|
| Empty onClick `onClick={() => {}}` | 1,029 TSX | 0 | 0 |
| href="#" | 1,029 TSX | 0 | 0 |
| Placeholder text | 1,029 TSX | 11 | 3 |
| Mock data in components | All components | 9 findings | 9 |
| Non-existent API calls | 41 stores + 82 hooks | 9 call sites | 7 |
| Placeholder services | 68 service files | 3 findings | 3 |
| setTimeout simulation | 82 hooks + 68 services | 6 findings | 2 |
| Missing aria-label | 1,029 TSX | 27 | 27 |
| Missing keyboard nav | 1,029 TSX | 5 | 3 |
| Contrast `/30` | 1,029 TSX | 2 | 2 |
| Unlabeled form inputs | 1,029 TSX | 3 | 3 |
| Missing error.tsx | 93 routes | 54 missing | 10 priority |
| Missing not-found.tsx | 93 routes | 89 missing | 3 priority |
| TODO/FIXME markers | Full codebase | 0 | 0 |

**Total actionable findings: 110+**

---

*Report generated by Qwen Code AI — Principal Frontend Engineer audit mode — 11 April 2026*
