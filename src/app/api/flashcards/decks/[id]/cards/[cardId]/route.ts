import { type NextRequest, NextResponse } from 'next/server';
import { deleteFlashcard } from '@/lib/db/review-queue-actions';

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
		console.error('[Card API] Error:', error);
		return NextResponse.json({ error: 'Failed to delete card' }, { status: 500 });
	}
}
