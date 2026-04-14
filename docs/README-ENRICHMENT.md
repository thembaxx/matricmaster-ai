# Enrichment System - README

Quick start, architecture overview, and operational guide for the MatricMaster AI enrichment system.

---

## Quick Start

```bash
# 1. Ensure database is connected (set DATABASE_URL in .env.local)

# 2. Generate mock data (100 users, 6 months, high intensity)
bun run scripts/generate-mock-data.ts

# 3. Run enrichment pipeline (all sources)
bun run scripts/run-enrichment.ts --all

# 4. Validate enriched data
bun run scripts/validate-enrichment.ts

# 5. Start the app and visit the dashboard to see enriched UI
bun run dev
```

---

## What Was Built

### Core Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Mock Data Generator V2** | `src/lib/mock-data/generator-v2.ts` | Profile-based, seeded mock data generation with flashcard reviews, activity timelines, and aging simulation |
| **Enrichment Pipeline** | `src/lib/enrichment/pipeline.ts` | Fetch, parse, deduplicate, validate, and persist external educational data |
| **Feature Flags** | `src/lib/feature-flags.ts` | Server-side env var checks + client-side runtime overrides |
| **Enrichment Store** | `src/stores/enrichment-store.ts` | Zustand persist store for client-side feature flag state |
| **Validator** | `src/lib/enrichment/validator.ts` | JSON schema validation for enriched records |
| **Normalizer** | `src/lib/enrichment/normalizer.ts` | Transform source data to canonical schema with provenance metadata |
| **robots.txt Checker** | `src/lib/enrichment/robots-checker.ts` | Ethical compliance gate for web scraping |

### CLI Scripts

| Script | Purpose |
|--------|---------|
| `scripts/generate-mock-data.ts` | Generate and insert mock data with configurable seed, users, months, intensity |
| `scripts/run-enrichment.ts` | Run the enrichment pipeline for all or specific sources |
| `scripts/validate-enrichment.ts` | Validate all enriched records against schema, report pass/fail |

### UI Components (Enriched Dashboard)

| Component | Purpose |
|-----------|---------|
| `ActivityHeatmap` | GitHub-style contribution grid showing 6 months of study activity |
| `ProgressRings` | Per-subject progress rings with expandable detail |
| `StreakCounter` | Consecutive days studied with fire animation |
| `ActivityStream` | Chronological activity feed grouped by date |
| `AccuracyTrend` | Line chart showing accuracy improvement over time |
| `WeakTopicHighlights` | Sorted list of topics below 50% accuracy |
| `CohortComparison` | Bar chart comparing user to average cohort performance |

---

## How to Use

### CLI Commands

#### Generate Mock Data

```bash
# Default configuration
bun run scripts/generate-mock-data.ts

# Custom configuration
bun run scripts/generate-mock-data.ts --seed=123 --users=50 --months=3 --intensity=medium

# Preview without inserting
bun run scripts/generate-mock-data.ts --dry-run

# Export as JSON
bun run scripts/generate-mock-data.ts --export=./output/mock-data.json
```

#### Run Enrichment Pipeline

```bash
# All sources
bun run scripts/run-enrichment.ts --all

# Specific source
bun run scripts/run-enrichment.ts --source=dbe-past-papers
```

#### Validate Enriched Data

```bash
bun run scripts/validate-enrichment.ts
```

#### Existing npm Scripts (package.json)

```bash
bun run mock:generate   # Run scripts/mock-export.ts
bun run mock:export     # Run scripts/mock-export.ts
bun run mock:validate   # Run scripts/mock-validate.ts
bun run db:enrich       # Run scripts/enrich-database.ts
```

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/mock-data/generate` | POST | None | Generate mock data (open for demo) |
| `/api/mock-data/generate` | GET | None | Get generation options |
| `/api/enrichment/run` | POST | Admin only | Run enrichment pipeline |
| `/api/enrichment/stats` | GET | None | Get enrichment statistics |
| `/api/activity/:userId/timeline` | GET | None | Get activity heatmap, streak, and subject progress |

### UI Feature Flags

The Zustand store (`useEnrichmentStore`) provides client-side toggles:

```typescript
import { useEnrichmentStore } from '@/stores/enrichment-store';

const { mockDataEnabled, setMockDataEnabled } = useEnrichmentStore();

// Toggle mock data
setMockDataEnabled(!mockDataEnabled);

// Reset to defaults
useEnrichmentStore.getState().resetToDefaults();
```

Server-side flags (`src/lib/feature-flags.ts`):

```typescript
import { isMockDataEnabled, getFeatureFlags } from '@/lib/feature-flags';

if (isMockDataEnabled()) {
  // Show mock data
}

const flags = getFeatureFlags();
// { ENABLE_MOCK_DATA: true, ENABLE_ENRICHMENT_PIPELINE: true, ENABLE_ENRICHED_UI: true }
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Next.js 16)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Dashboard   │  │ Subject Detail│  │ Admin Settings     │  │
│  │ Components  │  │ Components    │  │ (flag toggles)     │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬───────────┘  │
│         │                │                    │              │
│  ┌──────▼────────────────▼────────────────────▼──────────┐  │
│  │              Zustand Stores (40+)                      │  │
│  │  useEnrichmentStore  useProgressStore  useQuizStore    │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │ API calls
┌───────────────────────────▼─────────────────────────────────┐
│                     API Layer (Next.js)                      │
│  ┌──────────────────┐  ┌────────────────────────────────┐   │
│  │ /api/mock-data/  │  │ /api/enrichment/               │   │
│  │   generate       │  │   run, stats                   │   │
│  └────────┬─────────┘  └────────────┬───────────────────┘   │
│           │                         │                        │
│  ┌────────▼─────────┐  ┌────────────▼───────────────────┐   │
│  │ MockDataGenerator│  │ EnrichmentPipeline              │   │
│  │   - Seeded RNG   │  │   - robots.txt check            │   │
│  │   - Profiles     │  │   - Fetch + Parse               │   │
│  │   - Distributions│  │   - Deduplicate                 │   │
│  │   - SM-2 reviews │  │   - Validate                    │   │
│  └──────────────────┘  │   - Quarantine                  │   │
│                         └─────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ Drizzle ORM
┌───────────────────────────▼─────────────────────────────────┐
│                     Data Layer                               │
│  ┌─────────────────┐      ┌─────────────────┐               │
│  │  PostgreSQL     │      │  SQLite         │               │
│  │  (production)   │      │  (dev/fallback) │               │
│  └─────────────────┘      └─────────────────┘               │
│                                                               │
│  Tables with enrichment columns:                              │
│  quiz_results, study_sessions, flashcard_reviews,             │
│  topic_mastery, user_progress                                 │
│  Columns: data_source, enriched_at, data_quality              │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow

```
Mock Data Generation:
  Config (seed, users, months, intensity)
    → MockDataGeneratorV2
      → Generated records (users, quiz, flashcards, sessions)
        → Database insert (batched, onConflictDoNothing)

Enrichment Pipeline:
  Source registry
    → robots.txt check
      → Fetch (rate-limited)
        → Parse + Normalize
          → Deduplicate (sourceUrl + contentHash)
            → Validate (JSON schema)
              → PASS → Persist (upsert)
              → FAIL → Quarantine
```

---

## Documentation Index

| Document | Path | Purpose |
|----------|------|---------|
| **Prototype Brief** | `docs/ENRICHED-APP-PROTOTYPE-BRIEF.md` | Full project requirements, architecture, and design |
| **Test Plan** | `docs/test-plan.md` | Unit, integration, E2E, data quality, and security tests |
| **Deployment Guide** | `docs/deployment.md` | Prerequisites, env vars, Vercel deploy, rollback |
| **Maintenance Guide** | `docs/maintenance.md` | Scheduled tasks, versioning, runbooks, knowledge transfer |
| **This README** | `docs/README-ENRICHMENT.md` | Quick start and operational overview |

---

## Troubleshooting

### "Could not connect to database"

- Check `DATABASE_URL` is set in `.env.local`.
- Verify PostgreSQL is running: `psql $DATABASE_URL -c "SELECT 1"`
- On Windows: `pg_ctl start -D "C:\Program Files\PostgreSQL\16\data"`

### Mock data generates different output for same seed

- Ensure `SeededRandom` class has not been modified.
- Check no other code is calling `Math.random()` within the generator.
- Lock the RNG implementation; changing it is a breaking change.

### Enrichment source fails

- Check the source's `/robots.txt` -- it may have blocked our bot.
- Check Sentry for errors tagged with `enrichment.source` and `enrichment.phase`.
- Run `bun run scripts/run-enrichment.ts --source=<id>` to isolate the failing source.

### Quarantine count is high

- Inspect quarantined records via `GET /api/enrichment/stats`.
- Check if the validation schema is too strict or the source parser has a bug.
- Fix the root cause and re-run the enrichment for the affected source.

### Enriched UI shows empty state

- Check `ENABLE_ENRICHED_UI` is `true` (it defaults to `true`).
- Run `bun run scripts/generate-mock-data.ts` or `bun run scripts/run-enrichment.ts --all` to populate data.
- Check the dashboard components are reading from the correct data source (real vs mock).

### TypeScript errors in enrichment files

- Run `bun run typecheck` to identify type mismatches.
- Ensure Drizzle schema includes `dataSource`, `enrichedAt`, `dataQuality` columns.
- Check that `syncTableRegistry` has mappings for all enriched tables.
