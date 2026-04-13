'use client';

import { Notification03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { NotificationHeader } from '@/components/Notifications/NotificationHeader';
import { NotificationItem } from '@/components/Notifications/NotificationItem';
import type { Notification, NotificationAction } from '@/components/Notifications/types';
import { ScrollArea } from '@/components/ui/scroll-area';

// Map DB notification type to UI icon/type
const TYPE_CONFIG: Record<
	string,
	{ icon: Notification['icon']; iconColor: string; iconBg: string }
> = {
	achievement: {
		icon: 'trophy',
		iconColor: 'text-amber-500',
		iconBg: 'bg-amber-100 dark:bg-amber-900/30',
	},
	streak: {
		icon: 'fire',
		iconColor: 'text-orange-500',
		iconBg: 'bg-orange-100 dark:bg-orange-900/30',
	},
	exam: { icon: 'calendar', iconColor: 'text-blue-500', iconBg: 'bg-blue-100 dark:bg-blue-900/30' },
	past_paper: {
		icon: 'book',
		iconColor: 'text-emerald-500',
		iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
	},
	buddy: {
		icon: 'user',
		iconColor: 'text-violet-500',
		iconBg: 'bg-violet-100 dark:bg-violet-900/30',
	},
	progress: { icon: 'sparkles', iconColor: 'text-primary', iconBg: 'bg-primary/10' },
	leaderboard: {
		icon: 'rank',
		iconColor: 'text-cyan-500',
		iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
	},
	study_reminder: {
		icon: 'timer',
		iconColor: 'text-rose-500',
		iconBg: 'bg-rose-100 dark:bg-rose-900/30',
	},
	weekly_summary: {
		icon: 'chart',
		iconColor: 'text-indigo-500',
		iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
	},
	comment_reply: { icon: 'message', iconColor: 'text-primary', iconBg: 'bg-primary/10' },
	buddy_request: {
		icon: 'user',
		iconColor: 'text-violet-500',
		iconBg: 'bg-violet-100 dark:bg-violet-900/30',
	},
	wellness_tip: {
		icon: 'sparkles',
		iconColor: 'text-emerald-500',
		iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
	},
	practice_result: {
		icon: 'chart',
		iconColor: 'text-indigo-500',
		iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
	},
};

const FALLBACK_CONFIG = {
	icon: 'sparkles' as const,
	iconColor: 'text-primary',
	iconBg: 'bg-primary/10',
};

interface DbNotification {
	id: string;
	type: string;
	title: string;
	message: string;
	data?: string | null;
	isRead: boolean;
	readAt?: string | null;
	createdAt?: string | null;
}

function mapDbNotification(db: DbNotification): Notification {
	const config = TYPE_CONFIG[db.type] ?? FALLBACK_CONFIG;
	const detail = db.data
		? (() => {
				try {
					return JSON.parse(db.data);
				} catch {
					return null;
				}
			})()
		: null;

	return {
		id: db.id,
		type: db.type as Notification['type'],
		title: db.title,
		message: db.message,
		detail: detail ? JSON.stringify(detail) : undefined,
		icon: config.icon,
		iconColor: config.iconColor,
		iconBg: config.iconBg,
		isRead: db.isRead,
		createdAt: db.createdAt ? new Date(db.createdAt) : new Date(),
	};
}

export default function NotificationsPage() {
	const router = useRouter();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
	const [isDeleting, setIsDeleting] = useState<string | null>(null);

	const fetchNotifications = useCallback(async () => {
		try {
			const res = await fetch('/api/notifications?limit=50');
			const json = await res.json();
			if (json.success && Array.isArray(json.data)) {
				setNotifications(json.data.map(mapDbNotification));
			}
		} catch {
			toast.error('Failed to load notifications');
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchNotifications();
	}, [fetchNotifications]);

	const unreadCount = notifications.filter((n) => !n.isRead).length;
	const filteredNotifications =
		activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

	const formatTime = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days === 1) return 'Yesterday';
		if (days < 7) return `${days} days ago`;
		return date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
	};

	const formatFullDate = (date: Date) => {
		return date.toLocaleDateString('en-ZA', {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			hour: 'numeric',
			minute: '2-digit',
		});
	};

	const markAsRead = async (id: string) => {
		try {
			// Optimistic update
			setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
			const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
			if (!res.ok) throw new Error('Failed');
		} catch {
			// Revert on failure
			fetchNotifications();
			toast.error('Failed to mark as read');
		}
	};

	const markAllAsRead = async () => {
		try {
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
			const res = await fetch('/api/notifications', { method: 'PATCH' });
			if (!res.ok) throw new Error('Failed');
			toast.success('All notifications marked as read');
		} catch {
			fetchNotifications();
			toast.error('Failed to mark all as read');
		}
	};

	const deleteNotification = async (id: string) => {
		setIsDeleting(id);
		try {
			const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Failed');
			setNotifications((prev) => prev.filter((n) => n.id !== id));
			toast.success('Notification removed');
		} catch {
			toast.error('Failed to delete notification');
		} finally {
			setIsDeleting(null);
		}
	};

	const handleAction = (action: NotificationAction) => {
		if (action.onClick) {
			action.onClick();
		} else if (action.href) {
			router.push(action.href);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<p className="text-muted-foreground">Loading notifications...</p>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<NotificationHeader
				unreadCount={unreadCount}
				totalCount={notifications.length}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				onMarkAllRead={markAllAsRead}
			/>

			<div className="max-w-2xl mx-auto px-4 py-6 pb-32">
				{filteredNotifications.length === 0 ? (
					<div className="text-center py-16">
						<div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
							<HugeiconsIcon
								icon={Notification03Icon}
								className="w-8 h-8 text-muted-foreground/50"
							/>
						</div>
						<h3 className="text-sm font-semibold text-foreground mb-1">No notifications</h3>
						<p className="text-xs text-muted-foreground">
							{activeTab === 'unread' ? "You've read everything!" : "You're all caught up"}
						</p>
					</div>
				) : (
					<ScrollArea>
						<div className="space-y-3">
							<AnimatePresence mode="popLayout">
								{filteredNotifications.map((notification, index) => (
									<NotificationItem
										key={notification.id}
										notification={notification}
										index={index}
										isDeleting={isDeleting === notification.id}
										formatTime={formatTime}
										formatFullDate={formatFullDate}
										onMarkAsRead={markAsRead}
										onDelete={deleteNotification}
										onAction={handleAction}
									/>
								))}
							</AnimatePresence>
						</div>
					</ScrollArea>
				)}
			</div>
		</div>
	);
}
