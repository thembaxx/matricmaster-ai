import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { requireAuth } from '@/lib/server-auth';
import {
	claimChallengeReward,
	getTodayChallenges,
	updateChallengeProgress,
} from '@/services/dailyChallenges';

export async function GET() {
	await requireAuth();
	try {
		const challenges = await getTodayChallenges();
		return NextResponse.json({ challenges });
	} catch (error) {
		console.debug('[API/daily-challenges] GET error:', error);
		return NextResponse.json({ challenges: [] });
	}
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { challengeType, progressDelta } = body;

		if (!challengeType || typeof progressDelta !== 'number') {
			return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
		}

		const updated = await updateChallengeProgress(session.user.id, challengeType, progressDelta);
		return NextResponse.json({ challenges: updated });
	} catch (error) {
		console.debug('[API/daily-challenges] POST error:', error);
		return NextResponse.json({ error: 'Internal error' }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session?.user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { challengeId } = body;

		if (!challengeId) {
			return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 });
		}

		const result = await claimChallengeReward(challengeId);
		return NextResponse.json(result);
	} catch (error) {
		console.debug('[API/daily-challenges] PATCH error:', error);
		return NextResponse.json({ error: 'Internal error' }, { status: 500 });
	}
}
