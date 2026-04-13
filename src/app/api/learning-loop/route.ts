import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
	analyzePerformanceTrends,
	executeLearningLoop,
	generateRecommendations,
	getCurrentState,
} from '@/services/learning-loop-service';

/**
 * POST /api/learning-loop/execute
 * Trigger the AI→Study Plan→Quiz feedback loop
 */
export async function POST(_request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const result = await executeLearningLoop(session.user.id);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		console.error('Learning loop execution error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to execute learning loop' },
			{ status: 500 }
		);
	}
}

/**
 * GET /api/learning-loop/state
 * Get current learning state
 */
export async function GET(_request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const state = await getCurrentState(session.user.id);
		const trends = await analyzePerformanceTrends(session.user.id);
		const recommendations = generateRecommendations(state, trends, state.weakTopics);

		return NextResponse.json({
			success: true,
			data: {
				state,
				trends,
				recommendations,
			},
		});
	} catch (error) {
		console.error('Learning loop state error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to get learning state' },
			{ status: 500 }
		);
	}
}
