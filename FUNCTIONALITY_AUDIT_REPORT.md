# Lumni AI - Comprehensive Functionality Audit Report

**Date:** 11 April 2026  
**Auditor:** Qwen Code AI Agent  
**Scope:** Full Next.js 16 Application (92 page routes, 117 API routes, 124 components, 41 stores, 82 hooks, 31 server actions)

---

## Executive Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total features audited** | 156 | 100% |
| **Fully implemented** | 89 | 57% |
| **Partially implemented** | 48 | 31% |
| **Not implemented** | 19 | 12% |
| **Critical issues** | 8 | - |

### Key Findings
- **6 broken navigation links** lead users to non-existent pages
- **10 placeholder implementations** in services layer return hardcoded/stub data
- **9 API routes missing authentication** expose user data
- **11 API routes lack input validation** (no Zod schemas)
- **7 non-existent API endpoints** called by stores/hooks will always 404
- **3 critical security vulnerabilities** (disabled security headers, exposed API key fallback, weak DB init auth)
- **Default data source is mock** - entire app serves fake data unless explicitly switched

---

## Detailed Findings

### 1. Broken Navigation Links (Critical - User Impact)

#### `/tutor/[id]` - Tutor Profile Route
- **Location:** `src/screens/Marketplace.tsx` (lines 101, 105)
- **Type:** Navigation
- **Severity:** Critical
- **Current State:** `router.push(\`/tutor/${tutor.userId}\`)` navigates to non-existent route
- **Expected Behavior:** Should navigate to `/tutoring/[id]` where the actual tutor detail page exists
- **Impact:** Users clicking any tutor profile get a 404 error, breaking the entire tutoring marketplace flow
- **Dependencies:** None - pure route fix

**Implementation Plan:**
1. In `src/screens/Marketplace.tsx`, replace `/tutor/${tutor.userId}` with `/tutoring/${tutor.userId}` on lines 101 and 105

**Estimated Complexity:** Low  
**Suggested Priority:** P0 (Blocker)

---

#### `/my-sessions` - My Sessions Route
- **Location:** `src/screens/Marketplace.tsx` (line 126), `src/screens/BecomeTutor.tsx` (line 119), `src/components/TutorProfile/BookingDialog.tsx` (line 64)
- **Type:** Navigation
- **Severity:** Critical
- **Current State:** `router.push('/my-sessions')` navigates to non-existent route
- **Expected Behavior:** Should navigate to `/tutoring/sessions` where the sessions page exists
- **Impact:** Tutors and students cannot view their tutoring sessions after booking
- **Dependencies:** None

**Implementation Plan:**
1. In `src/screens/Marketplace.tsx` line 126: change `/my-sessions` to `/tutoring/sessions`
2. In `src/screens/BecomeTutor.tsx` line 119: change `/my-sessions` to `/tutoring/sessions`
3. In `src/components/TutorProfile/BookingDialog.tsx` line 64: change `/my-sessions` to `/tutoring/sessions`

**Estimated Complexity:** Low  
**Suggested Priority:** P0 (Blocker)

---

#### `/become-tutor` - Become Tutor Route
- **Location:** `src/screens/Marketplace.tsx` (lines 133, 269)
- **Type:** Navigation
- **Severity:** Critical
- **Current State:** `router.push('/become-tutor')` navigates to non-existent route
- **Expected Behavior:** Should navigate to `/tutoring/become-tutor` where the registration page exists
- **Impact:** Users cannot register as tutors, blocking marketplace supply
- **Dependencies:** None

**Implementation Plan:**
1. In `src/screens/Marketplace.tsx` lines 133 and 269: change `/become-tutor` to `/tutoring/become-tutor`

**Estimated Complexity:** Low  
**Suggested Priority:** P0 (Blocker)

---

#### `/streak` - Streak Page (Missing Entirely)
- **Location:** `src/components/Dashboard/BriefingGreeting.tsx` (line 110)
- **Type:** Page Route
- **Severity:** High
- **Current State:** `router.push(isNewUser ? '/onboarding' : '/streak')` - route does not exist
- **Expected Behavior:** Either create `/streak` page showing user's daily study streak, or redirect to `/achievements`
- **Impact:** Users clicking streak button get 404, breaking gamification loop
- **Dependencies:** Gamification system, XP tracking

**Implementation Plan:**
1. **Option A (Quick Fix):** Change route to `/achievements` in `BriefingGreeting.tsx` line 110
2. **Option B (Full Implementation):** Create `src/app/streak/page.tsx` with streak visualization using data from `useGamificationStore`

**Estimated Complexity:** Low (Option A) / Medium (Option B)  
**Suggested Priority:** P1 (High)

---

#### `/tasks` - Tasks Page (Missing Entirely)
- **Location:** `src/components/Dashboard/BriefingGreeting.tsx` (line 104)
- **Type:** Page Route
- **Severity:** High
- **Current State:** `router.push('/tasks')` - route does not exist
- **Expected Behavior:** Should show user's daily tasks/study plan, or redirect to `/study-plan`
- **Impact:** Users cannot access their task list from dashboard
- **Dependencies:** Smart scheduler, study plan system

**Implementation Plan:**
1. **Option A (Quick Fix):** Change route to `/study-plan` in `BriefingGreeting.tsx` line 104
2. **Option B (Full Implementation):** Create `src/app/tasks/page.tsx` pulling from `useSmartSchedulerStore` blocks

**Estimated Complexity:** Low (Option A) / Medium (Option B)  
**Suggested Priority:** P1 (High)

---

#### `/learning-center` - Learning Center Route
- **Location:** `src/components/Quiz/BridgeToMastery.tsx` (line 67)
- **Type:** Navigation
- **Severity:** Medium
- **Current State:** `<Link href={\`/learning-center?topic=...\`}>` - route does not exist
- **Expected Behavior:** Should navigate to `/learn` or `/lessons` for topic-specific learning
- **Impact:** Quiz review links to non-existent page, blocking learning flow
- **Dependencies:** None

**Implementation Plan:**
1. In `src/components/Quiz/BridgeToMastery.tsx` line 67: change `/learning-center` to `/learn` or `/lessons`

**Estimated Complexity:** Low  
**Suggested Priority:** P2 (Medium)

---

### 2. Placeholder Implementations (High - Data Integrity)

#### Mock Data Default Source
- **Location:** `src/lib/api/data-source.ts` (lines 44, 50, 58)
- **Type:** Data Infrastructure
- **Severity:** Critical
- **Current State:** `source: 'mock'` - entire application defaults to fake data
- **Expected Behavior:** Should default to `'real'` and fetch from database/APIs
- **Impact:** ALL user-facing data (dashboard, subjects, quizzes, progress, achievements, leaderboard, flashcards, study plans, calendar, past papers, settings, subscriptions, study buddies, bookmarks) is fake unless `window.__DATA_SOURCE__` is explicitly set to `'real'`
- **Dependencies:** Backend APIs, database

**Implementation Plan:**
1. In `src/lib/api/data-source.ts`, change default from `'mock'` to `'real'` on line 44
2. Verify all API endpoints exist and return proper data before switching
3. Add environment variable `NEXT_PUBLIC_DATA_SOURCE` to control this at build time
4. Remove mock data fallbacks from production build using tree-shaking or feature flags

**Estimated Complexity:** High (requires all APIs to be functional first)  
**Suggested Priority:** P0 (Blocker for production launch)

---

#### Question Bank Service - Placeholder AI Generation
- **Location:** `src/services/questionBankService.ts` (lines 162-186)
- **Type:** Service
- **Severity:** High
- **Current State:** Returns `[AI_GENERATED] Question for topic: ${topic}` placeholder strings
- **Expected Behavior:** Should call Gemini API to generate curriculum-aligned questions
- **Impact:** Quiz generation features show fake questions instead of real study material
- **Dependencies:** Gemini API, curriculum data

**Implementation Plan:**
1. Replace placeholder return with actual Gemini API call using `@ai-sdk/google`
2. Use existing server action pattern from `src/actions/` for server-side execution
3. Add proper error handling and fallback to cached questions if API fails
4. Implement prompt engineering for NSC Grade 12 aligned question generation

**Estimated Complexity:** High  
**Suggested Priority:** P1 (High)

---

#### Model Management Service - Placeholder Implementation
- **Location:** `src/services/modelManagement.ts` (lines 223-228)
- **Type:** Service
- **Severity:** High
- **Current State:** `fallbackToGeminiAPI()` returns `null` with "placeholder implementation" comment
- **Expected Behavior:** Should call Gemini API for model inference
- **Impact:** AI features that depend on model fallback will fail silently
- **Dependencies:** Gemini API

**Implementation Plan:**
1. Implement `fallbackToGeminiAPI()` to call Gemini API with proper parameters
2. Add error handling and retry logic
3. Return typed response instead of `null`

**Estimated Complexity:** Medium  
**Suggested Priority:** P1 (High)

---

#### Hint Management System - Hardcoded Zeros
- **Location:** `src/services/hintManagement.ts` (line 162)
- **Type:** Service
- **Severity:** Medium
- **Current State:** `const totalHintsUsed = 0; // Placeholder - implement with actual table`
- **Expected Behavior:** Should query `hintUsage` database table for actual usage stats
- **Impact:** Hint usage tracking shows zero for all users, breaking hint economy
- **Dependencies:** Database schema (hintUsage table does not exist)

**Implementation Plan:**
1. Create `hintUsage` table in database schema with Drizzle ORM
2. Implement INSERT on each hint request
3. Replace hardcoded zeros with actual COUNT queries
4. Add indexes on `userId` and `timestamp` for performance

**Estimated Complexity:** Medium  
**Suggested Priority:** P2 (Medium)

---

#### Monitoring Service - External Logging Not Integrated
- **Location:** `src/lib/monitoring.ts` (line 88)
- **Type:** Infrastructure
- **Severity:** Medium
- **Current State:** `sendToExternalService()` is empty stub with commented-out example code
- **Expected Behavior:** Should send logs to Sentry, LogRocket, or custom endpoint
- **Impact:** No production logging/monitoring, cannot debug issues or track errors
- **Dependencies:** Sentry/LogRocket account, API keys

**Implementation Plan:**
1. Uncomment and implement Sentry integration (already installed per package.json)
2. Configure `@sentry/nextjs` in `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
3. Replace console.error calls with `Sentry.captureException()`
4. Set up error boundary components to catch React errors

**Estimated Complexity:** Medium  
**Suggested Priority:** P1 (High)

---

#### Search API - Placeholder PDF URLs
- **Location:** `src/app/api/search/route.ts` (line 30)
- **Type:** API Route
- **Severity:** Medium
- **Current State:** `originalPdfUrl: '#', // Placeholder` - returns fake URLs for past paper PDFs
- **Expected Behavior:** Should return actual stored PDF URLs from database
- **Impact:** Search results for past papers have broken download links
- **Dependencies:** Past paper storage (UploadThing/S3)

**Implementation Plan:**
1. Query database for actual `originalPdfUrl` field from past papers table
2. Generate presigned URLs if using S3/UploadThing for secure access
3. Add fallback to show "PDF not available" instead of broken `#` links

**Estimated Complexity:** Low  
**Suggested Priority:** P2 (Medium)

---

#### Quiz Stats API - Placeholder Database Queries
- **Location:** `src/app/api/quiz/from-past-paper/stats/route.ts` (lines 105-120)
- **Type:** API Route
- **Severity:** Medium
- **Current State:** `getQuestionPerformanceStats()` and `updateQuestionPerformance()` return empty arrays
- **Expected Behavior:** Should query and update `question_performance` database table
- **Impact:** Quiz analytics show no data, blocking personalized learning insights
- **Dependencies:** Database schema (question_performance table)

**Implementation Plan:**
1. Create `questionPerformance` table in Drizzle schema
2. Implement `getQuestionPerformanceStats()` with SQL query: `SELECT question_id, COUNT(*) as attempts, AVG(is_correct) as accuracy FROM question_performance WHERE user_id = ? GROUP BY question_id`
3. Implement `updateQuestionPerformance()` with INSERT/UPDATE query
4. Add composite index on `(user_id, question_id)` for performance

**Estimated Complexity:** Medium  
**Suggested Priority:** P2 (Medium)

---

#### Onboarding Hook - Placeholder API Call
- **Location:** `src/hooks/useOnboarding.ts` (lines 209-216)
- **Type:** Hook
- **Severity:** Medium
- **Current State:** `saveLearningPreferences()` only logs to console with 1-second simulated delay
- **Expected Behavior:** Should persist learning preferences to database via API/server action
- **Impact:** User preferences (subject choices, learning style, goals) are lost on page refresh
- **Dependencies:** User preferences table

**Implementation Plan:**
1. Create server action `saveLearningPreferences(userId, preferences)` in `src/actions/`
2. Create or use existing `learningPreferences` table in database
3. Replace `setTimeout` with actual database INSERT/UPDATE
4. Add validation with Zod schema for preferences object

**Estimated Complexity:** Medium  
**Suggested Priority:** P1 (High)

---

### 3. Security Vulnerabilities (Critical)

#### Commented-Out Security Headers
- **Location:** `next.config.mjs` (lines 176-213)
- **Type:** Configuration
- **Severity:** Critical
- **Current State:** Entire `async headers()` block commented out - zero HTTP security headers
- **Expected Behavior:** Should enforce CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- **Impact:** Vulnerable to clickjacking, XSS, MIME sniffing, man-in-the-middle attacks
- **Dependencies:** None

**Implementation Plan:**
1. Uncomment the `async headers()` block in `next.config.mjs`
2. Test CSP directives to ensure they don't break legitimate functionality
3. If certain CSP directives cause issues, tune them individually rather than disabling all headers
4. Verify headers are present in production build with `curl -I https://lumni.ai`

**Estimated Complexity:** Low  
**Suggested Priority:** P0 (Blocker for production)

---

#### Gemini API Key Falls Back to NEXT_PUBLIC Variable
- **Location:** `src/services/chatService.ts` (line 269)
- **Type:** Security
- **Severity:** Critical
- **Current State:** `const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY;`
- **Expected Behavior:** Should fail loudly if server-side `GEMINI_API_KEY` is not set
- **Impact:** If server key is unset, app uses publicly-exposed client key, allowing API quota abuse and billing theft
- **Dependencies:** Environment variable configuration

**Implementation Plan:**
1. Remove `?? process.env.NEXT_PUBLIC_GEMINI_API_KEY` fallback
2. Add validation at app startup: `if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is required')`
3. If client-side direct API calls are needed, create a separate restricted API key with Google Cloud IP/domain restrictions
4. Audit all uses of `NEXT_PUBLIC_GEMINI_API_KEY` and ensure they are intentional and secured

**Estimated Complexity:** Low  
**Suggested Priority:** P0 (Blocker for production)

---

#### Database Init Endpoint with Spoofable IP-Based Auth
- **Location:** `src/app/api/db/init/route.ts` (lines 6-27)
- **Type:** Security
- **Severity:** Critical
- **Current State:** Authorization via `x-forwarded-for` header check for localhost IPs
- **Expected Behavior:** Should use strong secret token or be disabled in production
- **Impact:** `x-forwarded-for` is trivially spoofable, allowing any attacker to trigger database reinitialization
- **Dependencies:** None

**Implementation Plan:**
1. Remove IP-based authorization entirely
2. Add `DATABASE_INIT_SECRET` environment variable check: `if (request.headers.get('Authorization') !== \`Bearer ${process.env.DATABASE_INIT_SECRET}\`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`
3. Disable GET endpoint or require same auth
4. Consider removing this endpoint entirely and running DB init as deployment step, not runtime endpoint

**Estimated Complexity:** Low  
**Suggested Priority:** P0 (Blocker for production)

---

#### dangerouslySetInnerHTML Without Sanitization
- **Location:** `src/components/ui/MathRenderer.tsx` (lines 88, 123)
- **Type:** Security
- **Severity:** High
- **Current State:** LaTeX-to-HTML output rendered via `dangerouslySetInnerHTML` without sanitization
- **Expected Behavior:** Should sanitize HTML output with DOMPurify
- **Impact:** Crafted LaTeX from AI or user input could inject malicious HTML/JavaScript (XSS)
- **Dependencies:** DOMPurify library

**Implementation Plan:**
1. Install `dompurify` and `@types/dompurify`
2. Import and wrap HTML before rendering: `const sanitized = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['span', 'math', 'mi', 'mo', 'mn', 'mfrac', 'msqrt'] })`
3. Update `dangerouslySetInnerHTML` to use `sanitized` instead of `html`
4. Add test cases with malicious LaTeX input to verify sanitization

**Estimated Complexity:** Low  
**Suggested Priority:** P0 (Blocker for production)

---

### 4. Missing API Endpoints Called by Frontend (High)

#### `/api/subscription/status` - Missing Endpoint
- **Location:** `src/hooks/useFeatureAccess.ts` (lines 37, 80, 149)
- **Type:** API Route
- **Severity:** High
- **Current State:** Called by 3 hooks but no route file exists
- **Expected Behavior:** Should return user's subscription tier and feature access permissions
- **Impact:** All feature-gated content defaults to `canAccess: false`, blocking premium features for paying users
- **Dependencies:** Subscription table, Paystack integration

**Implementation Plan:**
1. Create `src/app/api/subscription/status/route.ts`
2. Implement GET handler that queries subscription table for user's active subscription
3. Return `{ tier: 'free' | 'premium' | 'parent', expiresAt, features: string[] }`
4. Add authentication check with `getAuth()`
5. Consider using `useSubscriptionStore` instead if tier is already managed client-side

**Estimated Complexity:** Medium  
**Suggested Priority:** P1 (High)

---

#### `/api/xp` - Missing Endpoint
- **Location:** `src/stores/useLearningStateStore.ts` (line 42)
- **Type:** API Route
- **Severity:** High
- **Current State:** Called but no route exists
- **Expected Behavior:** Should return user's XP, level, and achievements
- **Impact:** XP/level display fails on dashboard
- **Dependencies:** Gamification tables

**Implementation Plan:**
1. Create `src/app/api/xp/route.ts` or use existing `getUserXPAndLevel()` service function
2. Implement GET handler returning `{ totalXp, level: { level, title, xpToNext } }`
3. Add authentication check

**Estimated Complexity:** Low  
**Suggested Priority:** P1 (High)

---

#### `/api/energy` - Missing Combined Endpoint
- **Location:** `src/stores/useLearningStateStore.ts` (line 43)
- **Type:** API Route
- **Severity:** Medium
- **Current State:** Called but only `/api/energy/pattern`, `/api/energy/recommendations`, `/api/energy/track` exist
- **Expected Behavior:** Should return combined energy data or be split into separate calls
- **Impact:** Energy tracking fails silently
- **Dependencies:** Load shedding API, energy tracking tables

**Implementation Plan:**
1. Option A: Create `/api/energy` route that aggregates data from pattern, recommendations endpoints
2. Option B: Update `useLearningStateStore` to call the three existing endpoints separately
3. Add error handling for Eskom SePush API failures

**Estimated Complexity:** Low  
**Suggested Priority:** P2 (Medium)

---

#### `/api/gamification/streak/freeze` - Missing Endpoint
- **Location:** `src/stores/useLoadSheddingStore.ts` (line 259)
- **Type:** API Route
- **Severity:** Medium
- **Current State:** Called for auto-freeze during load shedding but no route exists
- **Expected Behavior:** Should consume a streak freeze for the user
- **Impact:** Load shedding auto-freeze feature does not work, users lose streaks unfairly
- **Dependencies:** Gamification tables

**Implementation Plan:**
1. Create `src/app/api/gamification/streak/freeze/route.ts`
2. Implement POST handler that decrements `streakFreezes` counter and preserves current streak
3. Return `{ success: boolean, remainingFreezes: number }`
4. Add rate limiting to prevent abuse

**Estimated Complexity:** Low  
**Suggested Priority:** P2 (Medium)

---

#### `/api/smart-scheduler/reschedule-energy` - Missing Endpoint
- **Location:** `src/stores/useSmartSchedulerStore.ts` (line 350)
- **Type:** API Route
- **Severity:** Medium
- **Current State:** Called but no route exists
- **Expected Behavior:** Should reschedule study blocks based on user energy levels
- **Impact:** Energy-based schedule optimization does not work
- **Dependencies:** Energy tracking, scheduler tables

**Implementation Plan:**
1. Create `src/app/api/smart-scheduler/reschedule-energy/route.ts`
2. Implement POST handler that reads current energy level and reschedules low-energy blocks to higher-energy times
3. Return updated blocks array
4. Alternatively, fold logic into existing `/api/smart-scheduler/optimize` endpoint

**Estimated Complexity:** Medium  
**Suggested Priority:** P2 (Medium)

---

#### `/api/smart-scheduler/reschedule-loadshedding` - Missing Endpoint
- **Location:** `src/stores/useSmartSchedulerStore.ts` (line 371)
- **Type:** API Route
- **Severity:** Medium
- **Current State:** Called but no route exists
- **Expected Behavior:** Should reschedule study blocks around load shedding times
- **Impact:** Load shedding schedule optimization does not work
- **Dependencies:** Load shedding API, scheduler tables

**Implementation Plan:**
1. Create `src/app/api/smart-scheduler/reschedule-loadshedding/route.ts`
2. Implement POST handler that fetches load shedding schedule and moves study blocks away from outage times
3. Return updated blocks array
4. Alternatively, fold into `/api/smart-scheduler/optimize`

**Estimated Complexity:** Medium  
**Suggested Priority:** P2 (Medium)

---

#### `/api/smart-scheduler/burnout-protection` - Missing Endpoint
- **Location:** `src/stores/useSmartSchedulerStore.ts` (line 391)
- **Type:** API Route
- **Severity:** Medium
- **Current State:** Called but no route exists
- **Expected Behavior:** Should reduce study load when burnout risk is detected
- **Impact:** Burnout protection feature does not function
- **Dependencies:** Burnout detection service, scheduler tables

**Implementation Plan:**
1. Create `src/app/api/smart-scheduler/burnout-protection/route.ts`
2. Implement POST handler that checks burnout risk from `useBurnoutStore` and reduces block intensity/duration
3. Return adjusted schedule with lighter load
4. Alternatively, integrate into `/api/smart-scheduler/optimize`

**Estimated Complexity:** Medium  
**Suggested Priority:** P2 (Medium)

---

#### `/api/team-goals/*` - Missing All Team Goals Endpoints
- **Location:** `src/stores/useTeamGoalsStore.ts` (lines 55, 71, 88, 99, 121, 151)
- **Type:** API Route
- **Severity:** High
- **Current State:** 6 endpoints called (`/api/team-goals`, `/join`, `/leave`, `/contribute`, `/reward`) but none exist
- **Expected Behavior:** Full CRUD for team goals feature
- **Impact:** Team goals page shows no data, all actions fail silently
- **Dependencies:** Team goals table

**Implementation Plan:**
1. Create `src/app/api/team-goals/route.ts` with GET (list goals) and POST (create goal)
2. Create sub-routes: `/api/team-goals/join/route.ts`, `/leave/route.ts`, `/contribute/route.ts`, `/reward/route.ts`
3. Implement authentication and team membership validation
4. Add Zod validation for all request bodies
5. Alternatively, convert to server actions in `src/actions/team-goals.ts`

**Estimated Complexity:** High  
**Suggested Priority:** P2 (Medium)

---

### 5. API Anti-Patterns (Medium)

#### Marketplace God Endpoint
- **Location:** `src/app/api/marketplace/route.ts`
- **Type:** API Route
- **Severity:** Medium
- **Current State:** Single route handles 13 different actions via query params/body (`?action=is-tutor`, `?action=book`, etc.)
- **Expected Behavior:** Should be split into RESTful routes
- **Impact:** Hard to maintain, test, secure, and document. Violates REST principles
- **Dependencies:** None

**Implementation Plan:**
1. Split into dedicated RESTful routes:
   - `GET /api/marketplace/tutors` (list tutors)
   - `GET /api/marketplace/tutors/:id` (tutor profile)
   - `POST /api/marketplace/sessions/book` (book session)
   - `GET /api/marketplace/sessions` (my sessions)
   - `POST /api/marketplace/reviews` (submit review)
   - etc.
2. Add Zod validation to each route
3. Add rate limiting per route
4. Update frontend calls to use new routes

**Estimated Complexity:** High  
**Suggested Priority:** P2 (Medium)

---

#### Multiple Routes Using Query Param Actions
- **Locations:**
  - `src/app/api/wrong-answer-pipeline/route.ts` (4 actions)
  - `src/app/api/adaptive-learning/process/route.ts` (4 actions)
  - `src/app/api/team-goals/route.ts` (4 actions)
  - `src/app/api/pdf-to-flashcard/route.ts` (2 actions)
  - `src/app/api/buddies/route.ts` (3 actions)
  - `src/app/api/parent-dashboard/route.ts` (2 actions)
  - `src/app/api/health/route.ts` (2 actions)
  - `src/app/api/moderation/flags/route.ts` (actions via query params)
- **Type:** API Design
- **Severity:** Medium
- **Current State:** Multiple actions handled via `?action=` or body `action` param
- **Expected Behavior:** Each action should be its own RESTful route
- **Impact:** Same as marketplace - maintainability, testing, and security concerns
- **Dependencies:** None

**Implementation Plan:**
1. Prioritize splitting based on usage frequency and security sensitivity
2. Start with `/api/health` (move `clear-logs` to `DELETE /api/health/logs`)
3. Split `/api/buddies` into `/api/buddies/accept`, `/api/buddies/reject`
4. Gradually refactor others in order of priority

**Estimated Complexity:** Medium per route  
**Suggested Priority:** P2 (Medium)

---

### 6. Missing Input Validation (High)

#### 11 API Routes Without Zod Validation
- **Locations:**
  - `src/app/api/marketplace/route.ts` (13 actions, zero validation)
  - `src/app/api/adaptive-learning/process/route.ts`
  - `src/app/api/wrong-answer-pipeline/route.ts`
  - `src/app/api/pdf-to-flashcard/route.ts`
  - `src/app/api/team-goals/route.ts`
  - `src/app/api/buddies/route.ts`
  - `src/app/api/parent-dashboard/route.ts` (PATCH)
  - `src/app/api/health/route.ts` (POST)
  - `src/app/api/study-plan/route.ts`
  - `src/app/api/calendar/events/route.ts`
  - `src/app/api/smart-scheduler/blocks/route.ts` (POST/PATCH)
  - `src/app/api/gamification/track/route.ts`
  - `src/app/api/mobile/route.ts`
- **Type:** API Route
- **Severity:** High
- **Current State:** No runtime validation of request bodies
- **Expected Behavior:** All inputs validated with Zod schemas
- **Impact:** Vulnerable to injection attacks, malformed data, and unpredictable behavior
- **Dependencies:** Zod library (already installed)

**Implementation Plan:**
1. Create Zod schemas for each route's expected input
2. Validate request body/params before processing
3. Return 400 Bad Request with specific validation error messages
4. Follow pattern from routes that already have validation (e.g., `quiz/complete/route.ts`)

**Estimated Complexity:** Medium  
**Suggested Priority:** P1 (High)

---

### 7. Missing Rate Limiting (High)

#### AI Endpoints Without Rate Limiting
- **Locations:**
  - `src/app/api/ai-chat/route.ts`
  - `src/app/api/ai-tutor/essay-grader/route.ts`
  - `src/app/api/ai-tutor/extract-concepts/route.ts`
  - `src/app/api/ai-tutor/recommendations/route.ts`
  - `src/app/api/quiz/generate-from-solution/route.ts`
  - `src/app/api/quiz/from-past-paper/create/route.ts`
  - `src/app/api/pdf-to-flashcard/route.ts`
  - `src/app/api/real-time-explanation/route.ts`
  - `src/app/api/extract-questions/route.ts`
  - `src/app/api/mock-data/generate/route.ts` (CRITICAL - database flooding)
- **Type:** API Route
- **Severity:** High
- **Current State:** No rate limiting (only `/api/ai-tutor` has it)
- **Expected Behavior:** All AI endpoints rate-limited to prevent cost exhaustion
- **Impact:** Single user can consume unlimited AI tokens, leading to Gemini API billing abuse
- **Dependencies:** Rate limiting infrastructure (already exists in `src/lib/rate-limit.ts`)

**Implementation Plan:**
1. Add rate limit categories to `src/lib/rate-limit.ts` for each endpoint
2. Import and call `checkRateLimit()` at start of each route handler
3. Return 429 Too Many Requests with `Retry-After` header when limit exceeded
4. For `/api/mock-data/generate`, add strict rate limit (1 per hour) or disable in production

**Estimated Complexity:** Medium  
**Suggested Priority:** P1 (High)

---

### 8. Store/Hook Issues (Medium)

#### Hardcoded Mock State in Stores
- **Locations:**
  - `src/stores/useGamificationStore.ts` (lines 72-171) - 3725 XP, level 13, 11 achievements
  - `src/stores/useNotificationStore.ts` (lines 42-173) - 20 hardcoded notifications
  - `src/stores/useDuelStore.ts` (lines 42-62) - "Sample question 1/2/3"
  - `src/stores/useScienceLab.ts` (lines 54-70) - hardcoded physics values
- **Type:** Store
- **Severity:** High
- **Current State:** Stores initialize with fake data shown to all users
- **Expected Behavior:** Zero/empty initial state, populated from server on mount
- **Impact:** Users see fake XP, achievements, notifications, and questions
- **Dependencies:** Backend APIs

**Implementation Plan:**
1. Replace mock initial state with zero/empty defaults
2. Add `fetchFromServer()` action to each store
3. Call `fetchFromServer()` on app mount in `AppLayout.tsx` or similar
4. Remove mock data functions or gate behind `NODE_ENV === 'development'`

**Estimated Complexity:** Medium  
**Suggested Priority:** P1 (High)

---

#### Non-Optimistic Store Mutations
- **Locations:**
  - `src/stores/useStudyBuddyStore.ts` (accept/reject requests)
  - `src/stores/useTeamGoalsStore.ts` (all 6 async actions)
  - `src/stores/useGamificationStore.ts` (no loading state during sync)
- **Type:** Store
- **Severity:** Low-Medium
- **Current State:** Mutations wait for API response before updating UI
- **Expected Behavior:** Optimistic update, rollback on failure
- **Impact:** Noticeable latency on user actions, poor UX
- **Dependencies:** None

**Implementation Plan:**
1. Update local state immediately (optimistic update)
2. Send API request in background
3. On failure, revert local state and show error toast
4. Follow pattern from `useSmartSchedulerStore.toggleBlockComplete` which already does this correctly

**Estimated Complexity:** Medium  
**Suggested Priority:** P3 (Nice-to-have)

---

### 9. Orphaned/Unused Code (Low)

#### Virtual Lab Page - No Navigation
- **Location:** `src/app/virtual-lab/page.tsx`
- **Type:** Page
- **Severity:** Low
- **Current State:** Page exists but no navigation links to it
- **Expected Behavior:** Either add to navigation or remove page
- **Impact:** Dead code, users cannot discover feature
- **Dependencies:** None

**Implementation Plan:**
1. Add link to sidebar under "Practice" or "AI Workspace" section
2. Or remove page if feature is deprecated

**Estimated Complexity:** Low  
**Suggested Priority:** P3 (Nice-to-have)

---

#### Backup Files in Repository
- **Locations:**
  - `src/app/api/extract-questions/route.ts.bak3`
  - `src/app/api/moderation/flags/route.ts.bak2`
- **Type:** Git artifact
- **Severity:** Medium
- **Current State:** Backup files committed to repo
- **Expected Behavior:** Clean repo history, no backup files
- **Impact:** Increases bundle size, could be accidentally imported, indicates instability
- **Dependencies:** None

**Implementation Plan:**
1. Delete `.bak3` and `.bak2` files
2. Add `*.bak*` to `.gitignore`
3. Use git blame/history for previous versions instead of file copies

**Estimated Complexity:** Low  
**Suggested Priority:** P2 (Medium)

---

#### Unused `defaultProfile` Variable
- **Location:** `src/stores/useUserLearningProfileStore.ts` (lines 46-58)
- **Type:** Store
- **Severity:** Low
- **Current State:** `defaultProfile` constant created but never used (`void defaultProfile`)
- **Expected Behavior:** Either use as initial state or remove
- **Impact:** Dead code
- **Dependencies:** None

**Implementation Plan:**
1. Remove `defaultProfile` constant and `void defaultProfile` line
2. Or use it as the initial `profile` state instead of `null`

**Estimated Complexity:** Low  
**Suggested Priority:** P3 (Nice-to-have)

---

### 10. localStorage Instead of Database (Medium)

#### API Key Stored in localStorage
- **Location:** `src/hooks/use-user-api-key.ts` (lines 23, 38, 49)
- **Type:** Hook
- **Severity:** Medium
- **Current State:** Gemini API key stored in `localStorage` under `lumni_user_gemini_api_key`
- **Expected Behavior:** API keys stored server-side in database
- **Impact:** Key exposed to XSS, does not sync across devices
- **Dependencies:** User settings table

**Implementation Plan:**
1. Create server action to save/retrieve API key encrypted in database
2. On app load, fetch key from server
3. If client-side caching needed, encrypt with Web Crypto API before storing in localStorage
4. Add option for users to use platform-managed API keys (no user key needed)

**Estimated Complexity:** Medium  
**Suggested Priority:** P2 (Medium)

---

#### Custom Topics in localStorage
- **Location:** `src/hooks/use-curriculum-progress.ts` (lines 28, 39)
- **Type:** Hook
- **Severity:** Low
- **Current State:** Custom topics saved to `localStorage` under `lumni-custom-topics`
- **Expected Behavior:** Persisted to database for cross-device access
- **Impact:** Lost on browser clear or device switch
- **Dependencies:** Curriculum table

**Implementation Plan:**
1. Create `POST /api/curriculum/custom-topics` endpoint
2. Save custom topics to database
3. Fetch on app mount and merge with standard curriculum
4. Keep localStorage as offline cache, sync when online

**Estimated Complexity:** Medium  
**Suggested Priority:** P3 (Nice-to-have)

---

## Quick Wins (< 30 minutes each)

1. **Fix `/tutor/[id]` route** - Change 2 lines in `Marketplace.tsx`
2. **Fix `/my-sessions` route** - Change 3 lines across 3 files
3. **Fix `/become-tutor` route** - Change 2 lines in `Marketplace.tsx`
4. **Fix `/streak` route** - Change 1 line to redirect to `/achievements`
5. **Fix `/tasks` route** - Change 1 line to redirect to `/study-plan`
6. **Fix `/learning-center` route** - Change 1 line in `BridgeToMastery.tsx`
7. **Delete backup files** - Remove `.bak3` and `.bak2` files
8. **Remove unused `defaultProfile`** - Delete 15 lines from `useUserLearningProfileStore.ts`
9. **Uncomment security headers** - Uncomment 40 lines in `next.config.mjs`
10. **Fix Gemini API key fallback** - Remove 1 fallback in `chatService.ts`
11. **Fix DB init auth** - Replace IP check with secret token in `db/init/route.ts`
12. **Fix search API PDF URLs** - Query actual URLs from database in `search/route.ts`
13. **Add DOMPurify to MathRenderer** - Install library and wrap 2 lines

---

## Critical Path (Must Fix First)

1. **Uncomment security headers** - Protects all users from XSS, clickjacking, MITM
2. **Fix Gemini API key fallback** - Prevents billing theft
3. **Fix DB init endpoint auth** - Prevents database reinitialization attacks
4. **Add DOMPurify to MathRenderer** - Prevents XSS from user/AI content
5. **Fix broken navigation links** - Core user flows (tutoring, tasks, streaks) are broken
6. **Switch data source from mock to real** - Entire app shows fake data
7. **Add rate limiting to AI endpoints** - Prevents cost exhaustion
8. **Create `/api/subscription/status`** - Unlocks premium features for paying users
9. **Implement `saveLearningPreferences`** - User preferences persist across sessions

---

## Recommendations

### Architecture
1. **Consolidate API design** - Migrate from action-query-param pattern to RESTful routes. Start with high-traffic endpoints (marketplace, buddies, health).
2. **Centralize environment validation** - Create `src/lib/env.ts` that validates all required env vars at startup using `@t3-oss/env-nextgen` or `zod`.
3. **Separate development utilities** - Gate mock data generation, database init, and seed utilities behind `NODE_ENV === 'development'` checks to prevent production usage.

### Security
1. **Enable CSP headers immediately** - Uncomment security headers in `next.config.mjs` and tune CSP directives.
2. **Audit all API routes for authentication** - Add `requireAuth()` helper to every route that accesses user data.
3. **Implement resource ownership checks** - Every endpoint accessing resources by ID must verify `WHERE user_id = session.user.id`.
4. **Rate limit all AI endpoints** - Add database-backed rate limiting to prevent Gemini API abuse.
5. **Remove `NEXT_PUBLIC_` from secret variables** - Audit all `NEXT_PUBLIC_` env vars and remove any that should be server-only.

### Data Integrity
1. **Replace mock state with server fetches** - All stores should initialize with zero/empty state and populate from APIs on mount.
2. **Create missing API endpoints** - Prioritize `/api/subscription/status`, `/api/xp`, and `/api/team-goals/*`.
3. **Implement placeholder services** - Replace stub implementations in `questionBankService`, `modelManagement`, `hintManagement`, and `monitoring`.

### Performance
1. **Add optimistic updates to stores** - Follow `useSmartSchedulerStore.toggleBlockComplete` pattern for all mutations.
2. **Implement Zustand selectors** - Replace `useStore()` with `useStore((s) => s.specificField)` to prevent unnecessary re-renders.
3. **Remove redundant wrapper hooks** - Delete `useGamification()`, `useProgress()`, `useAdaptiveDifficulty()` that just forward store properties.

### Code Quality
1. **Replace console.log with structured logger** - Use `@/lib/logger` across all API routes (85 console statements found).
2. **Delete or gate mock data utilities** - Remove `/api/mock-data/generate` or protect with admin-only auth + strict rate limiting.
3. **Split god stores** - Break `useSmartSchedulerStore` (400 lines, 18+ actions) and `useGamificationStore` into focused stores.
4. **Resolve store/hook naming collisions** - Rename duplicate `useStudyBuddyStore` exports.

---

## Enhancement Suggestions

### Missing Features Worth Adding
1. **Email verification flow** - Better Auth supports it but no UI found
2. **Password reset completion** - `/forgot-password` and `/reset-password` exist but need end-to-end testing
3. **Offline mode for AI features** - Cache AI responses for offline study sessions
4. **Parent-child account linking** - Currently shows "coming soon" toast
5. **Detailed parent reports** - Currently shows "coming soon" toast
6. **Streak visualization page** - Route `/streak` is referenced but page doesn't exist

### UX Improvements
1. **Loading states for async store actions** - Add spinners/skeletons for team goals, study buddy, and energy tracking operations
2. **Error boundaries** - Wrap major feature areas with React error boundaries to prevent full-page crashes
3. **Toast notifications for all errors** - Replace `console.error` with user-visible `toast.error()` calls
4. **Form validation feedback** - Add inline error messages to all forms using Zod validation

### Performance Optimizations
1. **React Query for data fetching** - Replace manual `fetch()` + Zustand pattern with React Query for automatic caching, deduplication, and refetching
2. **Route segment config** - Add `export const dynamic = 'force-dynamic'` or `force-static` to routes as appropriate
3. **Image optimization** - Ensure all Unsplash URLs use `next/image` with proper sizing and formats
4. **Bundle analysis** - Run `bun run build --analyze` to identify large dependencies

### Accessibility (WCAG 2.1 AA)
1. **Keyboard navigation audit** - Test all interactive elements with keyboard only
2. **Focus management** - Add focus trapping to modals and focus restoration after navigation
3. **Color contrast audit** - Verify all text meets 4.5:1 contrast ratio
4. **ARIA labels** - Add `aria-label` to icon-only buttons and complex interactive elements

### Security Hardening
1. **Enable CSRF protection** - Review and tighten CSRF exemptions
2. **Subresource Integrity (SRI)** - Add SRI hashes for external CDN resources (Daily.co, PDF.js)
3. **Dependency auditing** - Run `bun audit` regularly and update vulnerable packages
4. **Secret scanning** - Enable GitHub secret scanning on repository

---

## Appendix: Statistics

| Category | Files Scanned | Issues Found |
|----------|--------------|--------------|
| Page routes | 92 | 6 broken links |
| API routes | 117 | 9 missing auth, 11 missing validation, 7 non-existent |
| Components | 124 | 10 placeholders, 12 hardcoded values |
| Stores | 41 | 4 mock state, 4 stub actions, 3 SR violations |
| Hooks | 82 | 5 localStorage misuse, 2 TODO comments |
| Server actions | 31 | 0 issues (well-implemented) |
| Security | Full codebase | 3 critical, 5 high, 4 medium |
| Configuration | 15 files | 2 critical (headers, env vars) |

**Total findings: 96** across 156 features

---

*Report generated by Qwen Code AI Agent on 11 April 2026*
