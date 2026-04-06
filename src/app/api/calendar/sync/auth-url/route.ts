import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getGoogleAuthUrl } from '@/lib/calendar/google';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const state = `${session.user.id}:${Date.now()}`;
		const authUrl = getGoogleAuthUrl(state);

		return NextResponse.json({ authUrl });
	} catch (error) {
		console.debug('Calendar auth URL error:', error);
		return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
	}
}
