# Deployment Guide - Enrichment System

Prerequisites, environment setup, database migration, seeding, Vercel deployment, and rollback procedures for the MatricMaster AI enrichment system.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20+ | LTS recommended |
| Bun | 1.0+ | **Required** package manager -- no npm/yarn/pnpm |
| PostgreSQL | 14+ | Production database |
| Git | 2.30+ | For version control and deployment |

### Verify Prerequisites

```bash
node --version    # v20.x.x or higher
bun --version     # 1.0.x or higher
psql --version    # 14.x or higher
```

---

## Environment Variables

Add these to your `.env.local` (development) or Vercel Environment Variables (production):

### Enrichment Feature Flags

| Variable | Default (Dev) | Default (Prod) | Description |
|----------|---------------|----------------|-------------|
| `ENABLE_MOCK_DATA` | `true` | `false` | Enable mock data generation and display |
| `ENABLE_ENRICHMENT_PIPELINE` | `true` | `false` | Enable the web enrichment pipeline |
| `ENABLE_ENRICHED_UI` | `true` | `true` | Show enriched UI components (heatmaps, streaks, etc.) |

### Required Existing Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Authentication secret |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key |

### Example `.env.local` for Development

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/matricmaster
ENABLE_MOCK_DATA=true
ENABLE_ENRICHMENT_PIPELINE=true
ENABLE_ENRICHED_UI=true
```

---

## Database Migration Steps

### 1. Run Drizzle Migrations

```bash
# Generate migration files (if schema changed)
bun run db:generate

# Push schema to database
bun run db:push
```

### 2. Verify Schema

```bash
bun run db:studio
```

Ensure the following tables exist with enrichment columns (`dataSource`, `enrichedAt`, `dataQuality`):
- `users`
- `quiz_results`
- `study_sessions`
- `flashcard_decks`
- `flashcard_reviews`
- `topic_mastery`
- `user_progress`
- `user_achievements`
- `calendar_events`
- `notifications`

---

## Seed and Enrichment Steps

### 1. Seed Base Data

```bash
bun run db:seed
```

This seeds core data (subjects, questions, etc.).

### 2. Generate Mock Data

```bash
# Default: 100 users, 6 months, high intensity
bun run scripts/generate-mock-data.ts

# Custom configuration
bun run scripts/generate-mock-data.ts --seed=42 --users=50 --months=3 --intensity=medium

# Dry run (generate without inserting)
bun run scripts/generate-mock-data.ts --dry-run

# Export generated data as JSON
bun run scripts/generate-mock-data.ts --export=./mock-data/output.json
```

### 3. Run Enrichment Pipeline

```bash
# Run all sources
bun run scripts/run-enrichment.ts --all

# Run single source
bun run scripts/run-enrichment.ts --source=dbe-past-papers
```

### 4. Validate Enriched Data

```bash
bun run scripts/validate-enrichment.ts
```

Expected output: `STATUS: PASS` with 0 failures.

---

## Vercel Deployment

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Import your repository
3. Select framework: **Next.js**

### 2. Configure Environment Variables

In Vercel project settings > Environment Variables, add:

| Variable | Production Value |
|----------|-----------------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `ENABLE_MOCK_DATA` | `false` (or `true` for demo mode) |
| `ENABLE_ENRICHMENT_PIPELINE` | `false` |
| `ENABLE_ENRICHED_UI` | `true` |
| `BETTER_AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Your Gemini key |

### 3. Deploy

```bash
# Install Vercel CLI
bun add -g vercel

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 4. Post-Deployment Verification

1. Run the enrichment pipeline via API endpoint (admin-only):
   ```
   POST /api/enrichment/run
   ```
2. Check enrichment stats:
   ```
   GET /api/enrichment/stats
   ```
3. Validate the dashboard renders enriched data correctly.

---

## Feature Flag Configuration for Production

### Recommended Production Flags

| Flag | Value | Rationale |
|------|-------|-----------|
| `ENABLE_MOCK_DATA` | `false` | Real data only in production; enable only for demos |
| `ENABLE_ENRICHMENT_PIPELINE` | `false` | Run enrichment manually or on schedule, not per-request |
| `ENABLE_ENRICHED_UI` | `true` | Always show enriched UI; it gracefully handles empty state |

### Runtime Flag Override (Admin Panel)

Administrators can toggle flags at runtime via the Zustand store in the admin settings panel. This does **not** persist across sessions unless explicitly saved.

---

## Rollback Procedure

Follow this order for rolling back enrichment changes:

### Level 1: Feature Flag Toggle (Immediate)

1. Set `ENABLE_MOCK_DATA=false` and `ENABLE_ENRICHMENT_PIPELINE=false` in Vercel environment variables.
2. Redeploy (or use Vercel's instant rollback to previous deployment).
3. The app falls back to real data only; enriched UI components show empty states.

**Time:** ~1 minute  
**Impact:** No data loss; mock data hidden from users.

### Level 2: Git Revert (Code Changes)

1. Identify the commit to revert:
   ```bash
   git log --oneline | grep "enrichment"
   ```
2. Revert:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
3. Vercel auto-deploys the reverted commit.

**Time:** ~5 minutes  
**Impact:** Removes enrichment code; database data remains.

### Level 3: Database Cleanup (Data Removal)

If you need to remove enriched data from the database:

```sql
-- Remove mock data
DELETE FROM quiz_results WHERE data_source = 'mock';
DELETE FROM study_sessions WHERE data_source = 'mock';
DELETE FROM flashcard_reviews WHERE data_source = 'mock';
DELETE FROM topic_mastery WHERE data_source = 'mock';
DELETE FROM user_progress WHERE data_source = 'mock';

-- Or remove all enriched data (mock + enriched)
DELETE FROM quiz_results WHERE data_source IN ('mock', 'enriched');
-- ... repeat for other tables
```

**Time:** ~10 minutes (depends on data volume)  
**Impact:** Data loss; back up before running.

---

## Monitoring Setup

### Sentry Tags

The enrichment system emits tagged errors to Sentry. Key tags:

| Tag | Values | Description |
|-----|--------|-------------|
| `enrichment.source` | Source ID | Which enrichment source triggered the error |
| `enrichment.phase` | `fetch`, `parse`, `validate`, `persist` | Pipeline phase |
| `enrichment.quality` | `high`, `medium`, `low` | Data quality tier |

To search for enrichment errors in Sentry:
```
tags[enrichment.phase]:validate AND level:error
```

### PostHog Events

The following events are captured:

| Event | Properties | When |
|-------|-----------|------|
| `mock_data_generated` | `seed`, `userCount`, `recordCount` | After mock data generation |
| `enrichment_run` | `sourceId`, `recordsProcessed`, `success` | After each enrichment source |
| `feature_flag_toggled` | `flag`, `value` | When a feature flag changes |

To check enrichment usage in PostHog:
1. Go to Trends
2. Filter by event: `enrichment_run`
3. Group by property: `sourceId`

### Health Checks

```bash
# Check enrichment pipeline health
curl https://your-domain.com/api/enrichment/stats

# Expected response:
# { "stats": {...}, "quarantineCount": 0, "timestamp": "..." }
```
