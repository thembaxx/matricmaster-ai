'use client';

import { m } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { RecentSessionWithContext } from '@/lib/db/actions';
import {
	formatRelativeTime,
	getSessionSubtitle,
	getSessionTitle,
	MOCK_RECENT_SESSIONS,
} from './constants';

interface RecentSessionsProps {
	sessions: RecentSessionWithContext[];
	isLoading: boolean;
	isLive: boolean;
	onSessionClick: (session: RecentSessionWithContext | (typeof MOCK_RECENT_SESSIONS)[0]) => void;
	onEmptyStateClick: () => void;
}

export function RecentSessions({
	sessions,
	isLoading,
	isLive,
	onSessionClick,
	onEmptyStateClick,
}: RecentSessionsProps) {
	const displaySessions = sessions.length > 0 ? sessions : MOCK_RECENT_SESSIONS;

	return (
		<section>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
					Recent sessions
				</h2>
				{isLive && <span className="text-xs text-primary font-medium">Live data</span>}
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{[1, 2, 3].map((item) => (
						<div
							key={`recent-sessions-skeleton-${item}`}
							className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border animate-pulse"
						>
							<div className="w-10 h-10 rounded-full bg-muted" />
							<div className="flex-1 space-y-2">
								<div className="h-4 w-3/4 bg-muted rounded" />
								<div className="h-3 w-1/2 bg-muted rounded" />
							</div>
						</div>
					))}
				</div>
			) : displaySessions.length === 0 ? (
				<Card className="p-6 rounded-2xl border border-dashed">
					<div className="text-center">
						<div className="text-4xl mb-3">📖</div>
						<h3 className="font-semibold mb-1">No recent sessions</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Start a study session to see your progress here
						</p>
						<Button onClick={onEmptyStateClick} variant="outline" size="sm">
							Start learning
						</Button>
					</div>
				</Card>
			) : (
				<div className="space-y-2">
					{displaySessions.map((item, index) => (
						<m.button
							key={'id' in item ? item.id : index}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.5 + index * 0.08 }}
							onClick={() => onSessionClick(item)}
							className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-left group"
						>
							{'id' in item && item.subjectEmoji ? (
								<span className="text-xl">{item.subjectEmoji}</span>
							) : (
								<span className="text-xl">{(item as (typeof MOCK_RECENT_SESSIONS)[0]).emoji}</span>
							)}
							<div className="flex-1 min-w-0">
								{'id' in item ? (
									<>
										<p className="font-medium text-sm truncate">
											{getSessionTitle(item as RecentSessionWithContext)}
										</p>
										<p className="text-xs text-muted-foreground truncate">
											{getSessionSubtitle(item as RecentSessionWithContext)} •{' '}
											{formatRelativeTime((item as RecentSessionWithContext).completedAt)}
										</p>
									</>
								) : (
									<>
										<p className="font-medium text-sm truncate">
											{(item as (typeof MOCK_RECENT_SESSIONS)[0]).title}
										</p>
										<p className="text-xs text-muted-foreground truncate">
											{(item as (typeof MOCK_RECENT_SESSIONS)[0]).time}
										</p>
									</>
								)}
							</div>
							<Button
								asChild
								variant="ghost"
								size="sm"
								className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
							>
								Continue
							</Button>
						</m.button>
					))}
				</div>
			)}
		</section>
	);
}
