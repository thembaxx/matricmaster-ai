'use client';

import { Calendar02Icon, StarIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataSection } from '@/components/ui/data-loader';
import { cn } from '@/lib/utils';

interface Achievement {
	id: string;
	achievementId: string;
	title: string;
	description: string;
}

interface Notification {
	id: string;
	type: string;
	title: string;
	message: string;
	isRead: boolean;
}

interface CalendarEvent {
	id: string;
	title: string;
	startTime: string;
}

interface SidebarSectionProps {
	achievements: Achievement[];
	userAchievements: { achievementId: string }[];
	notifications: Notification[];
	events: CalendarEvent[];
}

export function SidebarSection({
	achievements,
	userAchievements,
	notifications,
	events,
}: SidebarSectionProps) {
	return (
		<div className="grid md:grid-cols-3 gap-8 mb-8">
			<DataSection title="Achievements" description="Your unlocked achievements">
				<div className="grid grid-cols-2 gap-3">
					{achievements.map((achievement) => {
						const isUnlocked = userAchievements.some(
							(ua) => ua.achievementId === achievement.achievementId
						);
						return (
							<Card
								key={achievement.id}
								className={cn('transition-all', !isUnlocked && 'opacity-50 grayscale')}
							>
								<CardContent className="pt-4">
									<div className="flex flex-col items-center text-center gap-2">
										<HugeiconsIcon
											icon={StarIcon}
											className={cn('w-8 h-8', isUnlocked ? 'text-yellow-500' : 'text-muted')}
										/>
										<p className="font-medium text-sm">{achievement.title}</p>
										<p className="text-xs text-muted-foreground">{achievement.description}</p>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</DataSection>

			<DataSection title="Recent Notifications" description="Your latest updates">
				<div className="space-y-3">
					{notifications.slice(0, 4).map((notification) => (
						<Card key={notification.id} className={cn(!notification.isRead && 'border-primary/30')}>
							<CardContent className="pt-4">
								<div className="flex items-start gap-3">
									<Badge variant="secondary" className="text-xs">
										{notification.type.replace('_', ' ')}
									</Badge>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm truncate">{notification.title}</p>
										<p className="text-xs text-muted-foreground line-clamp-2">
											{notification.message}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</DataSection>

			<DataSection title="Upcoming Events" description="Your scheduled activities">
				<div className="space-y-3">
					{events.slice(0, 4).map((event) => (
						<Card key={event.id}>
							<CardContent className="pt-4">
								<div className="flex items-start gap-3">
									<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
										<HugeiconsIcon icon={Calendar02Icon} className="w-5 h-5 text-primary" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm truncate">{event.title}</p>
										<p className="text-xs text-muted-foreground">
											{new Date(event.startTime).toLocaleDateString('en-ZA', {
												weekday: 'short',
												month: 'short',
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit',
											})}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</DataSection>
		</div>
	);
}
