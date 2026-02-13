import 'dotenv/config';
import { config } from 'dotenv';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type DbType = PostgresJsDatabase<typeof schema>;

config({ path: '.env.local' });

interface DatabaseConfig {
	connectionString: string;
	maxConnections?: number;
	connectionTimeout?: number;
	idleTimeout?: number;
}

class PostgreSQLManager {
	private static instance: PostgreSQLManager;
	private client: ReturnType<typeof postgres> | null = null;
	private db: DbType | null = null;
	private isConnected = false;
	private config: DatabaseConfig;

	private constructor(config: DatabaseConfig) {
		this.config = config;
	}

	public static getInstance(config?: DatabaseConfig): PostgreSQLManager {
		if (!PostgreSQLManager.instance) {
			const defaultConfig: DatabaseConfig = {
				connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL || '',
				maxConnections: 10,
				connectionTimeout: 30,
				idleTimeout: 60,
			};
			PostgreSQLManager.instance = new PostgreSQLManager(config || defaultConfig);
		}
		return PostgreSQLManager.instance;
	}

	public async connect(): Promise<boolean> {
		if (this.isConnected && this.client) {
			return true;
		}

		if (!this.config.connectionString) {
			console.error('❌ DATABASE_URL is not configured');
			return false;
		}

		try {
			console.log('🔄 Attempting to connect to PostgreSQL...');

			// Check if connection string is for Neon (contains neon.tech) to enable SSL
			const isNeon = this.config.connectionString.includes('neon.tech');

			this.client = postgres(this.config.connectionString, {
				prepare: false,
				max: this.config.maxConnections,
				idle_timeout: this.config.idleTimeout,
				connect_timeout: this.config.connectionTimeout,
				onnotice: () => {},
				ssl: isNeon ? 'require' : false,
			});

			this.db = drizzle(this.client, { schema });

			// Test connection with timeout
			const testResult = await Promise.race([
				this.client`SELECT 1 as test`,
				new Promise((_, reject) =>
					setTimeout(() => reject(new Error('Connection timeout')), 15000)
				),
			]);

			if (testResult) {
				this.isConnected = true;
				console.log('✅ PostgreSQL connected successfully');
				return true;
			}
		} catch (error) {
			console.error('❌ PostgreSQL connection failed:', error);
			this.isConnected = false;
			this.cleanup();
			return false;
		}

		return false;
	}

	public async disconnect(): Promise<void> {
		if (this.client) {
			try {
				await this.client.end();
				console.log('🔌 PostgreSQL disconnected');
			} catch (error) {
				console.error('Error disconnecting:', error);
			}
		}
		this.cleanup();
	}

	private cleanup(): void {
		this.client = null;
		this.db = null;
		this.isConnected = false;
	}

	public getDb(): DbType {
		if (!this.db) {
			throw new Error('Database not connected. Call connect() first.');
		}
		return this.db;
	}

	public getClient() {
		if (!this.client) {
			throw new Error('Database client not available. Call connect() first.');
		}
		return this.client;
	}

	public isConnectedToDatabase(): boolean {
		return this.isConnected;
	}

	public async waitForConnection(maxRetries = 5, delay = 5000): Promise<boolean> {
		for (let i = 0; i < maxRetries; i++) {
			const connected = await this.connect();
			if (connected) {
				return true;
			}
			if (i < maxRetries - 1) {
				console.log(`⏳ Retry attempt ${i + 1}/${maxRetries} in ${delay}ms...`);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
		return false;
	}
}

// Create singleton instance
const pgManager = PostgreSQLManager.getInstance();

// Graceful shutdown
process.on('SIGTERM', async () => {
	console.log('🛑 SIGTERM received, closing database connection...');
	await pgManager.disconnect();
	process.exit(0);
});

process.on('SIGINT', async () => {
	console.log('🛑 SIGINT received, closing database connection...');
	await pgManager.disconnect();
	process.exit(0);
});

export { pgManager };
export type { DatabaseConfig };
export type { DbType };
