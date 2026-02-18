import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
	try {
		const auth = getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// In production, fetch flagged content from database
		// Only admins should access this
		const flags: unknown[] = [];
		return NextResponse.json(flags);
	} catch (error) {
		console.error('Error fetching flags:', error);
		return NextResponse.json({ error: 'Failed to fetch flags' }, { status: 500 });
	}
}
