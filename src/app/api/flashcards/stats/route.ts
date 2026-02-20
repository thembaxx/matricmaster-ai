import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getReviewStats } from '@/lib/db/review-queue-actions';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await getReviewStats(session.user.id);

		return NextResponse.json(stats);
	} catch (error) {
		console.error('[Review Stats API] Error:', error);
		return NextResponse.json({ error: 'Failed to fetch review stats' }, { status: 500 });
	}
}
