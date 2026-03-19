import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
	getGlobalProgress,
	trackFlashcardReview,
	trackLessonCompletion,
	trackPastPaperAttempt,
	trackQuizAttempt,
} from '@/services/progressService';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const progress = await getGlobalProgress(session.user.id);

		if (!progress) {
			return NextResponse.json({
				flashcardsDue: 0,
				weakTopicsCount: 0,
				accuracy: 0,
				streakDays: 0,
				totalMarksEarned: 0,
				totalQuestionsAttempted: 0,
				weeklyPoints: 0,
				monthlyRank: null,
				subjectProgress: [],
			});
		}

		return NextResponse.json(progress);
	} catch (error) {
		console.error('Error in GET /api/progress:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { action, ...data } = body;

		switch (action) {
			case 'trackLesson': {
				const result = await trackLessonCompletion(data.lessonId, data.subjectId, data.topic);
				return NextResponse.json(result);
			}

			case 'trackQuiz': {
				const result = await trackQuizAttempt(
					data.quizId,
					data.subjectId,
					data.topic,
					data.score,
					data.totalQuestions,
					data.marksEarned,
					data.durationMinutes
				);
				return NextResponse.json(result);
			}

			case 'trackPastPaper': {
				const result = await trackPastPaperAttempt(
					data.paperId,
					data.subjectId,
					data.questionsAttempted,
					data.score,
					data.durationMinutes
				);
				return NextResponse.json(result);
			}

			case 'trackFlashcard': {
				const result = await trackFlashcardReview(data.flashcardId, data.rating);
				return NextResponse.json(result);
			}

			default:
				return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
		}
	} catch (error) {
		console.error('Error in POST /api/progress:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
