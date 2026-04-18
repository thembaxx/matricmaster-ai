import { ArrowRight01Icon, Delete02Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DURATION, EASING, STAGGER } from '@/lib/animation-presets';
import type { Notification, NotificationAction } from './types';
import { iconMap } from './types';

interface NotificationItemProps {
	notification: Notification;
	index: number;
	isDeleting: boolean;
	formatTime: (date: Date) => string;
	formatFullDate: (date: Date) => string;
	onMarkAsRead: (id: string) => void;
	onDelete: (id: string) => void;
	onAction: (action: NotificationAction) => void;
}

export function NotificationItem({
	notification,
	index,
	isDeleting,
	formatTime,
	formatFullDate,
	onMarkAsRead,
	onDelete,
	onAction,
}: NotificationItemProps) {
	const IconComponent = iconMap[notification.icon];

	return (
		<m.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{
				duration: DURATION.normal,
				delay: index * STAGGER.NORMAL,
				ease: EASING.easeOut,
			}}
		>
			<Card
				className={`
					group relative overflow-hidden transition-all duration-300 py-2
					${notification.isRead ? 'bg-muted/30 border-transparent' : 'bg-card border-border/50'}
					${isDeleting ? 'opacity-0 scale-95' : 'hover:shadow-lg hover:shadow-primary/5'}
				`}
			>
				{!notification.isRead && (
					<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-violet-500" />
				)}

				<div className="px-4 pt-4 pb-2 flex gap-4">
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
								{notification.actions.map((action) => (
									<Button
										key={action.label}
										variant={
											action.variant === 'outline'
												? 'outline'
												: action.variant === 'ghost'
													? 'ghost'
													: 'default'
										}
										size="sm"
										className="h-8 text-xs font-medium rounded-full px-4"
										onClick={() => onAction(action)}
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
										onClick={() => onMarkAsRead(notification.id)}
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
									onClick={() => onDelete(notification.id)}
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
