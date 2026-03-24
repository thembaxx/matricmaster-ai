import { type NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-error-handler';
import { getAuth } from '@/lib/auth';
import { adjustStudyPlanForWeakTopics } from '@/lib/db/study-plan-actions';
import { detectWeakTopics, type QuizResultForAnalysis, type WeakTopic } from '@/lib/quiz-grader';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AdjustStudyPlanRequest {
	weakTopics?: WeakTopic[];
	quizId: string;
	quizResultForAnalysis?: QuizResultForAnalysis;
}

interface StudyPlanAdjustment {
	topicsPrioritized: string[];
	difficultyAdjustments: Array<{
		topic: string;
		newDifficulty: 'easier' | 'harder' | 'same';
		reason: string;
	}>;
	focusAreasUpdated: boolean;
	sessionsReordered: boolean;
}

interface AdjustStudyPlanResponse {
	success: boolean;
	adjustment?: StudyPlanAdjustment;
	message?: string;
	error?: string;
}

/**
 * POST /api/study-plan/adjust
 * Adjusts the user's study plan based on weak topics detected from quiz performance
 */
export async function POST(request: NextRequest): Promise<NextResponse<AdjustStudyPlanResponse>> {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
		}

		const body: AdjustStudyPlanRequest = await request.json();
		const { weakTopics: providedWeakTopics, quizResultForAnalysis } = body;

		// Detect weak topics from quiz result analysis if not provided directly
		let weakTopics = providedWeakTopics || [];

		if (weakTopics.length === 0 && quizResultForAnalysis) {
			weakTopics = detectWeakTopics(quizResultForAnalysis);
		}

		if (weakTopics.length === 0) {
			return NextResponse.json({
				success: true,
				weakTopics: [],
				adjustment: {
					topicsPrioritized: [],
					difficultyAdjustments: [],
					focusAreasUpdated: false,
					sessionsReordered: false,
				},
				message: 'No weak topics detected, study plan unchanged',
			});
		}

		// Adjust the study plan based on weak topics
		const result = await adjustStudyPlanForWeakTopics(session.user.id, weakTopics);

		if (!result.success) {
			return NextResponse.json(
				{ success: false, error: result.error || 'Failed to adjust study plan' },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			success: true,
			weakTopics,
			adjustment: result.adjustment,
			message: `Study plan adjusted for ${weakTopics.length} weak topic(s)`,
		});
	} catch (error) {
		console.error('[Study Plan Adjust API] Error:', error);
		return handleApiError(error);
	}
}
