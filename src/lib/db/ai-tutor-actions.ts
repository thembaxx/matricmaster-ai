'use server';

import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
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
 */
export async function saveConversationAction(
	userId: string,
	title: string,
	messages: { role: 'user' | 'assistant'; content: string; timestamp: Date }[],
	subject?: string
): Promise<{ success: boolean; error?: string; conversationId?: string }> {
	try {
		// Validate input
		const validated = conversationSchema.parse({
			userId,
			title,
			messages: messages.map((m) => ({
				...m,
				timestamp: m.timestamp.toISOString(),
			})),
			subject,
		});

		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			console.warn('[AI Tutor] Database not available, conversation not saved');
			return { success: true }; // Don't fail the user experience
		}

		const db = getDb();

		// Save to database
		const messagesJson = JSON.stringify(validated.messages);
		const [conversation] = await db
			.insert(aiConversations)
			.values({
				userId: validated.userId,
				title: validated.title,
				subject: validated.subject,
				messages: messagesJson,
				messageCount: validated.messages.length,
			} as NewAiConversation)
			.returning();

		console.log(`[AI Tutor] Saved conversation "${title}" with ${messages.length} messages`);

		return { success: true, conversationId: conversation.id };
	} catch (error) {
		console.error('[AI Tutor] Error saving conversation:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to save conversation',
		};
	}
}

/**
 * Get user's AI tutor conversations
 */
export async function getConversationsAction(userId: string): Promise<AiConversation[]> {
	try {
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return [];
		}

		const db = getDb();
		return db
			.select()
			.from(aiConversations)
			.where(eq(aiConversations.userId, userId))
			.orderBy(desc(aiConversations.updatedAt));
	} catch (error) {
		console.error('[AI Tutor] Error getting conversations:', error);
		return [];
	}
}

/**
 * Get a specific conversation by ID
 */
export async function getConversationByIdAction(
	conversationId: string,
	userId: string
): Promise<AiConversation | null> {
	try {
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return null;
		}

		const db = getDb();
		const [conversation] = await db
			.select()
			.from(aiConversations)
			.where(and(eq(aiConversations.id, conversationId), eq(aiConversations.userId, userId)))
			.limit(1);

		return conversation ?? null;
	} catch (error) {
		console.error('[AI Tutor] Error getting conversation:', error);
		return null;
	}
}

/**
 * Delete a conversation
 */
export async function deleteConversationAction(
	conversationId: string,
	userId: string
): Promise<{ success: boolean; error?: string }> {
	try {
		const connected = await dbManager.waitForConnection(3, 2000);
		if (!connected) {
			return { success: false, error: 'Database not available' };
		}

		const db = getDb();
		const result = await db
			.delete(aiConversations)
			.where(and(eq(aiConversations.id, conversationId), eq(aiConversations.userId, userId)))
			.returning();

		return { success: result.length > 0 };
	} catch (error) {
		console.error('[AI Tutor] Error deleting conversation:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to delete conversation',
		};
	}
}
