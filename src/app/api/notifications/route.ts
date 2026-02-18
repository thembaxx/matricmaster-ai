import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
	try {
		const auth = getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// In production, fetch notifications from database
		const notifications: unknown[] = [];
		return NextResponse.json(notifications);
	} catch (error) {
		console.error('Error fetching notifications:', error);
		return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
	}
}
