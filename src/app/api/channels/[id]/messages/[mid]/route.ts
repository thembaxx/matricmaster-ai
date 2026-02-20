import { type NextRequest, NextResponse } from 'next/server';
import { deleteMessage, editMessage } from '@/lib/db/chat-actions';

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; mid: string }> }
) {
	try {
		const { mid: messageId } = await params;
		const body = await request.json();
		const { userId, content } = body;

		if (!userId || !content) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const result = await editMessage(messageId, userId, content);

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
		const { mid: messageId } = await params;
		const body = await request.json();
		const { userId } = body;

		if (!userId) {
			return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
		}

		const result = await deleteMessage(messageId, userId);

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error('[API] Error deleting message:', error);
		return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
	}
}
