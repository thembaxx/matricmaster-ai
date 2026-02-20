'use client';

import type { Realtime } from 'ably';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseAblyChannelOptions {
	channelName: string;
	onMessage?: (message: { data: unknown }) => void;
	enablePresence?: boolean;
}

export function useAblyChannel({
	channelName,
	onMessage,
	enablePresence = false,
}: UseAblyChannelOptions) {
	const [presenceMembers, setPresenceMembers] = useState<
		Array<{ clientId: string; data: unknown }>
	>([]);
	const channelRef = useRef<ReturnType<Realtime['channels']['get']> | null>(null);

	const publish = useCallback(async (eventName: string, data: unknown) => {
		if (channelRef.current) {
			await channelRef.current.publish(eventName, data);
		}
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const initChannel = async () => {
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

			if (onMessage) {
				channel.subscribe((message) => {
					onMessage(message as { data: unknown });
				});
			}

			if (enablePresence) {
				const handlePresenceUpdate = async () => {
					const members = await channel.presence.get();
					setPresenceMembers(members);
				};

				channel.presence.subscribe('enter', handlePresenceUpdate);
				channel.presence.subscribe('leave', handlePresenceUpdate);
				channel.presence.subscribe('update', handlePresenceUpdate);

				channel.presence.enter();

				return () => {
					channel.presence.leave();
					channel.presence.unsubscribe('enter', handlePresenceUpdate);
					channel.presence.unsubscribe('leave', handlePresenceUpdate);
					channel.presence.unsubscribe('update', handlePresenceUpdate);
				};
			}

			return () => {
				channel.unsubscribe();
				client.close();
			};
		};

		const cleanup = initChannel();

		return () => {
			cleanup.then((fn) => fn?.());
		};
	}, [channelName, onMessage, enablePresence]);

	return {
		channel: channelRef.current,
		presenceMembers,
		publish,
	};
}
