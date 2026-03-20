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

			console.log('✅ SQLite connected successfully');
			return true;
		} catch (error) {
			console.debug('❌ SQLite connection failed:', error);
			return false;
		}
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
