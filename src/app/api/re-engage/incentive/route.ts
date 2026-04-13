import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { grantReturnIncentive } from '@/services/re-engagement-service';

/**
 * POST /api/re-engage/incentive
 * Grant return incentive when user logs in after inactivity
 */
export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const sessionAuth = await auth.api.getSession({
			headers: await headers(),
		});

		if (!sessionAuth) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { daysInactive } = body;

		if (!daysInactive || typeof daysInactive !== 'number') {
			return NextResponse.json(
				{ error: 'daysInactive is required and must be a number' },
				{ status: 400 }
			);
		}

		const incentive = await grantReturnIncentive(sessionAuth.user.id, daysInactive);

		return NextResponse.json({
			success: true,
			data: incentive,
		});
	} catch (error) {
		console.error('Re-engagement incentive error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to grant incentive' },
			{ status: 500 }
		);
	}
}
