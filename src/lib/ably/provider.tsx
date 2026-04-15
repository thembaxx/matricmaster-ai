'use client';

import { ChatClient, LogLevel } from '@ably/chat';
import { ChatClientProvider } from '@ably/chat/react';
import * as Ably from 'ably';
import { AblyProvider, ChannelProvider } from 'ably/react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useAblyStore } from '@/stores/useAblyStore';

export const useAblyStatus = () => {
	const { isReady } = useAblyStore();
	return { isReady };
};

/**
 * Creates a disconnected Ably client that provides React context
 * without connecting to Ably servers. Used for unauthenticated users
 * so that ably/react hooks don't throw context errors.
 */
function createDisconnectedClient(): Ably.Realtime {
	return new Ably.Realtime({
		key: 'placeholder:autoConnect=false',
		autoConnect: false,
	});
}

interface AblyClientProviderProps {
	children: ReactNode;
}

export function AblyClientProvider({ children }: AblyClientProviderProps) {
	const { data: session, isPending } = useSession();
	const user = session?.user;
	const { setIsReady } = useAblyStore();
	const disconnectedClientRef = useRef<Ably.Realtime | null>(null);

	if (!disconnectedClientRef.current && typeof window !== 'undefined') {
		disconnectedClientRef.current = createDisconnectedClient();
	}

	const activeClient = useMemo(() => {
		if (typeof window === 'undefined') return null;

		// Only create active client when user is authenticated
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
		if (!activeClient) return null;

		return new ChatClient(activeClient, {
			logLevel: LogLevel.Warn,
		});
	}, [activeClient]);

	useEffect(() => {
		const isReady = !!(activeClient && chatClient);
		setIsReady(isReady);
	}, [activeClient, chatClient, setIsReady]);

	// On server, render children without AblyProvider (SSR bailout handled by next/dynamic)
	if (typeof window === 'undefined') {
		return <>{children}</>;
	}

	const client = activeClient || disconnectedClientRef.current;

	// Active (authenticated) path: include ChatClientProvider
	if (activeClient && chatClient) {
		return (
			<AblyProvider client={activeClient}>
				<ChatClientProvider client={chatClient}>{children}</ChatClientProvider>
			</AblyProvider>
		);
	}

	// Unauthenticated path: just AblyProvider for context, no chat
	return <AblyProvider client={client!}>{children}</AblyProvider>;
}

interface ChannelProviderWrapperProps {
	channelName: string;
	children: ReactNode;
	fallback?: ReactNode;
}

export function ChannelProviderWrapper({
	channelName,
	children,
	fallback = null,
}: ChannelProviderWrapperProps) {
	const [hasError, setHasError] = useState(false);

	if (hasError) {
		return <>{fallback}</>;
	}

	try {
		return <ChannelProvider channelName={channelName}>{children}</ChannelProvider>;
	} catch (err) {
		console.error('ChannelProvider error:', err);
		setHasError(true);
		return <>{fallback}</>;
	}
}
