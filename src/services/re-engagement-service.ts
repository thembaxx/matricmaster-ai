/**
 * Re-engagement Service for Inactive Users
 *
 * Purpose: Detect inactive users and trigger personalized re-engagement
 * campaigns via email, WhatsApp, and push notifications.
 *
 * Features:
 * - Inactivity detection (3, 7, 14, 30 days)
 * - Personalized re-engagement messages
 * - Progress-based motivation content
 * - Streak recovery incentives
 * - Achievement unlocking on return
 */

import { and, eq, lt, sql } from 'drizzle-orm';
import { Resend } from 'resend';
import { AI_MODELS, generateAI } from '@/lib/ai-config';
import { dbManager } from '@/lib/db';
import {
	topicMastery,
	userAchievements,
	userProgress,
	users,
	whatsappPreferences,
} from '@/lib/db/schema';
import { rateLimitedSend } from '@/services/whatsapp-service';
import { appConfig } from '../app.config';

// ========================
// TYPES
// ========================

export type InactivityTier = 'short' | 'medium' | 'long' | 'critical';

export interface InactiveUser {
	userId: string;
	name: string;
	email: string;
	lastActive: Date;
	daysInactive: number;
	inactivityTier: InactivityTier;
	previousStreak: number;
	topicsInProgress: string[];
	achievementsUnlocked: number;
}

export interface ReEngagementResult {
	userId: string;
	channelsNotified: ('email' | 'whatsapp')[];
	message: string;
	incentive?: string;
}

// ========================
// INACTIVITY DETECTION
// ========================

/**
 * Detect inactive users and categorize by inactivity tier
 */
export async function detectInactiveUsers(): Promise<InactiveUser[]> {
	const db = await dbManager.getDb();
	const now = new Date();

	// Find users inactive for 3+ days
	const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

	const inactiveUsers = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			updatedAt: users.updatedAt,
		})
		.from(users)
		.where(
			and(
				lt(users.updatedAt, threeDaysAgo),
				sql`${users.deletedAt} IS NULL`,
				sql`${users.isBlocked} = false`
			)
		)
		.limit(100);

	const results: InactiveUser[] = [];

	for (const user of inactiveUsers) {
		const daysInactive = Math.floor(
			(now.getTime() - new Date(user.updatedAt).getTime()) / (24 * 60 * 60 * 1000)
		);

		// Get user progress data
		const progressData = await db
			.select({ streakDays: userProgress.streakDays })
			.from(userProgress)
			.where(eq(userProgress.userId, user.id))
			.limit(1);

		// Get topics in progress
		const topicsData = await db
			.select({ topic: topicMastery.topic, subject: topicMastery.subjectId })
			.from(topicMastery)
			.where(
				and(
					eq(topicMastery.userId, user.id),
					sql`${topicMastery.masteryLevel} > 0.2 AND ${topicMastery.masteryLevel} < 0.8`
				)
			)
			.limit(5);

		// Get achievements
		const achievementsData = await db
			.select()
			.from(userAchievements)
			.where(eq(userAchievements.userId, user.id));

		results.push({
			userId: user.id,
			name: user.name,
			email: user.email,
			lastActive: new Date(user.updatedAt),
			daysInactive,
			inactivityTier: getInactivityTier(daysInactive),
			previousStreak: Number(progressData[0]?.streakDays) || 0,
			topicsInProgress: topicsData.map((t) => `${t.subject}: ${t.topic}`),
			achievementsUnlocked: achievementsData.length,
		});
	}

	return results;
}

function getInactivityTier(daysInactive: number): InactivityTier {
	if (daysInactive >= 30) return 'critical';
	if (daysInactive >= 14) return 'long';
	if (daysInactive >= 7) return 'medium';
	return 'short';
}

// ========================
// RE-ENGAGEMENT CAMPAIGNS
// ========================

/**
 * Execute re-engagement campaign for inactive users
 */
export async function executeReEngagementCampaign(): Promise<ReEngagementResult[]> {
	const inactiveUsers = await detectInactiveUsers();
	const results: ReEngagementResult[] = [];

	for (const user of inactiveUsers) {
		const result = await sendReEngagement(user);
		results.push(result);
	}

	return results;
}

/**
 * Send personalized re-engagement message to user
 */
async function sendReEngagement(user: InactiveUser): Promise<ReEngagementResult> {
	const channelsNotified: ('email' | 'whatsapp')[] = [];

	// Generate personalized message
	const message = await generateReEngagementMessage(user);

	// Send email
	await sendReEngagementEmail(user, message);
	channelsNotified.push('email');

	// Send WhatsApp if configured
	const db = await dbManager.getDb();
	const whatsappPrefs = await db
		.select()
		.from(whatsappPreferences)
		.where(
			and(
				eq(whatsappPreferences.userId, user.userId),
				eq(whatsappPreferences.isOptedIn, true),
				eq(whatsappPreferences.isVerified, true)
			)
		)
		.limit(1);

	if (whatsappPrefs.length > 0 && whatsappPrefs[0].phoneNumber) {
		const whatsappMessage = `Hey ${user.name}! 👋\n\n${message}\n\nCome back to lumni.ai to continue learning!`;
		await rateLimitedSend(whatsappPrefs[0].phoneNumber, whatsappMessage);
		channelsNotified.push('whatsapp');
	}

	// Determine incentive based on tier
	let incentive: string | undefined;
	if (user.inactivityTier === 'critical') {
		incentive = 'Bonus 50 XP on your return!';
	} else if (user.inactivityTier === 'long') {
		incentive = 'Streak recovery bonus: 25 XP!';
	}

	return {
		userId: user.userId,
		channelsNotified,
		message,
		incentive,
	};
}

// ========================
// AI MESSAGE GENERATION
// ========================

/**
 * Generate personalized re-engagement message using AI
 */
async function generateReEngagementMessage(user: InactiveUser): Promise<string> {
	const prompt = `You are a friendly, encouraging study companion writing to a Grade 12 student in South Africa who hasn't studied in a while.

Student Context:
- Name: ${user.name}
- Days since last study: ${user.daysInactive}
- Previous study streak: ${user.previousStreak} days
- Topics they were working on: ${user.topicsInProgress.join(', ') || 'Various topics'}
- Achievements unlocked: ${user.achievementsUnlocked}

Write a short, warm, motivational message (under 150 characters) that:
1. Acknowledges their absence without making them feel guilty
2. Reminds them of their progress
3. Encourages them to come back
4. Mentions their unfinished topics

Keep it personal, friendly, and specific to their situation.`;

	try {
		const response = await generateAI({
			prompt,
			model: AI_MODELS.PRIMARY,
		});

		return response.slice(0, 150);
	} catch (error) {
		console.error('Failed to generate re-engagement message:', error);

		// Fallback messages based on tier
		const fallbackMessages: Record<InactivityTier, string> = {
			short: `Hey ${user.name}! We miss you! Your ${user.previousStreak}-day streak is waiting for you. Come back and keep it going!`,
			medium: `Hi ${user.name}! It's been a while! You were making great progress on ${user.topicsInProgress[0] || 'your studies'}. Ready to continue?`,
			long: `${user.name}, we've saved your progress! You had unlocked ${user.achievementsUnlocked} achievements. Come back and unlock more!`,
			critical: `Hey ${user.name}! Your studies are waiting for you. Every expert was once a beginner - let's get back to it together!`,
		};

		return fallbackMessages[user.inactivityTier];
	}
}

// ========================
// EMAIL SENDING
// ========================

async function sendReEngagementEmail(user: InactiveUser, message: string): Promise<void> {
	const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
	if (!resend) {
		return;
	}

	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
	const loginUrl = `${appUrl}/sign-in`;

	const subject = getReEngagementEmailSubject(user);

	const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>We Miss You!</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px;">
      <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">We miss you, ${user.name}! 👋</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          ${message}
        </p>

        ${
					user.previousStreak > 3
						? `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              🔥 You had a <strong>${user.previousStreak}-day streak</strong>! Come back and keep it going.
            </p>
          </div>
        `
						: ''
				}

        ${
					user.topicsInProgress.length > 0
						? `
          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px;">
            <p style="color: #1e40af; font-size: 14px; margin: 0;">
              📚 You were working on: <strong>${user.topicsInProgress.slice(0, 2).join(', ')}</strong>
            </p>
          </div>
        `
						: ''
				}

        <a href="${loginUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 24px;">
          Continue Learning
        </a>

        <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
          We're here whenever you're ready. Every step counts towards your goals!
        </p>
      </div>
    </body>
    </html>
  `;

	try {
		await resend.emails.send({
			from: `${appConfig.name} AI <noreply@lumni.ai>`,
			to: user.email,
			subject,
			html,
		});
	} catch (error) {
		console.error('Failed to send re-engagement email:', error);
	}
}

function getReEngagementEmailSubject(user: InactiveUser): string {
	switch (user.inactivityTier) {
		case 'short':
			return 'Your streak is waiting for you! 🔥';
		case 'medium':
			return `We miss you, ${user.name}! 👋`;
		case 'long':
			return 'Your progress is saved - come back anytime! 📚';
		case 'critical':
			return `Ready to get back to it? We're here for you! 💪`;
	}
}

// ========================
// RETURN INCENTIVES
// ========================

/**
 * Grant return incentive when user comes back after inactivity
 */
export async function grantReturnIncentive(
	_userId: string,
	daysInactive: number
): Promise<{
	xpGranted: number;
	message: string;
}> {
	let xpGranted = 0;
	let message = '';

	if (daysInactive >= 30) {
		xpGranted = 50;
		message = "Welcome back! Here's 50 bonus XP to help you get started!";
	} else if (daysInactive >= 14) {
		xpGranted = 25;
		message = "Welcome back! Here's 25 bonus XP as a streak recovery bonus!";
	} else if (daysInactive >= 7) {
		xpGranted = 10;
		message = "Welcome back! Here's 10 bonus XP to keep you going!";
	}

	if (xpGranted > 0) {
		try {
			const { awardXP } = await import('@/services/xpSystem');
			await awardXP(_userId, xpGranted, 're-engagement_incentive');
		} catch (error) {
			console.error('Failed to award re-engagement XP:', error);
		}

		return { xpGranted, message };
	}

	return { xpGranted: 0, message: '' };
}

// ========================
// SCHEDULED JOB
// ========================

/**
 * Run this as a cron job daily at 10am SAST
 * Detects inactive users and sends re-engagement messages
 */
export async function runDailyReEngagementJob(): Promise<{
	usersDetected: number;
	messagesSent: number;
	errors: number;
}> {
	const inactiveUsers = await detectInactiveUsers();
	let messagesSent = 0;
	let errors = 0;

	for (const user of inactiveUsers) {
		try {
			// Only send for certain tiers (avoid spamming)
			// Short: send every day
			// Medium: send every 2 days
			// Long: send every 3 days
			// Critical: send once per week

			const shouldSend = shouldSendReEngagement(user);
			if (shouldSend) {
				await sendReEngagement(user);
				messagesSent++;
			}
		} catch (error) {
			console.error(`Failed to send re-engagement to ${user.userId}:`, error);
			errors++;
		}
	}

	return {
		usersDetected: inactiveUsers.length,
		messagesSent,
		errors,
	};
}

function shouldSendReEngagement(user: InactiveUser): boolean {
	const dayOfWeek = new Date().getDay();

	switch (user.inactivityTier) {
		case 'short':
			return true; // Send daily
		case 'medium':
			return user.daysInactive % 2 === 0; // Every 2 days
		case 'long':
			return user.daysInactive % 3 === 0; // Every 3 days
		case 'critical':
			return dayOfWeek === 1; // Mondays only
	}
}
