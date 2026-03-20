'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, m } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
	const router = useRouter();

	const { data: activities = [], isPending } = useQuery({
		queryKey: ['activity-feed'],
		queryFn: () => getRecentActivityAction(),
		select: (data) => (data.length > 0 ? data : MOCK_ACTIVITIES),
		staleTime: 30 * 1000,
	});

	if (isPending) {
		return (
			<div className="space-y-4">
				{[1, 2, 3].map((i) => (
					<div
						key={`skeleton-${i}`}
						className="h-20 bg-secondary/50 animate-pulse rounded-[2rem]"
					/>
				))}
			</div>
		);
	}

	return (
		<m.div layout className="space-y-4">
			<AnimatePresence mode="popLayout">
				{activities.length === 0 ? (
					<m.div
						key="empty"
						layout
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<Card className="p-8 text-center bg-secondary/30 border-none rounded-[2rem]">
							<div className="w-16 h-16 bg-tiimo-lavender/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
								<HugeiconsIcon icon={SparklesIcon} className="w-8 h-8 text-tiimo-lavender" />
							</div>
							<p className="text-base font-bold text-foreground mb-2">
								Your learning journey starts here
							</p>
							<p className="text-sm text-tiimo-gray-muted mb-4">Take your first quiz!</p>
							<Button onClick={() => router.push('/subjects')} variant="outline">
								Browse Subjects
							</Button>
						</Card>
					</m.div>
				) : (
					activities.map((activity, index) => (
						<m.div
							key={activity.id}
							layout
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95 }}
							transition={{ delay: index * 0.05 }}
							whileTap={{ scale: 0.98 }}
						>
							<Card className="p-5 flex items-center gap-4 bg-card border-border/50 rounded-[2rem] shadow-tiimo transition-all hover:scale-[1.02]">
								<div
									className={cn(
										'w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white',
										index % 2 === 0 ? 'bg-tiimo-lavender' : 'bg-tiimo-yellow'
									)}
								>
									{activity.marksEarned}
								</div>
								<div>
									<h4 className="font-medium text-sm">
										{activity.subjectName || 'Practice Session'}
									</h4>
									<p className="text-[10px] text-tiimo-gray-muted mt-0.5">
										{activity.completedAt
											? new Date(activity.completedAt).toLocaleDateString()
											: 'N/A'}{' '}
										• {activity.sessionType}
									</p>
								</div>
							</Card>
						</m.div>
					))
				)}
			</AnimatePresence>
		</m.div>
	);
}
