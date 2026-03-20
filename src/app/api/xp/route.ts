import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { awardXP, getUserXPAndLevel } from '@/services/xpSystem';

export async function GET() {
	try {
		const data = await getUserXPAndLevel();
		return NextResponse.json(data);
	} catch (error) {
		console.debug('[API/xp] GET error:', error);
		return NextResponse.json({ totalXp: 0, level: { level: 1, title: 'Novice' } });
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
		const { amount, reason } = body;

		if (!amount || typeof amount !== 'number' || amount <= 0) {
			return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
		}

		const totalXp = await awardXP(session.user.id, amount, reason || 'XP award');
		return NextResponse.json({ totalXp, awarded: amount });
	} catch (error) {
		console.debug('[API/xp] POST error:', error);
		return NextResponse.json({ error: 'Internal error' }, { status: 500 });
	}
}
