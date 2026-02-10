import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { sqliteManager } from './sqlite';
import { pgManager } from './postgresql-manager';

// Enhanced database connection with better error handling and proper fallback
class DatabaseManager {
	private static instance: DatabaseManager;
	private _client: ReturnType<typeof postgres> | null = null;
	private _db: ReturnType<typeof drizzle> | null = null;
	private isConnected = false;
	private isPostgreSQLAvailableVar = false;

	private constructor() {}

	public static getInstance(): DatabaseManager {
		if (!DatabaseManager.instance) {
			DatabaseManager.instance = new DatabaseManager();
		}
		return DatabaseManager.instance;
	}

	public async initialize(): Promise<void> {
		console.log('🚀 Initializing database connections...');
		
		// Try PostgreSQL first
		const postgresConnected = await pgManager.waitForConnection(2, 3000);
		
		if (postgresConnected) {
			this._client = pgManager.getClient();
			this._db = pgManager.getDb();
			this.isConnected = true;
			this.isPostgreSQLAvailableVar = true;
			console.log('✅ Using PostgreSQL database');
		} else {
			console.log('⚠️ PostgreSQL unavailable, checking SQLite fallback...');
			// Try SQLite as fallback
			try {
				const sqliteDbInstance = sqliteManager.getDb();
				if (sqliteManager.isConnectedToDatabase()) {
					this._db = sqliteDbInstance;
					this.isConnected = true;
					this.isPostgreSQLAvailableVar = false;
					console.log('✅ Using SQLite as database fallback');
				}
			} catch (error) {
				console.error('❌ Both PostgreSQL and SQLite failed:', error);
				this.isConnected = false;
				this.isPostgreSQLAvailableVar = false;
			}
		}
	}

	public getClient() {
		if (!this._client && this.isPostgreSQLAvailableVar) {
			this._client = pgManager.getClient();
		}
		return this._client;
	}

	public getDb() {
		if (!this._db) {
			if (this.isPostgreSQLAvailableVar) {
				this._db = pgManager.getDb();
			} else {
				this._db = sqliteManager.getDb();
			}
		}
		return this._db!;
	}

	public async waitForConnection(maxRetries = 3, delay = 1000): Promise<boolean> {
		if (this.isConnected) return true;
		
		await this.initialize();
		return this.isConnected;
	}

	public isConnectedToDatabase(): boolean {
		return this.isConnected;
	}

	public isPostgreSQLAvailable(): boolean {
		return this.isPostgreSQLAvailableVar;
	}

	public getPreferredDatabase() {
		if (this.isPostgreSQLAvailableVar) {
			return 'postgresql';
		} else if (sqliteManager.isConnectedToDatabase()) {
			return 'sqlite';
		}
		return 'memory';
	}

	public async close(): Promise<void> {
		if (this.isPostgreSQLAvailableVar) {
			await pgManager.disconnect();
		}
		this.isConnected = false;
		this._client = null;
		this._db = null;
	}
}

// Create singleton instance
const dbManager = DatabaseManager.getInstance();

// Initialize on startup
dbManager.initialize().catch(console.error);

// Export for backward compatibility
export const client = dbManager.getClient();
export const db = dbManager.getDb();

// Graceful shutdown
process.on('beforeExit', async () => {
	await dbManager.close();
});

// Helper function to close connection (useful for scripts)
export async function closeConnection() {
	await dbManager.close();
}

// Export the manager for advanced usage
export { dbManager, pgManager };
