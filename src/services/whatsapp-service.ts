/**
 * Core WhatsApp API Client
 *
 * Purpose: Handles direct WhatsApp Cloud API operations — sending/receiving messages,
 * webhook processing, message formatting, rate limiting, and notification templates.
 *
 * This is the low-level messaging layer. It does NOT handle scheduling, adaptive triggers,
 * or business logic for when/why to send messages.
 *
 * For scheduled/adaptive notifications (study reminders, burnout check-ins, weak topic alerts,
 * gamification updates, etc.), see: whatsapp-reminder-service.ts
 */

import { eq } from 'drizzle-orm';
import { AI_MODELS, generateAI } from '@/lib/ai-config';
import { getCachedResponse } from '@/lib/cache/vercel-kv';
import { db } from '@/lib/db';
import { whatsappPreferences } from '@/lib/db/schema';
import { whatsappClient } from '@/lib/whatsapp/client';
import { isWhatsAppConfigured } from '@/lib/whatsapp/config';

export type WhatsAppNotificationType =
	| 'study_reminder'
	| 'achievement_share'
	| 'buddy_update'
	| 'daily_tip'
	| 'weekly_report'
	| 'revision_due'
	| 'exam_countdown'
	| 'buddy_score';

export interface WhatsAppMessageContext {
	userId?: string;
	userName?: string;
	subject?: string;
	topic?: string;
	score?: number;
}

const GREETING = `Hi! I'm your Lumni Study Buddy.

I can help you with:
- Study questions
- APS calculation
- University info
- Past paper help

Just ask me anything!`;

const FALLBACK = `That's a great question! For detailed answers and practice, check the Lumni app at https://lumni.ai

Need more help? Ask me another question!`;

const RATE_LIMIT_DELAY = 1000;
const MAX_MESSAGE_LENGTH = 4096;
const SOUTH_AFRICA_COUNTRY_CODE = '27';

function normalizeSouthAfricanNumber(phone: string): string {
	const cleaned = phone.replace(/[\s\-()]/g, '');
	if (cleaned.startsWith('0')) {
		return `${SOUTH_AFRICA_COUNTRY_CODE}${cleaned.slice(1)}`;
	}
	if (cleaned.startsWith('+')) {
		return cleaned.slice(1);
	}
	return cleaned;
}

function truncateMessage(message: string, maxLength = MAX_MESSAGE_LENGTH): string {
	if (message.length <= maxLength) return message;
	return `${message.slice(0, maxLength - 20)}...\n\n(Truncated)`;
}

async function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function rateLimitedSend(to: string, message: string): Promise<boolean> {
	if (!isWhatsAppConfigured()) {
		console.warn('[WhatsApp] Cannot send - not configured');
		return false;
	}

	try {
		const normalizedNumber = normalizeSouthAfricanNumber(to);
		const truncatedMessage = truncateMessage(message);
		await whatsappClient.sendMessage(normalizedNumber, truncatedMessage);
		await delay(RATE_LIMIT_DELAY);
		return true;
	} catch (error) {
		console.error('Rate-limited send failed:', error);
		return false;
	}
}

export async function handleWhatsAppMessage(
	_from: string,
	message: string,
	ctx?: WhatsAppMessageContext
): Promise<string> {
	const normalized = message.toLowerCase().trim();

	if (normalized.match(/^(hi|hello|hey|start|help)/)) {
		return GREETING;
	}

	if (normalized.includes('unsubscribe') || normalized.includes('stop')) {
		return `You've been unsubscribed from WhatsApp notifications.

To re-subscribe, visit your settings at lumni.ai/settings`;
	}

	const cached = await getCachedResponse(normalized);
	if (cached) {
		return cached;
	}

	const contextPrompt = ctx?.subject
		? `Context: Student is learning ${ctx.subject}${ctx.topic ? ` - ${ctx.topic}` : ''}`
		: '';

	try {
		const response = await generateAI({
			prompt: `You are a helpful South African matric study assistant. 
Keep answers concise (under 300 characters for WhatsApp).
${contextPrompt}
Student asks: ${message}`,
			model: AI_MODELS.PRIMARY,
		});

		return truncateMessage(response, 400);
	} catch (error) {
		console.error('WhatsApp AI error:', error);
		return FALLBACK;
	}
}

export async function isInQuietHours(userId: string): Promise<boolean> {
	const dbClient = await db();
	const prefs = await dbClient.query.whatsappPreferences.findFirst({
		where: eq(whatsappPreferences.userId, userId),
	});

	if (!prefs?.quietHoursStart || !prefs?.quietHoursEnd) {
		return false;
	}

	const now = new Date();
	const currentHour = now.getHours();
	const startHour = Number.parseInt(prefs.quietHoursStart.split(':')[0], 10);
	const endHour = Number.parseInt(prefs.quietHoursEnd.split(':')[0], 10);

	if (startHour <= endHour) {
		return currentHour >= startHour && currentHour < endHour;
	}
	return currentHour >= startHour || currentHour < endHour;
}

export async function sendStudyReminder(
	to: string,
	userId?: string,
	ctx?: WhatsAppMessageContext
): Promise<boolean> {
	if (userId) {
		const inQuiet = await isInQuietHours(userId);
		if (inQuiet) return false;

		const dbClient = await db();
		const prefs = await dbClient.query.whatsappPreferences.findFirst({
			where: eq(whatsappPreferences.userId, userId),
		});
		if (!prefs?.notificationTypes?.includes('study_reminder')) return false;
	}

	const reminder = `Study Reminder from Lumni!

Time to practice some questions today.
${ctx?.topic ? `${ctx.topic} needs attention!` : 'Keep your streak going!'}

Visit lumni.ai to continue learning.`;

	return rateLimitedSend(to, reminder);
}

export async function sendWeeklyProgressReport(
	to: string,
	stats: {
		weekXp: number;
		totalXp: number;
		quizzesCompleted: number;
		streakDays: number;
		topicsImproved: string[];
	}
): Promise<boolean> {
	const report = `📊 Weekly Progress Report

XP Earned: +${stats.weekXp} (Total: ${stats.totalXp})
Quizzes: ${stats.quizzesCompleted} completed
Streak: ${stats.streakDays} days 🔥
Topics Improved: ${stats.topicsImproved.slice(0, 3).join(', ') || 'None yet'}

Keep it up! Visit lumni.ai`;

	return rateLimitedSend(to, report);
}

export async function sendRevisionDueNotification(
	to: string,
	topic: string,
	subject: string
): Promise<boolean> {
	const notification = `📚 Time to Review!

${subject}: ${topic} needs review.
Don't lose your progress - practice now!

lumni.ai/review`;

	return rateLimitedSend(to, notification);
}

export async function sendStruggleAlert(
	to: string,
	parentNumber: string,
	topic: string,
	subject: string,
	score: number
): Promise<void> {
	const alert = `⚠️ Study Alert for Parent

${subject}: ${topic}
Current understanding: ${Math.round(score * 100)}%

Your child may need extra help with this topic.
lumni.ai/ai-tutor`;

	await Promise.all([rateLimitedSend(to, alert), rateLimitedSend(parentNumber, alert)]);
}

export async function sendExamCountdown(
	to: string,
	exam: { subject: string; date: string; daysUntil: number }
): Promise<boolean> {
	const message =
		exam.daysUntil <= 7
			? `⏰ ${exam.subject} exam in ${exam.daysUntil} days!
Focus on this subject now.`
			: `📅 ${exam.subject} exam: ${exam.daysUntil} days away
Start preparing early!

lumni.ai/planner`;

	return rateLimitedSend(to, message);
}

export async function sendAchievementNotification(
	to: string,
	achievement: { title: string; description: string; icon?: string }
): Promise<boolean> {
	const icon = achievement.icon || '🏆';
	const notification = `${icon} Achievement Unlocked!

${achievement.title}
${achievement.description}

View all achievements at lumni.ai/achievements`;

	return rateLimitedSend(to, notification);
}

export async function sendBuddyScoreNotification(
	to: string,
	buddyName: string,
	score: number,
	topic?: string
): Promise<boolean> {
	const topicMsg = topic ? ` on ${topic}` : '';
	const notification = `🏃 Your study buddy ${buddyName} just beat your score${topicMsg}!

They scored ${Math.round(score * 100)}%

Can you catch up? Head to lumni.ai to try again!`;

	return rateLimitedSend(to, notification);
}

export async function sendDailyTip(to: string, tip: string): Promise<boolean> {
	const message = `💡 Daily Study Tip

${tip}

Learn more at lumni.ai`;

	return rateLimitedSend(to, message);
}

export async function sendWelcomeMessage(to: string, userName?: string): Promise<boolean> {
	const name = userName ? `, ${userName}` : '';
	const message = `Welcome to Lumni AI${name}! 🎓

You're now connected to WhatsApp notifications.

You'll receive:
• Study reminders
• Achievement updates
• Friend score updates
• Daily tips

Reply "HELP" for assistance or "STOP" to unsubscribe.`;

	return rateLimitedSend(to, message);
}

export async function sendVerificationCode(to: string, code: string): Promise<boolean> {
	const message = `Your Lumni verification code is: ${code}

This code expires in 10 minutes.

If you didn't request this, ignore this message.`;

	return rateLimitedSend(to, message);
}

export async function sendBulkMessages(
	recipients: Array<{ to: string; message: string; userId?: string }>
): Promise<{ sent: number; failed: number }> {
	let sent = 0;
	let failed = 0;

	for (const { to, message, userId } of recipients) {
		if (userId) {
			const inQuiet = await isInQuietHours(userId);
			if (inQuiet) {
				failed++;
				continue;
			}
		}

		const success = await rateLimitedSend(to, message);
		if (success) sent++;
		else failed++;
	}

	return { sent, failed };
}
