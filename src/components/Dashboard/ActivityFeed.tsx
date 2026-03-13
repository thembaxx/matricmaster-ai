'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getRecentActivityAction } from '@/lib/db/actions';
import type { StudySession } from '@/lib/db/schema';
import { cn } from '@/lib/utils';

export function ActivityFeed() {
	const [activities, setActivities] = useState<StudySession[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function load() {
			const data = await getRecentActivityAction();
			setActivities(data);
			setIsLoading(false);
		}
		load();
	}, []);

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-20 bg-secondary/50 animate-pulse rounded-[2rem]" />
				))}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{activities.length === 0 ? (
				<Card className="p-8 text-center bg-secondary/30 border-none rounded-[2rem]">
					<p className="text-sm font-bold text-tiimo-gray-muted uppercase tracking-widest">
						No recent activity
					</p>
				</Card>
			) : (
				activities.map((activity, index) => (
					<Card
						key={activity.id}
						className="p-5 flex items-center gap-4 bg-card border-border/50 rounded-[2rem] shadow-tiimo transition-all hover:scale-[1.02]"
					>
						<div
							className={cn(
								'w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white',
								index % 2 === 0 ? 'bg-tiimo-lavender' : 'bg-tiimo-yellow'
							)}
						>
							{activity.marksEarned}
						</div>
						<div>
							<h4 className="font-black text-sm uppercase tracking-tight">
								{activity.topic || 'Practice Session'}
							</h4>
							<p className="text-[10px] font-bold text-tiimo-gray-muted uppercase tracking-widest mt-0.5">
								{new Date(activity.completedAt).toLocaleDateString()} • {activity.durationMinutes}m
							</p>
						</div>
					</Card>
				))
			)}
		</div>
	);
}
