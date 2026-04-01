import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { processGamificationEvent } from '@/services/unified-gamification';

export async function POST(request: NextRequest) {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

	const body = await request.json();
	const { reviews } = body as {
		reviews: Array<{ deckId: string; cardId: string; wasCorrect: boolean; timestamp: number }>;
	};

	let xpEarned = 0;
	for (const review of reviews) {
		const result = await processGamificationEvent({
			userId: session.user.id,
			type: 'flashcard_review',
			metadata: { deckId: review.deckId, wasCorrect: review.wasCorrect },
		});
		xpEarned += result.xpEarned;
	}

	return NextResponse.json({ success: true, xpEarned });
}
