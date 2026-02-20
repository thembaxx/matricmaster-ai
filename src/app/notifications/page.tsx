'use client';

import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/lib/auth-client';

interface Notification {
	id: string;
	type: string;
	title: string;
	message: string;
	data?: Record<string, unknown>;
	isRead: boolean;
	createdAt: Date;
	readAt?: Date;
}

export default function NotificationsPage() {
	const { data: session } = useSession();
	const router = useRouter();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('all');

	const loadNotifications = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/notifications?limit=50');
			const data = await response.json();

			if (data.success) {
				setNotifications(data.data || []);
				setUnreadCount(data.unreadCount || 0);
			}
		} catch (error) {
			console.error('Error loading notifications:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		if (session?.user?.id) {
			loadNotifications();
		}
	}, [session?.user?.id, loadNotifications]);

	async function markAsRead(notificationId: string) {
		try {
			await fetch(`/api/notifications?id=${notificationId}&action=read`, {
				method: 'PATCH',
			});
			setNotifications((prev) =>
				prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
			);
			setUnreadCount((prev) => Math.max(0, prev - 1));
		} catch (error) {
			console.error('Error marking as read:', error);
		}
	}

	async function markAllAsRead() {
		try {
			await fetch('/api/notifications', { method: 'PATCH' });
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
			setUnreadCount(0);
			toast.success('All notifications marked as read');
		} catch (error) {
			console.error('Error marking all as read:', error);
		}
	}

	async function deleteNotification(notificationId: string) {
		try {
			await fetch(`/api/notifications?id=${notificationId}`, { method: 'DELETE' });
			setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
			toast.success('Notification deleted');
		} catch (error) {
			console.error('Error deleting notification:', error);
		}
	}

	const filteredNotifications =
		activeTab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case 'achievement':
				return '🏆';
			case 'buddy_request':
				return '👥';
			case 'comment_reply':
				return '💬';
			case 'study_reminder':
				return '📚';
			default:
				return '🔔';
		}
	};

	const formatTime = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - new Date(date).getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;
		return new Date(date).toLocaleDateString();
	};

	if (!session) {
		return (
			<div className="container mx-auto py-8 max-w-4xl">
				<Card>
					<CardContent className="py-12 text-center">
						<Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
						<p className="text-muted-foreground">Please sign in to view your notifications.</p>
						<Button className="mt-4" onClick={() => router.push('/sign-in')}>
							Sign In
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 max-w-4xl">
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<Bell className="h-8 w-8 text-primary" />
					<div>
						<h1 className="text-3xl font-bold">Notifications</h1>
						<p className="text-muted-foreground">
							{unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
						</p>
					</div>
				</div>
				{unreadCount > 0 && (
					<Button variant="outline" onClick={markAllAsRead}>
						<CheckCheck className="h-4 w-4 mr-2" />
						Mark all as read
					</Button>
				)}
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="mb-4">
					<TabsTrigger value="all">
						All
						<Badge variant="secondary" className="ml-2">
							{notifications.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="unread">
						Unread
						{unreadCount > 0 && (
							<Badge variant="destructive" className="ml-2">
								{unreadCount}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>

				<TabsContent value={activeTab}>
					{isLoading ? (
						<Card>
							<CardContent className="py-12 text-center">
								<div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
							</CardContent>
						</Card>
					) : filteredNotifications.length === 0 ? (
						<Card>
							<CardContent className="py-12 text-center">
								<Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
								<p className="text-muted-foreground">
									{activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
								</p>
							</CardContent>
						</Card>
					) : (
						<ScrollArea className="h-[calc(100vh-300px)]">
							<div className="space-y-3">
								{filteredNotifications.map((notification) => (
									<Card
										key={notification.id}
										className={`transition-all hover:shadow-md ${
											!notification.isRead ? 'border-l-4 border-l-primary' : ''
										}`}
									>
										<CardContent className="p-4">
											<div className="flex items-start gap-4">
												<div className="text-2xl">{getNotificationIcon(notification.type)}</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<h3 className="font-semibold truncate">{notification.title}</h3>
														{!notification.isRead && (
															<div className="h-2 w-2 rounded-full bg-primary" />
														)}
													</div>
													<p className="text-sm text-muted-foreground mt-1">
														{notification.message}
													</p>
													<p className="text-xs text-muted-foreground mt-2">
														{formatTime(notification.createdAt)}
													</p>
												</div>
												<div className="flex items-center gap-1">
													{!notification.isRead && (
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8"
															onClick={() => markAsRead(notification.id)}
														>
															<Check className="h-4 w-4" />
														</Button>
													)}
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-destructive"
														onClick={() => deleteNotification(notification.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</ScrollArea>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
