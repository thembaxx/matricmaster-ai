'use client';

import { m } from 'framer-motion';
import { Clock, Sparkles, Zap } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { type UserProgressSummary, getUserProgressSummary } from '@/lib/db/progress-actions';

interface WeeklyChallengeData {
	title: string;
	description: string;
	target: number;
	bonusXp: number;
	current: number;
	daysRemaining: number;
}

interface WeeklyChallengeProps {
	initialProgress?: UserProgressSummary;
}

const WEEKLY_CHALLENGES = [
	{
		title: 'Physics Explorer',
		description: 'Complete 20 Physics questions',
		type: 'questions',
		target: 20,
		bonusXp: 200,
	},
	{
		title: 'Math Master',
		description: 'Answer 30 Mathematics questions correctly',
		type: 'correct',
		target: 30,
		bonusXp: 250,
	},
	{
		title: 'Quiz Champion',
		description: 'Complete 5 quizzes this week',
		type: 'quizzes',
		target: 5,
		bonusXp: 150,
	},
	{
		title: 'Accuracy King',
		description: 'Maintain 85% accuracy across all subjects',
		type: 'accuracy',
		target: 85,
		bonusXp: 300,
	},
];

function getWeekNumber(date: Date): number {
	const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
	const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
	return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function getDaysUntilMonday(): number {
	const today = new Date();
	const dayOfWeek = today.getDay();
	const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
	return daysUntilMonday;
}

export const WeeklyChallenge = memo(function WeeklyChallenge({
	initialProgress,
}: WeeklyChallengeProps) {
	const [challenge, setChallenge] = useState<WeeklyChallengeData | null>(() => {
		if (initialProgress) {
			const weekNumber = getWeekNumber(new Date());
			const challengeIndex = weekNumber % WEEKLY_CHALLENGES.length;
			const challengeDef = WEEKLY_CHALLENGES[challengeIndex];

			let current = 0;
			switch (challengeDef.type) {
				case 'questions':
					current = initialProgress.totalQuestionsAttempted || 0;
					break;
				case 'correct':
					current = initialProgress.totalCorrect || 0;
					break;
				case 'quizzes':
					current = initialProgress.recentSessions?.length || 0;
					break;
				case 'accuracy':
					current = initialProgress.accuracy || 0;
					break;
			}

			return {
				title: challengeDef.title,
				description: challengeDef.description,
				target: challengeDef.target,
				bonusXp: challengeDef.bonusXp,
				current,
				daysRemaining: getDaysUntilMonday(),
			};
		}
		return null;
	});
	const [isLoading, setIsLoading] = useState(!challenge);

	useEffect(() => {
		if (challenge) return; // Skip fetch if initialized with initial data

		async function fetchChallenge() {
			try {
				const progress = await getUserProgressSummary();
				const weekNumber = getWeekNumber(new Date());
				const challengeIndex = weekNumber % WEEKLY_CHALLENGES.length;
				const challengeDef = WEEKLY_CHALLENGES[challengeIndex];

				let current = 0;
				switch (challengeDef.type) {
					case 'questions':
						current = progress?.totalQuestionsAttempted || 0;
						break;
					case 'correct':
						current = progress?.totalCorrect || 0;
						break;
					case 'quizzes':
						current = progress?.recentSessions?.length || 0;
						break;
					case 'accuracy':
						current = progress?.accuracy || 0;
						break;
				}

				setChallenge({
					title: challengeDef.title,
					description: challengeDef.description,
					target: challengeDef.target,
					bonusXp: challengeDef.bonusXp,
					current,
					daysRemaining: getDaysUntilMonday(),
				});
			} catch (error) {
				console.error('[WeeklyChallenge] Error fetching:', error);
			} finally {
				setIsLoading(false);
			}
		}

		fetchChallenge();
	}, [challenge]);

	if (isLoading) {
		return (
			<Card className="p-6 premium-glass border-none rounded-[2.5rem] h-full">
				<div className="animate-pulse space-y-4">
					<div className="h-5 w-40 bg-muted rounded-lg" />
					<div className="h-4 w-32 bg-muted rounded" />
					<div className="h-3 w-full bg-muted rounded" />
				</div>
			</Card>
		);
	}

	if (!challenge) return null;

	const progress = Math.min((challenge.current / challenge.target) * 100, 100);
	const isComplete = challenge.current >= challenge.target;

	return (
		<Card
			className={`p-6 premium-glass border-none rounded-[2.5rem] h-full relative overflow-hidden ${isComplete ? 'bg-brand-amber/5' : ''}`}
		>
			{isComplete && (
				<m.div
					animate={{ rotate: [0, 360] }}
					transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
					className="absolute -right-8 -top-8 w-32 h-32 bg-brand-amber/10 rounded-full blur-2xl"
				/>
			)}

			<div className="relative z-10 space-y-4">
				<div className="flex items-start justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<Zap className="w-4 h-4 text-brand-amber" />
							<span className="text-[10px] font-black text-brand-amber uppercase tracking-widest">
								Weekly Challenge
							</span>
						</div>
						<h3 className="text-xl font-black text-foreground tracking-tight">{challenge.title}</h3>
						<p className="text-sm text-muted-foreground">{challenge.description}</p>
					</div>
					{isComplete ? (
						<m.div
							initial={{ scale: 0.95, opacity: 0 }}
							animate={{ scale: 1 }}
							className="w-12 h-12 bg-brand-amber rounded-xl flex items-center justify-center"
						>
							<span className="text-2xl">🏆</span>
						</m.div>
					) : (
						<div className="text-right">
							<div className="flex items-center gap-1 text-muted-foreground">
								<Clock className="w-3 h-3" />
								<span className="text-xs font-bold">{challenge.daysRemaining}d left</span>
							</div>
						</div>
					)}
				</div>

				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
							{Math.min(challenge.current, challenge.target)} / {challenge.target}
						</span>
						<span className="text-sm font-black text-foreground">{Math.round(progress)}%</span>
					</div>
					<Progress
						value={progress}
						className={`h-3 ${isComplete ? '[&>div]:bg-brand-amber' : '[&>div]:bg-primary'}`}
					/>
				</div>

				<div className="flex items-center justify-between pt-2">
					<div className="flex items-center gap-2">
						<Sparkles className="w-4 h-4 text-brand-amber" />
						<span className="text-xs font-bold text-muted-foreground">Bonus Reward</span>
					</div>
					<span
						className={`text-lg font-black ${isComplete ? 'text-brand-amber' : 'text-foreground'}`}
					>
						+{challenge.bonusXp} XP
					</span>
				</div>
			</div>
		</Card>
	);
});
