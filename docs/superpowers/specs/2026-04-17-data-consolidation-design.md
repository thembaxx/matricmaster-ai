# Data Consolidation Design

## Problem

1. **Duplicate Schemas**: Two near-complete schema definitions exist (schema.ts for PostgreSQL, sqlite-schema.ts) with ~40 tables each
2. **Scattered Action Files**: 30+ action files with duplicate CRUD logic for Postgres + SQLite
3. **Maintenance Burden**: Adding a field requires edits in two schema files plus multiple action files

## Goal

Implement a unified data layer that maintains a single source of truth while preserving SQLite for offline/dev use.

---

## Solution: Unified Schema + Adapter Pattern

### Architecture

```
┌─────────────────────────────────────────────────────┐
│  Unified Schema (src/lib/db/schema.ts)              │
│  - Drizzle handles dialect differences          │
│  - Single canonical definition               │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  DB Manager (src/lib/db/)                        │
│  - postgresql-manager.ts (existing)          │
│  - sqlite-manager.ts (existing)            │
│  - NEW: unified-db.ts (thin router)         │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────┐
│  Action Layer (src/lib/db/*-actions.ts)          │
│  - Single imports, dialect-aware queries  │
└─────────────────────────────────────────────────────┘
```

### Key Changes

1. **Unified Schema**: Keep schema.ts as the single source. Use Drizzle's pg-core and sqlite-core compatibility:
   - Boolean columns: use `.notNull().default(true)` — Drizzle translates to integer for SQLite
   - Timestamps: single definition — drivers handle format
   - UUIDs: driver-specific handling in inserts only

2. **Unified DB Manager**: Thin wrapper that routes to existing managers:
   ```typescript
   // getDb() returns the appropriate dialect connection
   // based on DATABASE_URL or offline mode flag
   ```

3. **Consolidated Action Files**: Action files import schema once:
   ```typescript
   import { users, questions, quizResults } from '../schema';
   import { getDb } from '../db';
   
   // Query runs against whichever DB is active
   const db = getDb();
   ```

### What Stays the Same

- SQLite file location: `data/sqlite.db`
- PostgreSQL connection: via DATABASE_URL
- Sync columns: Keep for future implementation (they're already in schema.ts)
- All existing tables/fields: Preserved for data integrity

### What Changes

- Schema file structure: Single unified definition
- Action file imports: One source
- DB routing logic: In getDb(), not scattered

---

## Implementation Phases

### Phase 1: Analyze
- Map all field differences between schema.ts and sqlite-schema.ts
- Document which action files can stay as-is vs need updates

### Phase 2: Schema Unification
- Create unified schema.ts with dialect compatibility
- Merge missing fields from sqlite-schema.ts (e.g., sync metadata, payments tables)

### Phase 3: DB Router
- Add unified getDb() in database-manager-v2.ts
- Update imports across action files

### Phase 4: Validation
- Test SQLite operations work
- Test PostgreSQL operations work
- Verify no data loss

---

## Success Criteria

1. Single schema definition for all tables
2. Action files import from one source
3. SQLite remains functional for offline/dev
4. PostgreSQL remains functional for production
5. No duplicate CRUD logic
6. New field added in one place only