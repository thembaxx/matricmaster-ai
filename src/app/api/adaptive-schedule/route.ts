import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { analyzeAndAdjust } from '@/services/adaptiveScheduler';

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const adjustments = await analyzeAndAdjust(session.user.id);

		const rescheduledGoals = adjustments.filter((a) => a.type === 'reschedule').length;
		const extraPracticeAdded = adjustments.filter((a) => a.type === 'extra_practice').length;

		const messageParts: string[] = [];
		if (rescheduledGoals > 0) {
			messageParts.push(`${rescheduledGoals} missed goal(s) rescheduled`);
		}
		if (extraPracticeAdded > 0) {
			messageParts.push(`${extraPracticeAdded} extra practice session(s) added`);
		}

		return NextResponse.json({
			adjustments,
			rescheduledGoals,
			extraPracticeAdded,
			message:
				messageParts.length > 0 ? `${messageParts.join('. ')}.` : 'Your schedule is up to date',
		});
	} catch (error) {
		console.debug('[Adaptive Schedule API] Error:', error);
		return NextResponse.json({ error: 'Failed to adapt schedule' }, { status: 500 });
	}
}
