# Test Plan: Enriched App Prototype (Phase 5)

Comprehensive test plan covering unit, integration, E2E, data quality, performance, and security testing for the enriched app prototype.

---

## 1. Unit Tests

**Target:** `src/lib/mock-data/`, `src/lib/enrichment/`, `src/components/EnrichedDashboard/`
**Tool:** Vitest
**Coverage Gate:** 90% on new code

### 1.1 Mock Data Generator

| Test | File | Expected Outcome |
|------|------|-----------------|
| Seeded RNG produces identical output for same seed | `generator.test.ts` | Two generators with seed=42 produce identical user arrays |
| Different seeds produce different output | `generator.test.ts` | Generators with seed=1 and seed=2 produce different users |
| User count matches config | `generator.test.ts` | `generateUsers(50)` returns exactly 50 users |
| Generated users have valid emails | `generator.test.ts` | All user emails match `/^[^@]+@[^@]+\.[^@]+$/` regex |
| Quiz results have valid percentages | `generator.test.ts` | All percentages are 0-100 |
| Study sessions have positive duration | `generator.test.ts` | All `durationMinutes > 0` |
| Dates fall within configured range | `generator.test.ts` | All generated dates are within `monthsBack` window |
| Topic mastery levels are valid enum values | `generator.test.ts` | All levels are one of: beginner, intermediate, advanced, mastered |
| Export produces valid JSON | `generator.test.ts` | `export('json')` parses as valid JSON with expected structure |
| Intensity affects record count | `generator.test.ts` | high intensity produces more study sessions than low intensity |

### 1.2 Enrichment Pipeline

| Test | File | Expected Outcome |
|------|------|-----------------|
| Content hash is deterministic | `pipeline.test.ts` | Same data object produces same SHA-256 hash |
| Deduplication removes duplicates | `pipeline.test.ts` | Two records with same sourceUrl+hash result in 1 record |
| Quality scoring returns correct tier | `pipeline.test.ts` | Record with 90%+ non-empty fields gets "high" quality |
| Quality scoring returns "low" for empty data | `pipeline.test.ts` | Record with no data fields gets "low" quality |
| Validator rejects missing required fields | `validator.test.ts` | Record without required fields returns `{valid: false, errors: [...]}` |
| Validator accepts valid record | `validator.test.ts` | Complete record returns `{valid: true, errors: []}` |
| Normalizer adds provenance metadata | `normalizer.test.ts` | Normalized record has `dataSource`, `enrichedAt`, `provenance` |
| Rate limiter enforces minimum interval | `pipeline.test.ts` | Two requests to same domain are separated by at least `minIntervalMs` |
| Pipeline handles fetch failure gracefully | `pipeline.test.ts` | Failed fetch returns `{success: false, recordsFetched: 0}` |
| robots.txt checker blocks disallowed paths | `robots-checker.test.ts` | URL matching Disallow rule returns `{allowed: false}` |

### 1.3 UI Components

| Test | File | Expected Outcome |
|------|------|-----------------|
| ActivityHeatmap renders with empty timeline | `ActivityHeatmap.test.tsx` | Renders card with 0 total activity message |
| ActivityHeatmap renders grid for 180 days | `ActivityHeatmap.test.tsx` | Grid contains ~26 weeks of 7 cells each |
| ActivityHeatmap mobile shows 12 weeks | `ActivityHeatmap.test.tsx` | When window < 640px, only last 12 weeks rendered |
| ProgressRings renders subject list | `ProgressRings.test.tsx` | Each subject renders with correct progress percentage |
| ProgressRings expands on click | `ProgressRings.test.tsx` | Clicking a ring shows detail panel with attempted/target |
| StreakCounter shows correct message for streak=0 | `StreakCounter.test.tsx` | Displays "Start your streak today!" |
| StreakCounter shows hot streak animation | `StreakCounter.test.tsx` | Streak > 7 with recent activity shows orange flame with pulse |
| StreakCounter shows warning for inactive | `StreakCounter.test.tsx` | daysSinceLastStudied > 1 shows "Don't break the chain!" |
| ActivityStream groups by date | `ActivityStream.test.tsx` | Activities grouped under "Today", "Yesterday", etc. |
| ActivityStream shows empty state | `ActivityStream.test.tsx` | Empty array renders "Your story begins here" |
| AccuracyTrend shows improvement badge | `AccuracyTrend.test.tsx` | Increasing accuracy shows green arrow up badge |
| AccuracyTrend shows decline badge | `AccuracyTrend.test.tsx` | Decreasing accuracy shows red arrow down badge |
| WeakTopicHighlights sorts by accuracy | `WeakTopicHighlights.test.tsx` | Topics ordered lowest accuracy first, max 5 shown |
| WeakTopicHighlights renders null for empty | `WeakTopicHighlights.test.tsx` | Empty topics array returns null (nothing rendered) |
| CohortComparison shows correct percentile | `CohortComparison.test.tsx` | Percentile 90+ shows "top 10%" message |
| CohortComparison below average rotates icon | `CohortComparison.test.tsx` | userAccuracy < cohortAverage rotates TrendingUp 180 degrees |

---

## 2. Integration Tests

**Target:** API endpoints, database operations, enrichment pipeline end-to-end
**Tool:** Vitest with test database (SQLite)

### 2.1 API Endpoints

| Test | Endpoint | Method | Expected Outcome |
|------|----------|--------|-----------------|
| Mock data generation creates records | `/api/mock-data/generate` | POST | Returns `{success: true, usersGenerated: N, records: {...}}` with all record counts > 0 |
| Mock data generation with seed is reproducible | `/api/mock-data/generate` | POST | Two calls with same seed produce same user count and record counts |
| Mock data generation validates input | `/api/mock-data/generate` | POST | Invalid intensity value returns 400 or falls back to default |
| Mock data GET returns options | `/api/mock-data/generate` | GET | Returns `{status, methods, options}` |
| Enrichment run requires admin auth | `/api/enrichment/run` | POST | Non-admin session returns 401 |
| Enrichment run all sources | `/api/enrichment/run` | POST | Returns `{success, results, summary}` with per-source breakdown |
| Enrichment run single source | `/api/enrichment/run` | POST | Returns single `PipelineResult` with correct sourceId |
| Enrichment run with unknown source | `/api/enrichment/run` | POST | Returns `{success: false, errors: ["Unknown source: ..."]}` |
| Enrichment stats returns registry | `/api/enrichment/stats` | GET | Returns `{stats, quarantineCount, sources, timestamp}` |
| Enrichment stats includes quarantine entries | `/api/enrichment/stats` | GET | `recentQuarantine` array has at most 10 entries |
| Activity timeline returns heatmap data | `/api/activity/:userId/timeline` | GET | Returns `{heatmap: {timeline, totalDays, totalActivity}}` |
| Activity timeline returns streak data | `/api/activity/:userId/timeline` | GET | Returns `{streak: {currentStreak, bestStreak, lastStudiedAt}}` |
| Activity timeline returns subject progress | `/api/activity/:userId/timeline` | GET | Returns `{subjects: [{name, color, progress, attempted, target}]}` |
| Activity timeline for unknown user | `/api/activity/:userId/timeline` | GET | Returns 404 |
| Activity timeline respects months param | `/api/activity/:userId/timeline?months=3` | GET | Timeline spans exactly 3 months |

### 2.2 Database Operations

| Test | Operation | Expected Outcome |
|------|-----------|-----------------|
| Bulk user insert is idempotent | `users` table | Duplicate user ID insert does not throw, skips gracefully |
| Quiz results reference valid subjects | `quizResults` table | All `subjectId` values exist in `subjects` table |
| Study sessions have valid user references | `studySessions` table | All `userId` values exist in `users` table |
| Channel members reference valid users | `channelMembers` table | All `userId` values exist in `users` table |
| Calendar events have valid time ranges | `calendarEvents` table | `endTime > startTime` for all events |
| Topic mastery tracks per-user-per-subject | `topicMastery` table | No duplicate `(userId, subjectId, topic)` combinations |

---

## 3. E2E Tests (Playwright)

**Target:** Full user journeys through the enriched app
**Tool:** Playwright
**Browsers:** Chromium (required), Firefox + WebKit (optional CI)

### 3.1 Critical Paths

| Scenario | Steps | Expected Outcome |
|----------|-------|-----------------|
| Admin generates mock data | 1. Login as admin<br>2. Navigate to admin settings<br>3. Configure mock data (100 users, 6 months, high)<br>4. Click Generate | Toast confirms generation. Dashboard shows activity heatmap with data. |
| Dashboard displays enriched data | 1. Login as synthetic user<br>2. View dashboard | ActivityHeatmap renders with 6-month grid. StreakCounter shows streak. ProgressRings show subjects. ActivityStream shows recent activities. |
| Subject detail shows accuracy trend | 1. Login as synthetic user<br>2. Click Mathematics subject<br>3. View subject detail | AccuracyTrend chart renders with area graph. WeakTopicHighlights shows topics with accuracy < 50%. CohortComparison shows bar chart. |
| Weak topic CTA navigates to quiz | 1. On subject detail<br>2. Click "Practice Now" on weak topic | Navigates to `/quiz?topic={topic}` with topic pre-selected. |
| Streak counter updates after study | 1. Login with streak=5 user<br>2. Complete a quiz<br>3. Return to dashboard | StreakCounter shows 6 (incremented). |
| Progress rings expand on click | 1. View dashboard<br>2. Click a progress ring | Ring expands to show attempted/target details. |
| Activity heatmap tooltip works | 1. View dashboard<br>2. Hover over a heatmap cell | Tooltip shows date and activity count. |
| Cohort comparison renders correctly | 1. View subject detail<br>2. Scroll to cohort section | Bar chart shows "You" vs "Average" with reference line. Percentile displayed. |

### 3.2 Error Scenarios

| Scenario | Steps | Expected Outcome |
|----------|-------|-----------------|
| Generate mock data fails | 1. Trigger generation with DB disconnected | Error toast shown. Dashboard unchanged. |
| Non-admin tries enrichment | 1. Login as non-admin<br>2. Call POST /api/enrichment/run | 401 response. UI shows "Unauthorized" message. |
| Activity timeline for deleted user | 1. Request timeline for non-existent user | 404 response. UI shows empty state. |

### 3.3 Responsive E2E Tests

| Viewport | Scenario | Expected Outcome |
|----------|----------|-----------------|
| 375x812 (mobile) | Dashboard page | ActivityHeatmap shows 12-week compact view. ProgressRings in flex wrap layout. |
| 768x1024 (tablet) | Dashboard page | ActivityHeatmap shows full grid. ProgressRings in 3-column grid. |
| 1280x800 (desktop) | Dashboard page | ActivityHeatmap shows full grid. ProgressRings in 4-column grid. |

---

## 4. Data Quality Checks

**Tool:** Custom validators + Vitest

### 4.1 Schema Compliance

| Rule | Validation | Target |
|------|-----------|--------|
| R1: Accuracy in range | `0 <= accuracy <= 100` for all quiz results | 100% of records |
| R2: Positive time | `timeTaken > 0`, `durationMinutes > 0` | 100% of records |
| R3: Valid FK references | All `userId`, `subjectId` values exist in parent tables | 100% of records |
| R4: Valid flashcard ratings | `1 <= rating <= 5` for SM-2 scale | 100% of records |
| R5: dataSource tag | All records have `dataSource IN ('real', 'mock', 'enriched')` | 100% of records |
| R6: No PII in mock data | Regex scan: no real email/phone patterns in generated fields | 0 violations |
| R7: Dedup key uniqueness | `sourceUrl + contentHash` is unique across enriched records | 0 duplicates |

### 4.2 Distribution Validation

| Check | Method | Expected |
|-------|--------|----------|
| Accuracy distribution matches config | Compare generated mean/std to configured distribution parameters | Within 5% of target |
| Activity density follows intensity | Compare records-per-user across low/medium/high | high > medium > low |
| Weekend activity lower than weekday | Compare average daily activity Sat/Sun vs Mon-Fri | Weekday > Weekend |
| Subject weights respected | Compare question count per subject to configured weights | Within 10% of target ratio |

### 4.3 Temporal Validation

| Check | Method | Expected |
|-------|--------|----------|
| All dates within configured window | Min/max dates vs `monthsBack` config | All dates within range |
| No future dates | Max date <= today | 0 records with future dates |
| Activity has realistic gaps | No more than 30 consecutive zero-activity days for "high" intensity | Realistic study patterns |

---

## 5. Performance Targets

**Tool:** Lighthouse CI, Web Vitals monitoring

### 5.1 Page Load Performance

| Metric | Mobile Target | Desktop Target |
|--------|--------------|----------------|
| LCP (Largest Contentful Paint) | < 2.5s | < 1.5s |
| TTI (Time to Interactive) | < 3.5s | < 2.5s |
| CLS (Cumulative Layout Shift) | < 0.1 | < 0.05 |
| FCP (First Contentful Paint) | < 1.8s | < 1.0s |
| TBT (Total Blocking Time) | < 200ms | < 100ms |

### 5.2 Chart Rendering Performance

| Component | Target | Measurement |
|-----------|--------|-------------|
| ActivityHeatmap (180 days) | < 100ms render time | `performance.now()` before/after mount |
| AccuracyTrend (90 data points) | < 150ms render time | Time to first paint |
| ProgressRings (8 subjects) | < 200ms render time | Time to all rings visible |
| ActivityStream (30 items) | < 100ms render time | Time to scrollable list |

### 5.3 API Response Times

| Endpoint | P50 Target | P95 Target |
|----------|-----------|-----------|
| POST /api/mock-data/generate (100 users) | < 5s | < 10s |
| GET /api/enrichment/stats | < 200ms | < 500ms |
| GET /api/activity/:userId/timeline | < 300ms | < 800ms |

---

## 6. Security Tests

**Tool:** OWASP ZAP, manual review, Vitest

### 6.1 Authentication & Authorization

| Test | Method | Expected Outcome |
|------|--------|-----------------|
| Enrichment run requires session | POST /api/enrichment/run without session | 401 Unauthorized |
| Enrichment run requires admin role | POST /api/enrichment/run with student role | 401 Unauthorized |
| Activity timeline requires valid user | GET /api/activity/nonexistent/timeline | 404 Not Found |
| Mock data generation has no auth gate | POST /api/mock-data/generate (open) | 200 OK (intentionally open for demo) |

### 6.2 Input Validation

| Test | Method | Expected Outcome |
|------|--------|-----------------|
| Mock data with negative userCount | POST `{"userCount": -1}` | 400 Bad Request or clamped to minimum |
| Mock data with invalid intensity | POST `{"intensity": "extreme"}` | 400 Bad Request or falls back to default |
| Enrichment run with empty body | POST `{}` | 200 OK, runs all sources (default behavior) |
| Activity timeline with SQL injection in userId | GET `/api/activity/'; DROP TABLE users;--/timeline` | No SQL injection; Drizzle ORM parameterized queries prevent it |

### 6.3 XSS Prevention

| Test | Method | Expected Outcome |
|------|--------|-----------------|
| Generated user name with script tag | Inject `<script>alert(1)</script>` into mock name | React auto-escapes; script does not execute |
| Enriched data with HTML in subject name | Inject `<img onerror=alert(1)>` via enrichment | React auto-escapes; no XSS |

### 6.4 Rate Limiting

| Test | Method | Expected Outcome |
|------|--------|-----------------|
| Rapid mock data generation requests | Send 10 POST requests in 10 seconds | Rate limiter (if configured) throttles after threshold |
| Enrichment pipeline rate limits web sources | Pipeline fetches from same domain | Requests spaced by `rateLimitMs` config |

### 6.5 Data Privacy

| Test | Method | Expected Outcome |
|------|--------|-----------------|
| Mock data contains no real PII | Scan all generated user emails/names | All synthetic (e.g., `example.com` domain, fictional names) |
| Enriched data has provenance tags | Query enriched records | All have `dataSource: 'enriched'` and `enrichedAt` |
| Quarantine data does not leak to client | GET /api/enrichment/stats | Only `reason`, `sourceId`, `timestamp` exposed -- not full record contents |

---

## 7. Test Execution Schedule

| Phase | Tests | When | Gate |
|-------|-------|------|------|
| Pre-commit | Unit tests (generator, pipeline, components) | On `git commit` via Husky | All pass |
| PR | Unit + Integration tests | On PR creation/update | All pass, 90% coverage |
| Preview Deploy | E2E critical paths + Lighthouse | On Vercel preview deploy | Critical paths pass, LCP < 2.5s |
| Production | Full suite + Security scan | On merge to main | 0 critical security findings |
| Weekly | Data quality checks + Distribution validation | Scheduled CI job | 0 violations |

---

## 8. Test Infrastructure

| Component | Setup |
|-----------|-------|
| Test database | Separate SQLite instance per test run, torn down after |
| Mock HTTP | `msw` (Mock Service Worker) for external API simulation |
| Browser testing | Playwright with `playwright.config.ts` in project root |
| Coverage reporting | Vitest `--coverage` with `v8` provider, HTML report in `coverage/` |
| CI integration | GitHub Actions workflow `.github/workflows/test.yml` |
