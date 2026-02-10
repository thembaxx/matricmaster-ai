import 'dotenv/config';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// SQLite database connection for development
class SQLiteDatabaseManager {
	private static instance: SQLiteDatabaseManager;
	private _client: Database.Database | null = null;
	private _db: ReturnType<typeof drizzle> | null = null;
	private isConnected = false;

	private constructor() {}

	public static getInstance(): SQLiteDatabaseManager {
		if (!SQLiteDatabaseManager.instance) {
			SQLiteDatabaseManager.instance = new SQLiteDatabaseManager();
		}
		return SQLiteDatabaseManager.instance;
	}

	public getClient() {
		if (!this._client) {
			this.initializeConnection();
		}
		return this._client!;
	}

	public getDb() {
		if (!this._db) {
			this.initializeConnection();
		}
		return this._db!;
	}

	private initializeConnection() {
		try {
			// Create SQLite database file
			this._client = new Database('./database.db');
			
			// Enable WAL mode for better concurrency
			this._client.exec('PRAGMA journal_mode = WAL;');
			this._client.exec('PRAGMA foreign_keys = ON;');
			
			this._db = drizzle(this._client, { schema });
			this.isConnected = true;
			
			console.log('✅ SQLite database connected successfully');
			
		} catch (error) {
			console.error('❌ Failed to initialize SQLite database:', error);
			this.isConnected = false;
		}
	}

	public isConnectedToDatabase(): boolean {
		return this.isConnected;
	}
}

// Create singleton instance
const sqliteManager = SQLiteDatabaseManager.getInstance();

// Export for backward compatibility
export const sqliteClient = sqliteManager.getClient();
export const sqliteDb = sqliteManager.getDb();

// Export the manager for advanced usage
export { sqliteManager };