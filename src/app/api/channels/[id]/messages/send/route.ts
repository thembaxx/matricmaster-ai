import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { hasAccessToChannel, sendMessage } from '@/lib/db/chat-actions';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		// Authenticate the requester
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: channelId } = await params;
		const body = await request.json();
		const { content, messageType } = body;

		if (!content) {
			return NextResponse.json({ error: 'Missing required field: content' }, { status: 400 });
		}

		// Authorization check - verify user is a member of this channel
		const hasAccess = await hasAccessToChannel(session.user.id, channelId);
		if (!hasAccess) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Use authenticated user's ID, not the one from request body
		const result = await sendMessage(channelId, session.user.id, content, messageType || 'text');

		if (!result.success) {
			// Map error codes to appropriate HTTP statuses
			const statusMap: Record<string, number> = {
				NOT_FOUND: 404,
				FORBIDDEN: 403,
				BAD_REQUEST: 400,
				SERVER_ERROR: 500,
			};
			const status = statusMap[result.error.code] || 500;
			return NextResponse.json(result, { status });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.debug('[API] Error sending message:', error);
		return NextResponse.json(
			{ success: false, error: { message: 'Failed to send message', code: 'SERVER_ERROR' } },
			{ status: 500 }
		);
	}
}
