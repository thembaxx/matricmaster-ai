# Maintenance Guide - Enrichment System

Scheduled tasks, versioning strategy, runbooks, and knowledge transfer for the MatricMaster AI enrichment system.

---

## Monthly Tasks

### 1. Check Source Availability

Run this to verify all enrichment sources are still accessible:

```bash
bun run scripts/run-enrichment.ts --all
```

Review the output for any `FAIL` entries. Common issues:
- **robots.txt changes:** A source may have blocked our bot. Check `src/lib/enrichment/sources.ts` and update or remove the source.
- **API deprecation:** External APIs may return 410 Gone. Update to the new endpoint or remove the source.
- **Rate limiting:** If sources return 429 too frequently, increase `rateLimitMs` in the source config.

### 2. License Audit

Review `src/lib/enrichment/sources.ts` and verify each source's license is still permissive:
- Public domain sources (DBE past papers): No changes expected.
- CC BY / CC BY-SA sources: Verify attribution is maintained in the `dataSources` table.
- Scraped sources: Re-check robots.txt and terms of service.

### 3. Quarantine Review

Check quarantined records and decide whether to:
- Fix the validation schema (if the record is valid but schema was too strict).
- Fix the source parser (if the record was malformed).
- Delete the quarantine entries (if they are no longer relevant).

```bash
curl https://your-domain.com/api/enrichment/stats
# Check quarantineCount
```

---

## Quarterly Tasks

### 1. Recalibrate Distributions

Review the mock data generation distributions in `src/lib/enrichment/default-config.ts`:

- Compare generated accuracy distributions against real user data.
- Adjust `alpha`/`beta` parameters in the beta distribution if the mean has drifted.
- Review subject weights to ensure they match current curriculum enrollment patterns.

### 2. Update Architecture Diagrams

Regenerate Mermaid diagrams in `docs/ENRICHED-APP-PROTOTYPE-BRIEF.md` if:
- New enrichment sources were added.
- Pipeline phases changed.
- New UI components were built.

### 3. Dependency Updates

Check for updates to enrichment-related packages:
```bash
bun update
```

Pay special attention to:
- `drizzle-orm` -- schema changes may require migration.
- `zustand` -- store API changes.

---

## Per-Release Tasks

### 1. Regenerate Diagrams

Before each release, regenerate all architecture and data flow diagrams:

```bash
# If you have a diagram generation script:
bun run scripts/generate-diagrams.ts
```

### 2. Update API Contracts

Review and update API contracts in `docs/ENRICHED-APP-PROTOTYPE-BRIEF.md` section 5.2:
- `POST /api/mock-data/generate` -- verify request/response schema.
- `POST /api/enrichment/run` -- verify admin auth and response format.
- `GET /api/enrichment/stats` -- verify stats structure.
- `GET /api/activity/:userId/timeline` -- verify heatmap/streak/subjects format.

### 3. Run Full Test Suite

```bash
# Unit tests
bun run test:unit

# E2E tests
bun run test:e2e

# Validate enrichment
bun run scripts/validate-enrichment.ts
```

### 4. Update This Document

If any maintenance procedures changed during the release cycle, update this document.

---

## Versioning Strategy

### Mock Data Generator Config Versioning

The mock data generator config follows semantic versioning:

| Version Component | Increment When |
|-------------------|---------------|
| **MAJOR** | Breaking change to generated data schema (e.g., new required fields, removed fields) |
| **MINOR** | New distribution types, new profiles, backward-compatible config additions |
| **PATCH** | Bug fixes to distribution sampling, name pool updates, minor parameter tweaks |

Current version: **2.0.0** (defined in `ExportedConfig.version`)

### Config Migration

When the config version changes:

1. Add a migration function in `src/lib/mock-data/config-migration.ts` (create if needed).
2. The function should accept a v1 config and output a v2 config with sensible defaults for new fields.
3. Update the `version` field in `ExportedConfig`.

### Backward Compatibility

- Generated data from older config versions should still be importable.
- New fields should have defaults that match old behavior.
- Removed fields should be silently ignored during import.

---

## Runbook: Common Issues

### Issue: Seed Mismatch

**Symptom:** Generated data differs from expected output for a known seed.

**Root Cause:** The seeded RNG implementation changed, or distribution parameters were modified.

**Resolution:**
1. Check the seed value in the config: `seed: 42` (or whatever was used).
2. Verify the `SeededRandom` class in `src/lib/mock-data/seeded-random.ts` has not been modified.
3. If the RNG changed, document it as a breaking change and increment the major version.
4. Re-generate data with the original seed and compare.

**Prevention:** Lock the seeded RNG implementation; never change the algorithm without a major version bump.

### Issue: Pipeline Failure

**Symptom:** `bun run scripts/run-enrichment.ts --all` returns errors for one or more sources.

**Diagnosis:**
1. Check the error message in the output:
   - `Fetch failed` -- network issue or source down.
   - `robots.txt blocked` -- source updated robots.txt.
   - `Validation failed` -- data schema mismatch.
2. Check Sentry for tagged errors with `enrichment.phase` and `enrichment.source`.

**Resolution:**
- **Network issue:** Retry after a few minutes. The pipeline has exponential backoff built in.
- **robots.txt blocked:** Re-check the source's `/robots.txt`. If legitimately blocked, remove the source from `src/lib/enrichment/sources.ts`.
- **Validation failed:** Update the validator in `src/lib/enrichment/validator.ts` or fix the parser in the source module.

**Prevention:** Monitor source health via the monthly availability check.

### Issue: Data Drift

**Symptom:** Generated mock data no longer reflects realistic student activity patterns.

**Diagnosis:**
1. Compare generated distributions against real user data:
   ```bash
   # Query real user accuracy
   SELECT AVG(percentage) FROM quiz_results WHERE data_source = 'real';

   # Query mock user accuracy
   SELECT AVG(percentage) FROM quiz_results WHERE data_source = 'mock';
   ```
2. If the means differ by > 10%, recalibrate distributions.

**Resolution:**
1. Update distribution parameters in `src/lib/enrichment/default-config.ts`.
2. Re-run generation with the same seed and compare.
3. Document the change in the version changelog.

**Prevention:** Run distribution validation quarterly (see Quarterly Tasks).

### Issue: Database Connection Failure During Generation

**Symptom:** `bun run scripts/generate-mock-data.ts` fails with "Could not connect to database."

**Resolution:**
1. Verify `DATABASE_URL` is set in `.env.local`.
2. Test the connection:
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```
3. If PostgreSQL is down, start it:
   ```bash
   # macOS (Homebrew)
   brew services start postgresql

   # Linux (systemd)
   sudo systemctl start postgresql

   # Windows
   pg_ctl start -D "C:\Program Files\PostgreSQL\16\data"
   ```
4. Retry the script.

### Issue: High Quarantine Count

**Symptom:** `quarantineCount > 0` in `/api/enrichment/stats`.

**Resolution:**
1. Inspect quarantined records via the admin panel or direct DB query.
2. Categorize the failures:
   - **Schema too strict:** Relax the validator.
   - **Source data corrupt:** Contact the source owner or remove the source.
   - **Parser bug:** Fix the source-specific parser.
3. After fixing, re-run the enrichment for the affected source.
4. Clear the quarantine entries that were resolved.

---

## Knowledge Transfer Notes

### Architecture Overview

The enrichment system consists of:

1. **Mock Data Generator** (`src/lib/mock-data/`): Deterministic, seeded generation of synthetic student activity data.
2. **Enrichment Pipeline** (`src/lib/enrichment/`): Fetches, parses, validates, and persists external educational data.
3. **Feature Flags** (`src/lib/feature-flags.ts`): Env-var-driven toggles for mock data, enrichment, and enriched UI.
4. **Zustand Store** (`src/stores/enrichment-store.ts`): Client-side state for runtime flag overrides.
5. **CLI Scripts** (`scripts/run-enrichment.ts`, `scripts/generate-mock-data.ts`, `scripts/validate-enrichment.ts`): Operational tooling.

### Key Design Decisions

- **Seeded RNG:** All mock generation is deterministic. Same seed + config = identical output.
- **Data provenance:** Every enriched record has `dataSource`, `enrichedAt`, and `dataQuality` fields.
- **Idempotent pipeline:** Enrichment uses upsert with `sourceUrl + contentHash` deduplication.
- **Feature flag defaults:** Mock data and enrichment default to `true` in development, `false` in production.
- **Bun-only:** All scripts use `#!/usr/bin/env bun` and require Bun runtime.

### Where to Find Things

| Concern | Location |
|---------|----------|
| Mock data generation logic | `src/lib/mock-data/generator-v2.ts` |
| Distribution configurations | `src/lib/enrichment/default-config.ts` |
| Enrichment sources | `src/lib/enrichment/sources.ts` |
| Pipeline orchestration | `src/lib/enrichment/pipeline.ts` |
| Record validation | `src/lib/enrichment/validator.ts` |
| Data normalization | `src/lib/enrichment/normalizer.ts` |
| robots.txt checking | `src/lib/enrichment/robots-checker.ts` |
| Feature flags (server) | `src/lib/feature-flags.ts` |
| Feature flags (client) | `src/stores/enrichment-store.ts` |
| CLI scripts | `scripts/run-enrichment.ts`, `scripts/generate-mock-data.ts`, `scripts/validate-enrichment.ts` |
| Test plan | `docs/test-plan.md` |
| Deployment guide | `docs/deployment.md` |
| Main README | `docs/README-ENRICHMENT.md` |

### Onboarding a New Developer

1. Read `docs/ENRICHED-APP-PROTOTYPE-BRIEF.md` for the full project context.
2. Read this document (`docs/maintenance.md`) for operational knowledge.
3. Run `bun run scripts/generate-mock-data.ts --dry-run` to see the generator in action.
4. Run `bun run scripts/validate-enrichment.ts` to see validation output.
5. Review the test plan in `docs/test-plan.md` for expected behaviors.
