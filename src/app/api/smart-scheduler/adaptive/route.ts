import { NextResponse } from 'next/server';
import {
	addExtraPracticeForStruggling,
	detectMissedGoals,
	detectStrugglingTopics,
	rescheduleMissedGoals,
} from '@/lib/adaptive-schedule';
import { getAuth } from '@/lib/auth';

export async function POST() {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession();
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const userId = session.user.id;

		const missedGoals = await detectMissedGoals(userId);
		const strugglingTopics = await detectStrugglingTopics(userId);

		const rescheduled = await rescheduleMissedGoals(userId);
		let extraPracticeCount = 0;
		if (strugglingTopics.length > 0) {
			extraPracticeCount = await addExtraPracticeForStruggling(userId, strugglingTopics);
		}

		const newSuggestions = [];
		if (missedGoals.length > 0) {
			newSuggestions.push({
				id: crypto.randomUUID(),
				type: 'reschedule' as const,
				block: { id: missedGoals[0] },
				reason: `${missedGoals.length} missed goal(s) have been rescheduled`,
				confidence: 0.95,
			});
		}

		if (strugglingTopics.length > 0) {
			newSuggestions.push({
				id: crypto.randomUUID(),
				type: 'add' as const,
				block: { topic: strugglingTopics[0] },
				reason: `Extra practice added for struggling topics: ${strugglingTopics.slice(0, 3).join(', ')}`,
				confidence: 0.85,
			});
		}

		return NextResponse.json({
			success: true,
			missedGoalsRescheduled: rescheduled.length,
			extraPracticeAdded: extraPracticeCount,
			newSuggestions,
		});
	} catch (error) {
		console.error('Error in adaptive schedule check:', error);
		return NextResponse.json({ error: 'Failed to check adaptive schedule' }, { status: 500 });
	}
}
