import { type NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/db/chat-actions';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: channelId } = await params;
		const body = await request.json();
		const { userId, content, messageType } = body;

		if (!userId || !content) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const result = await sendMessage(channelId, userId, content, messageType || 'text');

		if (!result.success) {
			return NextResponse.json({ error: result.error }, { status: 500 });
		}

		return NextResponse.json(result);
	} catch (error) {
		console.error('[API] Error sending message:', error);
		return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
	}
}
