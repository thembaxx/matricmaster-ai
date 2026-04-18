'use client';

import { CheckmarkCircle02Icon, Target01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useQuery } from '@tanstack/react-query';
import { motion as m } from 'motion/react';
import { memo, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
	getUserProgressSummary,
	getUserStreak,
	type UserProgressSummary,
} from '@/lib/db/progress-actions';

interface DailyGoal {
	id: string;
	title: string;
	description: string;
	current: number;
	target: number;
	isComplete: boolean;
}

interface DailyGoalsProps {
	initialProgress?: UserProgressSummary;
	initialStreak?: {
		currentStreak: number;
		bestStreak?: number;
		lastActivityDate?: string | null;
	};
}

interface StreakData {
	currentStreak: number;
	bestStreak?: number;
	lastActivityDate?: string | null;
}

export const DailyGoals = memo(function DailyGoals({
	initialProgress,
	initialStreak,
}: DailyGoalsProps) {
	const { data: fetchedData } = useQuery({
		queryKey: ['user-progress-and-streak'],
		queryFn: async () => {
			const [progress, streakData] = await Promise.all([getUserProgressSummary(), getUserStreak()]);
			return { progress, streak: streakData as StreakData };
		},
		enabled: !initialProgress || !initialStreak,
		staleTime: 60 * 1000,
	});

	const progress = initialProgress ?? fetchedData?.progress;
	const streak = initialStreak ?? (fetchedData?.streak as StreakData);

	const goals = useMemo<DailyGoal[]>(() => {
		if (!progress || !streak) return [];
		return [
			{
				id: 'questions',
				title: 'answer 10 questions',
				description: 'complete practice questions today',
				current: Math.min(progress.totalQuestionsAttempted || 0, 10),
				target: 10,
				isComplete: (progress.totalQuestionsAttempted || 0) >= 10,
			},
			{
				id: 'accuracy',
				title: 'hit 70% accuracy',
				description: 'maintain good accuracy in your answers',
				current: progress.accuracy || 0,
				target: 70,
				isComplete: (progress.accuracy || 0) >= 70,
			},
			{
				id: 'streak',
				title: 'keep your streak',
				description: 'stay active to maintain your streak',
				current: streak.currentStreak > 0 ? 1 : 0,
				target: 1,
				isComplete: streak.currentStreak > 0,
			},
		];
	}, [progress, streak]);

	const isPending = !progress && !fetchedData;
	const allComplete = goals.every((g) => g.isComplete);

	if (isPending) {
		return (
			<Card className="p-8 shadow-tiimo border-border/50 h-full">
				<div className="space-y-6">
					<Skeleton className="h-6 w-32 rounded-full" />
					{[1, 2, 3].map((item) => (
						<div key={`daily-goals-skeleton-${item}`} className="flex gap-4 items-center">
							<Skeleton className="w-10 h-10 rounded-full" />
							<div className="flex-1 space-y-2">
								<Skeleton className="h-4 w-3/4 rounded-full" />
								<Skeleton className="h-2 w-full rounded-full" />
							</div>
						</div>
					))}
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-8 shadow-tiimo border-border/50 h-full relative overflow-hidden">
			<div className="flex items-center justify-between mb-8">
				<div className="flex items-center gap-3">
					<div className="p-2.5 bg-tiimo-lavender/15 rounded-2xl">
						<HugeiconsIcon icon={Target01Icon} className="w-6 h-6 text-tiimo-lavender" />
					</div>
					<h3 className="body-lg font-bold text-foreground tracking-tight">today's focus</h3>
				</div>
				{allComplete && (
					<m.div
						initial={{ scale: 0.95, opacity: 0, rotate: -20 }}
						animate={{ scale: 1, rotate: 0 }}
						className="bg-tiimo-green text-white px-4 py-1.5 rounded-full label-xs font-bold shadow-sm"
					>
						done!
					</m.div>
				)}
			</div>

			<div className="space-y-6">
				{goals.map((goal, index) => (
					<m.div
						key={goal.id}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						className="relative pl-6 group"
					>
						{/* Vertical Timeline Strip */}
						<div
							className={`absolute left-0 top-1 bottom-1 w-1.5 rounded-full transition-colors duration-300 ${
								goal.isComplete ? 'bg-tiimo-green' : 'bg-tiimo-lavender/20'
							}`}
						/>

						<div className="flex items-center gap-4">
							<m.button
								whileTap={{ scale: 0.9 }}
								className={`tiimo-checkbox shrink-0 ${goal.isComplete ? 'checked' : ''}`}
							>
								{goal.isComplete && (
									<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-6 h-6" />
								)}
							</m.button>

							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-1.5">
									<p
										className={`body-sm font-bold tracking-tight transition-colors truncate ${
											goal.isComplete ? 'text-tiimo-gray-muted line-through' : 'text-foreground'
										}`}
									>
										{goal.title.toLowerCase()}
									</p>
									<span className="label-xs font-black text-tiimo-gray-muted/60 tracking-tight bg-secondary px-2 py-0.5 rounded-full font-numeric">
										{Math.min(goal.current, goal.target)}/{goal.target}
									</span>
								</div>
								<div className="relative h-2.5 w-full bg-secondary rounded-full overflow-hidden">
									<m.div
										initial={{ width: 0 }}
										animate={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
										transition={{ duration: 1, ease: 'circOut' }}
										className={`absolute h-full left-0 top-0 rounded-full ${
											goal.isComplete ? 'bg-tiimo-green' : 'bg-tiimo-lavender'
										}`}
									/>
								</div>
							</div>
						</div>
					</m.div>
				))}
			</div>

			{allComplete && (
				<m.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="mt-8 p-4 bg-tiimo-green/10 rounded-[1.5rem] border border-tiimo-green/20 text-center"
				>
					<p className="body-sm font-bold text-tiimo-green">✨ energy restored!</p>
					<p className="label-xs text-tiimo-green/70 font-medium">you crushed your goals today.</p>
				</m.div>
			)}
		</Card>
	);
});
