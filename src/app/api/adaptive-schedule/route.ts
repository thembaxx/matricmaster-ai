import { type NextRequest, NextResponse } from 'next/server';
import {
	addExtraPracticeForStruggling,
	detectStrugglingTopics,
	rescheduleMissedGoals,
} from '@/lib/adaptive-schedule';
import { getAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const rescheduleChanges = await rescheduleMissedGoals(session.user.id);
		const strugglingTopics = await detectStrugglingTopics(session.user.id);
		const extraPracticeAdded = await addExtraPracticeForStruggling(
			session.user.id,
			strugglingTopics
		);

		return NextResponse.json({
			rescheduledGoals: rescheduleChanges.length,
			extraPracticeAdded,
			strugglingTopics,
		});
	} catch (error) {
		console.debug('[Adaptive Schedule API] Error:', error);
		return NextResponse.json({ error: 'Failed to adapt schedule' }, { status: 500 });
	}
}
