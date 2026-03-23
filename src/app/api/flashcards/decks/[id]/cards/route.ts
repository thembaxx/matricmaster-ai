import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { addFlashcardToDeck } from '@/lib/db/review-queue-actions';

const addCardSchema = z.object({
	front: z.string().min(1, 'Front text is required'),
	back: z.string().min(1, 'Back text is required'),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: deckId } = await params;
		const body = await request.json();

		const validation = addCardSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Validation failed', details: validation.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}

		const { front, back, difficulty } = validation.data;

		const result = await addFlashcardToDeck(deckId, front, back, difficulty || 'medium');

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({ flashcard: result.flashcard });
	} catch (error) {
		console.debug('[Cards API] Error:', error);
		return NextResponse.json({ error: 'Failed to add card' }, { status: 500 });
	}
}
