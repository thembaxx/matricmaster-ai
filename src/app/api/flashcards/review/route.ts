import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { recordFlashcardReview } from '@/lib/db/review-queue-actions';
import type { Rating } from '@/lib/spaced-repetition';

interface ReviewRequest {
	flashcardId: string;
	rating: Rating;
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

		const body: ReviewRequest = await request.json();
		const { flashcardId, rating } = body;

		if (!flashcardId || !rating) {
			return NextResponse.json({ error: 'Missing flashcardId or rating' }, { status: 400 });
		}

		const result = await recordFlashcardReview(session.user.id, flashcardId, rating);

		if (!result.success) {
			return NextResponse.json({ error: result.error || 'Failed to save review' }, { status: 500 });
		}

		return NextResponse.json({
			success: true,
			review: result.review,
		});
	} catch (error) {
		console.debug('[Review API] Error:', error);
		return NextResponse.json({ error: 'Failed to process review' }, { status: 500 });
	}
}
