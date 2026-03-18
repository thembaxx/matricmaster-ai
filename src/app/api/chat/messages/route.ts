import { type NextRequest, NextResponse } from 'next/server';
import { getSessionMessages, getSessions } from '@/services/chatService';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const sessionId = searchParams.get('sessionId');

		if (sessionId) {
			const messages = await getSessionMessages(sessionId);
			return NextResponse.json(messages);
		}

		const sessions = await getSessions();
		return NextResponse.json({ sessions });
	} catch (error) {
		console.debug('Error fetching data:', error);
		return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
	}
}
