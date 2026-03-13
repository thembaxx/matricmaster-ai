'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { getRecentActivityAction } from '@/lib/db/actions';
import { cn } from '@/lib/utils';

interface RecentActivity {
	id: string;
	sessionType: string;
	marksEarned: number;
	completedAt: Date | null;
	subjectName: string | null;
}

const MOCK_ACTIVITIES: RecentActivity[] = [
	{
		id: '1',
		sessionType: 'Quiz',
		marksEarned: 85,
		completedAt: new Date(),
		subjectName: 'Mathematics',
	},
	{
		id: '2',
		sessionType: 'Practice',
		marksEarned: 42,
		completedAt: new Date(Date.now() - 86400000),
		subjectName: 'Physics',
	},
	{
		id: '3',
		sessionType: 'Quiz',
		marksEarned: 78,
		completedAt: new Date(Date.now() - 172800000),
		subjectName: 'English',
	},
	{
		id: '4',
		sessionType: 'Practice',
		marksEarned: 56,
		completedAt: new Date(Date.now() - 259200000),
		subjectName: 'Life Sciences',
	},
];

export function ActivityFeed() {
	const [activities, setActivities] = useState<RecentActivity[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function load() {
			const data = await getRecentActivityAction();
			setActivities(data.length > 0 ? data : MOCK_ACTIVITIES);
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
					<p className="text-sm text-tiimo-gray-muted">No recent activity</p>
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
							<h4 className="font-medium text-sm">{activity.subjectName || 'Practice Session'}</h4>
							<p className="text-[10px] text-tiimo-gray-muted mt-0.5">
								{activity.completedAt ? new Date(activity.completedAt).toLocaleDateString() : 'N/A'}{' '}
								• {activity.sessionType}
							</p>
						</div>
					</Card>
				))
			)}
		</div>
	);
}
