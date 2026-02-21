'use client';

import { useChannel } from 'ably/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
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

export function useRealtimeNotifications(): UseRealtimeNotificationsReturn {
	const { data: session } = useSession();
	const [unreadCount, setUnreadCount] = useState(0);

	const handleNotification = useCallback((notification: RealtimeNotification) => {
		setUnreadCount((prev) => prev + 1);

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
		setUnreadCount((prev) => prev + 1);
	}, []);

	const resetUnread = useCallback(() => {
		setUnreadCount(0);
	}, []);

	useEffect(() => {
		async function fetchInitialCount() {
			if (!session?.user?.id) return;

			try {
				const response = await fetch('/api/notifications?unreadOnly=true&limit=0');
				if (response.ok) {
					const data = await response.json();
					setUnreadCount(data.unreadCount || 0);
				}
			} catch (error) {
				console.error('[RealtimeNotifications] Error fetching initial count:', error);
			}
		}

		fetchInitialCount();
	}, [session?.user?.id]);

	return {
		unreadCount,
		incrementUnread,
		resetUnread,
	};
}
