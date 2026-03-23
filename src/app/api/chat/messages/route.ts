import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/server-auth';
import { getSessionMessages, getSessions } from '@/services/chatService';

const getMessagesSchema = z.object({
	sessionId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
	await requireAuth();
	try {
		const { searchParams } = new URL(request.url);
		const sessionId = searchParams.get('sessionId');

		const validation = getMessagesSchema.safeParse({ sessionId });
		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Invalid query parameters', details: validation.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}

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
