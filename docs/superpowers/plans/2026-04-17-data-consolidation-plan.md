# Data Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a unified data layer with a single source of truth while preserving SQLite for offline/dev use

**Architecture:** Use Drizzle's built-in dialect support to maintain one schema definition. Create a thin unified DB router that delegates to existing PostgreSQL/SQLite managers. Update action file imports to use the unified schema and router.

**Tech Stack:** Drizzle ORM, TypeScript, existing database managers

---

## Phase 1: Analysis

### Task 1.1: Map Field Differences

**Files:**
- Read: `src/lib/db/schema.ts` (PostgreSQL schema, already read ~1300 lines)
- Read: `src/lib/db/sqlite-schema.ts` (SQLite schema, already read ~870 lines)

- [ ] **Step 1: Compare schema tables**

Create a comparison document showing:
- Tables in both schemas (same name)
- Tables in only sqlite-schema.ts (payment-related, sync metadata)
- Field type differences (boolean → integer, timestamp format, UUID handling)

Expected output: `docs/superpowers/plans/2026-04-17-data-consolidation-field-map.md`

---

## Phase 2: Schema Unification

### Task 2.1: Add Missing Tables to Unified Schema

**Files:**
- Modify: `src/lib/db/schema.ts`
- Reference: `src/lib/db/sqlite-schema.ts:1-38` (sync metadata tables)

- [ ] **Step 1: Add sync metadata tables to schema.ts**

Add after imports (around line 40 after better-auth export):

```typescript
// ============================================================================
// SYNC METADATA TABLES (from sqlite-schema)
// ============================================================================

export const syncMetadata = pgTable('sync_metadata', {
  tableName: varchar('table_name', { length: 100 }).primaryKey(),
  lastSyncTimestamp: timestamp('last_sync_timestamp'),
  lastSyncVersion: integer('last_sync_version'),
  syncDirection: varchar('sync_direction', { length: 20 }),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const syncLog = pgTable('sync_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  operation: varchar('operation', { length: 20 }).notNull(),
  recordId: varchar('record_id', { length: 100 }).notNull(),
  timestamp: timestamp('timestamp').notNull(),
  direction: varchar('direction', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(),
  errorMessage: text('error_message'),
  localVersion: integer('local_version'),
  remoteVersion: integer('remote_version'),
});
```

- [ ] **Step 2: Add payment tables from sqlite-schema.ts**

Add from `src/lib/db/sqlite-schema.ts`:
- `subscription_plans` (lines 794-808)
- `user_subscriptions` (lines 810-829)
- `payments` (lines 831-847)

Use exact field definitions from sqlite-schema.ts for compatibility.

- [ ] **Step 3: Add sync columns to new tables**

Add sync metadata columns to payment tables:
```typescript
syncVersion: integer('sync_version').notNull().default(1),
lastModifiedAt: timestamp('last_modified_at').notNull(),
localUpdatedAt: timestamp('local_updated_at').notNull(),
syncStatus: varchar('sync_status', { length: 20 }).notNull().default('synced'),
```

---

### Task 2.2: Audit Boolean Field Compatibility

**Files:**
- Modify: `src/lib/db/schema.ts`
- Reference: Current schema.ts boolean fields

- [ ] **Step 1: Verify boolean fields use Drizzle-compatible syntax**

Current schema.ts uses: `boolean('column_name').notNull().default(true)`

Drizzle handles SQLite translation to integer automatically. No changes needed.

- [ ] **Step 2: Test boolean + UUID with SQLite**

Create test query using schema.ts booleans and UUIDs against SQLite to verify compatibility.

```bash
# Test in dev mode
cd "C:\Users\Themba\Documents\org1128\projects\matricmaster-ai"
OFFLINE_MODE=true bun run db:push
# Verify migration succeeds
```

---

## Phase 3: DB Router

### Task 3.1: Create Unified getDb() Function

**Files:**
- Create: `src/lib/db/unified-db.ts`
- Reference: `src/lib/db/postgresql-manager.ts`, `src/lib/db/sqlite-manager.ts`

- [ ] **Step 1: Create unified-db.ts**

```typescript
// Unified DB router - returns the active database connection
import { pgManager } from './postgresql-manager';
import { sqliteManager } from './sqlite-manager';

export type DbConnection = Awaited<ReturnType<typeof pgManager.getDb>>;

const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

function isOfflineMode(): boolean {
  return process.env.OFFLINE_MODE === 'true' || 
         process.env.NODE_ENV === 'development' && !DATABASE_URL;
}

export async function getDb(): Promise<DbConnection> {
  // Offline mode or dev without PG string → use SQLite
  if (isOfflineMode() || !DATABASE_URL) {
    const sqlite = await sqliteManager.getDb();
    return sqlite as DbConnection;
  }
  
  // Production or explicit PG → use PostgreSQL
  const pg = await pgManager.getDb();
  if (pg) {
    return pg;
  }
  
  // Fallback to SQLite if PG connection fails
  console.warn('PG connection failed, falling back to SQLite');
  return sqliteManager.getDb() as Promise<DbConnection>;
}

export function getActiveDbType(): 'postgres' | 'sqlite' {
  if (isOfflineMode() || !DATABASE_URL) {
    return 'sqlite';
  }
  return 'postgres';
}
```

- [ ] **Step 2: Commit phase 3 changes**

---

## Phase 4: Action File Migration

### Task 4.1: Identify Action Files Needing Updates

**Files:**
- Read: glob `src/lib/db/*-actions.ts` (45+ files)

- [ ] **Step 1: List action files with dual imports**

Grep pattern: `import.*from.*schema`
Check which files import from both schema.ts and sqlite-schema.ts

---

### Task 4.2: Update Single Action File

**Files:**
- Modify: `src/lib/db/actions.ts:1-20`
- Test: Verify basic CRUD operations still work

- [ ] **Step 1: Check current imports in actions.ts**

Current imports should already be from single schema (schema.ts). Verify this is the case.

- [ ] **Step 2: Test basic user query**

```bash
cd "C:\Users\Themba\Documents\org1128\projects\matricmaster-ai"
OFFLINE_MODE=true bun run db:push
```

- [ ] **Step 3: Commit changes**

---

### Task 4.3: Rollback Identification

**Files:**
- Create: `docs/superpowers/plans/2026-04-17-data-consolidation-rollback.md`

- [ ] **Step 1: Document rollback identifiers**

Create a simple reference showing:
- Original imports to restore
- Files to revert
- Commands to run

---

## Phase 5: Validation

### Task 5.1: Test SQLite Operations

**Files:**
- Test: Existing app functionality

- [ ] **Step 1: Run app in dev mode**

```bash
cd "C:\Users\Themba\Documents\org1128\projects\matricmaster-ai"
OFFLINE_MODE=true bun run dev
```

- [ ] **Step 2: Verify basic operations work**

- Login/signup works
- Quiz creation works
- Subject listing works

---

### Task 5.2: Test PostgreSQL Operations

**Files:**
- Test: Production setup

- [ ] **Step 1: Verify PG connection works**

---

## Rollback Plan

If issues occur, in order:

1. **Schema rollback**: Keep sqlite-schema.ts and schema.ts original versions. Don't commit schema changes to unified schema.ts.

2. **Action file rollback**: Each modified action file should retain original import comment for reference:
   ```typescript
   // Original: import { users } from './schema';
   // Undo by restoring original import path
   ```

3. **DB router rollback**: If unified-db.ts fails, restore explicit DATABASE_URL checks in individual routes.

4. **Commands to rollback**:
   ```bash
   # Restore original schema
   git restore src/lib/db/schema.ts
   
   # Revert action file imports  
   git checkout -- src/lib/db/*-actions.ts
   
   # Remove test files
   rm -f src/lib/db/unified-db.ts
   ```

---

## Files Summary

### Created
- `src/lib/db/unified-db.ts` - Thin DB router
- `docs/superpowers/plans/2026-04-17-data-consolidation-field-map.md` - Analysis output
- `docs/superpowers/plans/2026-04-17-data-consolidation-action-migration.md` - Migration guide

### Modified
- `src/lib/db/schema.ts` - Added missing tables from sqlite-schema.ts

### Preserved (No Changes)
- `src/lib/db/sqlite-schema.ts` - Keep for reference/rollback
- `src/lib/db/postgresql-manager.ts` - Existing logic
- `src/lib/db/sqlite-manager.ts` - Existing logic