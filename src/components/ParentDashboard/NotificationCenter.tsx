'use client';

import {
	AlertCircleIcon,
	Calendar01Icon,
	FireIcon,
	Notification01Icon,
	Notification03Icon,
	Settings01Icon,
	StarIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, motion as m } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ParentNotification } from '@/actions/parent-notifications';
import {
	getParentNotifications,
	getParentUnreadCount,
	markAllParentNotificationsAsRead,
} from '@/actions/parent-notifications';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const typeIcons = {
	achievement: StarIcon,
	progress: FireIcon,
	session: Calendar01Icon,
	alert: AlertCircleIcon,
	milestone: StarIcon,
};

const typeColors = {
	achievement: 'text-warning bg-warning/10',
	progress: 'text-primary bg-primary/10',
	session: 'text-success bg-success/10',
	alert: 'text-destructive bg-destructive/10',
	milestone: 'text-warning bg-warning/10',
};

interface NotificationCenterProps {
	className?: string;
}

export function NotificationCenter({ className }: NotificationCenterProps) {
	const [notifications, setNotifications] = useState<ParentNotification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [filter, setFilter] = useState<string>('all');
	const [isLoading, setIsLoading] = useState(true);

	const loadNotifications = useCallback(async () => {
		setIsLoading(true);
		try {
			const [notifs, count] = await Promise.all([getParentNotifications(), getParentUnreadCount()]);
			setNotifications(notifs);
			setUnreadCount(count);
		} catch (error) {
			console.error('[NotificationCenter] Error loading:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadNotifications();
	}, [loadNotifications]);

	async function handleMarkAllRead() {
		await markAllParentNotificationsAsRead();
		toast.success('All notifications marked as read');
		loadNotifications();
	}

	const filteredNotifications =
		filter === 'all' ? notifications : notifications.filter((n) => n.type === filter);

	const uniqueTypes = ['all', ...new Set(notifications.map((n) => n.type))];

	function formatTime(date: Date) {
		const d = new Date(date);
		const now = new Date();
		const diffMs = now.getTime() - d.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return d.toLocaleDateString();
	}

	return (
		<div className={cn('', className)}>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="relative w-12 h-12 rounded-2xl bg-secondary hover:bg-secondary/80 tiimo-press transition-all"
					>
						<HugeiconsIcon
							icon={unreadCount > 0 ? Notification01Icon : Notification03Icon}
							className={cn(
								'w-6 h-6 transition-colors',
								unreadCount > 0 ? 'text-primary' : 'text-muted-foreground'
							)}
						/>
						{unreadCount > 0 && (
							<span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-[10px] font-black rounded-full flex items-center justify-center">
								{unreadCount > 9 ? '9+' : unreadCount}
							</span>
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					className="w-[380px] rounded-[2rem] p-0 shadow-tiimo border-border/50 bg-card/95 backdrop-blur-xl overflow-hidden"
				>
					<div className="p-4 border-b border-border/50">
						<div className="flex items-center justify-between mb-3">
							<DropdownMenuLabel className="font-black text-sm tracking-wider text-muted-foreground p-0">
								NOTIFICATIONS
							</DropdownMenuLabel>
							{unreadCount > 0 && (
								<Button
									variant="ghost"
									size="sm"
									className="text-xs font-bold text-primary h-7 px-2"
									onClick={handleMarkAllRead}
								>
									Mark all read
								</Button>
							)}
						</div>
						<div className="flex gap-1.5 overflow-x-auto no-scrollbar">
							{uniqueTypes.map((type) => (
								<Button
									key={type}
									variant={filter === type ? 'default' : 'outline'}
									size="sm"
									className={cn(
										'text-xs font-bold px-3 h-7 rounded-full whitespace-nowrap',
										filter === type
											? 'bg-primary text-primary-foreground'
											: 'bg-muted/50 text-muted-foreground'
									)}
									onClick={() => setFilter(type)}
								>
									{type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
								</Button>
							))}
						</div>
					</div>

					<div className="max-h-[400px] overflow-y-auto no-scrollbar">
						<AnimatePresence mode="popLayout">
							{isLoading ? (
								<div className="p-8 space-y-3">
									{Array.from({ length: 3 }).map((_, i) => (
										<div
											key={`skeleton-${i}`}
											className="h-16 bg-muted animate-pulse rounded-2xl"
										/>
									))}
								</div>
							) : filteredNotifications.length === 0 ? (
								<m.div
									key="empty"
									layout
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="py-12 text-center"
								>
									<HugeiconsIcon
										icon={Notification03Icon}
										className="w-12 h-12 mx-auto mb-3 opacity-30 text-muted-foreground"
									/>
									<p className="text-sm font-bold text-muted-foreground">All caught up!</p>
									<p className="text-xs text-muted-foreground/60 mt-1">
										No notifications right now
									</p>
								</m.div>
							) : (
								filteredNotifications.map((notification) => {
									const IconComponent = typeIcons[notification.type] || AlertCircleIcon;
									const colorClass = typeColors[notification.type] || 'bg-muted';

									return (
										<m.div
											key={notification.id}
											layout
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											className={cn(
												'p-4 border-b border-border/30 hover:bg-muted/30 transition-colors cursor-pointer',
												!notification.read && 'bg-primary/5'
											)}
										>
											<div className="flex gap-3">
												<div
													className={cn(
														'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
														colorClass
													)}
												>
													<HugeiconsIcon
														icon={IconComponent}
														className={cn(
															'w-5 h-5',
															notification.type === 'achievement' && 'text-warning',
															notification.type === 'progress' && 'text-primary',
															notification.type === 'session' && 'text-success',
															notification.type === 'alert' && 'text-destructive'
														)}
													/>
												</div>
												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between gap-2">
														<p
															className={cn(
																'font-bold text-sm leading-tight',
																!notification.read && 'font-black'
															)}
														>
															{notification.title}
														</p>
														{!notification.read && (
															<span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />
														)}
													</div>
													<p className="text-xs text-muted-foreground mt-1 line-clamp-2">
														{notification.message}
													</p>
													<div className="flex items-center gap-2 mt-2">
														<Badge
															variant="outline"
															className="text-[10px] font-bold px-1.5 py-0 h-5 rounded-full"
														>
															{notification.childName}
														</Badge>
														<span className="text-[10px] text-muted-foreground">
															{formatTime(notification.timestamp)}
														</span>
													</div>
												</div>
											</div>
										</m.div>
									);
								})
							)}
						</AnimatePresence>
					</div>

					<DropdownMenuSeparator className="bg-border/50" />

					<div className="p-3">
						<DropdownMenuItem className="w-full justify-center text-xs font-bold text-muted-foreground cursor-pointer">
							<HugeiconsIcon icon={Settings01Icon} className="w-4 h-4 mr-2" />
							Notification settings
						</DropdownMenuItem>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
