/** biome-ignore-all lint/suspicious/noExplicitAny: Unknown type */
'use client';

import type { Realtime } from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AblyChannels } from '@/lib/ably/channel-names';

interface ChatMessage {
	id: string;
	channelId: string;
	userId: string;
	content: string;
	messageType: string;
	replyToId: string | null;
	isEdited: boolean;
	isDeleted: boolean;
	createdAt: string;
	updatedAt: string;
}

interface UseChatMessagesOptions {
	channelId: string;
	initialMessages?: ChatMessage[];
}

export function useChatMessages({ channelId, initialMessages = [] }: UseChatMessagesOptions) {
	const channelName = AblyChannels.channelChat(channelId);
	const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
	const [isLoading, setIsLoading] = useState(!initialMessages.length);
	const channelRef = useRef<ReturnType<Realtime['channels']['get']> | null>(null);

	useEffect(() => {
		async function fetchMessages() {
			if (initialMessages.length > 0) {
				setMessages(initialMessages);
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(`/api/channels/${channelId}/messages`);
				if (response.ok) {
					const data = await response.json();
					setMessages(data);
				}
			} catch (error) {
				console.error('[Chat] Error fetching messages:', error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchMessages();
	}, [channelId, initialMessages]);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const initChat = async () => {
			const { Realtime } = await import('ably');

			const client = new Realtime({
				authUrl: '/api/ably/auth',
				authMethod: 'POST',
				authParams: {
					clientId: `anon-${Date.now()}`,
				},
			});

			await client.connection.once('connected');

			const channel = client.channels.get(channelName);
			channelRef.current = channel;

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const handleNewMessage = (message: any) => {
				const newMsg = message.data as ChatMessage;
				setMessages((prev) => {
					if (prev.some((m) => m.id === newMsg.id)) return prev;
					return [newMsg, ...prev];
				});
			};

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const handleMessageUpdated = (message: any) => {
				const updated = message.data as ChatMessage;
				setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
			};

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const handleMessageDeleted = (message: any) => {
				setMessages((prev) =>
					prev.map((m) => (m.id === message.data.id ? { ...m, isDeleted: true, content: '' } : m))
				);
			};

			channel.subscribe('new-message', handleNewMessage);
			channel.subscribe('message-updated', handleMessageUpdated);
			channel.subscribe('message-deleted', handleMessageDeleted);

			return () => {
				channel.unsubscribe('new-message', handleNewMessage);
				channel.unsubscribe('message-updated', handleMessageUpdated);
				channel.unsubscribe('message-deleted', handleMessageDeleted);
				client.close();
			};
		};

		const cleanup = initChat();

		return () => {
			cleanup.then((fn) => fn?.());
		};
	}, [channelName]);

	const sendMessage = useCallback(
		async (userId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text') => {
			try {
				const response = await fetch(`/api/channels/${channelId}/messages/send`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId, content, messageType }),
				});
				return await response.json();
			} catch (error) {
				console.error('[Chat] Error sending message:', error);
				return { success: false, error: String(error) };
			}
		},
		[channelId]
	);

	const editMessage = useCallback(
		async (messageId: string, userId: string, content: string) => {
			try {
				const response = await fetch(`/api/channels/${channelId}/messages/${messageId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId, content }),
				});
				return await response.json();
			} catch (error) {
				console.error('[Chat] Error editing message:', error);
				return { success: false, error: String(error) };
			}
		},
		[channelId]
	);

	const deleteMessage = useCallback(
		async (messageId: string, userId: string) => {
			try {
				const response = await fetch(`/api/channels/${channelId}/messages/${messageId}`, {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ userId }),
				});
				return await response.json();
			} catch (error) {
				console.error('[Chat] Error deleting message:', error);
				return { success: false, error: String(error) };
			}
		},
		[channelId]
	);

	return {
		messages,
		isLoading,
		sendMessage,
		editMessage,
		deleteMessage,
		channel: channelRef.current,
	};
}
