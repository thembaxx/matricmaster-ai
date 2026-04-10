'use server';

import { and, count, eq, ilike, sql } from 'drizzle-orm';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { type DbType, pastPaperQuestions, questions } from '@/lib/db/schema';
import { logger } from '@/lib/logger';

const log = logger.createLogger('QuestionBankService');

// ============================================================================
// Interfaces
// ============================================================================

export interface QuestionAvailability {
	topic: string;
	subjectId: number;
	totalQuestions: number;
	threshold: number;
	isExhausted: boolean;
	remaining: number;
}

export interface GeneratedQuestion {
	questionText: string;
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
	marks: number;
	options?: {
		optionText: string;
		optionLetter: string;
		isCorrect: boolean;
		explanation?: string;
	}[];
	answerExplanation?: string;
}

export interface PastPaperQuestionResult {
	id: string;
	questionText: string;
	answerText: string | null;
	year: number;
	subject: string;
	topic: string | null;
	marks: number | null;
	questionNumber: number | null;
}

export interface DiversityModeConfig {
	userId: string;
	enabled: boolean;
	lastRotationDate: Date;
	preferredDifficulties: ('easy' | 'medium' | 'hard')[];
	avoidRecentQuestions: boolean;
}

export interface TopicDemandNotification {
	topic: string;
	demandLevel: 'high' | 'critical';
	questionsRequested: number;
	questionsAvailable: number;
	timestamp: Date;
}

const EXHAUSTION_THRESHOLD = 10;
const DEFAULT_GENERATION_COUNT = 20;
const DEFAULT_PAST_PAPER_LIMIT = 15;

// ============================================================================
// Helper Functions
// ============================================================================

async function getDb(): Promise<DbType> {
	await dbManagerV2.initialize();
	const healthy = await dbManagerV2.ensureConnected();
	if (!healthy) {
		throw new Error('Database not available');
	}
	return dbManagerV2.getDb();
}

function buildTopicFilter(topic: string) {
	return ilike(questions.topic, `%${topic}%`);
}

function buildPastPaperTopicFilter(topic: string) {
	return ilike(pastPaperQuestions.topic, `%${topic}%`);
}

// ============================================================================
// 1. Check Question Availability
// ============================================================================

/**
 * Checks how many questions remain for a given topic and subject.
 * Returns availability status including whether the bank is exhausted.
 */
export async function checkQuestionAvailability(
	topic: string,
	subjectId: number
): Promise<QuestionAvailability> {
	try {
		const db = await getDb();

		const result = await db
			.select({ value: count() })
			.from(questions)
			.where(
				and(
					buildTopicFilter(topic),
					eq(questions.subjectId, subjectId),
					eq(questions.isActive, true)
				)
			);

		const totalQuestions = result[0]?.value ?? 0;
		const remaining = Math.max(0, EXHAUSTION_THRESHOLD - totalQuestions);
		const isExhausted = totalQuestions < EXHAUSTION_THRESHOLD;

		if (isExhausted) {
			log.warn('Question bank exhausted', {
				topic,
				subjectId,
				totalQuestions,
				threshold: EXHAUSTION_THRESHOLD,
			});
		}

		return {
			topic,
			subjectId,
			totalQuestions,
			threshold: EXHAUSTION_THRESHOLD,
			isExhausted,
			remaining,
		};
	} catch (error) {
		log.error('Failed to check question availability', { topic, subjectId, error });
		return {
			topic,
			subjectId,
			totalQuestions: 0,
			threshold: EXHAUSTION_THRESHOLD,
			isExhausted: true,
			remaining: EXHAUSTION_THRESHOLD,
		};
	}
}

// ============================================================================
// 2. Generate Supplementary Questions
// ============================================================================

/**
 * Triggers AI-based generation of supplementary questions for a topic.
 * Returns the generated questions (to be persisted by the caller or a separate AI pipeline).
 */
export async function generateSupplementaryQuestions(
	topic: string,
	count = DEFAULT_GENERATION_COUNT
): Promise<GeneratedQuestion[]> {
	try {
		log.info('Generating supplementary questions', { topic, count });

		// In production, this would call the Gemini API to generate curriculum-aligned questions.
		// For now, we return a structured placeholder that the AI pipeline can populate.
		// The actual generation happens via a server action that calls Google Gemini.

		const generatedQuestions: GeneratedQuestion[] = [];

		// Distribute difficulty: 40% easy, 40% medium, 20% hard
		const easyCount = Math.floor(count * 0.4);
		const mediumCount = Math.floor(count * 0.4);
		const hardCount = count - easyCount - mediumCount;

		const difficultyDistribution = [
			...Array(easyCount).fill('easy' as const),
			...Array(mediumCount).fill('medium' as const),
			...Array(hardCount).fill('hard' as const),
		];

		for (const difficulty of difficultyDistribution) {
			generatedQuestions.push({
				questionText: `[AI_GENERATED] Question for topic: ${topic}`,
				topic,
				difficulty,
				marks: difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6,
				options: [],
				answerExplanation: '',
			});
		}

		log.info('Supplementary questions generated', {
			topic,
			generated: generatedQuestions.length,
		});

		return generatedQuestions;
	} catch (error) {
		log.error('Failed to generate supplementary questions', { topic, count, error });
		return [];
	}
}

/**
 * Persists generated questions to the database.
 */
export async function persistGeneratedQuestions(
	generatedQuestions: GeneratedQuestion[],
	subjectId: number
): Promise<string[]> {
	try {
		const db = await getDb();
		const insertedIds: string[] = [];

		for (const q of generatedQuestions) {
			const result = await db
				.insert(questions)
				.values({
					subjectId,
					questionText: q.questionText,
					topic: q.topic,
					difficulty: q.difficulty,
					marks: q.marks,
					hint: q.answerExplanation || null,
					gradeLevel: 12,
					isActive: true,
				})
				.returning({ id: questions.id });

			if (result[0]?.id) {
				insertedIds.push(result[0].id);
			}
		}

		log.info('Persisted generated questions', { count: insertedIds.length, subjectId });
		return insertedIds;
	} catch (error) {
		log.error('Failed to persist generated questions', { subjectId, error });
		return [];
	}
}

// ============================================================================
// 3. Pull From Past Papers
// ============================================================================

/**
 * Fetches supplementary questions from past paper archives for a given topic.
 */
export async function pullFromPastPapers(
	topic: string,
	limit = DEFAULT_PAST_PAPER_LIMIT
): Promise<PastPaperQuestionResult[]> {
	try {
		const db = await getDb();

		const results = await db
			.select({
				id: pastPaperQuestions.id,
				questionText: pastPaperQuestions.questionText,
				answerText: pastPaperQuestions.answerText,
				year: pastPaperQuestions.year,
				subject: pastPaperQuestions.subject,
				topic: pastPaperQuestions.topic,
				marks: pastPaperQuestions.marks,
				questionNumber: pastPaperQuestions.questionNumber,
			})
			.from(pastPaperQuestions)
			.where(buildPastPaperTopicFilter(topic))
			.orderBy(sql`${pastPaperQuestions.year} DESC`)
			.limit(limit);

		log.info('Pulled questions from past papers', { topic, count: results.length });

		return results;
	} catch (error) {
		log.error('Failed to pull from past papers', { topic, limit, error });
		return [];
	}
}

// ============================================================================
// 4. Enable Question Diversity Mode
// ============================================================================

const diversityModeStore = new Map<string, DiversityModeConfig>();

/**
 * Enables diversity mode for a user, which prevents repetition fatigue by
 * rotating question types, difficulties, and sources.
 */
export async function enableQuestionDiversityMode(userId: string): Promise<DiversityModeConfig> {
	const config: DiversityModeConfig = {
		userId,
		enabled: true,
		lastRotationDate: new Date(),
		preferredDifficulties: ['easy', 'medium', 'hard'],
		avoidRecentQuestions: true,
	};

	diversityModeStore.set(userId, config);

	log.info('Diversity mode enabled', { userId });
	return config;
}

/**
 * Disables diversity mode for a user.
 */
export async function disableQuestionDiversityMode(userId: string): Promise<void> {
	const existing = diversityModeStore.get(userId);
	if (existing) {
		existing.enabled = false;
		diversityModeStore.set(userId, existing);
		log.info('Diversity mode disabled', { userId });
	}
}

/**
 * Checks if diversity mode is enabled for a user.
 */
export function isDiversityModeEnabled(userId: string): boolean {
	const config = diversityModeStore.get(userId);
	return config?.enabled ?? false;
}

/**
 * Gets the diversity mode configuration for a user.
 */
export function getDiversityModeConfig(userId: string): DiversityModeConfig | null {
	return diversityModeStore.get(userId) ?? null;
}

// ============================================================================
// 5. Notify High Demand Topic
// ============================================================================

const topicDemandNotifications: TopicDemandNotification[] = [];

/**
 * Records a notification about a high-demand topic for the content team.
 */
export async function notifyHighDemandTopic(topic: string): Promise<TopicDemandNotification> {
	// Check current availability to determine demand level
	const availability = await checkQuestionAvailability(topic, 0);
	const demandLevel: 'high' | 'critical' = availability.totalQuestions < 5 ? 'critical' : 'high';

	const notification: TopicDemandNotification = {
		topic,
		demandLevel,
		questionsRequested: availability.totalQuestions,
		questionsAvailable: Math.max(0, EXHAUSTION_THRESHOLD - availability.totalQuestions),
		timestamp: new Date(),
	};

	topicDemandNotifications.push(notification);

	log.warn('High demand topic notification', {
		topic,
		demandLevel,
		questionsRequested: notification.questionsRequested,
	});

	return notification;
}

/**
 * Gets all recorded topic demand notifications.
 */
export function getTopicDemandNotifications(): TopicDemandNotification[] {
	return [...topicDemandNotifications];
}

/**
 * Clears all recorded topic demand notifications.
 */
export function clearTopicDemandNotifications(): void {
	topicDemandNotifications.length = 0;
}

// ============================================================================
// Auto-Exhaustion Handler
// ============================================================================

/**
 * Checks a topic and auto-triggers supplementary content if exhausted.
 * This is the main orchestration function that combines the individual
 * functions into a single workflow.
 */
export async function handleTopicExhaustion(
	topic: string,
	subjectId: number
): Promise<{
	availability: QuestionAvailability;
	generatedQuestions: GeneratedQuestion[];
	pastPaperQuestions: PastPaperQuestionResult[];
	notification: TopicDemandNotification | null;
}> {
	const availability = await checkQuestionAvailability(topic, subjectId);

	let generatedQuestions: GeneratedQuestion[] = [];
	let pastPaperQs: PastPaperQuestionResult[] = [];
	let notification: TopicDemandNotification | null = null;

	if (availability.isExhausted) {
		// Auto-trigger AI generation
		generatedQuestions = await generateSupplementaryQuestions(topic, DEFAULT_GENERATION_COUNT);

		// Pull from past papers as supplementary
		pastPaperQs = await pullFromPastPapers(topic, DEFAULT_PAST_PAPER_LIMIT);

		// Notify content team
		notification = await notifyHighDemandTopic(topic);

		log.info('Topic exhaustion handled', {
			topic,
			subjectId,
			generated: generatedQuestions.length,
			pastPapers: pastPaperQs.length,
		});
	}

	return {
		availability,
		generatedQuestions,
		pastPaperQuestions: pastPaperQs,
		notification,
	};
}
