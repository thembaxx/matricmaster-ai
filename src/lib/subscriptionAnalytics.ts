'use server';

import { and, eq, gte } from 'drizzle-orm';
import { dbManager } from '@/lib/db';
import {
	aiConversations,
	leaderboardEntries,
	quizResults,
	studySessions,
	userProgress,
} from '@/lib/db/schema';

async function getDb() {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) throw new Error('Database not available');
	return dbManager.getDb();
}

export interface FeatureUsage {
	featureName: string;
	usageCount: number;
	lastUsed: Date | null;
	usagePercentile: number;
}

export interface SubscriptionAnalytics {
	featuresUsedMost: FeatureUsage[];
	predictedChurnRisk: 'low' | 'medium' | 'high';
	subscriptionUpsellCandidates: string[];
	totalActiveDays: number;
	avgSessionDuration: number;
	mostActiveTime: string;
}

export interface FeatureUsageBeforeUpgrade {
	featureName: string;
	tierRequired: string;
	usesLast7Days: number;
	usesLast30Days: number;
	upgradeMotivation: string;
}

export async function getUserFeatureUsage(userId: string, days = 30): Promise<FeatureUsage[]> {
	const db = await getDb();

	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - days);

	const quizzes = await db.query.quizResults.findMany({
		where: and(eq(quizResults.userId, userId), gte(quizResults.completedAt, cutoffDate)),
	});

	const sessions = await db.query.studySessions.findMany({
		where: and(eq(studySessions.userId, userId), gte(studySessions.startedAt, cutoffDate)),
	});

	const aiConvos = await db.query.aiConversations.findMany({
		where: and(eq(aiConversations.userId, userId), gte(aiConversations.createdAt, cutoffDate)),
	});

	const features: FeatureUsage[] = [
		{
			featureName: 'Quizzes',
			usageCount: quizzes.length,
			lastUsed:
				quizzes.length > 0
					? ((): Date | null => {
							const last = quizzes[quizzes.length - 1];
							return last.completedAt ? new Date(last.completedAt) : null;
						})()
					: null,
			usagePercentile: 0,
		},
		{
			featureName: 'Study Sessions',
			usageCount: sessions.length,
			lastUsed:
				sessions.length > 0
					? ((): Date | null => {
							const last = sessions[sessions.length - 1];
							return last.startedAt ? new Date(last.startedAt) : null;
						})()
					: null,
			usagePercentile: 0,
		},
		{
			featureName: 'AI Tutor',
			usageCount: aiConvos.reduce((sum, c) => sum + c.messageCount, 0),
			lastUsed:
				aiConvos.length > 0
					? ((): Date | null => {
							const last = aiConvos[aiConvos.length - 1];
							return last.createdAt ? new Date(last.createdAt) : null;
						})()
					: null,
			usagePercentile: 0,
		},
	];

	const maxUsage = Math.max(...features.map((f) => f.usageCount), 1);
	for (const feature of features) {
		feature.usagePercentile = (feature.usageCount / maxUsage) * 100;
	}

	return features.sort((a, b) => b.usageCount - a.usageCount);
}

export async function getFeaturesUsedBeforeUpgrade(
	userId: string
): Promise<FeatureUsageBeforeUpgrade[]> {
	const db = await getDb();

	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const recentQuizzes = await db.query.quizResults.findMany({
		where: and(eq(quizResults.userId, userId), gte(quizResults.completedAt, sevenDaysAgo)),
	});

	const recentSessions = await db.query.studySessions.findMany({
		where: and(eq(studySessions.userId, userId), gte(studySessions.startedAt, sevenDaysAgo)),
	});

	const recentAiConvos = await db.query.aiConversations.findMany({
		where: and(eq(aiConversations.userId, userId), gte(aiConversations.createdAt, sevenDaysAgo)),
	});

	const allQuizzes = await db.query.quizResults.findMany({
		where: and(eq(quizResults.userId, userId), gte(quizResults.completedAt, thirtyDaysAgo)),
	});

	const allSessions = await db.query.studySessions.findMany({
		where: and(eq(studySessions.userId, userId), gte(studySessions.startedAt, thirtyDaysAgo)),
	});

	const features: FeatureUsageBeforeUpgrade[] = [];

	if (recentAiConvos.length > 0 || allQuizzes.length > 30) {
		features.push({
			featureName: 'AI Tutor',
			tierRequired: 'basic',
			usesLast7Days: recentAiConvos.length,
			usesLast30Days: recentAiConvos.length * 4,
			upgradeMotivation: 'You frequently use AI tutoring. Upgrade for unlimited access.',
		});
	}

	if (recentSessions.length >= 5 || allSessions.length >= 20) {
		features.push({
			featureName: 'Focus Rooms',
			tierRequired: 'premium',
			usesLast7Days: recentSessions.filter((s) => s.sessionType === 'focus').length,
			usesLast30Days: allSessions.filter((s) => s.sessionType === 'focus').length,
			upgradeMotivation: 'Your study sessions suggest you would benefit from focus rooms.',
		});
	}

	if (recentQuizzes.length >= 3) {
		features.push({
			featureName: 'Past Papers',
			tierRequired: 'premium',
			usesLast7Days: Math.floor(recentQuizzes.length * 0.3),
			usesLast30Days: Math.floor(allQuizzes.length * 0.3),
			upgradeMotivation: 'You practice frequently. Past papers would help you prepare for exams.',
		});
	}

	if (recentAiConvos.length >= 10) {
		features.push({
			featureName: 'Voice AI Tutor',
			tierRequired: 'premium',
			usesLast7Days: Math.floor(recentAiConvos.length * 0.5),
			usesLast30Days: Math.floor(recentAiConvos.length * 2),
			upgradeMotivation: 'Voice interaction would make your study sessions more engaging.',
		});
	}

	return features;
}

export async function predictChurnRisk(userId: string): Promise<'low' | 'medium' | 'high'> {
	const db = await getDb();

	const progress = await db.query.userProgress.findFirst({
		where: eq(userProgress.userId, userId),
	});

	if (!progress) return 'high';

	const lastActivity = progress.lastActivityAt;
	const daysSinceActivity = lastActivity
		? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
		: 999;

	const streakDays = progress.streakDays || 0;

	if (daysSinceActivity > 14) return 'high';
	if (daysSinceActivity > 7) return 'medium';
	if (streakDays < 3 && daysSinceActivity > 3) return 'medium';

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const recentSessions = await db.query.studySessions.findMany({
		where: and(eq(studySessions.userId, userId), gte(studySessions.startedAt, thirtyDaysAgo)),
	});

	if (recentSessions.length < 3) return 'medium';

	return 'low';
}

export async function getSubscriptionAnalytics(userId: string): Promise<SubscriptionAnalytics> {
	const db = await getDb();

	const featuresUsedMost = await getUserFeatureUsage(userId, 30);
	const predictedChurnRisk = await predictChurnRisk(userId);
	const subscriptionUpsellCandidates = await getSubscriptionUpsellCandidates(userId);

	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const sessions = await db.query.studySessions.findMany({
		where: and(eq(studySessions.userId, userId), gte(studySessions.startedAt, thirtyDaysAgo)),
	});

	const uniqueDays = new Set(
		sessions.map((s) => (s.startedAt ? new Date(s.startedAt).toDateString() : ''))
	);

	const avgSessionDuration =
		sessions.length > 0
			? sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / sessions.length
			: 0;

	const hourCounts: Record<number, number> = {};
	for (const session of sessions) {
		if (session.startedAt) {
			const hour = new Date(session.startedAt).getHours();
			hourCounts[hour] = (hourCounts[hour] || 0) + 1;
		}
	}

	const mostActiveHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '18';
	const formattedHour = `${mostActiveHour}:00`;

	return {
		featuresUsedMost,
		predictedChurnRisk,
		subscriptionUpsellCandidates,
		totalActiveDays: uniqueDays.size,
		avgSessionDuration: Math.round(avgSessionDuration),
		mostActiveTime: formattedHour,
	};
}

export async function getSubscriptionUpsellCandidates(userId: string): Promise<string[]> {
	const db = await getDb();
	const candidates: string[] = [];

	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

	const recentQuizzes = await db.query.quizResults.findMany({
		where: and(eq(quizResults.userId, userId), gte(quizResults.completedAt, sevenDaysAgo)),
	});

	if (recentQuizzes.length >= 10) {
		candidates.push('basic');
	}

	const leaderboard = await db.query.leaderboardEntries.findFirst({
		where: eq(leaderboardEntries.userId, userId),
	});

	if (leaderboard?.rank && leaderboard.rank <= 20) {
		candidates.push('premium');
	}

	const aiConvos = await db.query.aiConversations.findMany({
		where: and(eq(aiConversations.userId, userId), gte(aiConversations.createdAt, sevenDaysAgo)),
	});

	const totalMessages = aiConvos.reduce((sum, c) => sum + c.messageCount, 0);
	if (totalMessages >= 50) {
		candidates.push('premium');
	}

	return candidates;
}

export async function trackFeatureUsage(
	_userId: string,
	_featureName: string,
	_metadata?: Record<string, unknown>
): Promise<void> {
	console.log(`Tracked feature usage: ${_featureName} for user ${_userId}`, _metadata);
}

export async function getUpgradeRecommendations(
	userId: string
): Promise<{ planId: string; reasons: string[] }[]> {
	const analytics = await getSubscriptionAnalytics(userId);
	const recommendations: { planId: string; reasons: string[] }[] = [];

	if (analytics.featuresUsedMost.some((f) => f.featureName === 'AI Tutor' && f.usageCount > 50)) {
		recommendations.push({
			planId: 'basic',
			reasons: ['High AI Tutor usage', 'Would benefit from increased limits'],
		});
	}

	if (
		analytics.featuresUsedMost.some((f) => f.featureName === 'Focus Rooms') ||
		analytics.featuresUsedMost.some((f) => f.featureName === 'Study Sessions')
	) {
		const existingPremium = recommendations.find((r) => r.planId === 'premium');
		if (existingPremium) {
			existingPremium.reasons.push('Active focus room user');
		} else {
			recommendations.push({
				planId: 'premium',
				reasons: ['Focus rooms enhance your study sessions', 'Group challenges available'],
			});
		}
	}

	return recommendations;
}
