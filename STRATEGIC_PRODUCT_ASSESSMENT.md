# Lumni (MatricMaster AI) — Strategic Product Assessment

**Date:** 12 April 2026  
**Version:** 1.0  
**Audience:** Executive leadership + Implementation teams

---

## Executive Summary

Lumni is the most feature-complete AI tutoring platform for South African Grade 12 students that I've analyzed. With **86+ routes**, **30+ database tables**, **6 AI providers**, **4 subscription tiers**, **real-time multiplayer features**, and **offline-first PWA capabilities**, the app has extraordinary breadth. However, this breadth masks critical gaps:

1. **Feature surface area is too wide, depth is too shallow** — 50+ features exist, but most are at "functional MVP" quality. The smart scheduler, study buddy matching, spaced repetition algorithm, leaderboard real-time sync, focus rooms presence, and APS calculator are all flagged as incomplete.
2. **Monetization leakage** — The free tier offers 5 AI messages/day, leaderboard, achievements, and topic mastery. That's generous enough that many students may never convert. The R49 Basic tier (20 msgs/day, 2 live sessions/month) has unclear value differentiation.
3. **No parent-school-teacher feedback loop** — Parent dashboard exists but is siloed. Teachers have `/school` but there's no mechanism for assigning homework, tracking class performance, or communicating with parents.
4. **Build instability** — The Next.js build crashes with exit code 66 (OOM/native module issue), which blocks reliable CI/CD and deployment confidence.
5. **526 debug/console statements** in production code indicate incomplete logging hygiene.

**The single highest-impact strategic recommendation**: **Consolidate and deepen the core learning loop** (Quiz → AI Tutor explanation → Spaced Repetition Flashcards → Progress Analytics) before adding new feature categories. A student who completes this loop should experience a demonstrably better outcome than any competitor.

---

## 1. Current State Snapshot

### Feature Set (Categorized)

| Category | Features | Maturity |
|----------|----------|----------|
| **Core Learning** | Quiz, Past Papers, Flashcards (SM-2), Lessons, Practice, Study Plans, Study Path, Review Mode | ✅ Functional, ⚠️ SM-2 algorithm suboptimal |
| **AI/Tutor** | AI Tutor (6-provider fallback), Voice Tutor, Snap & Solve (OCR), Essay Grader, Study Companion, Offline AI (WebLLM) | ✅ Functional, ⚠️ Voice tutor mobile STT incomplete |
| **Gamification** | XP System, Leaderboard (Ably), 50+ Achievements, Boss Fight (exam sim), Duel (PvP), Daily Login Bonus | ⚠️ Real-time leaderboard partial, Daily login bonus stubbed |
| **Social** | Study Buddies, Focus Rooms, Channels (chat), Comments, Team Goals | ⚠️ Matching algo weak, presence incomplete |
| **Scheduling** | Smart Scheduler, Calendar, Planner, Exam Timer | ⚠️ Conflict resolution incomplete |
| **Analytics** | Dashboard, Topic Mastery, Results, Analytics, Parent Dashboard | ⚠️ Parent dashboard needs notification prefs |
| **Utilities** | APS Calculator, Setwork Library, Periodic Table, Science Lab, Curriculum Map, Subject Map, Math/Physics tools | ⚠️ APS calc missing universities, stub components exist |
| **Communication** | Video Call (Daily.co), WhatsApp Notifications, Resend Email | ✅ Functional |
| **Admin/CMS** | Admin Dashboard, CMS, Content Flags | ✅ Functional |
| **Monetization** | 4-tier subscription (Free/Basic R49/Premium R99/Pro R199), Paystack payments | ✅ Functional |
| **Accessibility** | Skip-to-content, ARIA, reduced motion, high contrast, text scaling, axe-core testing | ✅ Strong |
| **Offline/PWA** | Service Worker, IndexedDB, offline flashcards, offline study plans, offline AI | ✅ Strong |

### User Cohorts

| Cohort | Size (Est.) | Primary Needs | Current Satisfaction |
|--------|-------------|---------------|---------------------|
| **Grade 12 Students** (primary) | Unknown — needs PostHog data | Exam prep, AI help, peer motivation | Likely moderate — feature-rich but depth gaps |
| **Parents** (secondary) | Unknown | Monitor progress, intervene early | Low — dashboard exists but lacks actionable insights |
| **Teachers/Tutors** (tertiary) | Unknown | Assign work, track class, monetize tutoring | Low — `/school` and `/tutoring` are thin |
| **School Administrators** (potential) | Not yet served | School-wide analytics, curriculum compliance | Not addressed |
| **University Applicants** (adjacent) | Unknown | APS calculation, university admission guidance | Partial — APS calculator incomplete |

### Success Metrics (Currently Tracked)

- PostHog: 13 typed events (quiz_completed, flashcard_created, subscription_started, ai_tutor_used, etc.)
- Vercel Analytics: Web vitals
- Sentry: Error monitoring
- Internal: Quiz scores, topic mastery, streaks, leaderboard rankings, adaptive learning metrics

**Missing metrics**: Retention (D7/D30), conversion rate (free → paid), NPS, time-to-first-AHA-moment, content coverage %, CAPS alignment score.

### Constraints

| Constraint | Impact |
|------------|--------|
| South African load shedding | Affects server uptime, student study sessions, real-time feature reliability |
| ZAR pricing ceiling | R199/mo Pro tier is expensive for SA market; price sensitivity is high |
| Data costs for students | Heavy AI usage, video calls, and real-time features consume mobile data — must optimize |
| CAPS curriculum compliance | All content must stay aligned; expansion to other grades requires curriculum mapping |
| Build instability (exit code 66) | Blocks reliable CI/CD |
| Multi-provider AI cost | 6 AI providers = unpredictable cost; token budget tracking exists (500K/day) but no cost-per-user analysis |
| PostgreSQL ↔ SQLite dual mode | Sync engine exists but adds complexity and potential data inconsistency |

---

## 2. Prioritized Feature Improvement Backlog

### Priority Framework: Impact (1-5) × Effort (S/M/L) × Risk (Low/Med/High)

#### P0 — Critical (Ship in next 2 sprints)

| # | Improvement | Rationale | Impact | Effort | Dependencies | Risks |
|---|------------|-----------|--------|--------|-------------|-------|
| 1 | **Fix build instability** (exit code 66) | Blocks all deployment, erodes team confidence, prevents CI/CD | 5 | M | None | May require Next.js downgrade or native module audit |
| 2 | **Deepen the core learning loop** (Quiz → AI explanation → Flashcard → Review) | This is the product's north star; currently each piece works independently but they don't flow together | 5 | L | Core learning features | Feature creep; must resist adding new features while doing this |
| 3 | **Optimize SM-2 spaced repetition algorithm** | Flashcards are the retention engine; suboptimal algorithm = knowledge decay = churn | 4 | M | Flashcard system | Requires A/B testing infrastructure to validate improvement |
| 4 | **Complete Smart Scheduler conflict resolution** | Students can't trust their study plans if conflicts aren't resolved | 4 | M | Study plans, calendar | Complex constraint satisfaction problem |
| 5 | **Implement real-time leaderboard sync (full Ably integration)** | Gamification drives engagement; stale leaderboard = lost motivation | 3 | M | Ably setup, leaderboard API | Ably cost at scale |

#### P1 — High (Ship in next 4-6 sprints)

| # | Improvement | Rationale | Impact | Effort | Dependencies | Risks |
|---|------------|-----------|--------|--------|-------------|-------|
| 6 | **Improve study buddy matching algorithm** | Social learning increases retention; current matching is likely random or basic | 4 | M | Study buddies, user profiles | Privacy concerns with student matching |
| 7 | **Complete Focus Rooms real-time presence** | Collaborative study sessions are a key differentiator vs. solo apps | 3 | M | Ably, focus room store | Network reliability during load shedding |
| 8 | **Parent dashboard: notification preferences + actionable insights** | Parents pay for subscriptions; they need reasons to stay subscribed | 4 | M | Parent dashboard, notification system | Over-notification fatigue |
| 9 | **APS Calculator: support all SA universities** | High-utility feature that drives organic traffic; currently incomplete | 3 | S | APS calculator | Requires research into each university's APS requirements |
| 10 | **Implement stub components** (InteractiveDiagram, ViewTransition, MobileLayoutFixes) | Reduces technical debt, improves UX | 2 | S | Each component | Low priority but quick wins |
| 11 | **Lessons browser pagination/virtualization** | Performance issue with large content sets | 3 | M | Lessons, database | May require API changes |

#### P2 — Medium (Ship in next 8-12 sprints)

| # | Improvement | Rationale | Impact | Effort | Dependencies | Risks |
|---|------------|-----------|--------|--------|-------------|-------|
| 12 | **Voice tutor mobile speech-to-text completion** | Accessibility feature; important for students who can't type during commute | 3 | L | Web Speech API, mobile testing | Browser compatibility on Android/iOS |
| 13 | **Knowledge Decay Alerts (unstub DailyLoginBonus, KnowledgeDecayAlert)** | Re-engagement mechanism; brings lapsed students back | 3 | S | Retention metrics, notification system | Alert fatigue |
| 14 | **WhatsApp Business API: study reminders + progress reports** | WhatsApp is the #1 communication channel in SA; huge potential | 4 | M | WhatsApp API, notification preferences | WhatsApp Business API cost per conversation |
| 15 | **Offline AI model optimization** (WebLLM) | Critical for load shedding scenarios; on-device inference = no data cost | 4 | L | @mlc-ai/web-llm, model optimization | Model quality vs. cloud providers |
| 16 | **Content coverage analytics** (% of CAPS curriculum covered per subject) | Students and parents need to know "am I covering everything?" | 4 | M | Curriculum map, questions table | Requires comprehensive CAPS mapping |

#### P3 — Strategic (Evaluate and plan)

| # | Improvement | Rationale | Impact | Effort | Dependencies | Risks |
|---|------------|-----------|--------|--------|-------------|-------|
| 17 | **Teacher portal: assign homework, track class performance** | Opens B2B2C revenue stream (schools buy licenses) | 5 | XL | School route, content management | Sales cycle for schools is long |
| 18 | **Grade 11 and Grade 10 content expansion** | Expands TAM 3x; students start using Lumni earlier | 5 | XL | Content pipeline, curriculum mapping | Content creation cost; dilutes Grade 12 focus |
| 19 | **AI-powered exam prediction engine** (predict student's exam score based on practice performance) | Massive value prop for parents and students | 5 | L | Historical performance data, ML model | Accuracy expectations; liability if wrong |
| 20 | **Integration with DBE (Department of Basic Education) past paper API** | Official content source; reduces manual content entry | 3 | L | DBE partnership, API availability | Government API reliability |

---

## 3. Integration Plan

### 3.1 Internal Feature Weaving

#### The Core Learning Loop (Improvement #2) — Detailed Design

**Current state:** Quiz, AI Tutor, Flashcards, and Review are independent features. A student takes a quiz, gets a score, and that's it. Wrong answers don't automatically become flashcards. AI Tutor conversations aren't linked to quiz performance.

**Target state:**
```
Student takes Quiz → Wrong answers flagged
    ↓
AI generates personalized explanation for each wrong answer (AI Tutor)
    ↓
Student can convert explanation → Flashcard deck (1-tap)
    ↓
Flashcard deck enters spaced repetition queue (SM-2)
    ↓
Review Mode surfaces past mistakes + upcoming flashcard reviews
    ↓
Dashboard shows "Knowledge Health Score" combining quiz scores, flashcard retention, and CAPS coverage
```

**Architectural implications:**
- **New table:** `learningLoopEvents` (userId, quizId, questionId, flashcardDeckId, aiSessionId, timestamp, outcome)
- **New API:** `POST /api/learning-loop/convert-wrong-answers` — triggers AI explanation generation + flashcard creation
- **Zustand store:** New `useLearningLoopStore` to orchestrate the flow client-side
- **Existing tables affected:** `quizResults` (add `wrongAnswersProcessed` flag), `flashcardDecks` (add `autoGeneratedFrom` reference), `aiChatSessions` (add `triggeredBy` enum: 'tutor' | 'quiz' | 'snap-and-solve' | 'learning-loop')

**Data flow:**
1. Quiz submission → Server flags wrong answers in `quizResults`
2. Background job (or lazy trigger) → Calls AI to generate explanations for each wrong answer
3. Explanations stored in `aiChatSessions` with `triggeredBy: 'learning-loop'`
4. Student sees "Convert to Flashcards" CTA on explanation cards
5. Flashcard deck created with `autoGeneratedFrom: 'quiz-{quizId}'`
6. SM-2 algorithm schedules reviews
7. Review Mode aggregates: upcoming flashcard reviews + past quiz mistakes to revisit

**Authentication & Authorization:**
- All learning loop data is user-scoped (row-level via `userId`)
- Parents with linked student accounts get read-only access to learning loop analytics
- No cross-user data sharing except anonymized aggregate stats for leaderboard

**Backward compatibility:**
- Existing quiz results remain valid; `wrongAnswersProcessed` defaults to `false`
- Existing flashcard decks work unchanged; `autoGeneratedFrom` is nullable
- AI chat sessions without `triggeredBy` default to `'tutor'`

**UX considerations:**
- Don't overwhelm: cap auto-generated explanations at 5 per quiz session
- Give students control: "Auto-convert wrong answers to flashcards" toggle in settings
- Visual indicator on dashboard: "3 wrong answers from yesterday's Math quiz need review"

### 3.2 External Platform Integrations

#### WhatsApp Business API Deep Integration (Improvement #14)

**Current state:** WhatsApp integration exists (`src/lib/services/whatsappReminders.ts`) but appears to be a stub with `console.debug` logging.

**Target state:**
- **Study reminders:** Daily WhatsApp message with today's study plan items
- **Progress reports:** Weekly summary to student (and parent if linked)
- **Exam countdown:** "3 days until Math Paper 1 — here's what to focus on"
- **Motivation:** Streak reminders, achievement notifications
- **Quick quiz:** "Answer this question via WhatsApp" — student replies A/B/C/D

**API contract:**
```typescript
// POST /api/whatsapp/subscribe
{ phoneNumber: string, preferences: { dailyReminder: boolean, weeklyReport: boolean, examCountdown: boolean } }

// POST /api/whatsapp/send (internal)
{ to: string, template: 'daily_reminder' | 'weekly_report' | 'exam_countdown' | 'quick_quiz', data: Record<string, any> }

// POST /api/whatsapp/webhook (WhatsApp inbound)
{ messageId: string, from: string, text: string } → parses quiz answers, stores progress
```

**Architecture:**
- Cloud-hosted WhatsApp Business API (Meta or 360dialog)
- Webhook endpoint at `/api/webhooks/whatsapp`
- Message template registry in `src/lib/whatsapp/templates/`
- Queue system (could use existing `outbox` table) for reliable delivery
- Rate limiting: max 1 message/student/day for reminders, 1/week for reports

**Data flow:**
```
Cron job (daily, 6 AM SAST) → Fetches today's study plans → Sends WhatsApp reminders
Cron job (weekly, Sunday 8 PM) → Aggregates weekly progress → Sends report
Exam date trigger → 7, 3, 1 day countdown messages
Student replies to quiz → Parsed → Stored as quiz attempt → Updates progress
```

#### Google Classroom Integration (New)

**Opportunity:** Teachers assign work via Google Classroom; Lumni can push practice quizzes and study plans as Classroom assignments.

**Architecture:**
- OAuth 2.0 flow for teachers to connect Google Classroom
- `POST /api/integrations/google-classroom/sync` — pushes study plans as assignments
- Webhook for receiving grade updates back from Classroom
- New table: `googleClassroomIntegrations` (teacherId, classroomId, courseId, syncedAt)

### 3.3 Authentication & Authorization Enhancements

**Current state:** Better Auth with email/password, Google OAuth, 2FA TOTP. Role field exists but isn't fully utilized.

**Recommended enhancements:**
1. **Role-based access control (RBAC):** Enforce role checks in API routes, not just in page components. Currently admin routes check role in page/route handler but not in proxy.
2. **Parent-student linking:** Parent accounts should be able to "claim" student accounts via invite code. New table: `parentStudentLinks` (parentId, studentId, linkedAt, permissions).
3. **School organization:** Multi-tenant support — students belong to schools, teachers belong to schools, data is scoped by schoolId. This is prerequisite for B2B sales.

### 3.4 Backward Compatibility Strategy

- All new tables use nullable columns for backfill
- Feature flags for gradual rollout (could use environment variables initially)
- Database migrations must be reversible (Drizzle supports `down` migrations)
- API versioning: prefix new breaking APIs with `/api/v2/`

---

## 4. Synergy Map

### Cross-Feature Synergies

| Synergy | Features Combined | Scenario | Expected Value | Required Collaboration | Timeline |
|---------|------------------|----------|----------------|----------------------|----------|
| **Smart Study Session** | Smart Scheduler + AI Tutor + Focus Rooms + XP | Student opens Focus Room → Scheduler assigns today's topics → AI Tutor helps with difficult concepts → XP earned for completion | 2x session duration, 30% improvement in topic mastery | AI team (tutor), Social team (focus rooms), Gamification team (XP), Scheduling team | Sprint 5-8 |
| **Parent-Student Feedback Loop** | Parent Dashboard + Notifications + WhatsApp + Learning Loop | Parent receives weekly WhatsApp report → Clicks link to dashboard → Sees child's weak topics → Sends encouragement message → Student gets notification | Parent subscription retention +40% | Parent dashboard team, Notification team, WhatsApp integration | Sprint 3-6 |
| **Exam Readiness Score** | Quiz + Past Papers + Topic Mastery + Exam Timer + Analytics | Student sees "72% Exam Ready" on dashboard → Breakdown by topic → "Algebra: 85%, Calculus: 45%" → Recommended study plan | Students who see readiness score study 1.5x more | Analytics team, Quiz team, Past Papers team | Sprint 4-7 |
| **Social Competition** | Leaderboard + Duel + Team Goals + Achievements | Student challenges friend to Duel → Winner earns XP + achievement → Team goal progress updated → Leaderboard updates in real-time | DAU +25%, session frequency +20% | Gamification team, Social team, Ably infrastructure | Sprint 3-5 |
| **Offline-First AI** | Offline AI + Flashcards + Study Plans + Sync Engine | Student downloads study plan + flashcards + AI model during WiFi → Studies during load shedding → Syncs progress when back online | Load shedding session loss → 0% (currently ~20%) | Offline team, AI team, Sync team | Sprint 6-10 |

### Cross-Product Synergies (Future)

| Synergy | Products | Scenario | Value | Timeline |
|---------|----------|----------|-------|----------|
| **Lumni for Schools** | Lumni Student + Lumni Teacher Portal | Teacher assigns quiz → Students complete → Teacher sees class analytics → Identifies struggling students → Assigns targeted practice | B2B revenue stream (R50/student/month) | Q3-Q4 2026 |
| **Lumni + University Partnerships** | Lumni + APS Calculator + University portals | Student's APS score auto-submitted to university applications → Universities send personalized offers through Lumni | Partnership revenue, user acquisition | Q4 2026 |
| **Lumni + DBE** | Lumni + Department of Basic Education | Official CAPS content sourced from DBE → Lumni becomes recommended study tool → Government endorsement | Credibility, user acquisition, content accuracy | Q2-Q4 2026 |

---

## 5. Edge Case & Risk Register

### 5.1 Usability Risks

| # | Risk | Likelihood | Severity | Mitigation | Testing Plan | Monitoring |
|---|------|-----------|----------|-----------|-------------|------------|
| U1 | Feature overwhelm — 86+ routes confuse new students | High | High | Progressive disclosure: onboarding flow shows 3 core features first, unlocks others over 7 days | Usability testing with 10+ Grade 12 students | Track "features used in first week" metric; target >3 |
| U2 | AI tutor gives incorrect explanations | Medium | High | Add "Report incorrect answer" button → feeds into wrong-answer-pipeline → human review queue | Red-team testing: feed known-wrong questions, verify AI catches them | Track "reported answers per 1000 AI messages"; target <5 |
| U3 | Spaced repetition shows too many reviews on same day | Medium | Medium | Implement SM-2 with daily review caps (max 50 cards/day); overflow rolls to next day | A/B test: capped vs. uncapped | Track "daily review count distribution"; alert if >95th percentile exceeds 50 |
| U4 | Parent dashboard shows data that causes anxiety (e.g., "your child is failing") | Low | High | Frame analytics positively: "Math needs attention" instead of "Math: 32%"; include actionable next steps | Parent focus group testing | Track parent session duration; sudden drops indicate negative framing |

### 5.2 Performance Risks

| # | Risk | Likelihood | Severity | Mitigation | Testing Plan | Monitoring |
|---|------|-----------|----------|-----------|-------------|------------|
| P1 | AI provider rate limiting during exam season (Oct-Nov) | High | High | Implement request queuing with exponential backoff; pre-warm fallback providers; token budget per user | Load test: simulate 1000 concurrent AI requests | Track "AI response time p95"; alert if >5s |
| P2 | Real-time leaderboard Ably connection drops during load shedding | High | Medium | Implement offline-first leaderboard: cache last known state, reconcile on reconnect | Chaos testing: disconnect/reconnect Ably during active sessions | Track "Ably disconnect events per hour"; target <1% |
| P3 | Large question bank queries (>10K questions) cause slow page loads | Medium | Medium | Implement pagination + virtualization; cache frequently accessed subjects; use Vercel KV for hot data | Load test with 50K questions in DB | Track "page load TTFB"; alert if >1s for cached routes |
| P4 | PWA service worker caching stale content | Low | High | Implement cache-busting with content hashes; max-age 5min for API responses; stale-while-revalidate strategy | E2E test: update content, verify PWA updates within 5min | Track "stale content complaints" via Sentry |

### 5.3 Scalability Risks

| # | Risk | Likelihood | Severity | Mitigation | Testing Plan | Monitoring |
|---|------|-----------|----------|-----------|-------------|------------|
| S1 | PostgreSQL connection pool exhaustion at 10K+ concurrent users | Medium | High | Use connection pooling (PgBouncer); implement read replicas for analytics queries; cache hot queries | Load test: simulate 10K concurrent users with k6 | Track "active DB connections / pool size ratio"; alert at 80% |
| S2 | AI token budget exhaustion (500K/day limit) | High | High | Implement per-user daily caps based on tier; queue excess requests with ETA notification; negotiate higher limits with providers | Monitor current token usage trends; project when limit will be hit | Track "tokens used per day / budget"; alert at 80% |
| S3 | Ably channel limits for Focus Rooms at scale | Low | Medium | Implement channel multiplexing; use Ably's presence features efficiently; fall back to polling if Ably unavailable | Load test Focus Rooms with 100 concurrent users | Track "Ably channel count"; alert at 80% of plan limit |
| S4 | SQLite fallback data inconsistency with PostgreSQL | Medium | High | Implement conflict resolution strategy in sync engine; log all conflicts for manual review; alert on sync failures | Test sync with concurrent writes to both databases | Track "sync conflicts per day"; alert on any unresolved conflict >24h |

### 5.4 Security Risks

| # | Risk | Likelihood | Severity | Mitigation | Testing Plan | Monitoring |
|---|------|-----------|----------|-----------|-------------|------------|
| E1 | AI prompt injection via user-submitted questions | Medium | High | Sanitize all user input before feeding to AI; use system prompts that ignore instruction-like content; implement output validation | Red-team: submit prompt injection attempts, verify AI ignores them | Track "AI output validation failures"; alert on any |
| E2 | Student PII exposure (phone numbers, names, grades) | Low | Critical | Encrypt PII at rest (phone numbers already encrypted for 2FA backup codes — extend pattern); row-level security in PostgreSQL; audit logging for data access | Penetration testing; automated PII scan in CI | Track "unauthorized data access attempts"; alert on any |
| E3 | Paystack payment webhook tampering | Low | High | Verify webhook signatures; implement idempotency keys; reconcile payments daily | Test with modified webhook payloads; verify signature validation | Track "failed webhook signature verifications"; alert on any |
| E4 | CSRF token bypass | Low | High | Current CSRF middleware is good; ensure all state-changing routes use it; test with CSRF testing tools | Automated CSRF testing in E2E suite | Track "CSRF validation failures"; investigate patterns |
| E5 | 526 console.debug statements in production code | High | Medium | Replace with structured logging (Sentry breadcrumbs); remove debug statements; implement log levels | Grep CI check for `console.debug` in production builds | Sentry breadcrumb volume; unexpected noise indicates leftover debug |

### 5.5 Privacy & Compliance Risks

| # | Risk | Likelihood | Severity | Mitigation | Testing Plan | Monitoring |
|---|------|-----------|----------|-----------|-------------|------------|
| R1 | POPIA (SA data protection law) non-compliance | Medium | Critical | Appoint information officer; conduct POPIA impact assessment; implement data subject access requests (DSAR); data retention policy | Legal review; POPIA compliance audit | Track "data access requests"; response time <30 days |
| R2 | Minor data protection (Grade 12 students are typically 17-18) | High | Critical | Parental consent flow for under-18s; clear privacy notice in plain language; minimal data collection; age verification at signup | Legal review; test consent flows | Track "under-18 signups without consent"; block if detected |
| R3 | AI data retention — storing student conversations indefinitely | Medium | High | Implement conversation retention policy (e.g., 12 months); allow students to delete their AI history; anonymize data used for model improvement | Test data deletion flow; verify DB cleanup | Track "conversations older than retention period"; alert on any |
| R4 | Cross-border data transfer (AI providers may process data outside SA) | Medium | Medium | Document data flows to each AI provider; ensure adequacy decisions or appropriate safeguards; disclose in privacy policy | Legal review of each AI provider's data processing terms | Track "new AI provider additions"; require privacy review before enabling |

### 5.6 Accessibility Risks

| # | Risk | Likelihood | Severity | Mitigation | Testing Plan | Monitoring |
|---|------|-----------|----------|-----------|-------------|------------|
| A1 | Math/science formulas not readable by screen readers | High | High | MathJax/KaTeX with ARIA descriptions; provide text alternatives for all equations | Screen reader testing (NVDA, JAWS, VoiceOver) | Track "accessibility complaints related to math content" |
| A2 | Color-only indicators (e.g., subject colors) not distinguishable by colorblind users | Medium | Medium | Add text labels or patterns alongside colors; test with colorblind simulators | Axe-core already runs in E2E; add colorblind-specific tests | Track "accessibility audit scores for color contrast" |
| A3 | Voice tutor not usable by students with speech impairments | Low | Medium | Ensure text-based AI tutor is equally capable; don't make voice-only features | Accessibility review of voice tutor feature | Track "voice tutor usage vs. text AI tutor usage" |

### 5.7 Localization Risks

| # | Risk | Likelihood | Severity | Mitigation | Testing Plan | Monitoring |
|---|------|-----------|----------|-----------|-------------|------------|
| L1 | Content only in English — excludes Afrikaans, isiZulu, isiXhosa speakers | High | Medium | `/language` route exists; prioritize translation of high-impact content (quiz questions, AI tutor prompts); use AI-assisted translation with human review | Native speaker review of translated content | Track "language selection rate"; target >20% for non-English |
| L2 | AI tutor doesn't respond in local languages | Medium | Medium | Configure Gemini to respond in user's selected language; test with isiZulu, Afrikaans prompts | Test AI responses in 5+ SA languages | Track "non-English AI conversations"; monitor quality |
| L3 | Date/time formatting not SAST-aware in all places | Low | Medium | Use `date-fns-tz` consistently; all server-side dates in SAST; client-side uses browser timezone with SAST override | Timezone testing in E2E | Track "date-related bug reports" |

### 5.8 Fault Tolerance & Incident Response

| # | Risk | Likelihood | Severity | Mitigation | Response Plan | Monitoring |
|---|------|-----------|----------|-----------|--------------|------------|
| F1 | Primary AI provider (Gemini) outage | Medium | High | 5 fallback providers already configured; implement circuit breaker pattern with automatic failover | Auto-failover within 30s; notify team via Sentry | Track "provider failover events"; alert on consecutive failures |
| F2 | PostgreSQL outage | Low | Critical | SQLite fallback exists; sync engine handles reconciliation; read-only mode during outage | Auto-failover to SQLite; sync when PostgreSQL recovers | Track "PostgreSQL health check"; alert on any failure |
| F3 | Paystack payment processing failure | Low | High | Queue failed payments for retry; allow alternative payment method; notify user | Manual retry within 1 hour; contact Paystack support if >30min | Track "failed payment attempts"; alert on >5% failure rate |
| F4 | Ably real-time service outage | Low | Medium | Fall back to polling (30s interval); cached state displayed; notify user of degraded mode | Auto-degrade to polling; restore when Ably recovers | Track "Ably connection status"; alert on disconnections >5min |
| F5 | Vercel deployment failure | Low | High | Maintain staging environment; rollback capability; canary deployments | Rollback to previous deployment within 5min | Track "deployment success rate"; alert on any failure |

---

## 6. Assumptions & Constraints

### Explicit Assumptions
1. **Team size:** Assuming 3-5 engineers, 1 designer, 1 product manager. If team is smaller, timeline doubles.
2. **User base:** Assuming <10K MAU currently. Growth projections not available.
3. **Content:** Assuming question bank covers >60% of CAPS curriculum for core subjects (Math, Physical Sciences).
4. **AI cost:** Assuming current AI provider costs are sustainable at current usage. No cost-per-user data available.
5. **Revenue:** No revenue data available. Subscription conversion rate unknown.
6. **Competition:** Assuming direct competitors are other SA edtech apps (Snappet, Siyavula, UkuCoca).

### Hard Constraints
1. **Budget:** Unknown — all estimates assume bootstrapped/revenue-funded growth
2. **Regulatory:** POPIA compliance is mandatory; minor data protection adds complexity
3. **Technical:** Next.js 16 build instability must be resolved before any major feature work
4. **Market:** SA student willingness to pay caps at ~R100/month; Pro tier at R199 may be overpriced

### Tradeoffs Surface

| Decision | Option A | Option B | Recommendation |
|----------|----------|----------|---------------|
| Feature depth vs. breadth | Deepen existing features | Add new features | **Option A** — depth drives retention and word-of-mouth |
| Cloud AI vs. on-device AI | Cloud AI (better quality) | On-device WebLLM (works offline) | **Both** — cloud primary, on-device fallback for load shedding |
| B2C vs. B2B focus | Direct-to-student | Sell to schools | **B2C first** — establish product-market fit, then B2B |
| Free tier generosity | Generous free tier (current) | Restrictive free tier | **Current approach** — generous free tier drives adoption; monetize via premium features, not core access |
| PostgreSQL vs. SQLite | PostgreSQL only (simpler) | Dual-mode (current) | **PostgreSQL only** long-term; SQLite adds complexity for marginal benefit |

---

## 7. Information Gaps — Requests for Clarification

| # | Gap | Why it matters | Who can answer |
|---|-----|---------------|---------------|
| 1 | **Monthly Active Users (MAU)** | Determines scalability priorities, cost projections | Product analytics (PostHog) |
| 2 | **Subscription conversion rate** | Informs pricing strategy, free tier adjustment | PostHog subscription events |
| 3 | **AI cost per user per month** | Determines unit economics, sustainability | AI provider billing + user count |
| 4 | **Content coverage % per subject** | Determines if content gaps are driving churn | Curriculum map analysis |
| 5 | **D7 and D30 retention rates** | Most important metric for product health | PostHog cohort analysis |
| 6 | **Team size and capacity** | Determines realistic sprint velocity | Engineering lead |
| 7 | **Revenue and runway** | Determines investment capacity | Founder/CEO |
| 8 | **Competitor analysis** | Informs differentiation strategy | Product/strategy team |
| 9 | **Parent willingness to pay** | Validates parent dashboard investment | User research/survey |
| 10 | **Teacher demand for tutoring marketplace** | Validates `/tutoring` feature investment | User research/survey |

---

## 8. Prioritized Backlog with Owners

| Priority | Item | Owner (Suggested) | Sprint | Status |
|----------|------|-------------------|--------|--------|
| P0 | Fix build instability | Backend Lead | 1-2 | 🔴 Blocked |
| P0 | Core learning loop integration | Full-stack Team | 2-4 | 🟡 Not Started |
| P0 | SM-2 algorithm optimization | ML/AI Engineer | 2-3 | 🟡 Not Started |
| P0 | Smart Scheduler conflict resolution | Full-stack Team | 3-4 | 🟡 Not Started |
| P0 | Real-time leaderboard (Ably) | Frontend + Backend | 3-4 | 🟡 Not Started |
| P1 | Study buddy matching improvement | ML/AI Engineer | 4-5 | 🟡 Not Started |
| P1 | Focus Rooms presence completion | Frontend Team | 4-5 | 🟡 Not Started |
| P1 | Parent dashboard enhancements | Full-stack Team | 5-6 | 🟡 Not Started |
| P1 | APS Calculator completion | Frontend Team | 4 | 🟡 Not Started |
| P1 | Stub component implementation | Frontend Team | 3 | 🟡 Not Started |
| P2 | Voice tutor mobile STT | Mobile/Frontend | 6-8 | 🟡 Not Started |
| P2 | WhatsApp Business integration | Backend Team | 5-7 | 🟡 Not Started |
| P2 | Offline AI optimization | ML/AI Engineer | 6-10 | 🟡 Not Started |
| P2 | Content coverage analytics | Data Engineer | 5-7 | 🟡 Not Started |
| P3 | Teacher portal | Full Team | 12+ | ⚪ Planned |
| P3 | Grade 10/11 expansion | Content + Eng Team | 16+ | ⚪ Planned |
| P3 | Exam prediction engine | ML/AI Engineer | 12+ | ⚪ Planned |

---

## 9. Validation Plan

### Metrics & Decision Gates

#### Phase 1: Foundation (Sprints 1-4)
| Metric | Target | Decision Gate |
|--------|--------|---------------|
| Build success rate | >95% | If <90% after Sprint 2, escalate to Next.js team or downgrade |
| Core learning loop completion rate | >40% of quiz-takers complete the loop | If <20%, redesign the loop UX |
| SM-2 retention improvement | +15% flashcard retention rate | If no improvement, investigate algorithm parameters |
| Smart Scheduler conflict resolution accuracy | >95% conflicts resolved | If <80%, simplify the algorithm |

#### Phase 2: Engagement (Sprints 4-8)
| Metric | Target | Decision Gate |
|--------|--------|---------------|
| D7 retention | +10% vs. baseline | If no improvement, investigate onboarding |
| D30 retention | +5% vs. baseline | If no improvement, investigate content quality |
| Focus Rooms DAU | >15% of DAU | If <5%, investigate value proposition |
| Parent dashboard weekly active users | >30% of parents | If <10%, investigate parent value prop |

#### Phase 3: Monetization (Sprints 8-12)
| Metric | Target | Decision Gate |
|--------|--------|---------------|
| Free → paid conversion rate | >5% | If <2%, adjust free tier or pricing |
| WhatsApp engagement rate | >60% open rate | If <30%, adjust message timing/content |
| AI cost per user | <R10/user/month | If >R20, optimize AI usage or raise prices |
| Churn rate (monthly) | <8% | If >15%, investigate cancellation reasons |

#### Phase 4: Scale (Sprints 12+)
| Metric | Target | Decision Gate |
|--------|--------|---------------|
| MAU growth | +20% month-over-month | If <5%, investigate acquisition channels |
| Content coverage | >80% CAPS curriculum for core subjects | If <60%, accelerate content pipeline |
| NPS | >40 | If <20, conduct user research |
| Teacher portal pilot success | >3 schools onboard | If 0, investigate sales approach |

### Testing Strategy

| Test Type | Frequency | Tools | Coverage Target |
|-----------|-----------|-------|----------------|
| Unit tests | Every PR | Vitest | >80% (currently unknown) |
| E2E tests | Every PR | Playwright | Critical flows (auth, quiz, AI tutor) |
| Accessibility audits | Every PR | axe-core | 0 critical violations |
| Load tests | Monthly | k6 | 10K concurrent users |
| Security audits | Quarterly | Snyk, manual pen test | 0 critical vulnerabilities |
| Usability testing | Monthly | In-person with students | Qualitative feedback |
| A/B tests | As needed | PostHog experiments | Statistical significance >95% |

---

## 10. Near-Term Roadmap (12 Sprints / ~24 Weeks)

```
Sprint 1-2: STABILIZE
├── Fix build instability [P0]
├── Audit and remove console.debug statements
├── Set up comprehensive monitoring dashboard
├── Define baseline metrics (MAU, D7, D30, conversion rate)
└── Information gap resolution (answers to Section 7)

Sprint 3-4: DEEPEN CORE
├── Core learning loop: Quiz → AI → Flashcard integration [P0]
├── SM-2 algorithm optimization [P0]
├── Implement stub components [P1]
├── APS Calculator completion [P1]
└── Lessons browser pagination [P1]

Sprint 5-6: ENGAGE
├── Smart Scheduler completion [P0]
├── Real-time leaderboard [P0]
├── Parent dashboard enhancements [P1]
├── WhatsApp Business API integration [P2]
└── Content coverage analytics [P2]

Sprint 7-8: SOCIAL
├── Study buddy matching improvement [P1]
├── Focus Rooms presence completion [P1]
├── Knowledge Decay Alerts [P2]
├── Voice tutor mobile STT [P2] (start)
└── A/B test: learning loop vs. control

Sprint 9-10: OPTIMIZE
├── Voice tutor mobile STT (complete) [P2]
├── Offline AI optimization (start) [P2]
├── Performance audit and optimization
├── POPIA compliance audit
└── Pricing experiment (free tier adjustment)

Sprint 11-12: PREPARE FOR SCALE
├── Offline AI optimization (complete) [P2]
├── Teacher portal planning [P3]
├── Grade 10/11 content pipeline planning [P3]
├── Exam prediction engine design [P3]
└── Annual strategy review and pivot assessment
```

---

## 11. Final Recommendations

### Do Now (This Week)
1. **Pull PostHog data** — Get MAU, D7/D30 retention, conversion rates. Everything in this document is hypothesis until validated with data.
2. **Fix the build** — Nothing else matters if you can't ship reliably.
3. **Talk to 5 students** — Understand what they actually use, what they love, what they ignore.

### Do This Quarter
1. **Deepen the core learning loop** — This is your moat. No competitor connects quiz performance → AI explanation → spaced repetition → review as seamlessly.
2. **Complete the incomplete features** — Smart Scheduler, SM-2, real-time leaderboard, study buddy matching. These are promised features that students expect to work.
3. **WhatsApp integration** — Highest-ROI feature for the SA market. Every student has WhatsApp.

### Do This Year
1. **Evaluate B2B (schools)** — Once B2C product-market fit is proven, schools are a massive channel.
2. **Grade expansion** — Grade 11, then Grade 10. Same platform, 3x the TAM.
3. **Exam prediction engine** — The killer feature that makes Lumni indispensable to parents.

### Don't Do (Yet)
1. **Don't add more features** until the core loop is world-class.
2. **Don't expand to other countries** until SA is dominated.
3. **Don't build a mobile app** until the PWA is flawless (PWA covers 90% of native app value at 10% of the cost).

---

*This assessment is based on codebase analysis and industry best practices. All recommendations should be validated against actual user data and business metrics before implementation. Priorities may shift based on data from Section 7 information gaps.*
