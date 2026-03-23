'use client';

import { Notification01Icon, Notification03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { AnimatePresence, m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getNotificationsAction, markNotificationAsReadAction } from '@/lib/db/actions';
import type { Notification } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

export function NotificationBell() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		async function load() {
			const data = await getNotificationsAction();
			setNotifications(data);
			setUnreadCount(data.filter((n) => !n.isRead).length);
		}
		load();
		// Set up poll or Ably listener here in production
	}, []);

	const handleMarkAsRead = async (id: string) => {
		await markNotificationAsReadAction(id);
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
		setUnreadCount((prev) => Math.max(0, prev - 1));
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative w-12 h-12 rounded-2xl bg-secondary hover:bg-secondary/80 tiimo-press"
				>
					<HugeiconsIcon
						icon={unreadCount > 0 ? Notification01Icon : Notification03Icon}
						className={cn('w-6 h-6', unreadCount > 0 ? 'text-primary' : 'text-tiimo-gray-muted')}
					/>
					{unreadCount > 0 && (
						<span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-secondary" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="end"
				className="w-[320px] sm:w-80 rounded-[2rem] p-4 shadow-tiimo border-border/50 bg-card/95 backdrop-blur-xl"
			>
				<DropdownMenuLabel className="font-black uppercase tracking-widest text-[10px] text-tiimo-gray-muted mb-2 px-2">
					Notifications
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-border/50 mb-2" />
				<div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-2">
					<AnimatePresence mode="popLayout">
						{notifications.length === 0 ? (
							<m.div
								key="empty"
								layout
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="py-8 text-center text-[10px] font-bold text-tiimo-gray-muted uppercase tracking-widest"
							>
								All caught up!
							</m.div>
						) : (
							notifications.map((n) => (
								<m.div
									key={n.id}
									layout
									initial={{ opacity: 0, scale: 0.95 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.95 }}
								>
									<DropdownMenuItem
										className={cn(
											'rounded-2xl p-4 cursor-pointer transition-all flex flex-col gap-1 items-start focus:bg-secondary/50',
											!n.isRead && 'bg-primary/5 border border-primary/10'
										)}
										onClick={() => handleMarkAsRead(n.id)}
									>
										<div className="flex w-full justify-between items-start gap-2">
											<span className="font-black text-xs uppercase tracking-tight leading-tight">
												{n.title}
											</span>
											{!n.isRead && (
												<div className="w-1.5 h-1.5 bg-primary rounded-full mt-1 shrink-0" />
											)}
										</div>
										<p className="text-[10px] font-medium text-tiimo-gray-muted leading-relaxed">
											{n.message}
										</p>
										<span className="text-[9px] font-bold text-tiimo-gray-muted/50 uppercase tracking-tighter mt-1">
											{new Date(n.createdAt!).toLocaleDateString()}
										</span>
									</DropdownMenuItem>
								</m.div>
							))
						)}
					</AnimatePresence>
				</div>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
