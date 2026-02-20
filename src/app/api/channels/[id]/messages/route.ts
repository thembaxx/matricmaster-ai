import { type NextRequest, NextResponse } from 'next/server';
import { getChannelMessages } from '@/lib/db/chat-actions';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id: channelId } = await params;
		const { searchParams } = new URL(request.url);
		const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
		const beforeId = searchParams.get('beforeId') || undefined;

		const messages = await getChannelMessages(channelId, { limit, beforeId });

		return NextResponse.json(messages);
	} catch (error) {
		console.error('[API] Error fetching messages:', error);
		return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
	}
}
