import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getAdaptiveDifficulty } from '@/services/spacedRepetition';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const difficulty = await getAdaptiveDifficulty();

		return NextResponse.json({ difficulty });
	} catch (error) {
		console.debug('[Adaptive Difficulty API] Error:', error);
		return NextResponse.json({ error: 'Failed to get adaptive difficulty' }, { status: 500 });
	}
}
