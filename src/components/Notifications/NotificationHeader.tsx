import { Notification03Icon, TickDouble02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';

interface NotificationHeaderProps {
	unreadCount: number;
	totalCount: number;
	activeTab: 'all' | 'unread';
	onTabChange: (tab: 'all' | 'unread') => void;
	onMarkAllRead: () => void;
}

export function NotificationHeader({
	unreadCount,
	totalCount,
	activeTab,
	onTabChange,
	onMarkAllRead,
}: NotificationHeaderProps) {
	return (
		<div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
			<div className="max-w-2xl mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
							<HugeiconsIcon icon={Notification03Icon} className="w-5 h-5 text-primary" />
						</div>
						<div>
							<h1 className="text-lg font-bold text-foreground">Notifications</h1>
							<p className="text-xs text-muted-foreground">
								{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
							</p>
						</div>
					</div>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="text-xs font-medium text-muted-foreground hover:text-primary"
							onClick={onMarkAllRead}
						>
							<HugeiconsIcon icon={TickDouble02Icon} className="w-4 h-4 mr-1.5" />
							Mark all read
						</Button>
					)}
				</div>

				<div className="flex gap-2 mt-4">
					<button
						type="button"
						onClick={() => onTabChange('all')}
						className={`
							relative px-3 py-1.5 text-xs font-semibold rounded-full transition-all
							${
								activeTab === 'all'
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-muted'
							}
						`}
					>
						All
						<span className="ml-1.5 opacity-60">({totalCount})</span>
					</button>
					<button
						type="button"
						onClick={() => onTabChange('unread')}
						className={`
							relative px-3 py-1.5 text-xs font-semibold rounded-full transition-all
							${
								activeTab === 'unread'
									? 'bg-primary text-primary-foreground'
									: 'text-muted-foreground hover:text-foreground hover:bg-muted'
							}
						`}
					>
						Unread
						{unreadCount > 0 && (
							<span className="ml-1.5 px-1.5 py-0.5 bg-rose-500 text-white text-[10px] rounded-full">
								{unreadCount}
							</span>
						)}
					</button>
				</div>
			</div>
		</div>
	);
}
