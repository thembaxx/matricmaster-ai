import { eq, gt, sql } from 'drizzle-orm';
import { dbManagerV2 } from '../database-manager-v2';
import { syncTableRegistry, type TableMapping } from './registry';

export type SyncDirection = 'push' | 'pull' | 'bidirectional';
export type ConflictResolution = 'last_write_wins' | 'server_wins' | 'client_wins';

export interface SyncConfig {
	direction: SyncDirection;
	conflictResolution: ConflictResolution;
	tables: string[];
	batchSize: number;
	retryAttempts: number;
}

export interface SyncStats {
	tablesProcessed: number;
	recordsPushed: number;
	recordsPulled: number;
	conflicts: number;
	errors: string[];
	duration: number;
}

const DEFAULT_CONFIG: SyncConfig = {
	direction: 'bidirectional',
	conflictResolution: 'last_write_wins',
	tables: [],
	batchSize: 100,
	retryAttempts: 3,
};

class SyncEngine {
	private static instance: SyncEngine;
	private isSyncing = false;
	private config: SyncConfig;
	private networkAvailable = true;

	private constructor(config: Partial<SyncConfig> = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
		this.setupNetworkMonitoring();
	}

	public static getInstance(config?: Partial<SyncConfig>): SyncEngine {
		if (!SyncEngine.instance) {
			SyncEngine.instance = new SyncEngine(config);
		}
		return SyncEngine.instance;
	}

	private setupNetworkMonitoring(): void {
		if (typeof window !== 'undefined') {
			window.addEventListener('online', () => {
				console.log('🌐 Network restored - triggering sync');
				this.networkAvailable = true;
				this.fullSync();
			});

			window.addEventListener('offline', () => {
				console.log('📴 Network lost - working offline');
				this.networkAvailable = false;
			});
		}
	}

	public async fullSync(): Promise<SyncStats> {
		const startTime = Date.now();
		const stats: SyncStats = {
			tablesProcessed: 0,
			recordsPushed: 0,
			recordsPulled: 0,
			conflicts: 0,
			errors: [],
			duration: 0,
		};

		if (this.isSyncing) {
			stats.errors.push('Sync already in progress');
			return stats;
		}

		this.isSyncing = true;

		try {
			const pgConnected = await this.ensurePostgresConnected();
			const sqliteConnected = await this.ensureSQLiteConnected();

			if (!pgConnected && !sqliteConnected) {
				stats.errors.push('Neither database is available');
				return stats;
			}

			const tables = this.getAllTableMappings();

			if (pgConnected && sqliteConnected) {
				for (const mapping of tables) {
					try {
						const pushed = await this.pushTableChanges(mapping);
						stats.recordsPushed += pushed;
						stats.tablesProcessed++;
					} catch (error) {
						stats.errors.push(`Error pushing ${mapping.tableName}: ${error}`);
					}
				}

				for (const mapping of tables) {
					try {
						const pulled = await this.pullTableChanges(mapping);
						stats.recordsPulled += pulled;
					} catch (error) {
						stats.errors.push(`Error pulling ${mapping.tableName}: ${error}`);
					}
				}

				await this.handleEmptyDatabase(tables);
			} else if (pgConnected && !sqliteConnected) {
				console.log('⚠️ SQLite not connected, skipping pull');
			} else if (!pgConnected && sqliteConnected) {
				console.log('⚠️ PostgreSQL not connected, skipping push');
			}
		} catch (error) {
			stats.errors.push(`Sync error: ${error}`);
		} finally {
			this.isSyncing = false;
			stats.duration = Date.now() - startTime;
		}

		return stats;
	}

	private async pushTableChanges(mapping: TableMapping): Promise<number> {
		const sqliteDb = dbManagerV2.getSqliteDb();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const pendingColumn = (mapping.sqliteTable as any).syncStatus;
		const pendingRecords = await sqliteDb
			.select()
			.from(mapping.sqliteTable)
			.where(eq(pendingColumn, 'pending'));

		let pushedCount = 0;

		for (const record of pendingRecords) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const id = (record as any)[mapping.idColumn];
				const remoteRecord = await this.getRemoteRecord(mapping, id);

				const shouldUpdate = this.resolveConflict(
					record,
					remoteRecord,
					this.config.conflictResolution
				);

				if (shouldUpdate === 'local') {
					await this.upsertRemote(mapping, record);
				}

				await this.markAsSynced(mapping, id);
				pushedCount++;
			} catch (_error) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const id = (record as any)[mapping.idColumn];
				await this.markAsFailed(mapping, id);
			}
		}

		return pushedCount;
	}

	private async pullTableChanges(mapping: TableMapping): Promise<number> {
		const pgDb = dbManagerV2.getPgDb();
		if (!pgDb) return 0;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const lastModifiedColumn = (mapping.pgTable as any).lastModifiedAt;

		const remoteRecords = await pgDb
			.select()
			.from(mapping.pgTable)
			.where(gt(lastModifiedColumn, new Date(0)));

		let pulledCount = 0;

		for (const record of remoteRecords) {
			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const id = (record as any)[mapping.idColumn];
				const localRecord = await this.getLocalRecord(mapping, id);

				const shouldUpdate = this.resolveConflict(
					localRecord,
					record,
					this.config.conflictResolution
				);

				if (shouldUpdate === 'remote') {
					await this.upsertLocal(mapping, record);
				}

				pulledCount++;
			} catch (error) {
				console.error('Error pulling record:', error);
			}
		}

		return pulledCount;
	}

	private resolveConflict(
		local: any,
		remote: any,
		_strategy: ConflictResolution
	): 'local' | 'remote' | 'skip' {
		if (!remote) return 'local';
		if (!local) return 'remote';

		const localTime = local.lastModifiedAt ? new Date(local.lastModifiedAt).getTime() : 0;
		const remoteTime = remote.lastModifiedAt ? new Date(remote.lastModifiedAt).getTime() : 0;

		return localTime >= remoteTime ? 'local' : 'remote';
	}

	private async handleEmptyDatabase(tables: TableMapping[]): Promise<void> {
		const sqliteDb = dbManagerV2.getSqliteDb();
		const pgDb = dbManagerV2.getPgDb();
		if (!pgDb) return;

		for (const mapping of tables) {
			try {
				const pgCountResult = await pgDb
					.select({ count: sql<number>`count(*)` })
					.from(mapping.pgTable);
				const pgHasData = (pgCountResult[0]?.count || 0) > 0;

				const sqliteCountResult = await sqliteDb
					.select({ count: sql<number>`count(*)` })
					.from(mapping.sqliteTable);
				const sqliteHasData = (sqliteCountResult[0]?.count || 0) > 0;

				if (pgHasData && !sqliteHasData) {
					console.log(`📥 Populating SQLite with ${mapping.tableName} from PostgreSQL...`);
					await this.seedTableFromRemote(mapping);
				} else if (!pgHasData && sqliteHasData) {
					console.log(`📤 Pushing ${mapping.tableName} from SQLite to PostgreSQL...`);
					await this.pushTableChanges(mapping);
				}
			} catch (error) {
				console.error(`Error handling empty database for ${mapping.tableName}:`, error);
			}
		}
	}

	private async seedTableFromRemote(mapping: TableMapping): Promise<void> {
		const sqliteDb = dbManagerV2.getSqliteDb();
		const pgDb = dbManagerV2.getPgDb();
		if (!pgDb) return;

		const records = await pgDb.select().from(mapping.pgTable);
		const now = new Date().toISOString();

		for (const record of records) {
			await sqliteDb.insert(mapping.sqliteTable).values({
				...record,
				syncStatus: 'synced',
				lastModifiedAt: now,
				localUpdatedAt: now,
				syncVersion: 1,
			} as any);
		}
	}

	private async ensurePostgresConnected(): Promise<boolean> {
		try {
			return await dbManagerV2.checkPostgreSQLHealth();
		} catch (error) {
			console.error('Failed to connect to PostgreSQL:', error);
			return false;
		}
	}

	private async ensureSQLiteConnected(): Promise<boolean> {
		try {
			return dbManagerV2.isSQLiteConnected();
		} catch (error) {
			console.error('Failed to check SQLite connection:', error);
			return false;
		}
	}

	private getAllTableMappings(): TableMapping[] {
		return syncTableRegistry;
	}

	private async getRemoteRecord(mapping: TableMapping, id: string): Promise<any> {
		const pgDb = dbManagerV2.getPgDb();
		if (!pgDb) return null;
		const idColumn = mapping.pgTable.id as any;
		const result = await pgDb.select().from(mapping.pgTable).where(eq(idColumn, id));
		return result[0];
	}

	private async getLocalRecord(mapping: TableMapping, id: string): Promise<any> {
		const sqliteDb = dbManagerV2.getSqliteDb();
		const idColumn = mapping.sqliteTable.id as any;
		const result = await sqliteDb.select().from(mapping.sqliteTable).where(eq(idColumn, id));
		return result[0];
	}

	private async upsertRemote(mapping: TableMapping, record: any): Promise<void> {
		const pgDb = dbManagerV2.getPgDb();
		if (!pgDb) return;

		await pgDb
			.insert(mapping.pgTable)
			.values({
				...record,
				updatedAt: new Date(),
			} as any)
			.onConflictDoUpdate({
				target: mapping.pgTable.id as any,
				set: {
					...record,
					updatedAt: new Date(),
				} as any,
			});
	}

	private async upsertLocal(mapping: TableMapping, record: any): Promise<void> {
		const sqliteDb = dbManagerV2.getSqliteDb();
		const now = new Date().toISOString();

		await sqliteDb
			.insert(mapping.sqliteTable)
			.values({
				...record,
				syncStatus: 'synced',
				lastModifiedAt: now,
				localUpdatedAt: now,
				syncVersion: 1,
			} as any)
			.onConflictDoUpdate({
				target: mapping.sqliteTable.id as any,
				set: {
					...record,
					syncStatus: 'synced',
					lastModifiedAt: now,
					localUpdatedAt: now,
				} as any,
			});
	}

	private async markAsSynced(mapping: TableMapping, id: string): Promise<void> {
		const sqliteDb = dbManagerV2.getSqliteDb();
		const idColumn = mapping.sqliteTable.id as any;

		await sqliteDb
			.update(mapping.sqliteTable)
			.set({ syncStatus: 'synced' as any })
			.where(eq(idColumn, id));
	}

	private async markAsFailed(mapping: TableMapping, id: string): Promise<void> {
		const sqliteDb = dbManagerV2.getSqliteDb();
		const idColumn = mapping.sqliteTable.id as any;

		await sqliteDb
			.update(mapping.sqliteTable)
			.set({ syncStatus: 'conflict' as any })
			.where(eq(idColumn, id));
	}

	public setConfig(config: Partial<SyncConfig>): void {
		this.config = { ...this.config, ...config };
	}

	public isNetworkAvailable(): boolean {
		return this.networkAvailable;
	}
}

export const syncEngine = SyncEngine.getInstance();
export { SyncEngine };
