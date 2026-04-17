import { NextResponse } from 'next/server';
import { QUESTIONS_DATA } from '@/content/questions';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const body = await request.json();
	const { questionId, answer } = body;

	const quiz = QUESTIONS_DATA[id];
	if (!quiz) {
		return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
	}

	const question = quiz.questions.find((q) => q.id === questionId);
	if (!question) {
		return NextResponse.json({ error: 'Question not found' }, { status: 404 });
	}

	// Basic validation logic
	let isCorrect = false;
	if ('correctAnswer' in question) {
		isCorrect = question.correctAnswer === answer;
	}

	return NextResponse.json({
		isCorrect,
		feedback: isCorrect ? 'Correct!' : 'Try again.',
	});
}
