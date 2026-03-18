import { type NextRequest, NextResponse } from 'next/server';
import {
	getAIResponse,
	getSessionMessages,
	getUserContext,
	saveMessage,
	updateSessionTitle,
} from '@/services/chatService';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { sessionId, message, subject } = body;

		if (!sessionId || !message) {
			return NextResponse.json({ error: 'Session ID and message required' }, { status: 400 });
		}

		await saveMessage(sessionId, 'user', message);

		const history = await getSessionMessages(sessionId);
		const userContext = await getUserContext();

		const aiResponse = await getAIResponse(
			[...history, { role: 'user', content: message }],
			userContext,
			subject || 'general'
		);

		await saveMessage(sessionId, 'assistant', aiResponse);

		if (history.length === 0) {
			const title = message.slice(0, 50) + (message.length > 50 ? '...' : '');
			await updateSessionTitle(sessionId, title);
		}

		return NextResponse.json({ response: aiResponse });
	} catch (error) {
		console.error('Error in AI chat:', error);
		return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
	}
}
