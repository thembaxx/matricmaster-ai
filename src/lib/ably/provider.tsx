'use client';

import { ChatClient, LogLevel } from '@ably/chat';
import { ChatClientProvider } from '@ably/chat/react';
import * as Ably from 'ably';
import { AblyProvider, ChannelProvider } from 'ably/react';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { useSession } from '@/lib/auth-client';

const AblyStatusContext = createContext<{ isReady: boolean }>({ isReady: false });

export const useAblyStatus = () => useContext(AblyStatusContext);

interface AblyClientProviderProps {
	children: ReactNode;
}

export function AblyClientProvider({ children }: AblyClientProviderProps) {
	const { data: session } = useSession();
	const user = session?.user;

	const client = useMemo(() => {
		if (typeof window === 'undefined') return null;

		const clientId = user?.id || `anonymous-${Date.now()}`;
		const authUrl = process.env.NEXT_PUBLIC_ABLY_AUTH_URL || '/api/ably/auth';

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
		return (
			<AblyStatusContext.Provider value={{ isReady: false }}>{children}</AblyStatusContext.Provider>
		);
	}

	return (
		<AblyProvider client={client}>
			<ChatClientProvider client={chatClient}>
				<AblyStatusContext.Provider value={{ isReady: true }}>
					{children}
				</AblyStatusContext.Provider>
			</ChatClientProvider>
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
