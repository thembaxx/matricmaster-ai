'use client';

import { ChatClient, LogLevel } from '@ably/chat';
import { ChatClientProvider } from '@ably/chat/react';
import * as Ably from 'ably';
import { AblyProvider, ChannelProvider } from 'ably/react';
import { type ReactNode, useEffect, useMemo } from 'react';
import { useSession } from '@/lib/auth-client';
import { useAblyStore } from '@/stores/useAblyStore';

export const useAblyStatus = () => {
	const { isReady } = useAblyStore();
	return { isReady };
};

interface AblyClientProviderProps {
	children: ReactNode;
}

export function AblyClientProvider({ children }: AblyClientProviderProps) {
	const { data: session, isPending } = useSession();
	const user = session?.user;
	const { setIsReady } = useAblyStore();

	const client = useMemo(() => {
		if (typeof window === 'undefined') return null;

		// Only create client when user is authenticated
		if (!user?.id || isPending) return null;

		const authUrl = process.env.NEXT_PUBLIC_ABLY_AUTH_URL || '/api/ably/auth';

		return new Ably.Realtime({
			authUrl,
			authMethod: 'POST',
			authHeaders: {
				'Content-Type': 'application/json',
			},
		});
	}, [user?.id, isPending]);

	const chatClient = useMemo(() => {
		if (!client) return null;

		return new ChatClient(client, {
			logLevel: LogLevel.Warn,
		});
	}, [client]);

	useEffect(() => {
		const isReady = !!(client && chatClient);
		setIsReady(isReady);
	}, [client, chatClient, setIsReady]);

	if (!client || !chatClient) {
		return <>{children}</>;
	}

	return (
		<AblyProvider client={client}>
			<ChatClientProvider client={chatClient}>{children}</ChatClientProvider>
		</AblyProvider>
	);
}

interface ChannelProviderWrapperProps {
	channelName: string;
	children: ReactNode;
}

export function ChannelProviderWrapper({ channelName, children }: ChannelProviderWrapperProps) {
	return <ChannelProvider channelName={channelName}>{children}</ChannelProvider>;
}
