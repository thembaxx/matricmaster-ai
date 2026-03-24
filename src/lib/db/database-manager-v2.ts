import { eq } from 'drizzle-orm';
import { type DbType, pgManager } from './postgresql-manager';
import { type SqliteDbType, sqliteManager } from './sqlite-manager';
import * as sqliteSchema from './sqlite-schema';
import { syncTableRegistry } from './sync/registry';
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

	public async initialize(options?: { forceSQLite?: boolean }): Promise<void> {
		if (this.isInitializing && this.initPromise) {
			return this.initPromise;
		}

		this.isInitializing = true;
		this.initPromise = (async () => {
			try {
				if (options?.forceSQLite) {
					console.warn('⚠️ force initializing with sqlite...');
					const sqliteConnected = await sqliteManager.connect();
					this.activeDatabase = sqliteConnected ? 'sqlite' : 'none';
					return;
				}

				const pgConnected = await pgManager.waitForConnection(5, 3000);
				if (pgConnected) {
					this.activeDatabase = 'postgresql';
					console.log('📀 postgresql is primary database');
				} else {
					console.warn('⚠️ postgresql unavailable, initializing sqlite...');
					const sqliteConnected = await sqliteManager.connect();
					this.activeDatabase = sqliteConnected ? 'sqlite' : 'none';
				}
			} catch (error) {
				console.debug('❌ database initialization failed:', error);
				const sqliteConnected = await sqliteManager.connect();
				this.activeDatabase = sqliteConnected ? 'sqlite' : 'none';
			}
		})();

		return this.initPromise;
	}

	public isPostgreSQLConnected(): boolean {
		try {
			return pgManager.isConnectedToDatabase();
		} catch (error) {
			console.warn('failed to check postgresql connection:', error);
			return false;
		}
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

	/**
	 * Returns a database instance that automatically handles sync metadata when using SQLite.
	 */
	public getSmartDb(): DbType | SqliteDbType {
		const db = this.getDb();
		const activeDb = this.activeDatabase;

		if (activeDb !== 'sqlite') {
			return db;
		}

		return new Proxy(db, {
			get(target, prop, receiver) {
				const value = Reflect.get(target, prop, receiver);

				if (prop === 'insert' || prop === 'update') {
					return (table: any) => {
						const queryBuilder = value.apply(target, [table]);

						if (prop === 'insert') {
							const originalValues = queryBuilder.values;
							queryBuilder.values = (data: any) => {
								const now = new Date().toISOString();
								const enhancedData = Array.isArray(data)
									? data.map((item) => ({
											...item,
											syncStatus: item.syncStatus ?? 'pending',
											lastModifiedAt: item.lastModifiedAt ?? now,
											localUpdatedAt: item.localUpdatedAt ?? now,
											syncVersion: (item.syncVersion ?? 0) + 1,
										}))
									: {
											...data,
											syncStatus: data.syncStatus ?? 'pending',
											lastModifiedAt: data.lastModifiedAt ?? now,
											localUpdatedAt: data.localUpdatedAt ?? now,
											syncVersion: (data.syncVersion ?? 0) + 1,
										};
								return originalValues.apply(queryBuilder, [enhancedData]);
							};
						}

						if (prop === 'update') {
							const originalSet = queryBuilder.set;
							queryBuilder.set = (data: any) => {
								const now = new Date().toISOString();
								const enhancedData = {
									...data,
									syncStatus: data.syncStatus ?? 'pending',
									lastModifiedAt: data.lastModifiedAt ?? now,
									localUpdatedAt: data.localUpdatedAt ?? now,
								};
								return originalSet.apply(queryBuilder, [enhancedData]);
							};
						}

						return queryBuilder;
					};
				}

				return typeof value === 'function' ? value.bind(target) : value;
			},
		}) as any;
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
		} catch (error) {
			console.warn('postgresql health check failed:', error);
			return false;
		}
	}

	public async ensureConnected(): Promise<boolean> {
		const pgHealthy = await this.checkPostgreSQLHealth();

		if (pgHealthy && this.activeDatabase !== 'postgresql') {
			console.log('🔄 postgresql recovered, switching from sqlite...');
			await this.syncFromSQLite();
			this.activeDatabase = 'postgresql';
			console.log('✅ switched back to postgresql');
		} else if (!pgHealthy && this.activeDatabase === 'postgresql') {
			console.warn('⚠️ postgresql connection lost, failing over to sqlite...');
			await sqliteManager.connect();
			this.activeDatabase = 'sqlite';
		}

		return this.activeDatabase !== 'none';
	}

	public async addToSyncQueue(
		item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount' | 'status'>
	): Promise<void> {
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
			.where(eq(sqliteSchema.sqliteSyncQueue.status, 'pending'));
		return result.length;
	}

	public async syncFromSQLite(): Promise<SyncResult> {
		if (this.syncInProgress) {
			return {
				success: false,
				syncedCount: 0,
				failedCount: 0,
				errors: ['sync already in progress'],
			};
		}

		this.syncInProgress = true;
		const result: SyncResult = { success: true, syncedCount: 0, failedCount: 0, errors: [] };

		try {
			const sqliteDb = sqliteManager.getDb();
			const pgDb = pgManager.getDb();

			const pendingItems = await sqliteDb
				.select()
				.from(sqliteSchema.sqliteSyncQueue)
				.where(eq(sqliteSchema.sqliteSyncQueue.status, 'pending'));

			for (const item of pendingItems) {
				try {
					const data = JSON.parse(item.data);

					switch (item.operation) {
						case 'INSERT':
						case 'UPDATE':
							await this.syncUpsert(item.tableName, item.recordId, data, pgDb);
							break;
						case 'DELETE':
							await this.syncDelete(item.tableName, item.recordId, pgDb);
							break;
					}

					await sqliteDb
						.update(sqliteSchema.sqliteSyncQueue)
						.set({ status: 'synced' })
						.where(eq(sqliteSchema.sqliteSyncQueue.id, item.id));

					result.syncedCount++;
				} catch (error) {
					result.failedCount++;
					result.errors.push(`failed to sync ${item.tableName}/${item.recordId}: ${error}`);

					if (item.retryCount >= 3) {
						await sqliteDb
							.update(sqliteSchema.sqliteSyncQueue)
							.set({ status: 'failed' })
							.where(eq(sqliteSchema.sqliteSyncQueue.id, item.id));
					} else {
						await sqliteDb
							.update(sqliteSchema.sqliteSyncQueue)
							.set({ retryCount: item.retryCount + 1 })
							.where(eq(sqliteSchema.sqliteSyncQueue.id, item.id));
					}
				}
			}

			await sqliteDb
				.delete(sqliteSchema.sqliteSyncQueue)
				.where(eq(sqliteSchema.sqliteSyncQueue.status, 'synced'));

			console.log(`🔄 sync complete: ${result.syncedCount} synced, ${result.failedCount} failed`);
		} catch (error) {
			result.success = false;
			result.errors.push(`sync error: ${error}`);
		} finally {
			this.syncInProgress = false;
		}

		return result;
	}

	private async syncUpsert(
		tableName: string,
		recordId: string,
		data: Record<string, unknown>,
		pgDb: DbType
	): Promise<void> {
		const mapping = syncTableRegistry.find((m) => m.tableName === tableName);
		if (!mapping) {
			console.warn(`⚠️ no sync mapping found for table: ${tableName}`);
			return;
		}

		const timestamp = new Date();

		// Normalize data for Drizzle (e.g. string dates to Date objects)
		const normalizedData: any = { ...data };

		// Ensure the ID is set correctly
		normalizedData[mapping.idColumn] = recordId;

		for (const key in normalizedData) {
			if (
				key.endsWith('At') ||
				key.endsWith('Time') ||
				key === 'expiresAt' ||
				key === 'periodStart'
			) {
				if (normalizedData[key] && typeof normalizedData[key] === 'string') {
					normalizedData[key] = new Date(normalizedData[key]);
				}
			}
		}

		// Ensure updatedAt reflects the sync time
		if (mapping.pgTable.updatedAt) {
			normalizedData.updatedAt = timestamp;
		}

		await pgDb.insert(mapping.pgTable).values(normalizedData).onConflictDoUpdate({
			target: mapping.pgTable[mapping.idColumn],
			set: normalizedData,
		});
	}

	private async syncDelete(tableName: string, recordId: string, pgDb: DbType): Promise<void> {
		const mapping = syncTableRegistry.find((m) => m.tableName === tableName);
		if (!mapping) return;

		await pgDb.delete(mapping.pgTable).where(eq(mapping.pgTable[mapping.idColumn], recordId));
	}

	public forceFailover(): void {
		this.activeDatabase = 'sqlite';
		console.warn('⚠️ force failover to sqlite');
	}

	public async forceFailback(): Promise<void> {
		const pgHealthy = await this.checkPostgreSQLHealth();
		if (pgHealthy) {
			await this.syncFromSQLite();
			this.activeDatabase = 'postgresql';
			console.log('✅ force failback to postgresql');
		} else {
			console.warn('⚠️ cannot failback - postgresql not healthy');
		}
	}
}

export const dbManagerV2 = DatabaseManagerV2.getInstance();
export default dbManagerV2;
