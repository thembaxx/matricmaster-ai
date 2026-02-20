'use client';

import { ChatClient, LogLevel } from '@ably/chat';
import { ChatClientProvider } from '@ably/chat/react';
import * as Ably from 'ably';
import { AblyProvider, ChannelProvider } from 'ably/react';
import { type ReactNode, useMemo } from 'react';
import { useSession } from '@/lib/auth-client';

interface AblyClientProviderProps {
	children: ReactNode;
}

export function AblyClientProvider({ children }: AblyClientProviderProps) {
	const { data: session } = useSession();
	const user = session?.user;

	const client = useMemo(() => {
		if (typeof window === 'undefined') return null;

		const clientId = user?.id || `anonymous-${Date.now()}`;
		const authUrl = '/api/ably/auth';

		return new Ably.Realtime({
			authUrl,
			authMethod: 'POST',
			authParams: {
				clientId,
				userId: user?.id || '',
			},
		});
	}, [user?.id]);

	const chatClient = useMemo(() => {
		if (!client) return null;

		return new ChatClient(client, {
			logLevel: LogLevel.Warn,
		});
	}, [client]);

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
