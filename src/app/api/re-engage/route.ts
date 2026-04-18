import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth, type SessionUser } from '@/lib/auth';
import { detectInactiveUsers, executeReEngagementCampaign } from '@/services/re-engagement-service';

/**
 * POST /api/re-engage/trigger
 * Manually trigger re-engagement campaign (admin only)
 */
export async function POST(_request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Check admin/moderator role
		const user = session.user as SessionUser;
		if (user.role !== 'admin' && user.role !== 'moderator') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		const result = await executeReEngagementCampaign();

		return NextResponse.json({
			success: true,
			data: {
				usersReEngaged: result.length,
				results: result,
			},
		});
	} catch (error) {
		console.error('Re-engagement trigger error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to trigger re-engagement' },
			{ status: 500 }
		);
	}
}

/**
 * GET /api/re-engage/status
 * Get count of inactive users by tier
 */
export async function GET(_request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const inactiveUsers = await detectInactiveUsers();

		const byTier = {
			short: inactiveUsers.filter((u) => u.inactivityTier === 'short').length,
			medium: inactiveUsers.filter((u) => u.inactivityTier === 'medium').length,
			long: inactiveUsers.filter((u) => u.inactivityTier === 'long').length,
			critical: inactiveUsers.filter((u) => u.inactivityTier === 'critical').length,
		};

		return NextResponse.json({
			success: true,
			data: {
				total: inactiveUsers.length,
				byTier,
			},
		});
	} catch (error) {
		console.error('Re-engagement status error:', error);
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to get re-engagement status' },
			{ status: 500 }
		);
	}
}
