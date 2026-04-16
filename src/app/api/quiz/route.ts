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
		topic: quiz.topic,
		questionCount: quiz.questions.length,
	}));

	if (params.subject) {
		quizzes = quizzes.filter((q) => q.subject === params.subject);
	}

	if (params.category) {
		quizzes = quizzes.filter((q) =>
			q.topic?.toLowerCase() === params.category?.toLowerCase() ||
			q.title.toLowerCase().includes(params.category?.toLowerCase() || '')
		);
	}

	const total = quizzes.length;
	const paginatedQuizzes = quizzes.slice(params.offset, params.offset + params.limit);

	return NextResponse.json({
		data: paginatedQuizzes,
		meta: {
			total,
			subject: params.subject,
			category: params.category,
			limit: params.limit,
			offset: params.offset,
		},
	});
}
