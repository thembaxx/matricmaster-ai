import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
	createFlashcardFromWrongAnswer,
	getQuizMistakeCards,
	getQuizMistakeStats,
	processQuizMistakes,
	type WrongAnswerData,
} from '@/services/wrongAnswerPipeline';

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
		const { action, wrongAnswers, wrongAnswer } = body;

		if (action === 'create') {
			if (!wrongAnswer) {
				return NextResponse.json({ error: 'wrongAnswer is required' }, { status: 400 });
			}

			const result = await createFlashcardFromWrongAnswer(wrongAnswer as WrongAnswerData);
			return NextResponse.json(result);
		}

		if (action === 'processAll') {
			if (!wrongAnswers || !Array.isArray(wrongAnswers)) {
				return NextResponse.json({ error: 'wrongAnswers array is required' }, { status: 400 });
			}

			const result = await processQuizMistakes(wrongAnswers as WrongAnswerData[]);
			return NextResponse.json(result);
		}

		return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.debug('[WrongAnswerPipeline API] Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while processing your request' },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const action = searchParams.get('action') || 'stats';
		const sortBy = searchParams.get('sortBy') || 'mostRecent';
		const deckId = searchParams.get('deckId') || undefined;

		if (action === 'stats') {
			const stats = await getQuizMistakeStats();
			return NextResponse.json(stats);
		}

		if (action === 'cards') {
			const cards = await getQuizMistakeCards(deckId, sortBy as 'mostRecent' | 'hardestFirst');
			return NextResponse.json({ cards });
		}

		return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.debug('[WrongAnswerPipeline API] Error:', error);
		return NextResponse.json(
			{ error: 'An error occurred while processing your request' },
			{ status: 500 }
		);
	}
}
