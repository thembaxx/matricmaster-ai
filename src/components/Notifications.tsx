'use client';

import {
	AlertCircle,
	Award,
	Bell,
	Calendar,
	Check,
	CheckCircle,
	MessageSquare,
	TrendingUp,
	Users,
	X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserNotifications } from '@/hooks/use-user-notifications';
import { useSession } from '@/lib/auth-client';

interface Notification {
	id: string;
	type: string;
	title: string;
	message: string;
	isRead: boolean;
	createdAt: string;
	data?: Record<string, unknown>;
}

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
	comment: <MessageSquare className="h-4 w-4 text-blue-500" />,
	buddy_request: <Users className="h-4 w-4 text-green-500" />,
	calendar: <Calendar className="h-4 w-4 text-purple-500" />,
	achievement: <Award className="h-4 w-4 text-yellow-500" />,
	progress: <TrendingUp className="h-4 w-4 text-cyan-500" />,
	alert: <AlertCircle className="h-4 w-4 text-red-500" />,
	success: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export default function NotificationsDropdown() {
	const { data: session } = useSession();
	const user = session?.user;
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [open, setOpen] = useState(false);

	const { channel } = useUserNotifications(user?.id);

	const fetchNotifications = useCallback(async () => {
		if (!user) return;

		try {
			const response = await fetch('/api/notifications');
			if (response.ok) {
				const data = await response.json();
				setNotifications(data);
			}
		} catch (error) {
			console.error('Failed to fetch notifications:', error);
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	useEffect(() => {
		fetchNotifications();
		const interval = setInterval(fetchNotifications, 30000);
		return () => clearInterval(interval);
	}, [fetchNotifications]);

	useEffect(() => {
		if (!channel) return;

		const handleNewNotification = (message: { data?: Notification }) => {
			const notification = message.data;
			if (!notification) return;

			console.log('[Notifications] Received realtime notification:', notification);

			setNotifications((prev) => {
				const exists = prev.some((n) => n.id === notification.id);
				if (exists) return prev;
				return [notification, ...prev];
			});

			toast(notification.title, {
				description: notification.message,
				icon: NOTIFICATION_ICONS[notification.type] || <Bell className="h-4 w-4" />,
				duration: 5000,
			});
		};

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		// biome-ignore lint/suspicious/noExplicitAny: Unknown type
		channel.subscribe('notification', handleNewNotification as any);

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return () => {
			// biome-ignore lint/suspicious/noExplicitAny:Unknown type
			channel.unsubscribe('notification', handleNewNotification as any);
		};
	}, [channel]);

	const markAsRead = async (notificationId: string) => {
		try {
			await fetch(`/api/notifications/${notificationId}/read`, {
				method: 'POST',
			});
			setNotifications(
				notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
			);
		} catch (error) {
			console.error('Failed to mark as read:', error);
		}
	};

	const markAllAsRead = async () => {
		try {
			await fetch('/api/notifications/read-all', {
				method: 'POST',
			});
			setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
		} catch (error) {
			console.error('Failed to mark all as read:', error);
		}
	};

	const deleteNotification = async (notificationId: string) => {
		try {
			await fetch(`/api/notifications/${notificationId}`, {
				method: 'DELETE',
			});
			setNotifications(notifications.filter((n) => n.id !== notificationId));
		} catch (error) {
			console.error('Failed to delete notification:', error);
		}
	};

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		return `${days}d ago`;
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
						>
							{unreadCount > 9 ? '9+' : unreadCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-80 p-0" align="end">
				<div className="flex items-center justify-between p-4 border-b">
					<h3 className="font-semibold">Notifications</h3>
					{unreadCount > 0 && (
						<Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
							Mark all read
						</Button>
					)}
				</div>

				<Tabs defaultValue="all" className="w-full">
					<TabsList className="w-full grid grid-cols-2">
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
					</TabsList>

					<TabsContent value="all" className="m-0">
						<NotificationList
							notifications={notifications}
							isLoading={isLoading}
							onMarkAsRead={markAsRead}
							onDelete={deleteNotification}
							formatTime={formatTime}
						/>
					</TabsContent>

					<TabsContent value="unread" className="m-0">
						<NotificationList
							notifications={notifications.filter((n) => !n.isRead)}
							isLoading={isLoading}
							onMarkAsRead={markAsRead}
							onDelete={deleteNotification}
							formatTime={formatTime}
							emptyMessage="No unread notifications"
						/>
					</TabsContent>
				</Tabs>
			</PopoverContent>
		</Popover>
	);
}

interface NotificationListProps {
	notifications: Notification[];
	isLoading: boolean;
	onMarkAsRead: (id: string) => void;
	onDelete: (id: string) => void;
	formatTime: (date: string) => string;
	emptyMessage?: string;
}

function NotificationList({
	notifications,
	isLoading,
	onMarkAsRead,
	onDelete,
	formatTime,
	emptyMessage = 'No notifications yet',
}: NotificationListProps) {
	if (isLoading) {
		return <div className="p-4 text-center text-muted-foreground">Loading notifications...</div>;
	}

	if (notifications.length === 0) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				<Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
				<p className="text-sm">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<ScrollArea className="h-75">
			<div className="divide-y">
				{notifications.map((notification) => (
					<div
						key={notification.id}
						className={`p-3 hover:bg-accent/50 transition-colors ${
							!notification.isRead ? 'bg-blue-50/50' : ''
						}`}
					>
						<div className="flex items-start gap-3">
							<div className="mt-1">
								{NOTIFICATION_ICONS[notification.type] || <Bell className="h-4 w-4" />}
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-start justify-between gap-2">
									<p className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}>
										{notification.title}
									</p>
									<span className="text-xs text-muted-foreground whitespace-nowrap">
										{formatTime(notification.createdAt)}
									</span>
								</div>
								<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
									{notification.message}
								</p>
								<div className="flex items-center gap-2 mt-2">
									{!notification.isRead && (
										<Button
											variant="ghost"
											size="sm"
											className="h-6 text-xs"
											onClick={() => onMarkAsRead(notification.id)}
										>
											<Check className="h-3 w-3 mr-1" />
											Mark read
										</Button>
									)}
									<Button
										variant="ghost"
										size="sm"
										className="h-6 text-xs text-muted-foreground"
										onClick={() => onDelete(notification.id)}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</ScrollArea>
	);
}
