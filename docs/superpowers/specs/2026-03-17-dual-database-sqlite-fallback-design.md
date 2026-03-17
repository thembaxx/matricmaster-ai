# Dual Database with SQLite Fallback - Design Specification

**Date:** 2026-03-17
**Status:** Approved
**Author:** AI Agent
**Reviewer:** User

## 1. Overview

This specification outlines a dual-database architecture for the MatricMaster AI application that provides automatic failover from PostgreSQL to SQLite when the primary database is unavailable, with real-time bidirectional synchronization when connection is restored.

### 1.1 Goals

- Ensure application availability when PostgreSQL is unavailable
- Maintain data consistency between PostgreSQL and SQLite
- Automatic failover and recovery without manual intervention
- Sync all application data (not just auth) between databases

### 1.2 Non-Goals

- Multi-region replication
- Real-time bidirectional sync when both databases are online (PG is always source of truth)
- Offline-first architecture (writes to SQLite only when PG is down)

---

## 2. Architecture

### 2.1 System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  DatabaseManagerV2                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - Health Check (on-demand)                         │    │
│  │  - Write Routing (PG primary, SQLite fallback)       │    │
│  │  - Read Routing (PG primary, SQLite fallback)        │    │
│  │  - Sync Queue Management                             │    │
│  │  - Failover/Failback Controller                      │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────┬─────────────────────────┬───────────────────────┘
           │                         │
    ┌──────▼──────┐           ┌──────▼──────┐
    │ PostgreSQL  │           │   SQLite    │
    │  (Primary)  │◄─────────►│  (Fallback) │
    └─────────────┘    Sync    └─────────────┘
```

### 2.2 Data Flow

**Normal Operation (PostgreSQL Available):**
1. All reads/writes go to PostgreSQL
2. SQLite is kept warm but not written to
3. No sync needed

**Failover Mode (PostgreSQL Unavailable):**
1. Detect PostgreSQL failure (on-demand)
2. Switch to SQLite for reads/writes
3. Queue all writes for later sync to PostgreSQL
4. Return response to user

**Recovery Mode (PostgreSQL Restored):**
1. Detect PostgreSQL is back (on-demand)
2. Sync queued changes from SQLite → PostgreSQL
3. Verify sync completion
4. Switch back to PostgreSQL as primary
5. Clear sync queue

---

## 3. Components

### 3.1 DatabaseManagerV2

The core component that manages database routing and sync.

**Responsibilities:**
- Initialize both PostgreSQL and SQLite connections
- Route reads/writes to appropriate database
- Manage failover state machine
- Handle sync queue

**Public API:**
```typescript
class DatabaseManagerV2 {
  // Initialization
  initialize(): Promise<void>
  
  // Connection status
  isPostgreSQLConnected(): boolean
  isSQLiteConnected(): boolean
  getActiveDatabase(): 'postgresql' | 'sqlite'
  
  // Database access (returns Drizzle instance)
  getDb(): DbType  // Returns whichever is active
  getPgDb(): DbType | null
  getSqliteDb(): DrizzleSQLite
  
  // Health check
  checkPostgreSQLHealth(): Promise<boolean>
  
  // Sync management
  syncFromSQLite(): Promise<SyncResult>
  getSyncQueueSize(): number
  
  // Force failover (for testing/admin)
  forceFailover(): void
  forceFailback(): void
}
```

### 3.2 SQLite Adapter

Lightweight SQLite setup using better-sqlite3 for Better Auth.

**Configuration:**
- Database file: `data/sqlite.db` (or configurable via env)
- Schema: Same as PostgreSQL (generated via Better Auth CLI)
- Writable only when PostgreSQL is unavailable

### 3.3 Sync Queue

Persistent queue stored in SQLite to track pending changes.

**Queue Structure:**
```typescript
interface SyncQueueItem {
  id: string;
  tableName: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'synced' | 'failed';
}
```

**Sync Strategy:**
- Real-time (on-write) when PostgreSQL recovers
- PostgreSQL wins on conflict (latest timestamp or PG record wins)
- Retry with exponential backoff (max 3 attempts)

### 3.4 Health Monitor

On-demand detection that checks PostgreSQL health before each operation.

**Behavior:**
- On read: Try PostgreSQL first, if fails, use SQLite
- On write: Try PostgreSQL first, if fails, write to SQLite + queue
- No continuous polling (reduces overhead)

---

## 4. Data Models

### 4.1 Schema Requirements

Both databases must have identical schemas. The system uses:

1. **Better Auth Tables** (required for auth):
   - `user`
   - `session`
   - `account`
   - `verification`
   - `audit_log` (if enabled)

2. **Application Tables** (full sync):
   - All tables from `src/lib/db/schema.ts`
   - All tables from `src/lib/db/schema-chat.ts`

### 4.2 Schema Generation

```bash
# Generate for PostgreSQL (primary)
npx auth@latest generate --output ./src/lib/db/better-auth-schema.ts

# Generate for SQLite (fallback)
# Same schema, different adapter in config
```

---

## 5. Implementation Details

### 5.1 Environment Variables

```env
# PostgreSQL (Primary)
DATABASE_URL=postgresql://...

# SQLite (Fallback)
SQLITE_DB_PATH=./data/sqlite.db

# Sync Configuration
SYNC_ON_RECOVERY=true
SYNC_BATCH_SIZE=100
```

### 5.2 File Structure

```
src/lib/db/
├── index.ts                    # Existing - keep for compatibility
├── postgresql-manager.ts       # Existing - keep
├── sqlite-manager.ts           # NEW - SQLite setup
├── database-manager-v2.ts      # NEW - Unified manager
├── sync/
│   ├── queue.ts               # Sync queue management
│   ├── replicator.ts          # SQLite → PostgreSQL sync
│   └── types.ts               # Sync types
└── adapters/
    └── sqlite-drizzle.ts      # SQLite Drizzle adapter
```

### 5.3 Better Auth Integration

Update `src/lib/auth.ts` to use DatabaseManagerV2:

```typescript
import { DatabaseManagerV2 } from './db/database-manager-v2';

const dbManagerV2 = DatabaseManagerV2.getInstance();

export const auth = betterAuth({
  database: dbManagerV2.getAuthAdapter(), // Returns appropriate adapter
  // ... other config
});
```

---

## 6. Sync Logic

### 6.1 Write Path

```
write(table, data):
  1. If PostgreSQL connected:
     a. Write to PostgreSQL
     b. Return success
  2. Else (PostgreSQL down):
     a. Write to SQLite
     b. Add to sync queue
     c. Return success
```

### 6.2 Read Path

```
read(table, query):
  1. If PostgreSQL connected:
     a. Read from PostgreSQL
     b. Return result
  2. Else (PostgreSQL down):
     a. Read from SQLite
     b. Return result
```

### 6.3 Recovery Path

```
onPostgreSQLRecovered():
  1. Acquire sync lock
  2. Fetch pending items from sync queue
  3. For each item:
     a. Apply to PostgreSQL (upsert)
     b. Mark as synced
  4. Clear sync queue
  5. Release sync lock
  6. Switch active database to PostgreSQL
```

### 6.4 Conflict Resolution

- **Strategy:** PostgreSQL wins (record in PG is authoritative)
- **Implementation:** 
  - On sync, check if record exists in PostgreSQL
  - If exists, compare `updatedAt` timestamps
  - Use PostgreSQL data if timestamps are equal or PG is newer
  - SQLite data overwrites only if PG record is older

---

## 7. Error Handling

### 7.1 Failure Modes

| Scenario | Behavior |
|----------|----------|
| PostgreSQL connection timeout | Failover to SQLite, queue writes |
| PostgreSQL query error | Retry once, then failover |
| SQLite unavailable | Log error, work with PostgreSQL only |
| Sync queue full | Log warning, continue (eventual consistency) |
| Sync failure (max retries) | Mark as failed, alert admin |

### 7.2 Logging

- Failover events: `warn` level
- Sync events: `info` level
- Errors: `error` level with stack trace

---

## 8. Performance Considerations

### 8.1 Connection Management

- PostgreSQL: Connection pool (existing, 10 connections)
- SQLite: Single connection, read/write lock
- Warm SQLite connection on startup

### 8.2 Query Optimization

- Enable `experimental.joins` for Better Auth (see docs)
- Index on `sync_queue.status` and `sync_queue.timestamp`
- Batch sync operations (100 records per batch)

### 8.3 Overhead

- Normal operation: No overhead (all queries go to PostgreSQL)
- Failover mode: ~5-10% overhead from queue management

---

## 9. Testing Strategy

### 9.1 Unit Tests

- DatabaseManagerV2 state machine
- Sync queue operations
- Conflict resolution logic

### 9.2 Integration Tests

- Failover when PostgreSQL is down
- Recovery and sync when PostgreSQL comes back
- Data consistency after sync

### 9.3 Manual Testing

- Kill PostgreSQL connection, verify app works
- Restore PostgreSQL, verify sync completes
- Check all app features work in both modes

---

## 10. Migration Plan

### Phase 1: Infrastructure (Day 1)
1. Create SQLite manager
2. Create DatabaseManagerV2 skeleton
3. Set up sync queue schema

### Phase 2: Integration (Day 2)
1. Update auth.ts to use DatabaseManagerV2
2. Implement failover logic
3. Implement basic sync (on recovery)

### Phase 3: Full Sync (Day 3)
1. Extend sync to all application tables
2. Implement conflict resolution
3. Add monitoring/logging

### Phase 4: Testing & Polish (Day 4)
1. Integration testing
2. Performance testing
3. Documentation

---

## 11. Alternatives Considered

### Alternative 1: Event Sourcing with PostgreSQL WAL
- More complex, requires PostgreSQL config changes
- Better for true real-time sync
- **Rejected:** Overkill for on-demand failover

### Alternative 2: Database Router Pattern
- Clean abstraction but more complex
- Better for multi-database read scaling
- **Rejected:** Simpler to implement write-through approach

### Alternative 3: Read-Only SQLite Fallback
- Only sync auth data
- App data unavailable when offline
- **Rejected:** Requirement is full app data sync

---

## 12. References

- [Better Auth SQLite Adapter](https://better-auth.com/docs/adapters/sqlite)
- [Better Auth PostgreSQL Adapter](https://better-auth.com/docs/adapters/postgresql)
- [Drizzle ORM SQLite](https://orm.drizzle.team/docs/sqlite)
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)
