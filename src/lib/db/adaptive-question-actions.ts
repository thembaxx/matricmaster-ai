'use server';

import { and, desc, eq, inArray, lte, not } from 'drizzle-orm';
import {
	type AdaptiveRecommendation,
	type LearningStats,
	prioritizeTopics,
	type TopicPerformance,
} from '@/lib/adaptive-learning';
import { dbManager, getDb } from './index';
import {
	type NewTopicMastery,
	type Question,
	questions,
	topicMastery,
	userProgress,
} from './schema';

export interface AdaptiveQuestionSelection {
	questions: Question[];
	recommendations: AdaptiveRecommendation[];
	weakTopics: string[];
}

export async function getTopicMasteryByUser(
	userId: string,
	subjectId?: number
): Promise<NewTopicMastery[]> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return [];
	}

	const db = getDb();

	try {
		if (subjectId) {
			return db
				.select()
				.from(topicMastery)
				.where(and(eq(topicMastery.userId, userId), eq(topicMastery.subjectId, subjectId)))
				.orderBy(desc(topicMastery.masteryLevel));
		}

		return db
			.select()
			.from(topicMastery)
			.where(eq(topicMastery.userId, userId))
			.orderBy(desc(topicMastery.masteryLevel));
	} catch (error) {
		console.debug('[Adaptive] Error fetching topic mastery:', error);
		return [];
	}
}

export async function updateTopicMastery(
	userId: string,
	subjectId: number,
	topic: string,
	isCorrect: boolean,
	timeSeconds?: number
): Promise<{ success: boolean; mastery?: NewTopicMastery }> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { success: false };
	}

	const db = getDb();

	try {
		const [existing] = await db
			.select()
			.from(topicMastery)
			.where(
				and(
					eq(topicMastery.userId, userId),
					eq(topicMastery.subjectId, subjectId),
					eq(topicMastery.topic, topic)
				)
			)
			.limit(1);

		const now = new Date();

		if (existing) {
			const newQuestionsAttempted = (existing.questionsAttempted ?? 0) + 1;
			const newQuestionsCorrect = (existing.questionsCorrect ?? 0) + (isCorrect ? 1 : 0);
			const newAccuracy = (newQuestionsCorrect / newQuestionsAttempted) * 100;
			const newConsecutiveCorrect = isCorrect ? (existing.consecutiveCorrect ?? 0) + 1 : 0;

			let newAverageTime = existing.averageTime;
			if (timeSeconds !== undefined) {
				const oldAvg = existing.averageTime ?? 0;
				newAverageTime = Math.round(
					(oldAvg * (existing.questionsAttempted ?? 0) + timeSeconds) / newQuestionsAttempted
				);
			}

			const nextReview = new Date(now);
			nextReview.setDate(nextReview.getDate() + (isCorrect ? 3 : 1));

			const [updated] = await db
				.update(topicMastery)
				.set({
					masteryLevel: newAccuracy.toFixed(2),
					questionsAttempted: newQuestionsAttempted,
					questionsCorrect: newQuestionsCorrect,
					averageTime: newAverageTime,
					consecutiveCorrect: newConsecutiveCorrect,
					lastPracticed: now,
					nextReview,
					updatedAt: now,
				})
				.where(eq(topicMastery.id, existing.id))
				.returning();

			return { success: true, mastery: updated };
		}

		const nextReview = new Date(now);
		nextReview.setDate(nextReview.getDate() + 1);

		const [created] = await db
			.insert(topicMastery)
			.values({
				userId,
				subjectId,
				topic,
				masteryLevel: isCorrect ? '100.00' : '0.00',
				questionsAttempted: 1,
				questionsCorrect: isCorrect ? 1 : 0,
				averageTime: timeSeconds,
				consecutiveCorrect: isCorrect ? 1 : 0,
				lastPracticed: now,
				nextReview,
			})
			.returning();

		return { success: true, mastery: created };
	} catch (error) {
		console.debug('[Adaptive] Error updating topic mastery:', error);
		return { success: false };
	}
}

export async function getAdaptiveQuestions(
	userId: string,
	subjectId: number,
	count = 10
): Promise<AdaptiveQuestionSelection> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return { questions: [], recommendations: [], weakTopics: [] };
	}

	const db = getDb();

	try {
		const masteryData = await getTopicMasteryByUser(userId, subjectId);

		const topicPerformances: TopicPerformance[] = masteryData.map((tm) => ({
			topic: tm.topic,
			subjectId: tm.subjectId,
			questionsAttempted: tm.questionsAttempted ?? 0,
			questionsCorrect: tm.questionsCorrect ?? 0,
			accuracy: Number(tm.masteryLevel) ?? 0,
			averageTimeSeconds: tm.averageTime ?? 0,
			lastPracticed: tm.lastPracticed ?? null,
			consecutiveCorrect: tm.consecutiveCorrect ?? 0,
		}));

		const recommendations = prioritizeTopics(topicPerformances);
		const weakTopics = recommendations.filter((r) => r.priority === 'high').map((r) => r.topic);

		const selectedQuestions: Question[] = [];
		const topicsToQuery =
			recommendations.length > 0 ? recommendations.map((r) => r.topic) : undefined;

		if (topicsToQuery && topicsToQuery.length > 0) {
			const availableQuestions = await db
				.select()
				.from(questions)
				.where(
					and(
						eq(questions.subjectId, subjectId),
						eq(questions.isActive, true),
						inArray(questions.topic, topicsToQuery)
					)
				);

			for (const rec of recommendations) {
				const topicQuestions = availableQuestions.filter(
					(q) => q.topic === rec.topic && q.difficulty === rec.recommendedDifficulty
				);

				if (topicQuestions.length > 0) {
					const shuffled = topicQuestions.sort(() => Math.random() - 0.5);
					selectedQuestions.push(...shuffled.slice(0, rec.questionCount));
				}
			}
		}

		if (selectedQuestions.length < count) {
			const excludeIds = selectedQuestions.map((q) => q.id);
			const additionalQuestions = await db
				.select()
				.from(questions)
				.where(
					and(
						eq(questions.subjectId, subjectId),
						eq(questions.isActive, true),
						excludeIds.length > 0 ? not(inArray(questions.id, excludeIds)) : undefined
					)
				)
				.limit(count - selectedQuestions.length);

			selectedQuestions.push(...additionalQuestions);
		}

		const shuffled = selectedQuestions.sort(() => Math.random() - 0.5).slice(0, count);

		return {
			questions: shuffled as Question[],
			recommendations,
			weakTopics,
		};
	} catch (error) {
		console.debug('[Adaptive] Error selecting adaptive questions:', error);
		return { questions: [], recommendations: [], weakTopics: [] };
	}
}

export async function getLearningStats(userId: string): Promise<LearningStats> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return {
			totalQuestions: 0,
			totalCorrect: 0,
			overallAccuracy: 0,
			weakTopics: [],
			strongTopics: [],
			improvingTopics: [],
			needsReview: [],
		};
	}

	const db = getDb();

	try {
		const progressRecords = await db
			.select()
			.from(userProgress)
			.where(eq(userProgress.userId, userId));

		const totalQuestions = progressRecords.reduce(
			(sum, p) => sum + (p.totalQuestionsAttempted ?? 0),
			0
		);
		const totalCorrect = progressRecords.reduce((sum, p) => sum + (p.totalCorrect ?? 0), 0);
		const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

		const masteryData = await getTopicMasteryByUser(userId);

		const topicPerformances: TopicPerformance[] = masteryData.map((tm) => ({
			topic: tm.topic,
			subjectId: tm.subjectId,
			questionsAttempted: tm.questionsAttempted ?? 0,
			questionsCorrect: tm.questionsCorrect ?? 0,
			accuracy: Number(tm.masteryLevel) ?? 0,
			averageTimeSeconds: tm.averageTime ?? 0,
			lastPracticed: tm.lastPracticed ?? null,
			consecutiveCorrect: tm.consecutiveCorrect ?? 0,
		}));

		const weakTopics = topicPerformances.filter(
			(tp) => tp.questionsAttempted >= 3 && tp.accuracy < 50
		);

		const strongTopics = topicPerformances.filter(
			(tp) => tp.questionsAttempted >= 5 && tp.accuracy > 80 && tp.consecutiveCorrect >= 3
		);

		const improvingTopics = topicPerformances.filter(
			(tp) =>
				tp.questionsAttempted >= 3 &&
				tp.accuracy >= 50 &&
				tp.accuracy <= 80 &&
				tp.consecutiveCorrect >= 2
		);

		const needsReview = topicPerformances.filter((tp) => tp.questionsAttempted < 3);

		return {
			totalQuestions,
			totalCorrect,
			overallAccuracy,
			weakTopics: weakTopics.sort((a, b) => a.accuracy - b.accuracy),
			strongTopics: strongTopics.sort((a, b) => b.accuracy - a.accuracy),
			improvingTopics: improvingTopics.sort((a, b) => b.accuracy - a.accuracy),
			needsReview: needsReview.sort((a, b) => {
				if (!a.lastPracticed) return -1;
				if (!b.lastPracticed) return 1;
				return new Date(a.lastPracticed).getTime() - new Date(b.lastPracticed).getTime();
			}),
		};
	} catch (error) {
		console.debug('[Adaptive] Error getting learning stats:', error);
		return {
			totalQuestions: 0,
			totalCorrect: 0,
			overallAccuracy: 0,
			weakTopics: [],
			strongTopics: [],
			improvingTopics: [],
			needsReview: [],
		};
	}
}

export async function getTopicsNeedingReview(userId: string): Promise<NewTopicMastery[]> {
	const connected = await dbManager.waitForConnection(3, 2000);
	if (!connected) {
		return [];
	}

	const db = getDb();
	const now = new Date();

	try {
		return db
			.select()
			.from(topicMastery)
			.where(and(eq(topicMastery.userId, userId), lte(topicMastery.nextReview, now)))
			.orderBy(topicMastery.nextReview);
	} catch (error) {
		console.debug('[Adaptive] Error getting topics needing review:', error);
		return [];
	}
}
