import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { deleteMessage, editMessage, hasAccessToChannel } from '@/lib/db/chat-actions';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; mid: string }> }
) {
	try {
		// Authenticate the requester
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: channelId, mid: messageId } = await params;
		const body = await request.json();
		const { content } = body;

		if (!content) {
			return NextResponse.json({ error: 'Missing required field: content' }, { status: 400 });
		}

		// Authorization check - verify user is a member of this channel
		const hasAccess = await hasAccessToChannel(session.user.id, channelId);
		if (!hasAccess) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Use authenticated user's ID, not from request body
		const result = await editMessage(messageId, session.user.id, content);

		if (!result.success) {
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
		console.debug('[API] Error editing message:', error);
		return NextResponse.json(
			{ success: false, error: { message: 'Failed to edit message', code: 'SERVER_ERROR' } },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; mid: string }> }
) {
	try {
		// Authenticate the requester
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: channelId, mid: messageId } = await params;

		// Authorization check - verify user is a member of this channel
		const hasAccess = await hasAccessToChannel(session.user.id, channelId);
		if (!hasAccess) {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Use authenticated user's ID from session, not from request body
		const result = await deleteMessage(messageId, session.user.id);

		if (!result.success) {
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
		console.debug('[API] Error deleting message:', error);
		return NextResponse.json(
			{ success: false, error: { message: 'Failed to delete message', code: 'SERVER_ERROR' } },
			{ status: 500 }
		);
	}
}
