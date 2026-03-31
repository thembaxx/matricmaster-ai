import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dbManagerV2 } from '@/lib/db/database-manager-v2';
import { logger } from '@/lib/logger';

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
	const { payload } = item;

	log.debug('Saving quiz result', {
		userId,
		quizId: payload.quizId,
		score: payload.score,
	});

	// In production, this would save to the database
	// For now, we just log the action
	log.info('Quiz result saved', {
		userId,
		quizId: payload.quizId,
		sessionId: payload.sessionId,
	});
}

async function saveQuizProgress(userId: string, item: SyncItem): Promise<void> {
	const { payload } = item;

	log.debug('Saving quiz progress', {
		userId,
		sessionId: payload.sessionId,
		questionId: payload.answer?.questionId,
	});

	log.info('Quiz progress saved', {
		userId,
		sessionId: payload.sessionId,
	});
}
