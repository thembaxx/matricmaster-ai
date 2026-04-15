'use client';

import { Notification03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Notification } from '@/components/Notifications/types';
import { Card } from '@/components/ui/card';

const MOCK_NOTIFICATIONS: Notification[] = [
	{
		id: '1',
		type: 'achievement',
		title: 'Achievement Unlocked!',
		message: 'Congratulations! You scored 85% in Mathematics Paper 1.',
		icon: 'trophy',
		iconColor: 'text-amber-500',
		iconBg: 'bg-amber-100 dark:bg-amber-900/30',
		isRead: false,
		createdAt: new Date(Date.now() - 1000 * 60 * 15),
	},
	{
		id: '2',
		type: 'streak',
		title: '7 Day Streak!',
		message: "You've studied for 7 consecutive days!",
		icon: 'fire',
		iconColor: 'text-orange-500',
		iconBg: 'bg-orange-100 dark:bg-orange-900/30',
		isRead: false,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
	},
	{
		id: '3',
		type: 'exam',
		title: 'Exam Reminder',
		message: 'Physical Sciences Paper 2 is in 3 days.',
		icon: 'calendar',
		iconColor: 'text-blue-500',
		iconBg: 'bg-blue-100 dark:bg-blue-900/30',
		isRead: false,
		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
	},
];

export default function NotificationsPage() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setNotifications(MOCK_NOTIFICATIONS);
		setIsLoading(false);
	}, []);

	const handleMarkAsRead = (id: string) => {
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
	};

	const handleDelete = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
		toast.success('Notification deleted');
	};

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const formatTime = (date: Date) => {
		const diff = Date.now() - date.getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		return `${days}d ago`;
	};

	if (isLoading) {
		return (
			<div className="flex h-full min-h-[400px] items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-background pb-40">
			<header className="sticky top-0 z-20 border-b border-border bg-card px-6 pt-12 pb-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-2xl font-black">Notifications</h1>
						<p className="text-sm text-muted-foreground">
							{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
						</p>
					</div>
					{unreadCount > 0 && (
						<button
							type="button"
							onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))}
							className="text-sm text-primary hover:underline"
						>
							Mark all read
						</button>
					)}
				</div>
			</header>

			<main className="flex-1 overflow-y-auto p-4">
				{notifications.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
						<div className="rounded-full bg-muted p-4">
							<HugeiconsIcon
								icon={Notification03Icon}
								className="h-12 w-12 text-muted-foreground"
							/>
						</div>
						<h3 className="text-lg font-semibold">No notifications yet</h3>
						<p className="text-muted-foreground">You&apos;ll see updates here.</p>
					</div>
				) : (
					<div className="space-y-2">
						{notifications.map((notification) => (
							<Card
								key={notification.id}
								className={`p-4 transition-colors hover:bg-muted/50 cursor-pointer ${
									notification.isRead ? 'opacity-60' : 'border-l-4 border-l-primary'
								}`}
							>
								<div className="flex items-start gap-3">
									<div className={`rounded-full p-2 ${notification.iconBg || 'bg-primary/10'}`}>
										<HugeiconsIcon
											icon={Notification03Icon}
											className={`h-5 w-5 ${notification.iconColor || 'text-primary'}`}
										/>
									</div>
									<div className="flex-1 space-y-1">
										<div className="flex items-center justify-between">
											<h3 className="font-semibold">{notification.title}</h3>
											<span className="text-xs text-muted-foreground">
												{formatTime(notification.createdAt)}
											</span>
										</div>
										<p className="text-sm text-muted-foreground">{notification.message}</p>
										<div className="flex gap-2 pt-2">
											{!notification.isRead && (
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														handleMarkAsRead(notification.id);
													}}
													className="text-xs text-primary hover:underline"
												>
													Mark read
												</button>
											)}
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(notification.id);
												}}
												className="text-xs text-destructive hover:underline"
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>
				)}
			</main>
		</div>
	);
}
