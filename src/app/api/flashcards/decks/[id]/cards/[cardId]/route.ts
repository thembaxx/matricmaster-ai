import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteFlashcard, updateFlashcard } from '@/lib/db/review-queue-actions';

const updateSchema = z.object({
	front: z.string().min(1).max(500).optional(),
	back: z.string().min(1).max(2000).optional(),
	difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; cardId: string }> }
) {
	try {
		const { id: deckId, cardId } = await params;
		const body = await request.json();
		const validation = updateSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Validation failed', details: validation.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}

		const result = await updateFlashcard(cardId, deckId, validation.data);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({ success: true, flashcard: result.flashcard });
	} catch (error) {
		console.debug('[Card API] Error:', error);
		return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
	}
}

export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string; cardId: string }> }
) {
	try {
		const { id: deckId, cardId } = await params;

		const result = await deleteFlashcard(cardId, deckId);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.debug('[Card API] Error:', error);
		return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
	}
}
