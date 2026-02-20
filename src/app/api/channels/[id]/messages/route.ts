import { type NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { getChannelMessages } from '@/lib/db/chat-actions';

const MIN_LIMIT = 1;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 50;

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		// Authenticate the requester
		const auth = await getAuth();
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { id: channelId } = await params;
		const { searchParams } = new URL(request.url);

		// Validate and clamp limit parameter
		let limit = Number.parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10);
		if (Number.isNaN(limit) || limit < MIN_LIMIT) {
			limit = DEFAULT_LIMIT;
		} else if (limit > MAX_LIMIT) {
			limit = MAX_LIMIT;
		}

		const beforeId = searchParams.get('beforeId') || undefined;

		// TODO: Add authorization check to verify user has access to this channel
		// const hasAccess = await hasAccessToChannel(session.user.id, channelId);
		// if (!hasAccess) {
		//   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		// }

		const messages = await getChannelMessages(channelId, { limit, beforeId });

		return NextResponse.json(messages);
	} catch (error) {
		console.error('[API] Error fetching messages:', error);
		return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
	}
}
