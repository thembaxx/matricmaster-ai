'use client';

import { ChannelProvider } from 'ably/react';
import type { ReactNode } from 'react';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { useAblyStatus } from '@/lib/ably/provider';
import { useSession } from '@/lib/auth-client';

interface NotificationListenerProps {
	children: ReactNode;
}

function NotificationListener({ children }: NotificationListenerProps) {
	const { data: session } = useSession();
	const { isReady } = useAblyStatus();

	if (!isReady) {
		return <>{children}</>;
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
	// Initialize realtime notifications hook which uses the Zustand store internally
	useRealtimeNotifications();

	return <>{children}</>;
}

export default NotificationListener;
