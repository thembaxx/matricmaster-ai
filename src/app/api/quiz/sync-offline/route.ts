import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { quizResults, topicMastery, userProgress } from '@/lib/db/schema';
import { logger } from '@/lib/logger';
import { processGamificationEvent } from '@/services/unified-gamification';

const log = logger.createLogger('QuizSyncOffline');

interface SyncItem {
	id: string;
	type: 'answer' | 'completion';
	payload: {
		sessionId: string;
		quizId: string;
		answer?: {
			questionId: string;
			selectedOption: string;
			isCorrect: boolean;
			timeSpentMs: number;
			answeredAt: string;
		};
		subject?: string;
		totalQuestions?: number;
		score?: number;
		percentage?: number;
		timeTaken?: number;
		answers?: Array<{
			questionId: string;
			selectedOption: string;
			isCorrect: boolean;
			timeSpentMs: number;
			answeredAt: string;
		}>;
	};
	createdAt: string;
}

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;
		const item: SyncItem = await request.json();

		log.info('Processing offline sync item', {
			userId,
			itemId: item.id,
			type: item.type,
			sessionId: item.payload.sessionId,
		});

		if (!item.id || !item.type || !item.payload) {
			return NextResponse.json({ error: 'Invalid sync item structure' }, { status: 400 });
		}

		const pgDb = dbManagerV2.getPgDb();
		if (!pgDb) {
			log.warn('PostgreSQL not available, queueing for later sync');
			return NextResponse.json(
				{
					success: false,
					error: 'Database temporarily unavailable',
					queueForLater: true,
				},
				{ status: 503 }
			);
		}

		if (item.type === 'completion') {
			const result = await syncQuizCompletion(userId, item);
			return NextResponse.json(result);
		}

		if (item.type === 'answer') {
			const result = await syncQuizAnswer(userId, item);
			return NextResponse.json(result);
		}

		return NextResponse.json({ error: 'Unknown sync item type' }, { status: 400 });
	} catch (error) {
		log.error('Failed to process offline sync', { error });
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

async function syncQuizCompletion(
	userId: string,
	item: SyncItem
): Promise<{
	success: boolean;
	conflict?: boolean;
	remoteData?: unknown;
}> {
	const { payload } = item;

	log.info('Syncing quiz completion', {
		userId,
		sessionId: payload.sessionId,
		quizId: payload.quizId,
	});

	try {
		const existingResult = await checkExistingQuizResult(userId, payload.quizId, payload.sessionId);

		if (existingResult) {
			const remoteTime = new Date(
				(existingResult.lastUpdatedAt as string | number | Date | null) ||
					(existingResult.createdAt as string | number | Date)
			);
			const localTime = new Date(payload.answers?.[0]?.answeredAt || item.createdAt);

			if (Math.abs(remoteTime.getTime() - localTime.getTime()) > 5000) {
				log.info('Conflict detected for quiz completion', {
					userId,
					sessionId: payload.sessionId,
					localTime: localTime.toISOString(),
					remoteTime: remoteTime.toISOString(),
				});

				return {
					success: false,
					conflict: true,
					remoteData: existingResult,
				};
			}
		}

		await saveQuizResult(userId, item);

		if (payload.answers) {
			await processGamificationEvent({
				userId,
				type: 'quiz_complete',
				metadata: {
					score: payload.score,
					totalQuestions: payload.totalQuestions,
					percentage: payload.percentage,
					subject: payload.subject,
					isOfflineSync: true,
				},
			});
		}

		return { success: true };
	} catch (error) {
		log.error('Failed to sync quiz completion', { error, userId, sessionId: payload.sessionId });
		throw error;
	}
}

async function syncQuizAnswer(
	userId: string,
	item: SyncItem
): Promise<{
	success: boolean;
	conflict?: boolean;
	remoteData?: unknown;
}> {
	const { payload } = item;

	log.info('Syncing quiz answer', {
		userId,
		sessionId: payload.sessionId,
		questionId: payload.answer?.questionId,
	});

	try {
		await saveQuizProgress(userId, item);
		return { success: true };
	} catch (error) {
		log.error('Failed to sync quiz answer', { error, userId, sessionId: payload.sessionId });
		throw error;
	}
}

async function checkExistingQuizResult(
	userId: string,
	quizId: string,
	_sessionId: string
): Promise<Record<string, unknown> | null> {
	const pgDb = dbManagerV2.getPgDb();
	if (!pgDb) return null;

	try {
		const result = await pgDb.query.quizResults.findFirst({
			where: (fields, { and, eq }) => and(eq(fields.userId, userId), eq(fields.quizId, quizId)),
		});

		return result || null;
	} catch (error) {
		log.warn('Failed to check existing quiz result', { error });
		return null;
	}
}

async function saveQuizResult(userId: string, item: SyncItem): Promise<void> {
	const pgDb = dbManagerV2.getPgDb();
	if (!pgDb) throw new Error('PostgreSQL not available');

	const { payload } = item;
	const { sessionId, quizId, subject, totalQuestions, score, percentage, timeTaken, answers } =
		payload;

	log.info('Persisting quiz result to database', {
		userId,
		quizId,
		sessionId,
		score,
		totalQuestions,
		percentage,
	});

	await pgDb.insert(quizResults).values({
		userId,
		quizId: quizId || '',
		score: score ?? 0,
		totalQuestions: totalQuestions ?? 0,
		percentage: percentage?.toString() ?? '0',
		timeTaken: timeTaken ?? 0,
		questionResults: answers ? JSON.stringify(answers) : null,
		completedAt: new Date(),
	});

	const correctCount = answers?.filter((a) => a.isCorrect).length ?? 0;
	const attemptedCount = answers?.length ?? 0;

	const existingProgress = await pgDb.query.userProgress.findFirst({
		where: (fields, { eq }) => eq(fields.userId, userId),
	});

	if (existingProgress) {
		await pgDb
			.update(userProgress)
			.set({
				totalQuestionsAttempted: (existingProgress.totalQuestionsAttempted ?? 0) + attemptedCount,
				totalCorrect: (existingProgress.totalCorrect ?? 0) + correctCount,
				lastActivityAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(userProgress.id, existingProgress.id));
	} else {
		await pgDb.insert(userProgress).values({
			userId,
			totalQuestionsAttempted: attemptedCount,
			totalCorrect: correctCount,
			lastActivityAt: new Date(),
		});
	}

	if (answers && subject) {
		for (const answer of answers) {
			const existingMastery = await pgDb.query.topicMastery.findFirst({
				where: (fields, { and, eq }) =>
					and(eq(fields.userId, userId), eq(fields.topic, answer.questionId)),
			});

			if (existingMastery) {
				const masteryDelta = answer.isCorrect ? 0.05 : -0.05;
				const newMastery = Math.max(
					0,
					Math.min(1, Number(existingMastery.masteryLevel) + masteryDelta)
				);
				await pgDb
					.update(topicMastery)
					.set({
						masteryLevel: newMastery.toString(),
						questionsAttempted: (existingMastery.questionsAttempted ?? 0) + 1,
						questionsCorrect: (existingMastery.questionsCorrect ?? 0) + (answer.isCorrect ? 1 : 0),
						consecutiveCorrect: answer.isCorrect
							? (existingMastery.consecutiveCorrect ?? 0) + 1
							: 0,
						lastPracticed: new Date(),
						updatedAt: new Date(),
					})
					.where(eq(topicMastery.id, existingMastery.id));
			} else {
				await pgDb.insert(topicMastery).values({
					userId,
					subjectId: 1,
					topic: answer.questionId,
					masteryLevel: answer.isCorrect ? '0.05' : '0',
					questionsAttempted: 1,
					questionsCorrect: answer.isCorrect ? 1 : 0,
					consecutiveCorrect: answer.isCorrect ? 1 : 0,
					lastPracticed: new Date(),
				});
			}
		}
	}

	log.info('Quiz result and related data persisted successfully', {
		userId,
		quizId,
		sessionId,
	});
}

async function saveQuizProgress(userId: string, item: SyncItem): Promise<void> {
	const pgDb = dbManagerV2.getPgDb();
	if (!pgDb) throw new Error('PostgreSQL not available');

	const { payload } = item;
	const { sessionId, quizId, answer } = payload;

	if (!answer) {
		log.warn('No answer data in sync item', { userId, sessionId });
		return;
	}

	const { questionId, selectedOption, isCorrect, timeSpentMs, answeredAt } = answer;

	log.info('Persisting quiz answer progress', {
		userId,
		sessionId,
		questionId,
		isCorrect,
	});

	const existingResult = await pgDb.query.quizResults.findFirst({
		where: (fields, { and, eq }) => and(eq(fields.userId, userId), eq(fields.quizId, quizId || '')),
	});

	if (existingResult) {
		const existingAnswers: Array<{
			questionId: string;
			selectedOption: string;
			isCorrect: boolean;
			timeSpentMs: number;
			answeredAt: string;
		}> = existingResult.questionResults ? JSON.parse(existingResult.questionResults) : [];

		const existingIndex = existingAnswers.findIndex((a) => a.questionId === questionId);
		if (existingIndex >= 0) {
			existingAnswers[existingIndex] = {
				questionId,
				selectedOption,
				isCorrect,
				timeSpentMs,
				answeredAt,
			};
		} else {
			existingAnswers.push({
				questionId,
				selectedOption,
				isCorrect,
				timeSpentMs,
				answeredAt,
			});
		}

		const correctCount = existingAnswers.filter((a) => a.isCorrect).length;

		await pgDb
			.update(quizResults)
			.set({
				questionResults: JSON.stringify(existingAnswers),
				score: correctCount,
				totalQuestions: existingAnswers.length,
				percentage:
					existingAnswers.length > 0
						? ((correctCount / existingAnswers.length) * 100).toFixed(2)
						: '0',
			})
			.where(eq(quizResults.id, existingResult.id));

		await pgDb
			.update(userProgress)
			.set({
				totalQuestionsAttempted:
					(existingResult.totalQuestions ?? 0) + 1 - (existingIndex >= 0 ? 1 : 0),
				totalCorrect:
					existingResult.score +
					(isCorrect ? 1 : 0) -
					(existingIndex >= 0 ? (existingAnswers[existingIndex]?.isCorrect ? 1 : 0) : 0),
				lastActivityAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(userProgress.id, existingResult.id));
	} else {
		const answersArray = [
			{
				questionId,
				selectedOption,
				isCorrect,
				timeSpentMs,
				answeredAt,
			},
		];

		await pgDb.insert(quizResults).values({
			userId,
			quizId: quizId || '',
			score: isCorrect ? 1 : 0,
			totalQuestions: 1,
			percentage: isCorrect ? '100' : '0',
			timeTaken: timeSpentMs,
			questionResults: JSON.stringify(answersArray),
			completedAt: new Date(answeredAt),
		});
	}

	log.info('Quiz answer progress persisted successfully', {
		userId,
		sessionId,
		questionId,
	});
}
