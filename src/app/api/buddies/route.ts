import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// In production, fetch buddies from database
		const buddies: unknown[] = [];
		return NextResponse.json(buddies);
	} catch (error) {
		console.error('Error fetching buddies:', error);
		return NextResponse.json({ error: 'Failed to fetch buddies' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { recipientId, message } = body;

		if (!recipientId) {
			return NextResponse.json({ error: 'Recipient ID required' }, { status: 400 });
		}

		// In production, create buddy request in database
		const buddyRequest = {
			id: crypto.randomUUID(),
			requesterId: session.user.id,
			recipientId,
			message,
			status: 'pending',
			createdAt: new Date().toISOString(),
		};

		return NextResponse.json(buddyRequest, { status: 201 });
	} catch (error) {
		console.error('Error creating buddy request:', error);
		return NextResponse.json({ error: 'Failed to create buddy request' }, { status: 500 });
	}
}
