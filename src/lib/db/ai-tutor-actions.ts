'use server';

import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { ensureAuthenticated } from './auth-utils';
import { dbManager, getDb } from './index';
import { type AiConversation, aiConversations, type NewAiConversation } from './schema';

const messageSchema = z.object({
	role: z.enum(['user', 'assistant']),
	content: z.string(),
	timestamp: z.string(),
});

const conversationSchema = z.object({
	userId: z.string().min(1),
	title: z.string().min(1).max(200),
	messages: z.array(messageSchema),
	subject: z.string().optional(),
});

/**
 * Save AI tutor conversation to database
 * Uses session-based authentication to prevent IDOR
 */
export async function saveConversationAction(
	_userId: string,
	title: string,
	messages: { role: 'user' | 'assistant'; content: string; timestamp: Date }[],
	subject?: string
): Promise<{ success: boolean; error?: string; conversationId?: string }> {
	try {
		const user = await ensureAuthenticated();
		const activeUserId = user.id;

		// Validate input
		const validated = conversationSchema.parse({
			userId: activeUserId,
			title,
			messages: messages.map((m) => ({
				...m,
				timestamp: m.timestamp.toISOString(),
			})),
			subject,
		});

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			console.warn('[Tutor] Database not available, conversation not saved');
			return { success: true }; // Don't fail the user experience
		}

		const db = getDb();

		// Save to database
		const messagesJson = JSON.stringify(validated.messages);
		const [conversation] = await db
			.insert(aiConversations)
			.values({
				userId: activeUserId,
				title: validated.title,
				subject: validated.subject,
				messages: messagesJson,
				messageCount: validated.messages.length,
			} as NewAiConversation)
			.returning();

		console.log(`[Tutor] Saved conversation "${title}" with ${messages.length} messages`);

		return { success: true, conversationId: conversation.id };
	} catch (error) {
		console.error('[Tutor] Error saving conversation:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to save conversation',
		};
	}
}

/**
 * Get user's AI tutor conversations
 * Verifies identity via session to prevent IDOR
 */
export async function getConversationsAction(_userId: string): Promise<AiConversation[]> {
	try {
		const user = await ensureAuthenticated();
		const activeUserId = user.id;

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return [];
		}

		const db = getDb();
		return db
			.select()
			.from(aiConversations)
			.where(eq(aiConversations.userId, activeUserId))
			.orderBy(desc(aiConversations.updatedAt));
	} catch (error) {
		console.error('[Tutor] Error getting conversations:', error);
		return [];
	}
}

/**
 * Get a specific conversation by ID
 * Verifies ownership via session to prevent IDOR
 */
export async function getConversationByIdAction(
	conversationId: string,
	_userId: string
): Promise<AiConversation | null> {
	try {
		const user = await ensureAuthenticated();
		const activeUserId = user.id;

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return null;
		}

		const db = getDb();
		const [conversation] = await db
			.select()
			.from(aiConversations)
			.where(and(eq(aiConversations.id, conversationId), eq(aiConversations.userId, activeUserId)))
			.limit(1);

		return conversation ?? null;
	} catch (error) {
		console.error('[Tutor] Error getting conversation:', error);
		return null;
	}
}

/**
 * Delete a conversation
 * Verifies ownership via session to prevent IDOR
 */
export async function deleteConversationAction(
	conversationId: string,
	_userId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const user = await ensureAuthenticated();
		const activeUserId = user.id;

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false, error: 'Database not available' };
		}

		const db = getDb();
		const result = await db
			.delete(aiConversations)
			.where(and(eq(aiConversations.id, conversationId), eq(aiConversations.userId, activeUserId)))
			.returning();

		return { success: result.length > 0 };
	} catch (error) {
		console.error('[Tutor] Error deleting conversation:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete conversation',
		};
	}
}
