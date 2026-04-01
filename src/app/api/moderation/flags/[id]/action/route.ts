import { type NextRequest, NextResponse } from 'next/server';
import { getAuth, type SessionUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		if ((session.user as SessionUser).role !== 'admin') {
			return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
		}

		const { id } = await params;
		const body = await request.json();
		const { action } = body;

		if (!action || !['approve', 'dismiss'].includes(action)) {
			return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
		}

		// In production, update flag in database
		return NextResponse.json({
			success: true,
			flagId: id,
			action,
			reviewedBy: session.user.id,
		});
	} catch (error) {
		console.debug('Error reviewing flag:', error);
		return NextResponse.json({ error: 'Failed to review flag' }, { status: 500 });
	}
}
