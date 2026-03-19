import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getStudyStats } from '@/services/progressService';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const stats = await getStudyStats(session.user.id);

		if (!stats) {
			return NextResponse.json({
				totalStudyTimeMinutes: 0,
				avgSessionLength: 0,
				questionsPerDay: 0,
				correctRate: 0,
				strongestTopic: null,
				weakestTopic: null,
				totalFlashcardsReviewed: 0,
				avgFlashcardEase: 2.5,
				papersAttempted: 0,
				avgPaperScore: 0,
				weeklyTrend: 'stable',
				streakDays: 0,
				bestStreak: 0,
			});
		}

		return NextResponse.json(stats);
	} catch (error) {
		console.error('Error in GET /api/progress/stats:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
