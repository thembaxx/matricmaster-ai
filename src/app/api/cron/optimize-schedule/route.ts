import { type NextRequest, NextResponse } from 'next/server';
import { optimizeStudyScheduleForEnergy } from '@/lib/services/energyAwareScheduler';

export async function GET(request: NextRequest) {
	const authHeader = request.headers.get('authorization');
	const cronSecret = process.env.CRON_SECRET;

	if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);
	const userId = searchParams.get('userId');

	if (!userId) {
		return NextResponse.json({ error: 'userId required' }, { status: 400 });
	}

	try {
		const result = await optimizeStudyScheduleForEnergy(userId, {
			daysAhead: 7,
			minEnergyImprovement: 15,
		});

		return NextResponse.json({
			success: true,
			optimized: result.optimized.length,
			details: result.optimized,
			errors: result.errors,
		});
	} catch (error) {
		console.error('Schedule optimization error:', error);
		return NextResponse.json({ error: 'Optimization failed' }, { status: 500 });
	}
}
