import { eq, gt, sql } from 'drizzle-orm';
import { pgManager } from '../postgresql-manager';
import * as schema from '../schema';
import { sqliteManager } from '../sqlite-manager';
import * as sqliteSchema from '../sqlite-schema';

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

interface TableMapping {
	pgTable: any;
	sqliteTable: any;
	idColumn: string;
}

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
				for (const [tableName, mapping] of tables) {
					try {
						const pushed = await this.pushTableChanges(mapping);
						stats.recordsPushed += pushed;
						stats.tablesProcessed++;
					} catch (error) {
						stats.errors.push(`Error pushing ${tableName}: ${error}`);
					}
				}

				for (const [tableName, mapping] of tables) {
					try {
						const pulled = await this.pullTableChanges(mapping);
						stats.recordsPulled += pulled;
					} catch (error) {
						stats.errors.push(`Error pulling ${tableName}: ${error}`);
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
		const sqliteDb = sqliteManager.getDb();

		const pendingColumn = mapping.sqliteTable.syncStatus as any;
		const pendingRecords = await sqliteDb
			.select()
			.from(mapping.sqliteTable)
			.where(eq(pendingColumn, 'pending'));

		let pushedCount = 0;

		for (const record of pendingRecords) {
			try {
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
				const id = (record as any)[mapping.idColumn];
				await this.markAsFailed(mapping, id);
			}
		}

		return pushedCount;
	}

	private async pullTableChanges(mapping: TableMapping): Promise<number> {
		const pgDb = pgManager.getDb();

		const lastModifiedColumn = mapping.pgTable.lastModifiedAt as any;

		const remoteRecords = await pgDb
			.select()
			.from(mapping.pgTable)
			.where(gt(lastModifiedColumn, new Date(0)));

		let pulledCount = 0;

		for (const record of remoteRecords) {
			try {
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

	private async handleEmptyDatabase(tables: Map<string, TableMapping>): Promise<void> {
		const sqliteDb = sqliteManager.getDb();
		const pgDb = pgManager.getDb();

		for (const [tableName, mapping] of tables) {
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
					console.log(`📥 Populating SQLite with ${tableName} from PostgreSQL...`);
					await this.seedTableFromRemote(mapping);
				} else if (!pgHasData && sqliteHasData) {
					console.log(`📤 Pushing ${tableName} from SQLite to PostgreSQL...`);
					await this.pushTableChanges(mapping);
				}
			} catch (error) {
				console.error(`Error handling empty database for ${tableName}:`, error);
			}
		}
	}

	private async seedTableFromRemote(mapping: TableMapping): Promise<void> {
		const sqliteDb = sqliteManager.getDb();
		const pgDb = pgManager.getDb();

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
			return await pgManager.waitForConnection(3, 2000);
		} catch (error) {
			console.error('Failed to connect to PostgreSQL:', error);
			return false;
		}
	}

	private async ensureSQLiteConnected(): Promise<boolean> {
		try {
			return await sqliteManager.connect();
		} catch (error) {
			console.error('Failed to connect to SQLite:', error);
			return false;
		}
	}

	private getAllTableMappings(): Map<string, TableMapping> {
		const tables = new Map<string, TableMapping>();

		tables.set('users', {
			pgTable: schema.users,
			sqliteTable: sqliteSchema.sqliteUsers,
			idColumn: 'id',
		});

		tables.set('sessions', {
			pgTable: schema.session,
			sqliteTable: sqliteSchema.sqliteSessions,
			idColumn: 'id',
		});

		tables.set('accounts', {
			pgTable: schema.account,
			sqliteTable: sqliteSchema.sqliteAccounts,
			idColumn: 'id',
		});

		tables.set('verifications', {
			pgTable: schema.verification,
			sqliteTable: sqliteSchema.sqliteVerifications,
			idColumn: 'id',
		});

		tables.set('subjects', {
			pgTable: schema.subjects,
			sqliteTable: sqliteSchema.sqliteSubjects,
			idColumn: 'id',
		});

		tables.set('questions', {
			pgTable: schema.questions,
			sqliteTable: sqliteSchema.sqliteQuestions,
			idColumn: 'id',
		});

		tables.set('options', {
			pgTable: schema.options,
			sqliteTable: sqliteSchema.sqliteOptions,
			idColumn: 'id',
		});

		tables.set('quiz_results', {
			pgTable: schema.quizResults,
			sqliteTable: sqliteSchema.sqliteQuizResults,
			idColumn: 'id',
		});

		tables.set('search_history', {
			pgTable: schema.searchHistory,
			sqliteTable: sqliteSchema.sqliteSearchHistory,
			idColumn: 'id',
		});

		tables.set('past_papers', {
			pgTable: schema.pastPapers,
			sqliteTable: sqliteSchema.sqlitePastPapers,
			idColumn: 'id',
		});

		tables.set('past_paper_questions', {
			pgTable: schema.pastPaperQuestions,
			sqliteTable: sqliteSchema.sqlitePastPaperQuestions,
			idColumn: 'id',
		});

		tables.set('user_progress', {
			pgTable: schema.userProgress,
			sqliteTable: sqliteSchema.sqliteUserProgress,
			idColumn: 'id',
		});

		tables.set('user_achievements', {
			pgTable: schema.userAchievements,
			sqliteTable: sqliteSchema.sqliteUserAchievements,
			idColumn: 'id',
		});

		tables.set('user_settings', {
			pgTable: schema.userSettings,
			sqliteTable: sqliteSchema.sqliteUserSettings,
			idColumn: 'userId',
		});

		tables.set('study_sessions', {
			pgTable: schema.studySessions,
			sqliteTable: sqliteSchema.sqliteStudySessions,
			idColumn: 'id',
		});

		tables.set('study_plans', {
			pgTable: schema.studyPlans,
			sqliteTable: sqliteSchema.sqliteStudyPlans,
			idColumn: 'id',
		});

		tables.set('flashcard_decks', {
			pgTable: schema.flashcardDecks,
			sqliteTable: sqliteSchema.sqliteFlashcardDecks,
			idColumn: 'id',
		});

		tables.set('flashcards', {
			pgTable: schema.flashcards,
			sqliteTable: sqliteSchema.sqliteFlashcards,
			idColumn: 'id',
		});

		tables.set('flashcard_reviews', {
			pgTable: schema.flashcardReviews,
			sqliteTable: sqliteSchema.sqliteFlashcardReviews,
			idColumn: 'id',
		});

		tables.set('topic_mastery', {
			pgTable: schema.topicMastery,
			sqliteTable: sqliteSchema.sqliteTopicMastery,
			idColumn: 'id',
		});

		tables.set('question_attempts', {
			pgTable: schema.questionAttempts,
			sqliteTable: sqliteSchema.sqliteQuestionAttempts,
			idColumn: 'id',
		});

		tables.set('bookmarks', {
			pgTable: schema.bookmarks,
			sqliteTable: sqliteSchema.sqliteBookmarks,
			idColumn: 'id',
		});

		tables.set('leaderboard_entries', {
			pgTable: schema.leaderboardEntries,
			sqliteTable: sqliteSchema.sqliteLeaderboardEntries,
			idColumn: 'id',
		});

		tables.set('channels', {
			pgTable: schema.channels,
			sqliteTable: sqliteSchema.sqliteChannels,
			idColumn: 'id',
		});

		tables.set('channel_members', {
			pgTable: schema.channelMembers,
			sqliteTable: sqliteSchema.sqliteChannelMembers,
			idColumn: 'channelId',
		});

		tables.set('comments', {
			pgTable: schema.comments,
			sqliteTable: sqliteSchema.sqliteComments,
			idColumn: 'id',
		});

		tables.set('comment_votes', {
			pgTable: schema.commentVotes,
			sqliteTable: sqliteSchema.sqliteCommentVotes,
			idColumn: 'id',
		});

		tables.set('notifications', {
			pgTable: schema.notifications,
			sqliteTable: sqliteSchema.sqliteNotifications,
			idColumn: 'id',
		});

		tables.set('calendar_events', {
			pgTable: schema.calendarEvents,
			sqliteTable: sqliteSchema.sqliteCalendarEvents,
			idColumn: 'id',
		});

		tables.set('ai_conversations', {
			pgTable: schema.aiConversations,
			sqliteTable: sqliteSchema.sqliteAiConversations,
			idColumn: 'id',
		});

		tables.set('buddy_requests', {
			pgTable: schema.buddyRequests,
			sqliteTable: sqliteSchema.sqliteBuddyRequests,
			idColumn: 'id',
		});

		tables.set('study_buddy_profiles', {
			pgTable: schema.studyBuddyProfiles,
			sqliteTable: sqliteSchema.sqliteStudyBuddyProfiles,
			idColumn: 'id',
		});

		tables.set('study_buddy_requests', {
			pgTable: schema.studyBuddyRequests,
			sqliteTable: sqliteSchema.sqliteStudyBuddyRequests,
			idColumn: 'id',
		});

		tables.set('study_buddies', {
			pgTable: schema.studyBuddies,
			sqliteTable: sqliteSchema.sqliteStudyBuddies,
			idColumn: 'id',
		});

		tables.set('concept_struggles', {
			pgTable: schema.conceptStruggles,
			sqliteTable: sqliteSchema.sqliteConceptStruggles,
			idColumn: 'id',
		});

		tables.set('topic_confidence', {
			pgTable: schema.topicConfidence,
			sqliteTable: sqliteSchema.sqliteTopicConfidence,
			idColumn: 'id',
		});

		tables.set('university_targets', {
			pgTable: schema.universityTargets,
			sqliteTable: sqliteSchema.sqliteUniversityTargets,
			idColumn: 'id',
		});

		tables.set('user_aps_scores', {
			pgTable: schema.userApsScores,
			sqliteTable: sqliteSchema.sqliteUserApsScores,
			idColumn: 'id',
		});

		tables.set('aps_milestones', {
			pgTable: schema.apsMilestones,
			sqliteTable: sqliteSchema.sqliteApsMilestones,
			idColumn: 'id',
		});

		tables.set('topic_weightages', {
			pgTable: schema.topicWeightages,
			sqliteTable: sqliteSchema.sqliteTopicWeightages,
			idColumn: 'id',
		});

		tables.set('subscription_plans', {
			pgTable: schema.subscriptionPlans,
			sqliteTable: sqliteSchema.sqliteSubscriptionPlans,
			idColumn: 'id',
		});

		tables.set('user_subscriptions', {
			pgTable: schema.userSubscriptions,
			sqliteTable: sqliteSchema.sqliteUserSubscriptions,
			idColumn: 'id',
		});

		tables.set('payments', {
			pgTable: schema.payments as any,
			sqliteTable: sqliteSchema.sqlitePayments,
			idColumn: 'id',
		});

		tables.set('content_flags', {
			pgTable: schema.contentFlags,
			sqliteTable: sqliteSchema.sqliteContentFlags,
			idColumn: 'id',
		});

		return tables;
	}

	private async getRemoteRecord(mapping: TableMapping, id: string): Promise<any> {
		const pgDb = pgManager.getDb();
		const idColumn = mapping.pgTable.id as any;
		const result = await pgDb.select().from(mapping.pgTable).where(eq(idColumn, id));
		return result[0];
	}

	private async getLocalRecord(mapping: TableMapping, id: string): Promise<any> {
		const sqliteDb = sqliteManager.getDb();
		const idColumn = mapping.sqliteTable.id as any;
		const result = await sqliteDb.select().from(mapping.sqliteTable).where(eq(idColumn, id));
		return result[0];
	}

	private async upsertRemote(mapping: TableMapping, record: any): Promise<void> {
		const pgDb = pgManager.getDb();

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
		const sqliteDb = sqliteManager.getDb();
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
		const sqliteDb = sqliteManager.getDb();
		const idColumn = mapping.sqliteTable.id as any;

		await sqliteDb
			.update(mapping.sqliteTable)
			.set({ syncStatus: 'synced' as any })
			.where(eq(idColumn, id));
	}

	private async markAsFailed(mapping: TableMapping, id: string): Promise<void> {
		const sqliteDb = sqliteManager.getDb();
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
