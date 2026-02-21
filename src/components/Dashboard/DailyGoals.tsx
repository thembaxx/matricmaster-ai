'use client';

import { m } from 'framer-motion';
import { CheckCircle, Circle, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getUserProgressSummary, getUserStreak } from '@/lib/db/progress-actions';

interface DailyGoal {
	id: string;
	title: string;
	description: string;
	current: number;
	target: number;
	isComplete: boolean;
}

export function DailyGoals() {
	const [goals, setGoals] = useState<DailyGoal[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [allComplete, setAllComplete] = useState(false);

	useEffect(() => {
		async function fetchGoals() {
			try {
				const [progress, streakData] = await Promise.all([
					getUserProgressSummary(),
					getUserStreak(),
				]);

				const dailyGoals: DailyGoal[] = [
					{
						id: 'questions',
						title: 'Answer 10 Questions',
						description: 'Complete practice questions today',
						current: Math.min(progress?.totalQuestionsAttempted || 0, 10),
						target: 10,
						isComplete: (progress?.totalQuestionsAttempted || 0) >= 10,
					},
					{
						id: 'accuracy',
						title: 'Hit 70% Accuracy',
						description: 'Maintain good accuracy in your answers',
						current: progress?.accuracy || 0,
						target: 70,
						isComplete: (progress?.accuracy || 0) >= 70,
					},
					{
						id: 'streak',
						title: 'Keep Your Streak',
						description: 'Stay active to maintain your streak',
						current: streakData.currentStreak > 0 ? 1 : 0,
						target: 1,
						isComplete: streakData.currentStreak > 0,
					},
				];

				setGoals(dailyGoals);
				setAllComplete(dailyGoals.every((g) => g.isComplete));
			} catch (error) {
				console.error('[DailyGoals] Error fetching:', error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchGoals();
	}, []);

	if (isLoading) {
		return (
			<Card className="p-6 premium-glass border-none rounded-[2.5rem] h-full">
				<div className="animate-pulse space-y-4">
					<div className="h-5 w-28 bg-muted rounded-lg" />
					{[1, 2, 3].map((i) => (
						<div key={i} className="space-y-2">
							<div className="h-4 w-32 bg-muted rounded" />
							<div className="h-2 w-full bg-muted rounded" />
						</div>
					))}
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 premium-glass border-none rounded-[2.5rem] h-full">
			<div className="flex items-center gap-2 mb-4">
				<Target className="w-5 h-5 text-primary" />
				<h3 className="text-lg font-black text-foreground tracking-tight">Daily Goals</h3>
				{allComplete && (
					<m.span initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1 }} className="text-lg">
						🎉
					</m.span>
				)}
			</div>

			{allComplete ? (
				<m.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center py-6"
				>
					<m.div
						animate={{ scale: [1, 1.1, 1] }}
						transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
						className="w-16 h-16 mx-auto mb-4 bg-brand-amber/20 rounded-2xl flex items-center justify-center"
					>
						<span className="text-3xl">🏆</span>
					</m.div>
					<p className="text-sm font-bold text-foreground">All goals complete!</p>
					<p className="text-xs text-muted-foreground mt-1">Great work today!</p>
				</m.div>
			) : (
				<div className="space-y-4">
					{goals.map((goal, index) => (
						<m.div
							key={goal.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1 }}
							className="space-y-2"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									{goal.isComplete ? (
										<CheckCircle className="w-4 h-4 text-brand-green" />
									) : (
										<Circle className="w-4 h-4 text-muted-foreground/30" />
									)}
									<span
										className={`text-sm font-bold ${goal.isComplete ? 'text-brand-green' : 'text-foreground'}`}
									>
										{goal.title}
									</span>
								</div>
								<span className="text-xs font-black text-muted-foreground">
									{Math.min(goal.current, goal.target)}/{goal.target}
								</span>
							</div>
							<Progress
								value={Math.min((goal.current / goal.target) * 100, 100)}
								className={`h-2 ${goal.isComplete ? '[&>div]:bg-brand-green' : ''}`}
							/>
						</m.div>
					))}
				</div>
			)}
		</Card>
	);
}
