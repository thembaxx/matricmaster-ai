'use server';

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';

const statsQuerySchema = z.object({
	paperId: z.string().min(1),
	questionIds: z.array(z.string()).optional(),
});

interface QuestionPerformance {
	questionId: string;
	attempts: number;
	correctCount: number;
	averageTime: number;
	lastAttempted: Date;
	difficultyAdjusted: number;
}

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers as never });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const paperId = searchParams.get('paperId');

		if (!paperId) {
			return NextResponse.json({ error: 'Missing required parameter: paperId' }, { status: 400 });
		}

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return NextResponse.json({ error: 'Database not available' }, { status: 503 });
		}

		// Get question performance stats from database
		// This would typically query a quiz_attempts or question_performance table
		const stats = await getQuestionPerformanceStats(session.user.id, paperId);

		return NextResponse.json({
			success: true,
			stats,
		});
	} catch (error) {
		console.error('[QuizPastPaperStats] GET error:', error);
		return NextResponse.json(
			{ error: 'Failed to get question performance stats' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers as never });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const parsed = statsQuerySchema.parse(body);
		const { paperId, questionIds } = parsed;

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return NextResponse.json({ error: 'Database not available' }, { status: 503 });
		}

		// Update question performance based on quiz results
		const updatedStats = await updateQuestionPerformance(
			session.user.id,
			paperId,
			questionIds || []
		);

		return NextResponse.json({
			success: true,
			updatedStats,
		});
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
		}
		console.error('[QuizPastPaperStats] POST error:', error);
		return NextResponse.json(
			{ error: 'Failed to update question performance stats' },
			{ status: 500 }
		);
	}
}

async function getQuestionPerformanceStats(
	_userId: string,
	_paperId: string
): Promise<QuestionPerformance[]> {
	// Placeholder - in production this would query the database
	// Example: SELECT question_id, COUNT(*) as attempts, AVG(correct) as accuracy, etc.
	// FROM quiz_attempts WHERE user_id = ? AND paper_id = ? GROUP BY question_id

	return [];
}

async function updateQuestionPerformance(
	_userId: string,
	_paperId: string,
	_questionIds: string[]
): Promise<QuestionPerformance[]> {
	// Placeholder - in production this would update the database
	// Example: INSERT INTO question_performance (user_id, question_id, attempts, correct, time_taken)
	// ON CONFLICT UPDATE attempts = attempts + 1, etc.

	return [];
}
