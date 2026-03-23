import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuth } from '@/lib/auth';
import {
	getGlobalProgress,
	trackFlashcardReview,
	trackLessonCompletion,
	trackPastPaperAttempt,
	trackQuizAttempt,
} from '@/services/progressService';

const trackLessonSchema = z.object({
	action: z.literal('trackLesson'),
	lessonId: z.string(),
	subjectId: z.coerce.number(),
	topic: z.string().optional(),
});

const trackQuizSchema = z.object({
	action: z.literal('trackQuiz'),
	quizId: z.string(),
	subjectId: z.coerce.number(),
	topic: z.string().optional(),
	score: z.number().min(0),
	totalQuestions: z.number().positive(),
	marksEarned: z.number().min(0),
	durationMinutes: z.number().optional().default(0),
});

const trackPastPaperSchema = z.object({
	action: z.literal('trackPastPaper'),
	paperId: z.string(),
	subjectId: z.coerce.number(),
	questionsAttempted: z.number().positive(),
	score: z.number().min(0),
	durationMinutes: z.number().optional().default(0),
});

const trackFlashcardSchema = z.object({
	action: z.literal('trackFlashcard'),
	flashcardId: z.string(),
	rating: z.number().min(1).max(5),
});

const progressActionSchema = z.discriminatedUnion('action', [
	trackLessonSchema,
	trackQuizSchema,
	trackPastPaperSchema,
	trackFlashcardSchema,
]);

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

		const validation = progressActionSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Validation failed', details: validation.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}

		switch (validation.data.action) {
			case 'trackLesson': {
				const result = await trackLessonCompletion(
					validation.data.lessonId,
					validation.data.subjectId,
					validation.data.topic || 'general'
				);
				return NextResponse.json(result);
			}

			case 'trackQuiz': {
				const result = await trackQuizAttempt(
					validation.data.quizId,
					validation.data.subjectId,
					validation.data.topic || 'general',
					validation.data.score,
					validation.data.totalQuestions,
					validation.data.marksEarned,
					validation.data.durationMinutes
				);
				return NextResponse.json(result);
			}

			case 'trackPastPaper': {
				const result = await trackPastPaperAttempt(
					validation.data.paperId,
					validation.data.subjectId,
					validation.data.questionsAttempted,
					validation.data.score,
					validation.data.durationMinutes
				);
				return NextResponse.json(result);
			}

			case 'trackFlashcard': {
				const result = await trackFlashcardReview(
					validation.data.flashcardId,
					validation.data.rating
				);
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
