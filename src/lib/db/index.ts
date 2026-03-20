// Database exports - loaded synchronously but lazily initialized
import { type DbType, pgManager } from './postgresql-manager';

export type { DbType } from './postgresql-manager';

// Create singleton instance
const pgManagerInstance = pgManager;

// Export the managers
export { pgManagerInstance as pgManager };

// Database manager class for connection management
class DatabaseManager {
	private static instance: DatabaseManager;
	private _db: DbType | null = null;
	private isConnected = false;
	private initialized = false;

	private constructor() {}

	public static getInstance(): DatabaseManager {
		if (!DatabaseManager.instance) {
			DatabaseManager.instance = new DatabaseManager();
		}
		return DatabaseManager.instance;
	}

	public async initialize(): Promise<void> {
		await this.ensureConnected();
	}

	public async ensureConnected(): Promise<boolean> {
		if (this.initialized) return this.isConnected;

		try {
			const connected = await pgManagerInstance.waitForConnection(3, 2000);
			this.isConnected = connected;
			this.initialized = true;
			return connected;
		} catch (error) {
			console.warn('PostgreSQL connection failed:', error);
			this.initialized = true;
			this.isConnected = false;
			return false;
		}
	}

	public getDb(): DbType {
		if (this.isConnected && this._db) {
			return this._db;
		}
		// Try to get from pgManager directly
		try {
			this._db = pgManagerInstance.getDb();
			return this._db;
		} catch (error) {
			console.warn('Failed to get database:', error);
			throw new Error('Database not connected. Call ensureConnected() first.');
		}
	}

	public getClient() {
		try {
			return pgManagerInstance.getClient();
		} catch (error) {
			console.warn('Failed to get PostgreSQL client:', error);
			return null;
		}
	}

	public async waitForConnection(_maxRetries = 3, _delay = 2000): Promise<boolean> {
		return this.ensureConnected();
	}

	public isConnectedToDatabase(): boolean {
		return this.isConnected;
	}

	public isPostgreSQLAvailable(): boolean {
		return this.isConnected;
	}

	public getPreferredDatabase(): string {
		return this.isConnected ? 'postgresql' : 'none';
	}

	public async close(): Promise<void> {
		await pgManagerInstance.disconnect();
		this._db = null;
		this.isConnected = false;
		this.initialized = false;
	}
}

export const dbManager = DatabaseManager.getInstance();

// Export closeConnection for migrations
export async function closeConnection() {
	await dbManager.close();
}

// Re-export getDb as a standalone function for backward compatibility
export const getDb = () => dbManager.getDb();

// Export the database client for direct queries (Drizzle ORM)
// This is lazy-loaded to avoid build-time errors
export const db = new Proxy({} as DbType, {
	get(_target, prop) {
		const actualDb = dbManager.getDb();
		return actualDb[prop as keyof DbType];
	},
});
