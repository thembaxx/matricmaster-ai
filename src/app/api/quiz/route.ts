import { NextResponse } from 'next/server';
import { QUESTIONS_DATA } from '@/content/questions';
import { QuizParamsSchema } from '@/lib/schemas/quiz-params';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const paramsResult = QuizParamsSchema.safeParse(Object.fromEntries(searchParams));

	if (!paramsResult.success) {
		return NextResponse.json(
			{ error: 'Invalid parameters', details: paramsResult.error.flatten() },
			{ status: 400 }
		);
	}

	const params = paramsResult.data;
	let quizzes = Object.entries(QUESTIONS_DATA).map(([id, quiz]) => ({
		id,
		title: quiz.title,
		subject: quiz.subject,
		questionCount: quiz.questions.length,
	}));

	if (params.subject) {
		quizzes = quizzes.filter((q) => q.subject === params.subject);
	}

	if (params.category) {
		quizzes = quizzes.filter((q) =>
			q.title.toLowerCase().includes(params.category?.toLowerCase() || '')
		);
	}

	const total = quizzes.length;
	const offset = params.offset ?? 0;
	const limit = params.limit ?? 10;
	const paginatedQuizzes = quizzes.slice(offset, offset + limit);

	return NextResponse.json({
		data: paginatedQuizzes,
		meta: {
			total,
			subject: params.subject,
			category: params.category,
			limit,
			offset,
		},
	});
}
