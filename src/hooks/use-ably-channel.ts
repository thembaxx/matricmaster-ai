'use client';

import { useChannel } from 'ably/react';
import { useCallback, useEffect, useState } from 'react';
import { useAblyStatus } from '@/lib/ably/provider';

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
	const { isReady } = useAblyStatus();
	const [presenceMembers, setPresenceMembers] = useState<unknown[]>([]);

	const { channel } = useChannel({ channelName, skip: !isReady }, (message) => {
		if (onMessage) {
			onMessage(message as { data: unknown });
		}
	});

	useEffect(() => {
		if (!isReady || !enablePresence || !channel) return;

		const handlePresenceUpdate = async () => {
			const members = await channel.presence.get();
			setPresenceMembers(members);
		};

		channel.presence.subscribe('enter', handlePresenceUpdate);
		channel.presence.subscribe('leave', handlePresenceUpdate);
		channel.presence.subscribe('update', handlePresenceUpdate);

		channel.presence.enter();

		handlePresenceUpdate();

		return () => {
			channel.presence.leave();
			channel.presence.unsubscribe('enter', handlePresenceUpdate);
			channel.presence.unsubscribe('leave', handlePresenceUpdate);
			channel.presence.unsubscribe('update', handlePresenceUpdate);
		};
	}, [isReady, enablePresence, channel]);

	const publish = useCallback(
		async (eventName: string, data: unknown) => {
			if (channel) {
				await channel.publish(eventName, data);
			}
		},
		[channel]
	);

	return {
		channel: isReady ? channel : null,
		presenceMembers,
		publish,
	};
}
