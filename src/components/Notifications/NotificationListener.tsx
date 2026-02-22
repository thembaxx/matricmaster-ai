'use client';

import { ChannelProvider } from 'ably/react';
import { createContext, type ReactNode, useContext } from 'react';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { useAblyStatus } from '@/lib/ably/provider';
import { useSession } from '@/lib/auth-client';

interface NotificationContextValue {
	unreadCount: number;
	incrementUnread: () => void;
	resetUnread: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotificationContext() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error('useNotificationContext must be used within NotificationListener');
	}
	return context;
}

export function useNotificationContextSafe(): NotificationContextValue {
	const context = useContext(NotificationContext);
	return context || { unreadCount: 0, incrementUnread: () => {}, resetUnread: () => {} };
}

interface NotificationListenerProps {
	children: ReactNode;
}

function NotificationListener({ children }: NotificationListenerProps) {
	const { data: session } = useSession();
	const { isReady } = useAblyStatus();

	if (!isReady) {
		return (
			<NotificationContext.Provider
				value={{ unreadCount: 0, incrementUnread: () => {}, resetUnread: () => {} }}
			>
				{children}
			</NotificationContext.Provider>
		);
	}

	return (
		<ChannelProvider
			channelName={session?.user?.id ? `user:${session.user.id}:notifications` : 'dummy-channel'}
		>
			<NotificationListenerInner>{children}</NotificationListenerInner>
		</ChannelProvider>
	);
}

function NotificationListenerInner({ children }: { children: ReactNode }) {
	const { unreadCount, incrementUnread, resetUnread } = useRealtimeNotifications();

	return (
		<NotificationContext.Provider value={{ unreadCount, incrementUnread, resetUnread }}>
			{children}
		</NotificationContext.Provider>
	);
}

export default NotificationListener;
