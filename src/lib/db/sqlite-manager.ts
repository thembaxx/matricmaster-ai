import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
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
		if (this.drizzleDb) {
			return true;
		}

		try {
			const fs = await import('node:fs');
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
			console.debug('❌ SQLite connection failed:', error);
			return false;
		}
	}

	private createTables(): void {
		if (!this.db) {
			return;
		}

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
				has_completed_onboarding INTEGER NOT NULL DEFAULT 0,
				school TEXT,
				avatar_id TEXT,
				deleted_at TEXT,
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL
			)
		`);

		this.db.exec(`
			CREATE TABLE IF NOT EXISTS sessions (
				id TEXT PRIMARY KEY,
				expiresAt TEXT NOT NULL,
				token TEXT NOT NULL UNIQUE,
				createdAt TEXT NOT NULL,
				updatedAt TEXT NOT NULL,
				ipAddress TEXT,
				userAgent TEXT,
				userId TEXT NOT NULL
			)
		`);

		this.db.exec(`
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
			)
		`);

		this.db.exec(`
			CREATE TABLE IF NOT EXISTS verifications (
				id TEXT PRIMARY KEY,
				identifier TEXT NOT NULL,
				value TEXT NOT NULL,
				expiresAt TEXT NOT NULL,
				created_at TEXT
			)
		`);

		this.db.exec(`
			CREATE TABLE IF NOT EXISTS sync_queue (
				id TEXT PRIMARY KEY,
				table_name TEXT NOT NULL,
				operation TEXT NOT NULL,
				record_id TEXT NOT NULL,
				data TEXT NOT NULL,
				timestamp INTEGER NOT NULL,
				retry_count INTEGER NOT NULL DEFAULT 0,
				status TEXT NOT NULL DEFAULT 'pending'
			)
		`);

		this.db.exec('CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status)');
		this.db.exec('CREATE INDEX IF NOT EXISTS idx_sync_queue_timestamp ON sync_queue(timestamp)');
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
