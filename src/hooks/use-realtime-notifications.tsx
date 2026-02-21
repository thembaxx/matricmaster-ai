'use client';

import { useChannel } from 'ably/react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';
import { useSession } from '@/lib/auth-client';

export interface RealtimeNotification {
	id: string;
	type: string;
	title: string;
	message: string;
	data?: Record<string, unknown>;
	createdAt: string;
}

interface UseRealtimeNotificationsReturn {
	unreadCount: number;
	incrementUnread: () => void;
	resetUnread: () => void;
}

const fetcher = async (url: string) => {
	const response = await fetch(url);
	if (!response.ok) throw new Error('Failed to fetch');
	return response.json();
};

export function useRealtimeNotifications(): UseRealtimeNotificationsReturn {
	const { data: session } = useSession();
	const [realtimeIncrement, setRealtimeIncrement] = useState(0);

	const { data: notificationData } = useSWR(
		session?.user?.id ? '/api/notifications?unreadOnly=true&limit=0' : null,
		fetcher,
		{
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
			dedupingInterval: 60000,
		}
	);

	const baseUnreadCount = notificationData?.unreadCount ?? 0;
	const unreadCount = baseUnreadCount + realtimeIncrement;

	const handleNotification = useCallback((notification: RealtimeNotification) => {
		setRealtimeIncrement((prev) => prev + 1);

		const icon = notification.data?.icon || '🏆';
		const title = `${icon} ${notification.title}`;

		switch (notification.type) {
			case 'achievement_unlocked':
				toast.success(title, {
					description: notification.message,
					duration: 5000,
					position: 'top-right',
				});
				break;
			case 'buddy_request':
				toast.info(notification.title, {
					description: notification.message,
					duration: 5000,
					position: 'top-right',
				});
				break;
			case 'level_up':
				toast.success(title, {
					description: notification.message,
					duration: 7000,
					position: 'top-right',
				});
				break;
			default:
				toast.info(notification.title, {
					description: notification.message,
					duration: 5000,
					position: 'top-right',
				});
		}
	}, []);

	const channelName = session?.user?.id ? `user:${session.user.id}:notifications` : null;

	useChannel(channelName || 'dummy-channel', (message) => {
		if (!channelName) return;

		const notification = message.data as RealtimeNotification;
		if (notification) {
			handleNotification(notification);
		}
	});

	const incrementUnread = useCallback(() => {
		setRealtimeIncrement((prev) => prev + 1);
	}, []);

	const resetUnread = useCallback(() => {
		setRealtimeIncrement(0);
	}, []);

	return {
		unreadCount,
		incrementUnread,
		resetUnread,
	};
}
