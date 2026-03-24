import { dbManagerV2 } from './database-manager-v2';
import type { DbType } from './postgresql-manager';
import { pgManager } from './postgresql-manager';

export type { DbType } from './postgresql-manager';

/**
 * Type alias for the smart database that auto-handles sync metadata.
 */
export type SmartDbType = DbType;

/**
 * Legacy DatabaseManager shim that uses DatabaseManagerV2 under the hood.
 * This ensures all existing code gets the benefits of SmartDb and local-first sync.
 */
class LegacyDatabaseManagerShim {
	private static instance: LegacyDatabaseManagerShim;

	private constructor() {}

	public static getInstance(): LegacyDatabaseManagerShim {
		if (!LegacyDatabaseManagerShim.instance) {
			LegacyDatabaseManagerShim.instance = new LegacyDatabaseManagerShim();
		}
		return LegacyDatabaseManagerShim.instance;
	}

	public async initialize(): Promise<void> {
		await dbManagerV2.initialize();
	}

	public async ensureConnected(): Promise<boolean> {
		return await dbManagerV2.ensureConnected();
	}

	public async getDb(): Promise<SmartDbType> {
		return await dbManagerV2.getSmartDb();
	}

	public getClient() {
		return pgManager.getClient();
	}

	public async waitForConnection(_maxRetries = 3, _delay = 2000): Promise<boolean> {
		await dbManagerV2.initialize();
		return dbManagerV2.getActiveDatabase() !== 'none';
	}

	public isConnectedToDatabase(): boolean {
		return dbManagerV2.getActiveDatabase() !== 'none';
	}

	public isPostgreSQLAvailable(): boolean {
		return dbManagerV2.getActiveDatabase() === 'postgresql';
	}

	public getPreferredDatabase(): string {
		return dbManagerV2.getActiveDatabase();
	}

	public async close(): Promise<void> {
		// No-op or call disconnect on individual managers if needed
	}
}

export const dbManager = LegacyDatabaseManagerShim.getInstance();

export async function closeConnection() {
	await dbManager.close();
}

export const getDb = async (): Promise<DbType> => {
	return await dbManagerV2.getSmartDb();
};

/**
 * Global db export - properly typed through SmartDb to handle sync-ready writes automatically.
 * Use `await db` to get the database instance.
 */
export const db = (): Promise<DbType> => dbManagerV2.getSmartDb();
