import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getDueFlashcards } from '@/lib/db/review-queue-actions';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const cards = await getDueFlashcards(session.user.id);

		return NextResponse.json({ cards });
	} catch (error) {
		console.debug('[Due Cards API] Error:', error);
		return NextResponse.json({ error: 'Failed to fetch due cards' }, { status: 500 });
	}
}
