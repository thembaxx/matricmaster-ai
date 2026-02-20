import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { deleteMessage, editMessage } from '@/lib/db/chat-actions';

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

		const { mid: messageId } = await params;
		const body = await request.json();
		const { content } = body;

		if (!content) {
			return NextResponse.json({ error: 'Missing required field: content' }, { status: 400 });
		}

		// Use authenticated user's ID, not from request body
		const result = await editMessage(messageId, session.user.id, content);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error('[API] Error editing message:', error);
		return NextResponse.json({ error: 'Failed to edit message' }, { status: 500 });
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

		const { mid: messageId } = await params;

		// Use authenticated user's ID from session, not from request body
		const result = await deleteMessage(messageId, session.user.id);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error('[API] Error deleting message:', error);
		return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
	}
}
