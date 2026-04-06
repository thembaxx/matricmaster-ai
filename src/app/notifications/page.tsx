'use client';

import { Notification03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { NotificationHeader } from '@/components/Notifications/NotificationHeader';
import { NotificationItem } from '@/components/Notifications/NotificationItem';
import type { Notification, NotificationAction } from '@/components/Notifications/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const generateMockNotifications = (): Notification[] => {
	const now = new Date();

	return [
		{
			id: '1',
			type: 'streak',
			title: '12 Day Streak!',
			message: "You've studied for 12 days in a row. Keep it up!",
			detail: 'Mathematics: 5 sessions • Physics: 4 sessions • Life Sciences: 3 sessions',
			icon: 'fire',
			iconColor: 'text-orange-500',
			iconBg: 'bg-orange-100 dark:bg-orange-900/30',
			isRead: false,
			createdAt: new Date(now.getTime() - 1000 * 60 * 5),
		},
		{
			id: '2',
			type: 'achievement',
			title: 'Achievement Unlocked!',
			message: 'You earned the "Week Warrior" badge',
			detail: 'Maintain a 7-day study streak',
			icon: 'trophy',
			iconColor: 'text-amber-500',
			iconBg: 'bg-amber-100 dark:bg-amber-900/30',
			actions: [{ label: 'View Achievements', href: '/achievements' }],
			isRead: false,
			createdAt: new Date(now.getTime() - 1000 * 60 * 30),
		},
		{
			id: '3',
			type: 'exam',
			title: 'Exam Countdown',
			message: 'Mathematics Paper 1 in 14 days',
			detail: 'Nov 3, 2026 • 09:00 AM • Duration: 3 hours',
			icon: 'calendar',
			iconColor: 'text-blue-500',
			iconBg: 'bg-blue-100 dark:bg-blue-900/30',
			actions: [
				{ label: 'View Schedule', href: '/schedule' },
				{ label: 'Practice Now', href: '/quiz?subject=mathematics' },
			],
			isRead: false,
			createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
		},
		{
			id: '4',
			type: 'past_paper',
			title: 'Past Paper Complete!',
			message: 'You finished Physical Sciences 2024 November',
			detail: 'Score: 78% • Time: 2h 15m • 156 marks',
			icon: 'book',
			iconColor: 'text-emerald-500',
			iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
			actions: [
				{ label: 'Review Answers', href: '/past-paper?id=phys-2024-nov' },
				{ label: 'Similar Papers', href: '/past-papers?subject=physics' },
			],
			isRead: false,
			createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 4),
		},
		{
			id: '5',
			type: 'buddy',
			title: 'Study Buddy Request',
			message: 'Amahle Nkosi wants to study with you',
			detail: 'Maths • Life Sciences • Both online now',
			icon: 'user',
			iconColor: 'text-violet-500',
			iconBg: 'bg-violet-100 dark:bg-violet-900/30',
			actions: [
				{ label: 'Accept', variant: 'default' },
				{ label: 'Decline', variant: 'outline' },
			],
			isRead: false,
			createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 6),
		},
		{
			id: '6',
			type: 'progress',
			title: 'Topic Mastered!',
			message: "You've mastered 'Calculus - Differentiation'",
			detail: '15/15 questions correct • 3 practice sessions',
			icon: 'sparkles',
			iconColor: 'text-primary',
			iconBg: 'bg-primary/10',
			actions: [{ label: 'View Topics', href: '/curriculum-map' }],
			isRead: true,
			createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 12),
		},
		{
			id: '7',
			type: 'leaderboard',
			title: 'You Moved Up!',
			message: "You're now #47 on the Mathematics leaderboard",
			detail: 'Up 12 spots from yesterday • 2,450 XP this week',
			icon: 'rank',
			iconColor: 'text-cyan-500',
			iconBg: 'bg-cyan-100 dark:bg-cyan-900/30',
			actions: [{ label: 'View Leaderboard', href: '/leaderboard?subject=mathematics' }],
			isRead: true,
			createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 18),
		},
		{
			id: '8',
			type: 'study_reminder',
			title: 'Time to Study!',
			message: "You haven't studied today. Ready for a quick session?",
			detail: 'Recommended: 30 min Mathematics',
			icon: 'timer',
			iconColor: 'text-rose-500',
			iconBg: 'bg-rose-100 dark:bg-rose-900/30',
			actions: [
				{ label: 'Start Studying', href: '/dashboard' },
				{ label: 'Snooze 1h', variant: 'outline' },
			],
			isRead: true,
			createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
		},
		{
			id: '9',
			type: 'weekly_summary',
			title: 'Weekly Summary',
			message: 'Your study week at a glance',
			detail: '5 days active • 12.5 hours • 847 XP • 89% accuracy',
			icon: 'chart',
			iconColor: 'text-indigo-500',
			iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
			actions: [{ label: 'View Details', href: '/dashboard' }],
			isRead: true,
			createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 48),
		},
		{
			id: '10',
			type: 'buddy',
			title: 'Study Buddy Online',
			message: 'Lwazi is online in Focus Room - Mathematics',
			detail: '3 others studying now',
			icon: 'user',
			iconColor: 'text-pink-500',
			iconBg: 'bg-pink-100 dark:bg-pink-900/30',
			actions: [{ label: 'Join Room', href: '/focus-rooms?room=math' }],
			isRead: true,
			createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 72),
		},
	];
};

export default function NotificationsPage() {
	const router = useRouter();
	const [notifications, setNotifications] = useState<Notification[]>(() =>
		generateMockNotifications()
	);
	const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
	const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

	const markAsRead = (id: string) => {
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
		toast.success('Marked as read');
	};

	const markAllAsRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
		toast.success('All notifications marked as read');
	};

	const deleteNotification = (id: string) => {
		setIsDeleting(id);
		setTimeout(() => {
			setNotifications((prev) => prev.filter((n) => n.id !== id));
			setIsDeleting(null);
			toast.success('Notification removed');
		}, 300);
	};

	const handleAction = (action: NotificationAction) => {
		if (action.onClick) {
			action.onClick();
		} else if (action.href) {
			router.push(action.href);
		}
	};

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
