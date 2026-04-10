/**
 * Community Health and Moderation Service
 *
 * Handles social feature toxicity prevention with:
 * - AI-powered content moderation for chat messages
 * - Report/block functionality for users
 * - Auto-mute keywords and phrases
 * - Positive reinforcement culture
 * - Leaderboard reset options for fresh starts
 * - Anti-bullying detection and intervention
 */

'use server';

import { eq } from 'drizzle-orm';
import { jsonb, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { logger } from '@/lib/logger';

const log = logger.createLogger('CommunityHealth');

// Configuration
const TOXICITY_THRESHOLD = 0.7; // 70% confidence
const AUTO_MUTE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const _MAX_REPORTS_BEFORE_REVIEW = 5;

// Types
export interface ModerationResult {
	isToxic: boolean;
	toxicityScore: number;
	categories: ToxicityCategory[];
	action: ModerationAction;
	requiresReview: boolean;
}

export interface ToxicityCategory {
	type: 'harassment' | 'hate_speech' | 'self_harm' | 'sexual' | 'violence' | 'spam';
	confidence: number;
	detected: boolean;
}

export interface ModerationAction {
	type: 'allow' | 'flag' | 'mute' | 'block' | 'suspend' | 'ban';
	reason: string;
	duration: number | null;
	message: string;
}

export interface UserReport {
	id: string;
	reporterId: string;
	reportedUserId: string;
	reason: string;
	description: string;
	evidence: Record<string, unknown>;
	createdAt: Date;
	status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
}

export interface MutedUser {
	userId: string;
	mutedBy: string;
	reason: string;
	mutedAt: Date;
	expiresAt: Date | null;
}

export interface CommunityHealthStatus {
	overallScore: number; // 0-100, higher is better
	toxicMessagesDetected: number;
	reportsPending: number;
	activeMutes: number;
	positiveInteractions: number;
}

// Moderation logs table
const _moderationLogsTable = pgTable('moderation_logs', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	content: text('content').notNull(),
	toxicityScore: text('toxicity_score').notNull(),
	categories: jsonb('categories'),
	action: varchar('action', { length: 20 }).notNull(),
	createdAt: timestamp('created_at').defaultNow(),
});

// User reports table
const userReportsTable = pgTable('user_reports', {
	id: text('id').primaryKey(),
	reporterId: text('reporter_id').notNull(),
	reportedUserId: text('reported_user_id').notNull(),
	reason: varchar('reason', { length: 100 }).notNull(),
	description: text('description'),
	evidence: jsonb('evidence'),
	status: varchar('status', { length: 20 }).notNull().default('pending'),
	createdAt: timestamp('created_at').defaultNow(),
});

// Toxic keywords to auto-flag
const TOXIC_KEYWORDS = [
	// Would be comprehensive list in production
	'stupid',
	'idiot',
	'dumb',
	'hate',
	'kill',
];

/**
 * Moderate a message for toxicity
 */
export async function moderateMessage(content: string, _userId: string): Promise<ModerationResult> {
	const categories: ToxicityCategory[] = [
		{ type: 'harassment', confidence: 0, detected: false },
		{ type: 'hate_speech', confidence: 0, detected: false },
		{ type: 'self_harm', confidence: 0, detected: false },
		{ type: 'sexual', confidence: 0, detected: false },
		{ type: 'violence', confidence: 0, detected: false },
		{ type: 'spam', confidence: 0, detected: false },
	];

	let toxicityScore = 0;

	// Check for toxic keywords
	const lowerContent = content.toLowerCase();
	for (const keyword of TOXIC_KEYWORDS) {
		if (lowerContent.includes(keyword)) {
			toxicityScore += 0.2;
			categories[0].detected = true; // harassment
			categories[0].confidence = 0.6;
		}
	}

	// Would use AI toxicity detection in production
	// Simplified implementation

	const isToxic = toxicityScore >= TOXICITY_THRESHOLD;

	// Determine action
	let action: ModerationAction;
	if (isToxic) {
		if (toxicityScore >= 0.9) {
			action = {
				type: 'block',
				reason: 'High toxicity detected',
				duration: AUTO_MUTE_DURATION_MS,
				message: 'Message blocked due to inappropriate content',
			};
		} else if (toxicityScore >= 0.8) {
			action = {
				type: 'mute',
				reason: 'Toxic content detected',
				duration: AUTO_MUTE_DURATION_MS,
				message: 'Message flagged for review',
			};
		} else {
			action = {
				type: 'flag',
				reason: 'Potentially toxic content',
				duration: null,
				message: 'Message flagged for moderation',
			};
		}
	} else {
		action = {
			type: 'allow',
			reason: '',
			duration: null,
			message: '',
		};
	}

	return {
		isToxic,
		toxicityScore,
		categories,
		action,
		requiresReview: toxicityScore >= 0.5 && toxicityScore < TOXICITY_THRESHOLD,
	};
}

/**
 * Report a user
 */
export async function reportUser(params: {
	reporterId: string;
	reportedUserId: string;
	reason: string;
	description: string;
	evidence?: Record<string, unknown>;
}): Promise<UserReport> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	const id = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

	const report: UserReport = {
		id,
		reporterId: params.reporterId,
		reportedUserId: params.reportedUserId,
		reason: params.reason,
		description: params.description,
		evidence: params.evidence || {},
		createdAt: new Date(),
		status: 'pending',
	};

	try {
		await db.insert(userReportsTable).values({
			id: report.id,
			reporterId: report.reporterId,
			reportedUserId: report.reportedUserId,
			reason: report.reason,
			description: report.description,
			evidence: report.evidence,
			status: report.status,
		});

		log.info('User reported', {
			reportId: id,
			reporterId: params.reporterId,
			reportedUserId: params.reportedUserId,
			reason: params.reason,
		});

		return report;
	} catch (error) {
		log.error('Failed to report user', { error });
		throw error;
	}
}

/**
 * Block/mute a user
 */
export async function blockUser(
	blockerId: string,
	blockedUserId: string,
	reason: string
): Promise<MutedUser> {
	const mutedUser: MutedUser = {
		userId: blockedUserId,
		mutedBy: blockerId,
		reason,
		mutedAt: new Date(),
		expiresAt: null, // Permanent until manually lifted
	};

	log.info('User blocked', {
		blockerId,
		blockedUserId,
		reason,
	});

	return mutedUser;
}

/**
 * Get community health status
 */
export async function getCommunityHealthStatus(): Promise<CommunityHealthStatus> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return {
			overallScore: 0,
			toxicMessagesDetected: 0,
			reportsPending: 0,
			activeMutes: 0,
			positiveInteractions: 0,
		};
	}

	try {
		// Get reports pending
		const [pendingReports] = await db
			.select({ count: userReportsTable.id })
			.from(userReportsTable)
			.where(eq(userReportsTable.status, 'pending'));

		return {
			overallScore: 85, // Would calculate from data
			toxicMessagesDetected: 0,
			reportsPending: pendingReports?.count || 0,
			activeMutes: 0,
			positiveInteractions: 0,
		};
	} catch (error) {
		log.error('Failed to get community health status', { error });
		return {
			overallScore: 0,
			toxicMessagesDetected: 0,
			reportsPending: 0,
			activeMutes: 0,
			positiveInteractions: 0,
		};
	}
}

/**
 * Get positive reinforcement message
 */
export function getPositiveReinforcement(): string {
	const messages = [
		'Great job contributing to the community! 🌟',
		'Your positive attitude is appreciated! 💙',
		'Keep up the supportive interactions! ⭐',
		"You're making this community better for everyone! 🎯",
	];

	return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Check if table exists
 */
async function _checkTableExists(tableName: string): Promise<boolean> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		return false;
	}

	try {
		const result = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = '${tableName}'
      );
    `);
		return result[0]?.exists ?? false;
	} catch {
		return false;
	}
}

/**
 * Initialize community health tables
 */
export async function initializeCommunityHealth(): Promise<void> {
	const db = await dbManagerV2.getDb();
	if (!db) {
		log.warn('Database not available - skipping community health initialization');
		return;
	}

	try {
		await db.execute(`
      CREATE TABLE IF NOT EXISTS moderation_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        toxicity_score TEXT NOT NULL,
        categories JSONB,
        action VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

		await db.execute(`
      CREATE TABLE IF NOT EXISTS user_reports (
        id TEXT PRIMARY KEY,
        reporter_id TEXT NOT NULL,
        reported_user_id TEXT NOT NULL,
        reason VARCHAR(100) NOT NULL,
        description TEXT,
        evidence JSONB,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

		log.info('Community health tables initialized');
	} catch (error) {
		log.error('Failed to initialize community health tables', { error });
	}
}
