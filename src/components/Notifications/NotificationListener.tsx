'use client';

import { createContext, type ReactNode, useContext } from 'react';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';

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
	const { unreadCount, incrementUnread, resetUnread } = useRealtimeNotifications();

	return (
		<NotificationContext.Provider value={{ unreadCount, incrementUnread, resetUnread }}>
			{children}
		</NotificationContext.Provider>
	);
}

export default NotificationListener;
