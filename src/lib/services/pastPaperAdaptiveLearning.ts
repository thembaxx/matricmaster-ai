import { and, avg, count, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
	pastPaperQuestions,
	pastPapers,
	questionAttempts,
	subjects,
	topicMastery,
	topicWeightages,
} from '@/lib/db/schema';

export interface WeakAreaFromPastPapers {
	topic: string;
	subject: string;
	subjectId: number;
	subjectName: string;
	attemptCount: number;
	averageScore: number;
	confidence: number;
	lastAttempt: Date | null;
}

export interface AdaptiveQuizQuestion {
	questionId: string;
	questionText: string;
	topic: string;
	subject: string;
	difficulty: string | null;
	marks: number | null;
	year: number;
	paper: string | null;
	month: string | null;
	weight: number;
}

export interface PastPaperPerformanceSummary {
	totalAttempts: number;
	correctAttempts: number;
	accuracy: number;
	byTopic: Array<{ topic: string; attempts: number; accuracy: number; examWeight: number }>;
	byYear: Array<{ year: number; attempts: number; accuracy: number }>;
}

interface _TopicFrequency {
	topic: string;
	frequency: number;
}

/**
 * Analyzes past paper performance to identify weak areas for a user
 */
export async function analyzePastPaperWeakAreas(
	userId: string,
	subject?: string
): Promise<WeakAreaFromPastPapers[]> {
	const whereClause = subject
		? and(
				eq(questionAttempts.userId, userId),
				eq(questionAttempts.source, 'past_paper'),
				eq(pastPaperQuestions.subject, subject)
			)
		: and(eq(questionAttempts.userId, userId), eq(questionAttempts.source, 'past_paper'));

	const performanceData = await db
		.select({
			topic: pastPaperQuestions.topic,
			subject: pastPaperQuestions.subject,
			attemptCount: count(questionAttempts.id),
			averageScore: avg(sql<number>`CASE WHEN ${questionAttempts.isCorrect} THEN 100 ELSE 0 END`),
			lastAttempt: sql<Date>`MAX(${questionAttempts.attemptedAt})`,
		})
		.from(questionAttempts)
		.innerJoin(pastPaperQuestions, eq(questionAttempts.questionId, pastPaperQuestions.id))
		.where(whereClause)
		.groupBy(pastPaperQuestions.topic, pastPaperQuestions.subject);

	if (performanceData.length === 0) {
		return [];
	}

	const subjectNames = performanceData.map((p) => p.subject).filter((s): s is string => s !== null);

	const subjectsData =
		subjectNames.length > 0
			? await db
					.select({
						id: subjects.id,
						name: subjects.name,
					})
					.from(subjects)
					.where(inArray(subjects.name, subjectNames))
			: [];

	const subjectMap = new Map(subjectsData.map((s) => [s.name, s.id]));

	const topicNames = performanceData.map((p) => p.topic).filter((t): t is string => t !== null);

	const masteryData =
		topicNames.length > 0
			? await db
					.select({
						topic: topicMastery.topic,
						confidence: topicMastery.masteryLevel,
					})
					.from(topicMastery)
					.where(
						and(
							eq(topicMastery.userId, userId),
							inArray(
								topicMastery.topic,
								topicNames.filter((t): t is string => t !== null)
							)
						)
					)
			: [];

	const masteryMap = new Map(masteryData.map((m) => [m.topic, Number(m.confidence)]));

	return performanceData
		.map((p) => ({
			topic: p.topic ?? 'Unknown',
			subject: p.subject ?? 'Unknown',
			subjectId: subjectMap.get(p.subject ?? '') ?? 0,
			subjectName: p.subject ?? 'Unknown',
			attemptCount: Number(p.attemptCount),
			averageScore: Number(p.averageScore) ?? 0,
			confidence: masteryMap.get(p.topic ?? '') ?? 0.5,
			lastAttempt: p.lastAttempt ?? null,
		}))
		.sort((a, b) => a.averageScore - b.averageScore);
}

/**
 * Generates an adaptive quiz targeting weak areas from past papers
 */
export async function generateAdaptiveQuizFromPastPapers(
	userId: string,
	subject: string,
	options: {
		questionCount?: number;
		excludeQuestionIds?: string[];
		includeTopics?: string[];
	} = {}
): Promise<AdaptiveQuizQuestion[]> {
	const { questionCount = 10, excludeQuestionIds = [], includeTopics } = options;

	const weakAreas = await analyzePastPaperWeakAreas(userId, subject);

	const targetTopics = includeTopics
		? weakAreas.filter((w) => includeTopics.includes(w.topic))
		: weakAreas.slice(0, 5);

	if (targetTopics.length === 0) {
		return [];
	}

	const topicFrequencies = await calculateTopicFrequency(subject);
	const topicWeightageMap = await getCapsTopicWeightage(subject);

	const questions = await db
		.select({
			id: pastPaperQuestions.id,
			questionText: pastPaperQuestions.questionText,
			topic: pastPaperQuestions.topic,
			difficulty: pastPaperQuestions.difficulty,
			year: pastPaperQuestions.year,
			marks: pastPaperQuestions.marks,
			paper: pastPaperQuestions.paper,
			month: pastPaperQuestions.month,
		})
		.from(pastPaperQuestions)
		.where(
			and(
				eq(pastPaperQuestions.subject, subject),
				inArray(
					pastPaperQuestions.topic,
					targetTopics.map((t) => t.topic)
				)
			)
		)
		.orderBy(desc(pastPaperQuestions.year))
		.limit(questionCount * 4);

	const filteredQuestions = questions.filter((q) => !excludeQuestionIds.includes(q.id));

	const weightedQuestions = filteredQuestions.map((q) => {
		const topicWeakness = targetTopics.find((t) => t.topic === q.topic);
		const weaknessScore = topicWeakness ? 1 - topicWeakness.confidence : 0.5;
		const frequencyWeight = topicFrequencies.get(q.topic ?? '') ?? 0.5;
		const examWeight = topicWeightageMap.get(q.topic ?? '') ?? 0.5;

		const weight = weaknessScore * 0.5 + frequencyWeight * 0.25 + examWeight * 0.25;

		return {
			...q,
			weight,
		};
	});

	weightedQuestions.sort((a, b) => b.weight - a.weight);

	const candidates = weightedQuestions.slice(0, questionCount * 2);
	const shuffled = candidates.sort(() => Math.random() - 0.5);

	return shuffled.slice(0, questionCount);
}

/**
 * Calculate topic frequency weightages from past papers for a subject
 */
async function calculateTopicFrequency(subject: string): Promise<Map<string, number>> {
	const frequencyData = await db
		.select({
			topic: pastPaperQuestions.topic,
			count: count(pastPaperQuestions.id),
		})
		.from(pastPaperQuestions)
		.where(eq(pastPaperQuestions.subject, subject))
		.groupBy(pastPaperQuestions.topic);

	if (frequencyData.length === 0) {
		return new Map();
	}

	const maxCount = Math.max(...frequencyData.map((f) => Number(f.count)));

	return new Map(
		frequencyData
			.map((f) => [f.topic ?? '', Number(f.count) / maxCount])
			.filter(([key]) => key !== '')
	);
}

/**
 * Get CAPS exam topic weightages for a subject
 */
async function getCapsTopicWeightage(subject: string): Promise<Map<string, number>> {
	const weightageData = await db
		.select({
			topic: topicWeightages.topic,
			weightage: topicWeightages.weightagePercent,
		})
		.from(topicWeightages)
		.where(eq(topicWeightages.subject, subject));

	const maxWeightage = Math.max(...weightageData.map((w) => Number(w.weightage)), 1);

	return new Map(
		weightageData
			.map((w) => [w.topic ?? '', Number(w.weightage) / maxWeightage])
			.filter(([key]) => key !== '')
	);
}

/**
 * Records a question attempt from a past paper with full metadata
 */
export async function recordPastPaperAttempt(
	userId: string,
	questionId: string,
	isCorrect: boolean,
	options: {
		topic?: string;
		pastPaperId?: string;
		responseTimeMs?: number;
		confidenceLevel?: 'sure' | 'guess' | 'unsure';
	} = {}
): Promise<string> {
	const { topic = 'Unknown', pastPaperId, responseTimeMs, confidenceLevel } = options;

	const [attempt] = await db
		.insert(questionAttempts)
		.values({
			userId,
			questionId,
			topic,
			isCorrect,
			responseTimeMs,
			source: 'past_paper',
			pastPaperId: pastPaperId ? (pastPaperId as string) : null,
			confidenceLevel,
		})
		.returning();

	return attempt.id;
}

/**
 * Gets comprehensive past paper performance statistics for a user
 */
export async function getPastPaperStats(
	userId: string,
	subject?: string
): Promise<PastPaperPerformanceSummary> {
	const whereCondition = subject
		? and(
				eq(questionAttempts.userId, userId),
				eq(questionAttempts.source, 'past_paper'),
				eq(pastPaperQuestions.subject, subject)
			)
		: and(eq(questionAttempts.userId, userId), eq(questionAttempts.source, 'past_paper'));

	const [totalResult, topicResults, yearResults] = await Promise.all([
		db
			.select({
				total: count(questionAttempts.id),
				correct: count(sql<number>`CASE WHEN ${questionAttempts.isCorrect} THEN 1 END`),
			})
			.from(questionAttempts)
			.where(and(eq(questionAttempts.userId, userId), eq(questionAttempts.source, 'past_paper'))),
		db
			.select({
				topic: pastPaperQuestions.topic,
				attempts: count(questionAttempts.id),
				correct: count(sql<number>`CASE WHEN ${questionAttempts.isCorrect} THEN 1 END`),
			})
			.from(questionAttempts)
			.innerJoin(pastPaperQuestions, eq(questionAttempts.questionId, pastPaperQuestions.id))
			.where(whereCondition)
			.groupBy(pastPaperQuestions.topic),
		db
			.select({
				year: pastPaperQuestions.year,
				attempts: count(questionAttempts.id),
				correct: count(sql<number>`CASE WHEN ${questionAttempts.isCorrect} THEN 1 END`),
			})
			.from(questionAttempts)
			.innerJoin(pastPaperQuestions, eq(questionAttempts.questionId, pastPaperQuestions.id))
			.where(whereCondition)
			.groupBy(pastPaperQuestions.year)
			.orderBy(desc(pastPaperQuestions.year)),
	]);

	const total = Number(totalResult[0]?.total ?? 0);
	const correct = Number(totalResult[0]?.correct ?? 0);

	const topicWeightageMap = subject ? await getCapsTopicWeightage(subject) : new Map();

	return {
		totalAttempts: total,
		correctAttempts: correct,
		accuracy: total > 0 ? (correct / total) * 100 : 0,
		byTopic: topicResults.map((t) => ({
			topic: t.topic ?? 'Unknown',
			attempts: Number(t.attempts),
			accuracy: Number(t.attempts) > 0 ? (Number(t.correct) / Number(t.attempts)) * 100 : 0,
			examWeight: topicWeightageMap.get(t.topic ?? '') ?? 0,
		})),
		byYear: yearResults.map((y) => ({
			year: Number(y.year),
			attempts: Number(y.attempts),
			accuracy: Number(y.attempts) > 0 ? (Number(y.correct) / Number(y.attempts)) * 100 : 0,
		})),
	};
}

/**
 * Gets past paper questions by topic with difficulty distribution
 */
export async function getPastPaperQuestionsByTopic(
	subject: string,
	topic: string,
	options: {
		limit?: number;
		yearAfter?: number;
	} = {}
): Promise<
	Array<{
		id: string;
		questionText: string;
		year: number;
		paper: string | null;
		month: string | null;
		marks: number | null;
	}>
> {
	const { limit = 20, yearAfter } = options;

	const whereClauses = [
		eq(pastPaperQuestions.subject, subject),
		eq(pastPaperQuestions.topic, topic),
	];

	if (yearAfter) {
		whereClauses.push(gte(pastPaperQuestions.year, yearAfter));
	}

	const questions = await db
		.select({
			id: pastPaperQuestions.id,
			questionText: pastPaperQuestions.questionText,
			year: pastPaperQuestions.year,
			paper: pastPaperQuestions.paper,
			month: pastPaperQuestions.month,
			marks: pastPaperQuestions.marks,
		})
		.from(pastPaperQuestions)
		.where(and(...whereClauses))
		.orderBy(desc(pastPaperQuestions.year))
		.limit(limit);

	return questions;
}

/**
 * Gets available past paper years for a subject
 */
export async function getAvailablePastPaperYears(subject: string): Promise<number[]> {
	const years = await db
		.selectDistinct({ year: pastPaperQuestions.year })
		.from(pastPaperQuestions)
		.where(eq(pastPaperQuestions.subject, subject))
		.orderBy(desc(pastPaperQuestions.year));

	return years.map((y) => Number(y.year));
}

/**
 * Gets past paper metadata for a subject
 */
export async function getPastPaperMetadata(subject: string): Promise<
	Array<{
		paperId: string;
		year: number;
		month: string;
		paper: string;
		totalQuestions: number;
	}>
> {
	const papers = await db
		.select({
			id: pastPapers.paperId,
			year: pastPapers.year,
			month: pastPapers.month,
			paper: pastPapers.paper,
		})
		.from(pastPapers)
		.where(eq(pastPapers.subject, subject))
		.orderBy(desc(pastPapers.year));

	const questionCounts = await db
		.select({
			paperId: pastPaperQuestions.paperId,
			count: count(pastPaperQuestions.id),
		})
		.from(pastPaperQuestions)
		.where(eq(pastPaperQuestions.subject, subject))
		.groupBy(pastPaperQuestions.paperId);

	const countMap = new Map(questionCounts.map((c) => [c.paperId as string, Number(c.count)]));

	return papers.map((p) => ({
		paperId: p.id ?? '',
		year: Number(p.year),
		month: p.month ?? '',
		paper: p.paper ?? '',
		totalQuestions: countMap.get(p.id ?? '') ?? 0,
	}));
}
