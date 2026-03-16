'use client';

import {
	ArrowRight01Icon,
	BookOpen01Icon,
	Calendar02Icon,
	Delete02Icon,
	FireIcon,
	Medal01Icon,
	Message01Icon,
	SparklesIcon,
	Tick01Icon,
	Timer02Icon,
	UserIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export interface NotificationAction {
	label: string;
	href?: string;
	onClick?: () => void;
	variant?: 'default' | 'outline' | 'ghost';
}

export type NotificationIcon =
	| 'trophy'
	| 'fire'
	| 'calendar'
	| 'user'
	| 'chart'
	| 'rank'
	| 'timer'
	| 'book'
	| 'sparkles'
	| 'message';

export interface Notification {
	id: string;
	type: 'achievement' | 'streak' | 'reminder' | 'social' | 'system' | 'promotion';
	title: string;
	message: string;
	icon: NotificationIcon;
	iconBg: string;
	iconColor: string;
	detail?: string;
	actions?: NotificationAction[];
	isRead: boolean;
	createdAt: Date;
}

const iconMap: Record<string, typeof Medal01Icon> = {
	trophy: Medal01Icon,
	fire: FireIcon,
	calendar: Calendar02Icon,
	user: UserIcon,
	chart: SparklesIcon,
	rank: Medal01Icon,
	timer: Timer02Icon,
	book: BookOpen01Icon,
	sparkles: SparklesIcon,
	message: Message01Icon,
};

interface NotificationItemProps {
	notification: Notification;
	index: number;
	formatTime: (date: Date) => string;
	formatFullDate: (date: Date) => string;
	markAsRead: (id: string) => void;
	deleteNotification: (id: string) => void;
	handleAction: (action: NotificationAction) => void;
	isDeleting: string | null;
}

export function NotificationItem({
	notification,
	index,
	formatTime,
	formatFullDate,
	markAsRead,
	deleteNotification,
	handleAction,
	isDeleting,
}: NotificationItemProps) {
	const router = useRouter();
	const IconComponent = iconMap[notification.icon];

	const localHandleAction = (action: NotificationAction) => {
		if (action.onClick) {
			action.onClick();
		} else if (action.href) {
			router.push(action.href);
		}
		handleAction(action);
	};

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3, delay: index * 0.05 }}
		>
			<Card
				className={`
					group relative overflow-hidden transition-all duration-300
					${notification.isRead ? 'bg-muted/30 border-transparent' : 'bg-card border-border/50'}
					${isDeleting === notification.id ? 'opacity-0 scale-95' : 'hover:shadow-lg hover:shadow-primary/5'}
				`}
			>
				{!notification.isRead && (
					<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-violet-500" />
				)}

				<div className="p-4 flex gap-4">
					<div
						className={`shrink-0 w-12 h-12 rounded-2xl ${notification.iconBg} flex items-center justify-center`}
					>
						<HugeiconsIcon icon={IconComponent} className={`w-5 h-5 ${notification.iconColor}`} />
					</div>

					<div className="flex-1 min-w-0">
						<div className="flex items-start justify-between gap-2">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<h3
										className={`font-semibold text-sm truncate ${!notification.isRead ? 'text-foreground' : 'text-foreground/80'}`}
									>
										{notification.title}
									</h3>
									{!notification.isRead && (
										<span className="shrink-0 w-2 h-2 rounded-full bg-primary" />
									)}
								</div>
								<p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
									{notification.message}
								</p>
								{notification.detail && (
									<p className="text-xs text-muted-foreground/70 mt-1.5 line-clamp-1">
										{notification.detail}
									</p>
								)}
							</div>

							<span className="shrink-0 text-[11px] text-muted-foreground/60 font-medium">
								{formatTime(notification.createdAt)}
							</span>
						</div>

						{notification.actions && (
							<div className="flex gap-2 mt-3">
								{notification.actions.map((action: NotificationAction, i: number) => (
									<Button
										key={i}
										variant={
											action.variant === 'outline'
												? 'outline'
												: action.variant === 'ghost'
													? 'ghost'
													: 'default'
										}
										size="sm"
										className="h-8 text-xs font-medium rounded-full px-4"
										onClick={() => localHandleAction(action)}
									>
										{action.label}
										{action.href && (
											<HugeiconsIcon icon={ArrowRight01Icon} className="w-3 h-3 ml-1" />
										)}
									</Button>
								))}
							</div>
						)}

						<div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
							<span className="text-[10px] text-muted-foreground/50 font-medium">
								{formatFullDate(notification.createdAt)}
							</span>
							<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								{!notification.isRead && (
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7 rounded-full hover:bg-primary/10"
										onClick={() => markAsRead(notification.id)}
									>
										<HugeiconsIcon
											icon={Tick01Icon}
											className="w-3.5 h-3.5 text-muted-foreground"
										/>
									</Button>
								)}
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 rounded-full hover:bg-destructive/10 text-destructive/60 hover:text-destructive"
									onClick={() => deleteNotification(notification.id)}
								>
									<HugeiconsIcon icon={Delete02Icon} className="w-3.5 h-3.5" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Card>
		</m.div>
	);
}
