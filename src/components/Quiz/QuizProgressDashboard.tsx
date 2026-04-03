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
				return 'bg-success text-success';
			case 'hard':
				return 'bg-destructive text-destructive';
			default:
				return 'bg-warning text-warning';
		}
	};

	const getDifficultyLabel = (diff?: string) => {
		switch (diff) {
			case 'easy':
				return 'Easy';
			case 'hard':
				return 'Hard';
			default:
				return 'Medium';
		}
	};

	return (
		<Card className="p-5 rounded-[1.5rem] space-y-4 border-0 shadow-tiimo">
			<div className="flex items-center justify-between">
				<h3 className="font-display font-bold text-base text-foreground">Progress</h3>
				<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
					<HugeiconsIcon icon={TimerIcon} className="w-4 h-4 text-muted-foreground" />
					<span className="text-sm font-mono font-medium tabular-nums">{elapsedTime}</span>
				</div>
			</div>

			<div className="space-y-2">
				<Progress
					value={progressPercent}
					className="h-2.5 rounded-full bg-secondary"
					indicatorClassName="rounded-full bg-gradient-to-r from-primary to-purple-400 transition-all duration-500"
				/>
				<div className="flex justify-between text-xs text-muted-foreground">
					<span>Question {currentQuestion}</span>
					<span>of {totalQuestions}</span>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
				<div className="p-3 rounded-2xl bg-success/10 text-center">
					<div className="flex items-center justify-center gap-1.5 mb-1">
						<HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-success" />
						<span className="text-xl font-bold text-success tabular-nums">{correctCount}</span>
					</div>
					<p className="text-xs text-muted-foreground font-medium">Correct</p>
				</div>
				<div className="p-3 rounded-2xl bg-destructive/10 text-center">
					<div className="flex items-center justify-center gap-1.5 mb-1">
						<HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5 text-destructive" />
						<span className="text-xl font-bold text-destructive tabular-nums">
							{incorrectCount}
						</span>
					</div>
					<p className="text-xs text-muted-foreground font-medium">Wrong</p>
				</div>
				<div className="p-3 rounded-2xl bg-primary/10 text-center">
					<div className="mb-1">
						<span className="text-xl font-bold text-primary tabular-nums">{accuracy}%</span>
					</div>
					<p className="text-xs text-muted-foreground font-medium">Accuracy</p>
				</div>
			</div>

			{difficulty && (
				<div className="flex justify-center">
					<span
						className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold  tracking-wider ${getDifficultyColor(difficulty)}`}
					>
						{getDifficultyLabel(difficulty)} Mode
					</span>
				</div>
			)}
		</Card>
	);
}
