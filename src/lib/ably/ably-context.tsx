'use client';

import { Realtime } from 'ably';
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

interface AblyContextValue {
	client: Realtime | null;
	isConnected: boolean;
}

const AblyContext = createContext<AblyContextValue>({
	client: null,
	isConnected: false,
});

interface AblyContextProviderProps {
	children: ReactNode;
	authUrl: string;
	clientId: string;
}

export function AblyContextProvider({ children, authUrl, clientId }: AblyContextProviderProps) {
	const [client, setClient] = useState<Realtime | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') return;

		const ablyClient = new Realtime({
			authUrl,
			authMethod: 'POST',
			authParams: {
				clientId,
			},
		});

		ablyClient.connection.on('connected', () => {
			setIsConnected(true);
		});

		ablyClient.connection.on('disconnected', () => {
			setIsConnected(false);
		});

		setClient(ablyClient);

		return () => {
			ablyClient.close();
		};
	}, [authUrl, clientId]);

	return <AblyContext.Provider value={{ client, isConnected }}>{children}</AblyContext.Provider>;
}

export function useAblyContext() {
	return useContext(AblyContext);
}
