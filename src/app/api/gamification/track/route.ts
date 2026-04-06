import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { processGamificationAction } from '@/services/unified-gamification';

interface GamificationRequest {
	type:
		| 'flashcard_review'
		| 'quiz_complete'
		| 'study_session'
		| 'perfect_score'
		| 'buddy_session'
		| 'past_paper_complete'
		| 'ai_tutor_session'
		| 'focus_room'
		| 'mistake_resolution'
		| 'streak_milestone';
	metadata: Record<string, unknown>;
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

		const body: GamificationRequest = await request.json();
		const { type, metadata } = body;

		if (!type) {
			return NextResponse.json({ error: 'Missing type' }, { status: 400 });
		}

		const result = await processGamificationAction(type, {
			userId: session.user.id,
			...metadata,
		});

		return NextResponse.json(result);
	} catch (error) {
		console.debug('[Gamification API] Error:', error);
		return NextResponse.json({ error: 'Failed to process gamification' }, { status: 500 });
	}
}
