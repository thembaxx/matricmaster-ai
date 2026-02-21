import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
	deleteFlashcardDeck,
	getDeckFlashcards,
	updateFlashcardDeck,
} from '@/lib/db/review-queue-actions';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const flashcards = await getDeckFlashcards(id);
		return NextResponse.json({ flashcards });
	} catch (error) {
		console.error('[Deck API] Error:', error);
		return NextResponse.json({ error: 'Failed to fetch deck' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();

		const result = await updateFlashcardDeck(id, session.user.id, body);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({ deck: result.deck });
	} catch (error) {
		console.error('[Deck API] Error:', error);
		return NextResponse.json({ error: 'Failed to update deck' }, { status: 500 });
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id } = await params;
		const result = await deleteFlashcardDeck(id, session.user.id);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('[Deck API] Error:', error);
		return NextResponse.json({ error: 'Failed to delete deck' }, { status: 500 });
	}
}
