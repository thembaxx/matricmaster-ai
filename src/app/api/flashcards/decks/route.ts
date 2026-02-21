import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { createFlashcardDeck, getUserDecks } from '@/lib/db/review-queue-actions';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const decks = await getUserDecks(session.user.id);
		return NextResponse.json({ decks });
	} catch (error) {
		console.error('[Decks API] Error:', error);
		return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 });
	}
}

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
		const { name, description, subjectId } = body;

		if (!name || name.trim().length === 0) {
			return NextResponse.json({ error: 'Deck name is required' }, { status: 400 });
		}

		const result = await createFlashcardDeck(session.user.id, name, description, subjectId);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json({ deck: result.deck });
	} catch (error) {
		console.error('[Decks API] Error:', error);
		return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 });
	}
}
