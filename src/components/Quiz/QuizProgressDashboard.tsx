'use client';

import { Cancel01Icon, CheckmarkCircle02Icon, TimerIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface QuizProgressDashboardProps {
	totalQuestions: number;
	currentQuestion: number;
	correctCount: number;
	incorrectCount: number;
	elapsedTime: string;
	difficulty?: 'easy' | 'medium' | 'hard';
}

export function QuizProgressDashboard({
	totalQuestions,
	currentQuestion,
	correctCount,
	incorrectCount,
	elapsedTime,
	difficulty,
}: QuizProgressDashboardProps) {
	const attempted = correctCount + incorrectCount;
	const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
	const progressPercent = (currentQuestion / totalQuestions) * 100;

	const getDifficultyColor = (diff?: string) => {
		switch (diff) {
			case 'easy':
				return 'text-green-500';
			case 'hard':
				return 'text-red-500';
			default:
				return 'text-yellow-500';
		}
	};

	return (
		<Card className="p-4 rounded-2xl space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-bold text-sm">Progress</h3>
				<div className="flex items-center gap-1 text-xs text-muted-foreground">
					<HugeiconsIcon icon={TimerIcon} className="w-3 h-3" />
					{elapsedTime}
				</div>
			</div>

			<Progress value={progressPercent} className="h-2 rounded-full" />

			<div className="grid grid-cols-3 gap-2 text-center">
				<div className="p-2 rounded-xl bg-green-50 dark:bg-green-950/30">
					<div className="flex items-center justify-center gap-1 text-green-600">
						<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
						<span className="font-bold">{correctCount}</span>
					</div>
					<p className="text-xs text-muted-foreground">Correct</p>
				</div>
				<div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30">
					<div className="flex items-center justify-center gap-1 text-red-600">
						<HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
						<span className="font-bold">{incorrectCount}</span>
					</div>
					<p className="text-xs text-muted-foreground">Wrong</p>
				</div>
				<div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30">
					<div className="flex items-center justify-center gap-1 text-blue-600">
						<span className="font-bold">{accuracy}%</span>
					</div>
					<p className="text-xs text-muted-foreground">Accuracy</p>
				</div>
			</div>

			{difficulty && (
				<div className="text-center">
					<span className={`text-xs font-medium uppercase ${getDifficultyColor(difficulty)}`}>
						{difficulty} Mode
					</span>
				</div>
			)}

			<div className="text-center text-xs text-muted-foreground">
				Question {currentQuestion} of {totalQuestions}
			</div>
		</Card>
	);
}
