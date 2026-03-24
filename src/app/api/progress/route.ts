import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error-handler';
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
			return NextResponse.json({ error: 'unauthorized', success: false }, { status: 401 });
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
				success: true,
			});
		}

		return NextResponse.json({ ...progress, success: true });
	} catch (error) {
		return handleApiError(error);
	}
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'unauthorized', success: false }, { status: 401 });
		}

		const body = await request.json();
		const validation = progressActionSchema.parse(body);

		switch (validation.action) {
			case 'trackLesson': {
				const result = await trackLessonCompletion(
					validation.lessonId,
					validation.subjectId,
					validation.topic || 'general'
				);
				return NextResponse.json({ ...result, success: true });
			}

			case 'trackQuiz': {
				const result = await trackQuizAttempt(
					validation.quizId,
					validation.subjectId,
					validation.topic || 'general',
					validation.score,
					validation.totalQuestions,
					validation.marksEarned,
					validation.durationMinutes
				);
				return NextResponse.json({ ...result, success: true });
			}

			case 'trackPastPaper': {
				const result = await trackPastPaperAttempt(
					validation.paperId,
					validation.subjectId,
					validation.questionsAttempted,
					validation.score,
					validation.durationMinutes
				);
				return NextResponse.json({ ...result, success: true });
			}

			case 'trackFlashcard': {
				const result = await trackFlashcardReview(validation.flashcardId, validation.rating);
				return NextResponse.json({ ...result, success: true });
			}

			default:
				return NextResponse.json({ error: 'invalid action', success: false }, { status: 400 });
		}
	} catch (error) {
		return handleApiError(error);
	}
}
