import { eq } from 'drizzle-orm';
import { type DbType, pgManager } from './postgresql-manager';
import * as schema from './schema';
import { type SqliteDbType, sqliteManager } from './sqlite-manager';
import * as sqliteSchema from './sqlite-schema';
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

	public async initialize(): Promise<void> {
		if (this.isInitializing && this.initPromise) {
			return this.initPromise;
		}

		this.isInitializing = true;
		this.initPromise = (async () => {
			try {
				const pgConnected = await pgManager.waitForConnection(5, 3000);
				if (pgConnected) {
					this.activeDatabase = 'postgresql';
					console.log('📀 PostgreSQL is primary database');
				} else {
					console.warn('⚠️ PostgreSQL unavailable, initializing SQLite...');
					const sqliteConnected = await sqliteManager.connect();
					this.activeDatabase = sqliteConnected ? 'sqlite' : 'none';
				}
			} catch (error) {
				console.debug('❌ Database initialization failed:', error);
				const sqliteConnected = await sqliteManager.connect();
				this.activeDatabase = sqliteConnected ? 'sqlite' : 'none';
			}
		})();

		return this.initPromise;
	}

	public isPostgreSQLConnected(): boolean {
		try {
			return pgManager.isConnectedToDatabase();
		} catch {
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
		} catch {
			return false;
		}
	}

	public async ensureConnected(): Promise<boolean> {
		const pgHealthy = await this.checkPostgreSQLHealth();

		if (pgHealthy && this.activeDatabase !== 'postgresql') {
			console.log('🔄 PostgreSQL recovered, switching from SQLite...');
			await this.syncFromSQLite();
			this.activeDatabase = 'postgresql';
			console.log('✅ Switched back to PostgreSQL');
		} else if (!pgHealthy && this.activeDatabase === 'postgresql') {
			console.warn('⚠️ PostgreSQL connection lost, failing over to SQLite...');
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
				errors: ['Sync already in progress'],
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
					result.errors.push(`Failed to sync ${item.tableName}/${item.recordId}: ${error}`);

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

			console.log(`🔄 Sync complete: ${result.syncedCount} synced, ${result.failedCount} failed`);
		} catch (error) {
			result.success = false;
			result.errors.push(`Sync error: ${error}`);
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
		const timestamp = new Date().toISOString();

		switch (tableName) {
			case 'users':
				await pgDb
					.insert(schema.user)
					.values({
						id: recordId,
						name: data.name as string,
						email: data.email as string,
						emailVerified: data.emailVerified as boolean,
						image: data.image as string | null,
						role: data.role as string,
						isBlocked: data.isBlocked as boolean,
						twoFactorEnabled: data.twoFactorEnabled as boolean,
						hasCompletedOnboarding: data.hasCompletedOnboarding as boolean,
						school: (data as { school?: string }).school as string | null,
						avatarId: (data as { avatarId?: string }).avatarId as string | null,
						deletedAt: data.deletedAt ? new Date(data.deletedAt as string) : null,
						createdAt: new Date(data.createdAt as string),
						updatedAt: new Date(timestamp),
					})
					.onConflictDoUpdate({
						target: schema.user.id,
						set: {
							name: data.name as string,
							email: data.email as string,
							emailVerified: data.emailVerified as boolean,
							image: data.image as string | null,
							role: data.role as string,
							isBlocked: data.isBlocked as boolean,
							twoFactorEnabled: data.twoFactorEnabled as boolean,
							hasCompletedOnboarding: data.hasCompletedOnboarding as boolean,
							school: (data as { school?: string }).school as string | null,
							avatarId: (data as { avatarId?: string }).avatarId as string | null,
							deletedAt: data.deletedAt ? new Date(data.deletedAt as string) : null,
							updatedAt: new Date(timestamp),
						},
					});
				break;

			case 'sessions':
				await pgDb
					.insert(schema.session)
					.values({
						id: recordId,
						expiresAt: new Date(data.expiresAt as string),
						token: data.token as string,
						createdAt: new Date(data.createdAt as string),
						updatedAt: new Date(timestamp),
						ipAddress: (data as { ipAddress?: string }).ipAddress as string | null,
						userAgent: (data as { userAgent?: string }).userAgent as string | null,
						userId: data.userId as string,
					})
					.onConflictDoUpdate({
						target: schema.session.id,
						set: {
							expiresAt: new Date(data.expiresAt as string),
							token: data.token as string,
							updatedAt: new Date(timestamp),
							ipAddress: (data as { ipAddress?: string }).ipAddress as string | null,
							userAgent: (data as { userAgent?: string }).userAgent as string | null,
						},
					});
				break;

			case 'accounts':
				await pgDb
					.insert(schema.account)
					.values({
						id: recordId,
						accountId: data.accountId as string,
						providerId: data.providerId as string,
						userId: data.userId as string,
						accessToken: (data as { accessToken?: string }).accessToken as string | null,
						refreshToken: (data as { refreshToken?: string }).refreshToken as string | null,
						idToken: (data as { idToken?: string }).idToken as string | null,
						accessTokenExpiresAt: data.accessTokenExpiresAt
							? new Date(data.accessTokenExpiresAt as string)
							: null,
						refreshTokenExpiresAt: data.refreshTokenExpiresAt
							? new Date(data.refreshTokenExpiresAt as string)
							: null,
						scope: (data as { scope?: string }).scope as string | null,
						password: (data as { password?: string }).password as string | null,
						createdAt: new Date(data.createdAt as string),
						updatedAt: new Date(timestamp),
					})
					.onConflictDoUpdate({
						target: schema.account.id,
						set: {
							accessToken: (data as { accessToken?: string }).accessToken as string | null,
							refreshToken: (data as { refreshToken?: string }).refreshToken as string | null,
							idToken: (data as { idToken?: string }).idToken as string | null,
							accessTokenExpiresAt: data.accessTokenExpiresAt
								? new Date(data.accessTokenExpiresAt as string)
								: null,
							refreshTokenExpiresAt: data.refreshTokenExpiresAt
								? new Date(data.refreshTokenExpiresAt as string)
								: null,
							scope: (data as { scope?: string }).scope as string | null,
							updatedAt: new Date(timestamp),
						},
					});
				break;

			case 'verifications':
				await pgDb
					.insert(schema.verification)
					.values({
						id: recordId,
						identifier: data.identifier as string,
						value: data.value as string,
						expiresAt: new Date(data.expiresAt as string),
						createdAt: data.createdAt ? new Date(data.createdAt as string) : new Date(),
					})
					.onConflictDoNothing();
				break;
		}
	}

	private async syncDelete(tableName: string, recordId: string, pgDb: DbType): Promise<void> {
		switch (tableName) {
			case 'users':
				await pgDb.delete(schema.user).where(eq(schema.user.id, recordId));
				break;
			case 'sessions':
				await pgDb.delete(schema.session).where(eq(schema.session.id, recordId));
				break;
			case 'accounts':
				await pgDb.delete(schema.account).where(eq(schema.account.id, recordId));
				break;
			case 'verifications':
				await pgDb.delete(schema.verification).where(eq(schema.verification.id, recordId));
				break;
		}
	}

	public forceFailover(): void {
		this.activeDatabase = 'sqlite';
		console.warn('⚠️ Force failover to SQLite');
	}

	public async forceFailback(): Promise<void> {
		const pgHealthy = await this.checkPostgreSQLHealth();
		if (pgHealthy) {
			await this.syncFromSQLite();
			this.activeDatabase = 'postgresql';
			console.log('✅ Force failback to PostgreSQL');
		} else {
			console.warn('⚠️ Cannot failback - PostgreSQL not healthy');
		}
	}
}

export const dbManagerV2 = DatabaseManagerV2.getInstance();
export default dbManagerV2;
