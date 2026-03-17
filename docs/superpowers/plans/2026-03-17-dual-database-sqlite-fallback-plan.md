# Dual Database with SQLite Fallback - Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement automatic failover from PostgreSQL to SQLite when primary database is unavailable, with real-time bidirectional sync on recovery.

**Architecture:** Write-through dual database pattern - PostgreSQL is primary source of truth, SQLite serves as fallback when PG is unavailable. Writes queue in SQLite during failover and sync back when PG recovers.

**Tech Stack:** Next.js 16, Better Auth, Drizzle ORM, PostgreSQL (Neon), SQLite (better-sqlite3)

---

## Phase 1: Infrastructure Setup

### Task 1: Install SQLite Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install SQLite dependencies**

Run: `bun add better-sqlite3 drizzle-orm/sqlite3`

Expected: Dependencies added to package.json

---

### Task 2: Create SQLite Schema

**Files:**
- Create: `src/lib/db/sqlite-schema.ts`

- [ ] **Step 1: Create SQLite schema file with Drizzle SQLite tables**

```typescript
import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';

export const sqliteUsers = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role').notNull().default('user'),
  isBlocked: integer('isBlocked', { mode: 'boolean' }).notNull().default(false),
  twoFactorEnabled: integer('twoFactorEnabled', { mode: 'boolean' }).notNull().default(false),
  hasCompletedOnboarding: integer('has_completed_onboarding', { mode: 'boolean' }).notNull().default(false),
  school: text('school'),
  avatarId: text('avatar_id'),
  deletedAt: text('deleted_at'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

export const sqliteSessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: text('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
});

export const sqliteAccounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: text('accessTokenExpiresAt'),
  refreshTokenExpiresAt: text('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: text('createdAt').notNull(),
  updatedAt: text('updatedAt').notNull(),
});

export const sqliteVerifications = sqliteTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: text('expiresAt').notNull(),
  createdAt: text('created_at'),
});

export const sqliteSyncQueue = sqliteTable('sync_queue', {
  id: text('id').primaryKey(),
  tableName: text('table_name').notNull(),
  operation: text('operation').notNull(),
  recordId: text('record_id').notNull(),
  data: text('data').notNull(),
  timestamp: integer('timestamp').notNull(),
  retryCount: integer('retry_count').notNull().default(0),
  status: text('status').notNull().default('pending'),
});
```

- [ ] **Step 2: Export types for sync**

Create: `src/lib/db/sync/types.ts`

```typescript
export interface SyncQueueItem {
  id: string;
  tableName: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  recordId: string;
  data: Record<string, unknown>;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'synced' | 'failed';
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

export type ActiveDatabase = 'postgresql' | 'sqlite';
```

---

### Task 3: Create SQLite Manager

**Files:**
- Create: `src/lib/db/sqlite-manager.ts`

- [ ] **Step 1: Create SQLite manager class**

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/sqlite3';
import * as sqliteSchema from './sqlite-schema';

type SqliteDbType = ReturnType<typeof drizzle>;

class SQLiteManager {
  private static instance: SQLiteManager;
  private db: Database.Database | null = null;
  private drizzleDb: SqliteDbType | null = null;
  private dbPath: string;

  private constructor() {
    this.dbPath = process.env.SQLITE_DB_PATH || './data/sqlite.db';
  }

  public static getInstance(): SQLiteManager {
    if (!SQLiteManager.instance) {
      SQLiteManager.instance = new SQLiteManager();
    }
    return SQLiteManager.instance;
  }

  public async connect(): Promise<boolean> {
    if (this.drizzleDb) return true;

    try {
      const fs = await import('fs');
      const dir = this.dbPath.substring(0, this.dbPath.lastIndexOf('/'));
      if (dir && !fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.drizzleDb = drizzle(this.db, { schema: sqliteSchema });
      
      this.createTables();
      console.log('✅ SQLite connected successfully');
      return true;
    } catch (error) {
      console.error('❌ SQLite connection failed:', error);
      return false;
    }
  }

  private createTables(): void {
    if (!this.db) return;
    
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        emailVerified INTEGER NOT NULL DEFAULT 0,
        image TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        isBlocked INTEGER NOT NULL DEFAULT 0,
        twoFactorEnabled INTEGER NOT NULL DEFAULT 0,
        hasCompletedOnboarding INTEGER NOT NULL DEFAULT 0,
        school TEXT,
        avatar_id TEXT,
        deleted_at TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        expiresAt TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        ipAddress TEXT,
        userAgent TEXT,
        userId TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        accountId TEXT NOT NULL,
        providerId TEXT NOT NULL,
        userId TEXT NOT NULL,
        accessToken TEXT,
        refreshToken TEXT,
        idToken TEXT,
        accessTokenExpiresAt TEXT,
        refreshTokenExpiresAt TEXT,
        scope TEXT,
        password TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS verifications (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        operation TEXT NOT NULL,
        record_id TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        retry_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'pending'
      );

      CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_timestamp ON sync_queue(timestamp);
    `);
  }

  public getDb(): SqliteDbType {
    if (!this.drizzleDb) {
      throw new Error('SQLite not connected. Call connect() first.');
    }
    return this.drizzleDb;
  }

  public isConnected(): boolean {
    return this.drizzleDb !== null;
  }

  public async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.drizzleDb = null;
      console.log('🔌 SQLite disconnected');
    }
  }
}

export const sqliteManager = SQLiteManager.getInstance();
export type { SqliteDbType };
```

---

## Phase 2: Core DatabaseManagerV2

### Task 4: Create DatabaseManagerV2

**Files:**
- Create: `src/lib/db/database-manager-v2.ts`

- [ ] **Step 1: Create the unified database manager**

```typescript
import { pgManager, type DbType } from './postgresql-manager';
import { sqliteManager, type SqliteDbType } from './sqlite-manager';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import * as schema from './schema';
import * as sqliteSchema from './sqlite-schema';
import type { ActiveDatabase, SyncQueueItem, SyncResult } from './sync/types';

class DatabaseManagerV2 {
  private static instance: DatabaseManagerV2;
  private activeDatabase: ActiveDatabase = 'postgresql';
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private syncInProgress = false;

  private constructor() {}

  public static getInstance(): DatabaseManagerV2 {
    if (!DatabaseManagerV2.instance) {
      DatabaseManagerV2.instance = new DatabaseManagerV2();
    }
    return DatabaseManagerV2.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        const pgConnected = await pgManager.waitForConnection(5, 3000);
        if (pgConnected) {
          this.activeDatabase = 'postgresql';
          console.log('📀 PostgreSQL is primary database');
        } else {
          console.warn('⚠️ PostgreSQL unavailable, initializing SQLite...');
          const sqliteConnected = await sqliteManager.connect();
          this.activeDatabase = sqliteConnected ? 'sqlite' : 'none';
        }
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
        const sqliteConnected = await sqliteManager.connect();
        this.activeDatabase = sqliteConnected ? 'sqlite' : 'none';
      }
    })();

    return this.initPromise;
  }

  public isPostgreSQLConnected(): boolean {
    return pgManager.isConnectedToDatabase();
  }

  public isSQLiteConnected(): boolean {
    return sqliteManager.isConnected();
  }

  public getActiveDatabase(): ActiveDatabase {
    return this.activeDatabase;
  }

  public getDb(): DbType | SqliteDbType {
    if (this.activeDatabase === 'postgresql' && this.isPostgreSQLConnected()) {
      return pgManager.getDb();
    }
    return sqliteManager.getDb();
  }

  public getPgDb(): DbType | null {
    if (this.isPostgreSQLConnected()) {
      return pgManager.getDb();
    }
    return null;
  }

  public getSqliteDb(): SqliteDbType {
    return sqliteManager.getDb();
  }

  public async checkPostgreSQLHealth(): Promise<boolean> {
    try {
      if (!this.isPostgreSQLConnected()) {
        return false;
      }
      const client = pgManager.getClient();
      await client`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  public async ensureConnected(): Promise<boolean> {
    const pgHealthy = await this.checkPostgreSQLHealth();
    
    if (pgHealthy && this.activeDatabase !== 'postgresql') {
      console.log('🔄 PostgreSQL recovered, switching from SQLite...');
      await this.syncFromSQLite();
      this.activeDatabase = 'postgresql';
      console.log('✅ Switched back to PostgreSQL');
    } else if (!pgHealthy && this.activeDatabase === 'postgresql') {
      console.warn('⚠️ PostgreSQL connection lost, failing over to SQLite...');
      await sqliteManager.connect();
      this.activeDatabase = 'sqlite';
    }
    
    return this.activeDatabase !== 'none';
  }

  public async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>): Promise<void> {
    const sqliteDb = sqliteManager.getDb();
    const id = crypto.randomUUID();
    const timestamp = Date.now();
    
    await sqliteDb.insert(sqliteSchema.sqliteSyncQueue).values({
      id,
      tableName: item.tableName,
      operation: item.operation,
      recordId: item.recordId,
      data: JSON.stringify(item.data),
      timestamp,
      retryCount: 0,
      status: 'pending',
    });
  }

  public async getSyncQueueSize(): Promise<number> {
    const sqliteDb = sqliteManager.getDb();
    const result = await sqliteDb
      .select()
      .from(sqliteSchema.sqliteSyncQueue)
      .where(sqliteSchema.sqliteSyncQueue.status.equals('pending'));
    return result.length;
  }

  public async syncFromSQLite(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return { success: false, syncedCount: 0, failedCount: 0, errors: ['Sync already in progress'] };
    }

    this.syncInProgress = true;
    const result: SyncResult = { success: true, syncedCount: 0, failedCount: 0, errors: [] };

    try {
      const sqliteDb = sqliteManager.getDb();
      const pgDb = pgManager.getDb();
      
      const pendingItems = await sqliteDb
        .select()
        .from(sqliteSchema.sqliteSyncQueue)
        .where(sqliteSchema.sqliteSyncQueue.status.equals('pending'));

      for (const item of pendingItems) {
        try {
          const data = JSON.parse(item.data);
          
          switch (item.operation) {
            case 'INSERT':
            case 'UPDATE':
              await this.syncUpsert(item.tableName, item.recordId, data);
              break;
            case 'DELETE':
              await this.syncDelete(item.tableName, item.recordId);
              break;
          }

          await sqliteDb
            .update(sqliteSchema.sqliteSyncQueue)
            .set({ status: 'synced' })
            .where(sqliteSchema.sqliteSyncQueue.id.equals(item.id));
          
          result.syncedCount++;
        } catch (error) {
          result.failedCount++;
          result.errors.push(`Failed to sync ${item.tableName}/${item.recordId}: ${error}`);
          
          if (item.retryCount >= 3) {
            await sqliteDb
              .update(sqliteSchema.sqliteSyncQueue)
              .set({ status: 'failed' })
              .where(sqliteSchema.sqliteSyncQueue.id.equals(item.id));
          } else {
            await sqliteDb
              .update(sqliteSchema.sqliteSyncQueue)
              .set({ retryCount: item.retryCount + 1 })
              .where(sqliteSchema.sqliteSyncQueue.id.equals(item.id));
          }
        }
      }

      await sqliteDb
        .delete(sqliteSchema.sqliteSyncQueue)
        .where(sqliteSchema.sqliteSyncQueue.status.equals('synced'));

      console.log(`🔄 Sync complete: ${result.syncedCount} synced, ${result.failedCount} failed`);
    } catch (error) {
      result.success = false;
      result.errors.push(`Sync error: ${error}`);
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  private async syncUpsert(tableName: string, recordId: string, data: Record<string, unknown>): Promise<void> {
    const pgDb = pgManager.getDb();
    const timestamp = new Date().toISOString();
    
    switch (tableName) {
      case 'users':
        await pgDb.insert(schema.user).values({
          id: recordId,
          name: data.name as string,
          email: data.email as string,
          emailVerified: data.emailVerified as boolean,
          image: data.image as string | null,
          role: data.role as string,
          isBlocked: data.isBlocked as boolean,
          twoFactorEnabled: data.twoFactorEnabled as boolean,
          hasCompletedOnboarding: data.hasCompletedOnboarding as boolean,
          school: data.school as string | null,
          avatarId: data.avatarId as string | null,
          deletedAt: data.deletedAt as Date | null,
          createdAt: new Date(data.createdAt as string),
          updatedAt: new Date(timestamp),
        }).onConflictDoUpdate({
          target: schema.user.id,
          set: {
            name: data.name as string,
            email: data.email as string,
            emailVerified: data.emailVerified as boolean,
            image: data.image as string | null,
            role: data.role as string,
            isBlocked: data.isBlocked as boolean,
            twoFactorEnabled: data.twoFactorEnabled as boolean,
            hasCompletedOnboarding: data.hasCompletedOnboarding as boolean,
            school: data.school as string | null,
            avatarId: data.avatarId as string | null,
            deletedAt: data.deletedAt as Date | null,
            updatedAt: new Date(timestamp),
          },
        });
        break;
        
      case 'sessions':
        await pgDb.insert(schema.session).values({
          id: recordId,
          expiresAt: new Date(data.expiresAt as string),
          token: data.token as string,
          createdAt: new Date(data.createdAt as string),
          updatedAt: new Date(timestamp),
          ipAddress: data.ipAddress as string | null,
          userAgent: data.userAgent as string | null,
          userId: data.userId as string,
        }).onConflictDoUpdate({
          target: schema.session.id,
          set: {
            expiresAt: new Date(data.expiresAt as string),
            token: data.token as string,
            updatedAt: new Date(timestamp),
            ipAddress: data.ipAddress as string | null,
            userAgent: data.userAgent as string | null,
          },
        });
        break;
        
      case 'accounts':
        await pgDb.insert(schema.account).values({
          id: recordId,
          accountId: data.accountId as string,
          providerId: data.providerId as string,
          userId: data.userId as string,
          accessToken: data.accessToken as string | null,
          refreshToken: data.refreshToken as string | null,
          idToken: data.idToken as string | null,
          accessTokenExpiresAt: data.accessTokenExpiresAt ? new Date(data.accessTokenExpiresAt as string) : null,
          refreshTokenExpiresAt: data.refreshTokenExpiresAt ? new Date(data.refreshTokenExpiresAt as string) : null,
          scope: data.scope as string | null,
          password: data.password as string | null,
          createdAt: new Date(data.createdAt as string),
          updatedAt: new Date(timestamp),
        }).onConflictDoUpdate({
          target: schema.account.id,
          set: {
            accessToken: data.accessToken as string | null,
            refreshToken: data.refreshToken as string | null,
            idToken: data.idToken as string | null,
            accessTokenExpiresAt: data.accessTokenExpiresAt ? new Date(data.accessTokenExpiresAt as string) : null,
            refreshTokenExpiresAt: data.refreshTokenExpiresAt ? new Date(data.refreshTokenExpiresAt as string) : null,
            scope: data.scope as string | null,
            updatedAt: new Date(timestamp),
          },
        });
        break;
        
      case 'verifications':
        await pgDb.insert(schema.verification).values({
          id: recordId,
          identifier: data.identifier as string,
          value: data.value as string,
          expiresAt: new Date(data.expiresAt as string),
          createdAt: data.createdAt ? new Date(data.createdAt as string) : new Date(),
        }).onConflictDoNothing();
        break;
    }
  }

  private async syncDelete(tableName: string, recordId: string): Promise<void> {
    const pgDb = pgManager.getDb();
    
    switch (tableName) {
      case 'users':
        await pgDb.delete(schema.user).where(schema.user.id.equals(recordId));
        break;
      case 'sessions':
        await pgDb.delete(schema.session).where(schema.session.id.equals(recordId));
        break;
      case 'accounts':
        await pgDb.delete(schema.account).where(schema.account.id.equals(recordId));
        break;
      case 'verifications':
        await pgDb.delete(schema.verification).where(schema.verification.id.equals(recordId));
        break;
    }
  }

  public forceFailover(): void {
    this.activeDatabase = 'sqlite';
    console.warn('⚠️ Force failover to SQLite');
  }

  public async forceFailback(): Promise<void> {
    const pgHealthy = await this.checkPostgreSQLHealth();
    if (pgHealthy) {
      await this.syncFromSQLite();
      this.activeDatabase = 'postgresql';
      console.log('✅ Force failback to PostgreSQL');
    } else {
      console.warn('⚠️ Cannot failback - PostgreSQL not healthy');
    }
  }
}

export const dbManagerV2 = DatabaseManagerV2.getInstance();
export default dbManagerV2;
```

---

### Task 5: Create Drizzle SQLite Adapter for Better Auth

**Files:**
- Create: `src/lib/db/adapters/sqlite-drizzle.ts`

- [ ] **Step 1: Create SQLite Drizzle adapter**

```typescript
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { sqliteManager } from '../sqlite-manager';
import * as sqliteSchema from '../sqlite-schema';

export function getSQLiteAuthAdapter() {
  const db = sqliteManager.getDb();
  return drizzleAdapter(db, {
    provider: 'sqlite',
    schema: sqliteSchema,
  });
}
```

---

### Task 6: Create PostgreSQL Adapter Helper

**Files:**
- Create: `src/lib/db/adapters/postgres-drizzle.ts`

- [ ] **Step 1: Create PostgreSQL Drizzle adapter**

```typescript
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { pgManager } from '../postgresql-manager';
import * as schema from '../schema';

export function getPostgresAuthAdapter() {
  const db = pgManager.getDb();
  return drizzleAdapter(db, {
    provider: 'pg',
    schema,
  });
}
```

---

## Phase 3: Integration with Better Auth

### Task 7: Update Auth Configuration

**Files:**
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Update imports and add DatabaseManagerV2**

Add to imports:
```typescript
import { dbManagerV2 } from './db/database-manager-v2';
import { getPostgresAuthAdapter } from './db/adapters/postgres-drizzle';
import { getSQLiteAuthAdapter } from './db/adapters/sqlite-drizzle';
```

- [ ] **Step 2: Modify createAuth function to use dual database**

Replace the database configuration in `createAuth()`:
```typescript
function createAuth(): AuthInstance {
  const isPgConnected = dbManagerV2.isPostgreSQLConnected();
  
  let adapter;
  
  if (isPgConnected) {
    adapter = getPostgresAuthAdapter();
  } else {
    adapter = getSQLiteAuthAdapter();
  }

  const runtimeConfig = {
    ...authConfig,
    database: adapter,
    // ... rest of config
  };

  return betterAuth(runtimeConfig as any);
}
```

- [ ] **Step 3: Update getAuth to ensure database connection**

Replace `getAuth()` function:
```typescript
export async function getAuth(): Promise<AuthInstance> {
  if (authInstance) {
    return authInstance;
  }

  if (authPromise) {
    return authPromise;
  }

  authPromise = (async () => {
    try {
      await dbManagerV2.initialize();
    } catch (err) {
      console.error('❌ Failed to initialize database:', err);
    }

    if (!authInstance) {
      authInstance = createAuth();
    }
    return authInstance;
  })();

  return authPromise;
}
```

- [ ] **Step 4: Add hook to sync on database recovery**

Add to `databaseHooks` in config:
```typescript
databaseHooks: {
  user: {
    create: {
      after: async (user: ExtendedUser) => {
        console.log(`✅ New user created: ${user.id} (${user.email})`);
        
        if (!dbManagerV2.isPostgreSQLConnected()) {
          await dbManagerV2.addToSyncQueue({
            tableName: 'users',
            operation: 'INSERT',
            recordId: user.id,
            data: {
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
              image: user.image,
              role: user.role,
              isBlocked: user.isBlocked,
              twoFactorEnabled: user.twoFactorEnabled,
              hasCompletedOnboarding: user.hasCompletedOnboarding,
              school: (user as any).school,
              avatarId: (user as any).avatarId,
              deletedAt: user.deletedAt,
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            },
          });
        }
      },
    },
    update: {
      before: async (user: ExtendedUser) => {
        if (user.isBlocked) {
          throw new Error('Your account has been blocked. Please contact support for assistance.');
        }
        return { data: user };
      },
      after: async (user: ExtendedUser) => {
        if (!dbManagerV2.isPostgreSQLConnected()) {
          await dbManagerV2.addToSyncQueue({
            tableName: 'users',
            operation: 'UPDATE',
            recordId: user.id,
            data: {
              name: user.name,
              email: user.email,
              emailVerified: user.emailVerified,
              image: user.image,
              role: user.role,
              isBlocked: user.isBlocked,
              twoFactorEnabled: user.twoFactorEnabled,
              hasCompletedOnboarding: user.hasCompletedOnboarding,
              school: (user as any).school,
              avatarId: (user as any).avatarId,
              deletedAt: user.deletedAt,
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            },
          });
        }
      },
    },
    delete: {
      after: async ({ id }: { id: string }) => {
        if (!dbManagerV2.isPostgreSQLConnected()) {
          await dbManagerV2.addToSyncQueue({
            tableName: 'users',
            operation: 'DELETE',
            recordId: id,
            data: {},
          });
        }
      },
    },
  },
  session: {
    create: {
      after: async (session: any) => {
        if (!dbManagerV2.isPostgreSQLConnected()) {
          await dbManagerV2.addToSyncQueue({
            tableName: 'sessions',
            operation: 'INSERT',
            recordId: session.id,
            data: {
              expiresAt: session.expiresAt.toISOString(),
              token: session.token,
              createdAt: session.createdAt.toISOString(),
              updatedAt: session.updatedAt.toISOString(),
              ipAddress: session.ipAddress,
              userAgent: session.userAgent,
              userId: session.userId,
            },
          });
        }
      },
    },
    delete: {
      after: async ({ id }: { id: string }) => {
        if (!dbManagerV2.isPostgreSQLConnected()) {
          await dbManagerV2.addToSyncQueue({
            tableName: 'sessions',
            operation: 'DELETE',
            recordId: id,
            data: {},
          });
        }
      },
    },
  },
  account: {
    create: {
      after: async (account: any) => {
        if (!dbManagerV2.isPostgreSQLConnected()) {
          await dbManagerV2.addToSyncQueue({
            tableName: 'accounts',
            operation: 'INSERT',
            recordId: account.id,
            data: {
              accountId: account.accountId,
              providerId: account.providerId,
              userId: account.userId,
              accessToken: account.accessToken,
              refreshToken: account.refreshToken,
              idToken: account.idToken,
              accessTokenExpiresAt: account.accessTokenExpiresAt?.toISOString(),
              refreshTokenExpiresAt: account.refreshTokenExpiresAt?.toISOString(),
              scope: account.scope,
              password: account.password,
              createdAt: account.createdAt.toISOString(),
              updatedAt: account.updatedAt.toISOString(),
            },
          });
        }
      },
    },
    delete: {
      after: async ({ id }: { id: string }) => {
        if (!dbManagerV2.isPostgreSQLConnected()) {
          await dbManagerV2.addToSyncQueue({
            tableName: 'accounts',
            operation: 'DELETE',
            recordId: id,
            data: {},
          });
        }
      },
    },
  },
},
```

---

## Phase 4: Environment and Configuration

### Task 8: Update Environment Variables

**Files:**
- Modify: `.env.example`
- Modify: `.env.local` (if needed)

- [ ] **Step 1: Add SQLite config to env example**

Add to `.env.example`:
```env
# SQLite (Fallback)
SQLITE_DB_PATH=./data/sqlite.db
```

---

## Phase 5: Testing

### Task 9: Run Typecheck and Lint

**Files:**
- Test: Entire implementation

- [ ] **Step 1: Run typecheck**

Run: `bun run typecheck`

Expected: No TypeScript errors

- [ ] **Step 2: Run lint**

Run: `bun run lint:fix`

Expected: Code formatted correctly

- [ ] **Step 3: Test database initialization**

Create test file: `src/lib/db/__tests__/database-manager-v2.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { dbManagerV2 } from '../database-manager-v2';

describe('DatabaseManagerV2', () => {
  beforeAll(async () => {
    await dbManagerV2.initialize();
  });

  afterAll(async () => {
    // cleanup
  });

  it('should initialize with PostgreSQL or SQLite', async () => {
    const activeDb = dbManagerV2.getActiveDatabase();
    expect(['postgresql', 'sqlite', 'none']).toContain(activeDb);
  });

  it('should check PostgreSQL health', async () => {
    const isHealthy = await dbManagerV2.checkPostgreSQLHealth();
    expect(typeof isHealthy).toBe('boolean');
  });

  it('should return correct connection status', () => {
    expect(typeof dbManagerV2.isPostgreSQLConnected()).toBe('boolean');
    expect(typeof dbManagerV2.isSQLiteConnected()).toBe('boolean');
  });
});
```

Run: `bun run test:unit`

Expected: Tests pass

---

### Task 10: Build and Verify

- [ ] **Step 1: Run build**

Run: `bun run build`

Expected: Build completes without errors

---

## Summary of Files Created/Modified

### New Files
- `src/lib/db/sqlite-schema.ts` - SQLite schema definitions
- `src/lib/db/sqlite-manager.ts` - SQLite connection manager
- `src/lib/db/database-manager-v2.ts` - Unified database manager
- `src/lib/db/sync/types.ts` - Sync type definitions
- `src/lib/db/adapters/sqlite-drizzle.ts` - SQLite Drizzle adapter
- `src/lib/db/adapters/postgres-drizzle.ts` - PostgreSQL Drizzle adapter

### Modified Files
- `package.json` - Added SQLite dependencies
- `.env.example` - Added SQLite config
- `src/lib/auth.ts` - Integrated DatabaseManagerV2

---

## Next Steps After Implementation

1. **Manual Testing**: Test failover by temporarily disconnecting PostgreSQL
2. **Monitoring**: Add metrics for failover events
3. **Production**: Set `SQLITE_DB_PATH` in production environment
4. **Data Migration**: Optionally migrate existing PostgreSQL data to SQLite for initial sync
