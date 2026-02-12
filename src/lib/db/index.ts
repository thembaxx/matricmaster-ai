import 'dotenv/config';
import { config } from 'dotenv';
import { type DbType, pgManager } from './postgresql-manager';

config({ path: '.env.local' });

export type { DbType } from './postgresql-manager';

class DatabaseManager {
	private static instance: DatabaseManager;
	private _db: DbType | null = null;
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
		console.log('Initializing PostgreSQL database connection...');

		const postgresConnected = await pgManager.waitForConnection(5, 5000);

		if (postgresConnected) {
			this._db = pgManager.getDb();
			this.isConnected = true;
			this.isPostgreSQLAvailableVar = true;
			console.log('Using PostgreSQL database');
		} else {
			console.error('PostgreSQL connection failed');
			this.isConnected = false;
			this.isPostgreSQLAvailableVar = false;
		}
	}

	public getClient() {
		if (this.isPostgreSQLAvailableVar) {
			return pgManager.getClient();
		}
		return null;
	}

	public getDb(): DbType {
		if (this.isPostgreSQLAvailableVar && this._db) {
			return this._db;
		}
		if (this.isPostgreSQLAvailableVar) {
			this._db = pgManager.getDb();
			return this._db;
		}
		throw new Error('Database not connected');
	}

	public async waitForConnection(_maxRetries = 3, _delay = 1000): Promise<boolean> {
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
		}
		return 'none';
	}

	public async close(): Promise<void> {
		if (this.isPostgreSQLAvailableVar) {
			await pgManager.disconnect();
		}
		this.isConnected = false;
		this._db = null;
	}
}

const dbManager = DatabaseManager.getInstance();

export const db = dbManager.isConnectedToDatabase() ? dbManager.getDb() : null;

process.on('beforeExit', async () => {
	await dbManager.close();
});

export async function closeConnection() {
	await dbManager.close();
}

export { dbManager, pgManager };
