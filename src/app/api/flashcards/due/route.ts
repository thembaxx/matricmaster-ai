import { and, eq, gte } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { dbManager } from '@/lib/db';
import { getDueFlashcards } from '@/lib/db/review-queue-actions';
import { flashcardReviews } from '@/lib/db/schema';

const MAX_DAILY_REVIEWS = 50;

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;
		const db = await dbManager.getDb();

		// Get today's review count
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const todayReviews = await db.query.flashcardReviews.findMany({
			where: and(eq(flashcardReviews.userId, userId), gte(flashcardReviews.reviewedAt, today)),
		});

		const reviewsToday = todayReviews.length;
		const hasReachedDailyCap = reviewsToday >= MAX_DAILY_REVIEWS;

		// Get due cards (still fetch for showing what's coming)
		const cards = await getDueFlashcards(userId);

		return NextResponse.json({
			cards: hasReachedDailyCap ? [] : cards.slice(0, MAX_DAILY_REVIEWS - reviewsToday),
			stats: {
				reviewsToday,
				maxPerDay: MAX_DAILY_REVIEWS,
				hasReachedDailyCap,
				remaining: Math.max(0, MAX_DAILY_REVIEWS - reviewsToday),
			},
		});
	} catch (error) {
		console.debug('[Due Cards API] Error:', error);
		return NextResponse.json({ error: 'Failed to fetch due cards' }, { status: 500 });
	}
}
