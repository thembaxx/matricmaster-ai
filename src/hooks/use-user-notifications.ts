'use client';

import type { Realtime } from 'ably';
import { useEffect, useRef } from 'react';

export function useUserNotifications(userId: string | undefined) {
	const channelRef = useRef<ReturnType<Realtime['channels']['get']> | null>(null);

	useEffect(() => {
		if (!userId || typeof window === 'undefined') return;

		const initNotifications = async () => {
			const { Realtime } = await import('ably');

			const client = new Realtime({
				authUrl: '/api/ably/auth',
				authMethod: 'POST',
				authParams: {
					clientId: userId,
					userId,
				},
			});

			await client.connection.once('connected');

			const channelName = `user:${userId}:notifications`;
			const channel = client.channels.get(channelName);
			channelRef.current = channel;

			channel.subscribe((message) => {
				console.log('[Notifications] New notification:', message.data);
			});

			return () => {
				channel.unsubscribe();
				client.close();
			};
		};

		const cleanup = initNotifications();

		return () => {
			cleanup.then((fn) => fn?.());
		};
	}, [userId]);

	return {
		channel: channelRef.current,
		channelName: userId ? `user:${userId}:notifications` : '',
	};
}
