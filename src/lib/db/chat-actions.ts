/** biome-ignore-all lint/suspicious/noExplicitAny: reasons */
'use server';

import { and, desc, eq } from 'drizzle-orm';
import { AblyChannels } from '../ably/channel-names';
import { publishToChannel } from '../ably/client';
import { dbManager } from './index';
import { channelMembers } from './schema';
import { chatMessages, outbox, userPresence } from './schema-chat';

const getDb = () => dbManager.getDb();

export type ChatActionResult<T = void> =
	| { success: true; message: T }
	| { success: false; error: { message: string; code: string } };

export async function hasAccessToChannel(userId: string, channelId: string): Promise<boolean> {
	try {
		const db = getDb();
		const [membership] = await db
			.select()
			.from(channelMembers)
			.where(and(eq(channelMembers.channelId, channelId), eq(channelMembers.userId, userId)))
			.limit(1);

		return !!membership;
	} catch (error) {
		console.debug('[Chat] Error checking channel access:', error);
		return false;
	}
}

export async function sendMessage(
	channelId: string,
	userId: string,
	content: string,
	messageType: 'text' | 'image' | 'file' = 'text',
	replyToId?: string
): Promise<ChatActionResult<any>> {
	const db = getDb();
	const id = crypto.randomUUID();

	try {
		const [message] = await db.transaction(async (tx: typeof db) => {
			const [inserted] = await tx
				.insert(chatMessages)
				.values({
					id,
					channelId,
					userId,
					content,
					messageType,
					replyToId: replyToId || null,
					isEdited: false,
					isDeleted: false,
				})
				.returning();

			await tx.insert(outbox).values({
				mutationId: `${Date.now()}-${crypto.randomUUID()}`,
				channel: `chat:${channelId}`,
				name: 'insert',
				data: JSON.stringify(inserted),
			});

			return [inserted];
		});

		const channelName = AblyChannels.channelChat(channelId);
		await publishToChannel(channelName, 'new-message', message);

		return { success: true, message };
	} catch (error) {
		console.debug('[Chat] Error sending message:', error);
		return {
			success: false,
			error: { message: String(error), code: 'SERVER_ERROR' },
		};
	}
}

export async function getChannelMessages(
	channelId: string,
	options?: {
		limit?: number;
		beforeId?: string;
	}
) {
	const db = getDb();
	const limit = options?.limit || 50;

	try {
		const query = db
			.select()
			.from(chatMessages)
			.where(eq(chatMessages.channelId, channelId))
			.orderBy(desc(chatMessages.createdAt))
			.limit(limit);

		const messages = await query;

		return messages
			.filter((m: (typeof messages)[number]) => !m.isDeleted)
			.sort((a: (typeof messages)[number], b: (typeof messages)[number]) => {
				const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
				const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
				return dateB - dateA;
			});
	} catch (error) {
		console.debug('[Chat] Error getting messages:', error);
		return [];
	}
}

export async function editMessage(
	messageId: string,
	userId: string,
	content: string
): Promise<ChatActionResult<any>> {
	const db = getDb();

	try {
		const [existing] = await db
			.select()
			.from(chatMessages)
			.where(eq(chatMessages.id, messageId))
			.limit(1);

		if (!existing || existing.userId !== userId) {
			return {
				success: false,
				error: { message: 'Not authorized to edit this message', code: 'FORBIDDEN' },
			};
		}

		const [updated] = await db
			.update(chatMessages)
			.set({
				content,
				isEdited: true,
				updatedAt: new Date(),
			})
			.where(eq(chatMessages.id, messageId))
			.returning();

		await db.insert(outbox).values({
			mutationId: `${Date.now()}-${crypto.randomUUID()}`,
			channel: `chat:${existing.channelId}`,
			name: 'update',
			data: JSON.stringify(updated),
		});

		const channelName = AblyChannels.channelChat(existing.channelId);
		await publishToChannel(channelName, 'message-updated', updated);

		return { success: true, message: updated };
	} catch (error) {
		console.debug('[Chat] Error editing message:', error);
		return {
			success: false,
			error: { message: String(error), code: 'SERVER_ERROR' },
		};
	}
}

export async function deleteMessage(
	messageId: string,
	userId: string
): Promise<ChatActionResult<any>> {
	const db = getDb();

	try {
		const [existing] = await db
			.select()
			.from(chatMessages)
			.where(eq(chatMessages.id, messageId))
			.limit(1);

		if (!existing || existing.userId !== userId) {
			return {
				success: false,
				error: { message: 'Not authorized to delete this message', code: 'FORBIDDEN' },
			};
		}

		await db
			.update(chatMessages)
			.set({
				isDeleted: true,
				content: '',
				updatedAt: new Date(),
			})
			.where(eq(chatMessages.id, messageId));

		await db.insert(outbox).values({
			mutationId: `${Date.now()}-${crypto.randomUUID()}`,
			channel: `chat:${existing.channelId}`,
			name: 'delete',
			data: JSON.stringify({ id: messageId }),
		});

		const channelName = AblyChannels.channelChat(existing.channelId);
		await publishToChannel(channelName, 'message-deleted', { id: messageId });

		return { success: true, message: undefined };
	} catch (error) {
		console.debug('[Chat] Error deleting message:', error);
		return {
			success: false,
			error: { message: String(error), code: 'SERVER_ERROR' },
		};
	}
}

export async function updateUserPresence(
	channelId: string,
	userId: string,
	status: 'online' | 'away' | 'offline'
): Promise<ChatActionResult<any>> {
	const db = getDb();

	try {
		const [presence] = await db
			.insert(userPresence)
			.values({
				channelId,
				userId,
				status,
				lastSeenAt: new Date(),
			})
			.onConflictDoUpdate({
				target: [userPresence.channelId, userPresence.userId],
				set: {
					status,
					lastSeenAt: new Date(),
					updatedAt: new Date(),
				},
			})
			.returning();

		await db.insert(outbox).values({
			mutationId: `${Date.now()}-${crypto.randomUUID()}`,
			channel: `presence:${channelId}`,
			name: 'update',
			data: JSON.stringify(presence),
		});

		const channelName = AblyChannels.channelPresence(channelId);
		await publishToChannel(channelName, 'presence-update', presence);

		return { success: true, message: presence };
	} catch (error) {
		console.debug('[Chat] Error updating presence:', error);
		return {
			success: false,
			error: { message: String(error), code: 'SERVER_ERROR' },
		};
	}
}

export async function getChannelPresence(channelId: string) {
	const db = getDb();

	try {
		const members = await db
			.select()
			.from(userPresence)
			.where(eq(userPresence.channelId, channelId));

		return members;
	} catch (error) {
		console.debug('[Chat] Error getting presence:', error);
		return [];
	}
}
