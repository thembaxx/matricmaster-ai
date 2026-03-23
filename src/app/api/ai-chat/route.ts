import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
	getAIResponse,
	getSessionMessages,
	getUserContext,
	saveMessage,
	updateSessionTitle,
} from '@/services/chatService';

const chatMessageSchema = z.object({
	sessionId: z.string().uuid({ message: 'Session ID must be a valid UUID' }),
	message: z.string().min(1, 'Message is required'),
	subject: z.string().optional().default('general'),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		const validation = chatMessageSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{ error: 'Validation failed', details: validation.error.flatten().fieldErrors },
				{ status: 400 }
			);
		}

		const { sessionId, message, subject } = validation.data;

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
