import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import {
	acceptBuddyRequest as acceptBuddyRequestAction,
	getUserBuddies,
	rejectBuddyRequest as rejectBuddyRequestAction,
	sendBuddyRequest,
} from '@/lib/db/buddy-actions';

export async function GET(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const buddies = await getUserBuddies(session.user.id);
		return NextResponse.json({ success: true, data: buddies });
	} catch (error) {
		console.error('Error fetching buddies:', error);
		return NextResponse.json({ error: 'Failed to fetch buddies' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { action, recipientId, message, requestId } = body;

		if (action === 'accept' && requestId) {
			const result = await acceptBuddyRequestAction(requestId, session.user.id);
			if (!result.success) {
				return NextResponse.json(
					{ error: result.error || 'Failed to accept request' },
					{ status: 500 }
				);
			}
			return NextResponse.json({ success: true });
		}

		if (action === 'reject' && requestId) {
			const result = await rejectBuddyRequestAction(requestId);
			if (!result.success) {
				return NextResponse.json(
					{ error: result.error || 'Failed to reject request' },
					{ status: 500 }
				);
			}
			return NextResponse.json({ success: true });
		}

		if (!recipientId) {
			return NextResponse.json({ error: 'Recipient ID required' }, { status: 400 });
		}

		const result = await sendBuddyRequest(session.user.id, recipientId, message);
		if (!result.success) {
			return NextResponse.json(
				{ error: result.error || 'Failed to send request' },
				{ status: 500 }
			);
		}

		return NextResponse.json({ success: true, data: result.request }, { status: 201 });
	} catch (error) {
		console.error('Error creating buddy request:', error);
		return NextResponse.json({ error: 'Failed to create buddy request' }, { status: 500 });
	}
}
