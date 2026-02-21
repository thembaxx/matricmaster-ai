import { type NextRequest, NextResponse } from 'next/server';
import { addFlashcardToDeck } from '@/lib/db/review-queue-actions';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: deckId } = await params;
		const body = await request.json();
		const { front, back, difficulty } = body;

		if (!front || !back) {
			return NextResponse.json({ error: 'Front and back are required' }, { status: 400 });
		}

		const result = await addFlashcardToDeck(deckId, front, back, difficulty || 'medium');

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({ flashcard: result.flashcard });
	} catch (error) {
		console.error('[Cards API] Error:', error);
		return NextResponse.json({ error: 'Failed to add card' }, { status: 500 });
	}
}
