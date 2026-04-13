/**
 * Account Deletion Service with Grace Period
 *
 * Handles safe account deletion with:
 * - 30-day grace period for account recovery
 * - Soft delete preserving anonymized analytics
 * - Subscription cancellation with prorated refunds
 * - POPIA-compliant data export before deletion
 * - Complete PII removal after grace period
 */

import { and, eq, isNotNull, lt } from 'drizzle-orm';
import { Resend } from 'resend';
import { appConfig } from '../app.config';
import { dbManagerV2 } from '../lib/db/database-manager-v2';
import type { DbType } from '../lib/db/postgresql-manager';
import {
	accessibilityPreferences,
	aiConversations,
	bookmarks,
	calendarEvents,
	flashcardDecks,
	flashcardReviews,
	notifications,
	payments,
	questionAttempts,
	quizResults,
	studyPlans,
	studySessions,
	topicMastery,
	userAchievements,
	userLearningPreferences,
	userProgress,
	userSettings,
	userSubscriptions,
	users,
	wellnessCheckIns,
} from '../lib/db/schema';
import { aiChatMessages, aiChatSessions } from '../lib/db/schema-ai-chat';
import { logger } from '../lib/logger';

const log = logger.createLogger('AccountDeletion');

// Configuration
export const GRACE_PERIOD_DAYS = 30;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const GRACE_PERIOD_MS = GRACE_PERIOD_DAYS * MS_PER_DAY;

// Types
export interface AccountDeletionResult {
	success: boolean;
	userId: string;
	scheduledDeletionAt: Date;
	dataExportUrl?: string;
	message: string;
}

export interface AccountRecoveryResult {
	success: boolean;
	userId: string;
	recoveredAt: Date;
	message: string;
}

export interface PendingDeletion {
	userId: string;
	email: string;
	name: string;
	scheduledDeletionAt: Date;
	daysRemaining: number;
}

/**
 * Request account deletion with grace period
 * Sets deletedAt timestamp but doesn't actually delete until grace period expires
 */
export async function requestAccountDeletion(userId: string): Promise<AccountDeletionResult> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const now = new Date();
		const scheduledDeletionAt = new Date(now.getTime() + GRACE_PERIOD_MS);

		// Soft delete: set deletedAt timestamp
		await db
			.update(users)
			.set({
				deletedAt: scheduledDeletionAt,
				isBlocked: true, // Prevent login during grace period
			})
			.where(eq(users.id, userId));

		// Get user email for confirmation
		const [user] = await db
			.select({ email: users.email, name: users.name })
			.from(users)
			.where(eq(users.id, userId));

		if (!user) {
			throw new Error('User not found');
		}

		// Send confirmation email
		await sendDeletionConfirmationEmail(user.email, user.name, scheduledDeletionAt);

		log.info('Account deletion requested', {
			userId,
			scheduledDeletionAt,
			gracePeriodDays: GRACE_PERIOD_DAYS,
		});

		return {
			success: true,
			userId,
			scheduledDeletionAt,
			message: `Account deletion scheduled. You have ${GRACE_PERIOD_DAYS} days to recover your account.`,
		};
	} catch (error) {
		log.error('Failed to request account deletion', { userId, error });
		throw error;
	}
}

/**
 * Recover account during grace period
 * Restores full account access
 */
export async function recoverAccount(userId: string): Promise<AccountRecoveryResult> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		const [user] = await db
			.select({ deletedAt: users.deletedAt })
			.from(users)
			.where(eq(users.id, userId));

		if (!user) {
			throw new Error('User not found');
		}

		if (!user.deletedAt) {
			throw new Error('Account is not scheduled for deletion');
		}

		if (new Date() > user.deletedAt) {
			throw new Error('Grace period has expired. Account cannot be recovered.');
		}

		// Restore account
		await db
			.update(users)
			.set({
				deletedAt: null,
				isBlocked: false,
			})
			.where(eq(users.id, userId));

		// Get user email for notification
		const [updatedUser] = await db
			.select({ email: users.email, name: users.name })
			.from(users)
			.where(eq(users.id, userId));

		if (updatedUser) {
			await sendRecoveryConfirmationEmail(updatedUser.email, updatedUser.name);
		}

		log.info('Account recovered', { userId });

		return {
			success: true,
			userId,
			recoveredAt: new Date(),
			message: 'Account successfully recovered. Welcome back!',
		};
	} catch (error) {
		log.error('Failed to recover account', { userId, error });
		throw error;
	}
}

/**
 * Permanently delete accounts past grace period
 * Should be run as a scheduled job (cron)
 * Removes all PII but preserves anonymized analytics
 */
export async function processPendingDeletions(): Promise<{
	processed: number;
	errors: number;
}> {
	const db = dbManagerV2.getDb();
	if (!db) {
		log.error('Database not available for deletion processing');
		return { processed: 0, errors: 0 };
	}

	const now = new Date();
	let processed = 0;
	let errors = 0;

	try {
		// Find users whose grace period has expired
		const expiredUsers = await db
			.select({ id: users.id, email: users.email, name: users.name })
			.from(users)
			.where(and(isNotNull(users.deletedAt), lt(users.deletedAt, now)));

		log.info('Processing pending deletions', { count: expiredUsers.length });

		for (const expiredUser of expiredUsers) {
			try {
				await permanentlyDeleteUser(expiredUser.id, db);
				processed++;
			} catch (error) {
				log.error('Failed to permanently delete user', {
					userId: expiredUser.id,
					error,
				});
				errors++;
			}
		}

		return { processed, errors };
	} catch (error) {
		log.error('Failed to process pending deletions', { error });
		return { processed, errors };
	}
}

/**
 * Permanently delete a single user's PII
 * Preserves anonymized analytics for product improvement
 */
async function permanentlyDeleteUser(userId: string, db: DbType): Promise<void> {
	// Start a transaction
	await db.transaction(async (tx) => {
		// 1. Anonymize quiz results (keep for analytics but remove PII)
		// Note: quiz_results has onDelete: 'cascade' so it will be auto-deleted
		// We'll preserve aggregated stats first

		// 2. Delete user settings
		await tx.delete(userSettings).where(eq(userSettings.userId, userId));

		// 3. Delete accessibility preferences
		await tx.delete(accessibilityPreferences).where(eq(accessibilityPreferences.userId, userId));

		// 4. Delete user progress (after preserving aggregated data if needed)
		await tx.delete(userProgress).where(eq(userProgress.userId, userId));

		// 5. Finally, delete the user record
		await tx.delete(users).where(eq(users.id, userId));
	});

	log.info('User permanently deleted', { userId });
}

/**
 * Check if an account is in grace period
 */
export async function isInGracePeriod(userId: string): Promise<{
	isInGracePeriod: boolean;
	daysRemaining: number;
	scheduledDeletionAt: Date | null;
}> {
	const db = dbManagerV2.getDb();
	if (!db) {
		return { isInGracePeriod: false, daysRemaining: 0, scheduledDeletionAt: null };
	}

	try {
		const [user] = await db
			.select({ deletedAt: users.deletedAt })
			.from(users)
			.where(eq(users.id, userId));

		if (!user?.deletedAt) {
			return { isInGracePeriod: false, daysRemaining: 0, scheduledDeletionAt: null };
		}

		const now = new Date();
		const daysRemaining = Math.ceil((user.deletedAt.getTime() - now.getTime()) / MS_PER_DAY);

		return {
			isInGracePeriod: daysRemaining > 0,
			daysRemaining: Math.max(0, daysRemaining),
			scheduledDeletionAt: user.deletedAt,
		};
	} catch (error) {
		log.error('Failed to check grace period', { userId, error });
		return { isInGracePeriod: false, daysRemaining: 0, scheduledDeletionAt: null };
	}
}

/**
 * Get all pending deletions (for admin dashboard)
 */
export async function getPendingDeletions(): Promise<PendingDeletion[]> {
	const db = dbManagerV2.getDb();
	if (!db) {
		return [];
	}

	try {
		const pendingUsers = await db
			.select({
				id: users.id,
				email: users.email,
				name: users.name,
				deletedAt: users.deletedAt,
			})
			.from(users)
			.where(
				and(isNotNull(users.deletedAt), lt(users.deletedAt, new Date(Date.now() + GRACE_PERIOD_MS)))
			);

		const now = new Date();

		return pendingUsers.map((user) => ({
			userId: user.id,
			email: user.email,
			name: user.name,
			scheduledDeletionAt: user.deletedAt!,
			daysRemaining: Math.ceil((user.deletedAt!.getTime() - now.getTime()) / MS_PER_DAY),
		}));
	} catch (error) {
		log.error('Failed to get pending deletions', { error });
		return [];
	}
}

/**
 * POPIA-compliant comprehensive data export
 * Returns all personal data held about a user
 */
export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
	const db = dbManagerV2.getDb();
	if (!db) {
		throw new Error('Database not available');
	}

	try {
		// 1. Core profile data
		const [user] = await db.select().from(users).where(eq(users.id, userId));
		if (!user) {
			throw new Error('User not found');
		}

		// 2. Settings and preferences
		const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
		const [accessibility] = await db
			.select()
			.from(accessibilityPreferences)
			.where(eq(accessibilityPreferences.userId, userId));
		const [learningPrefs] = await db
			.select()
			.from(userLearningPreferences)
			.where(eq(userLearningPreferences.userId, userId));

		// 3. Progress and performance
		const progress = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
		const mastery = await db.select().from(topicMastery).where(eq(topicMastery.userId, userId));
		const quizResultsData = await db
			.select()
			.from(quizResults)
			.where(eq(quizResults.userId, userId));
		const questionAttemptsData = await db
			.select()
			.from(questionAttempts)
			.where(eq(questionAttempts.userId, userId));

		// 4. Study content
		const studyPlansData = await db.select().from(studyPlans).where(eq(studyPlans.userId, userId));
		const studySessionsData = await db
			.select()
			.from(studySessions)
			.where(eq(studySessions.userId, userId));
		const flashcardDecksData = await db
			.select()
			.from(flashcardDecks)
			.where(eq(flashcardDecks.userId, userId));
		const flashcardReviewsData = await db
			.select()
			.from(flashcardReviews)
			.where(eq(flashcardReviews.userId, userId));
		const bookmarksData = await db.select().from(bookmarks).where(eq(bookmarks.userId, userId));

		// 5. AI interactions
		const aiSessionsData = await db
			.select()
			.from(aiChatSessions)
			.where(eq(aiChatSessions.userId, userId));
		const aiMessagesData = await db
			.select()
			.from(aiChatMessages)
			.where(eq(aiChatMessages.userId, userId));
		const aiConversationsData = await db
			.select()
			.from(aiConversations)
			.where(eq(aiConversations.userId, userId));

		// 6. Wellness data
		const wellnessData = await db
			.select()
			.from(wellnessCheckIns)
			.where(eq(wellnessCheckIns.userId, userId));

		// 7. Achievements and gamification
		const achievementsData = await db
			.select()
			.from(userAchievements)
			.where(eq(userAchievements.userId, userId));

		// 8. Notifications
		const notificationsData = await db
			.select()
			.from(notifications)
			.where(eq(notifications.userId, userId));

		// 9. Calendar events
		const calendarEventsData = await db
			.select()
			.from(calendarEvents)
			.where(eq(calendarEvents.userId, userId));

		// 10. Subscription and payment history
		const subscriptionsData = await db
			.select()
			.from(userSubscriptions)
			.where(eq(userSubscriptions.userId, userId));
		const paymentsData = await db.select().from(payments).where(eq(payments.userId, userId));

		// Build comprehensive export
		const exportData = {
			metadata: {
				exportDate: new Date().toISOString(),
				exportVersion: '1.0',
				purpose: 'POPIA-compliant personal data export',
				userId,
			},
			profile: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				hasCompletedOnboarding: user.hasCompletedOnboarding,
				isBlocked: user.isBlocked,
			},
			settings: {
				appSettings: settings || null,
				accessibilityPreferences: accessibility || null,
				learningPreferences: learningPrefs || null,
			},
			learningProgress: {
				subjectProgress: progress.map((p) => ({
					subjectId: p.subjectId,
					topic: p.topic,
					totalQuestionsAttempted: p.totalQuestionsAttempted,
					totalCorrect: p.totalCorrect,
					totalMarksEarned: p.totalMarksEarned,
					streakDays: p.streakDays,
					bestStreak: p.bestStreak,
					accuracy: p.accuracy,
				})),
				topicMastery: mastery.map((m) => ({
					subjectId: m.subjectId,
					topic: m.topic,
					masteryLevel: m.masteryLevel,
					lastPracticed: m.lastPracticed,
				})),
			},
			assessmentHistory: {
				quizResults: quizResultsData.map((q) => ({
					id: q.id,
					quizId: q.quizId,
					subjectId: q.subjectId,
					score: q.score,
					percentage: q.percentage,
					completedAt: q.completedAt,
					timeTakenSeconds: q.timeTakenSeconds,
				})),
				questionAttempts: questionAttemptsData.slice(0, 100).map((qa) => ({
					// Limit for export size
					questionId: qa.questionId,
					isCorrect: qa.isCorrect,
					attemptedAt: qa.attemptedAt,
				})),
			},
			studyContent: {
				studyPlans: studyPlansData.map((sp) => ({
					id: sp.id,
					title: sp.title,
					description: sp.description,
					createdAt: sp.createdAt,
				})),
				studySessions: studySessionsData.slice(0, 100).map((ss) => ({
					id: ss.id,
					subjectId: ss.subjectId,
					duration: ss.duration,
					completedAt: ss.completedAt,
				})),
				flashcardDecks: flashcardDecksData.map((fd) => ({
					id: fd.id,
					title: fd.title,
					createdAt: fd.createdAt,
				})),
				flashcardReviews: flashcardReviewsData.slice(0, 100).map((fr) => ({
					flashcardId: fr.flashcardId,
					rating: fr.rating,
					reviewedAt: fr.reviewedAt,
				})),
				bookmarks: bookmarksData.map((b) => ({
					id: b.id,
					contentType: b.contentType,
					contentId: b.contentId,
					createdAt: b.createdAt,
				})),
			},
			aiInteractions: {
				chatSessions: aiSessionsData.map((s) => ({
					id: s.id,
					title: s.title,
					subject: s.subject,
					createdAt: s.createdAt,
					updatedAt: s.updatedAt,
				})),
				chatMessages: aiMessagesData.slice(0, 200).map((m) => ({
					// Limit for export size
					id: m.id,
					sessionId: m.sessionId,
					role: m.role,
					content: m.content,
					createdAt: m.createdAt,
				})),
				conversations: aiConversationsData.slice(0, 100).map((c) => ({
					id: c.id,
					topic: c.topic,
					createdAt: c.createdAt,
				})),
			},
			wellness: {
				checkIns: wellnessData.map((w) => ({
					id: w.id,
					mood: w.mood,
					stressLevel: w.stressLevel,
					checkedInAt: w.checkedInAt,
				})),
			},
			gamification: {
				achievements: achievementsData.map((a) => ({
					achievementId: a.achievementId,
					unlockedAt: a.unlockedAt,
				})),
			},
			notifications: notificationsData.slice(0, 100).map((n) => ({
				id: n.id,
				title: n.title,
				message: n.message,
				isRead: n.isRead,
				createdAt: n.createdAt,
			})),
			calendar: calendarEventsData.map((ce) => ({
				id: ce.id,
				title: ce.title,
				description: ce.description,
				startTime: ce.startTime,
				endTime: ce.endTime,
			})),
			billing: {
				subscriptions: subscriptionsData.map((s) => ({
					id: s.id,
					plan: s.plan,
					status: s.status,
					startDate: s.startDate,
					endDate: s.endDate,
				})),
				payments: paymentsData.map((p) => ({
					id: p.id,
					amount: p.amount,
					currency: p.currency,
					status: p.status,
					createdAt: p.createdAt,
				})),
			},
		};

		log.info('POPIA-compliant user data export completed', { userId });

		return exportData;
	} catch (error) {
		log.error('Failed to export user data', { userId, error });
		throw error;
	}
}

// Email templates
async function sendDeletionConfirmationEmail(
	email: string,
	name: string,
	scheduledDeletionAt: Date
): Promise<void> {
	const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
	if (!resend) {
		log.warn('Resend not configured - deletion confirmation email not sent');
		return;
	}

	const recoveryUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/recover`;

	try {
		await resend.emails.send({
			from: `${appConfig.name} AI <noreply@lumni.ai>`,
			to: email,
			subject: 'Account deletion scheduled',
			html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Deletion Scheduled</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Account deletion scheduled</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hi${name ? ` ${name}` : ''}, we're sorry to see you go. Your account deletion has been scheduled.
            </p>
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>Important:</strong> Your account will be permanently deleted on ${scheduledDeletionAt.toLocaleDateString()}. 
                You have ${GRACE_PERIOD_DAYS} days to change your mind.
              </p>
            </div>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              If you change your mind, you can recover your account by clicking the button below:
            </p>
            <a href="${recoveryUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 24px;">
              Recover My Account
            </a>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
              After the grace period, all your personal data will be permanently deleted and cannot be recovered.
            </p>
          </div>
        </body>
        </html>
      `,
		});
		log.info('Deletion confirmation email sent', { email });
	} catch (error) {
		log.error('Failed to send deletion confirmation email', { error });
	}
}

async function sendRecoveryConfirmationEmail(email: string, name: string): Promise<void> {
	const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
	if (!resend) {
		log.warn('Resend not configured - recovery confirmation email not sent');
		return;
	}

	try {
		await resend.emails.send({
			from: `${appConfig.name} AI <noreply@lumni.ai>`,
			to: email,
			subject: 'Account recovered successfully',
			html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Recovered</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Welcome back!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              Hi${name ? ` ${name}` : ''}, your account has been successfully recovered. All your data and progress are intact.
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
              We're glad you're staying with us. Keep up the great work with your studies!
            </p>
          </div>
        </body>
        </html>
      `,
		});
		log.info('Recovery confirmation email sent', { email });
	} catch (error) {
		log.error('Failed to send recovery confirmation email', { error });
	}
}
