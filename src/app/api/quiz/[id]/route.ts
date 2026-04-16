import { NextResponse } from 'next/server';
import { QUESTIONS_DATA } from '@/content/questions';

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	const quiz = QUESTIONS_DATA[params.id];

	if (!quiz) {
		return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
	}

	return NextResponse.json(quiz);
}
