import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApiError } from '@/lib/api-error-handler';
import {
	getAIResponse,
	getSessionMessages,
	getUserContext,
	saveMessage,
	updateSessionTitle,
} from '@/services/chatService';

const chatMessageSchema = z.object({
	sessionId: z.string().uuid({ message: 'session id must be a valid uuid' }),
	message: z.string().min(1, 'message is required'),
	subject: z.string().optional().default('general'),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const validation = chatMessageSchema.parse(body);

		const { sessionId, message, subject } = validation;

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

		return NextResponse.json({ response: aiResponse, success: true });
	} catch (error) {
		return handleApiError(error);
	}
}
