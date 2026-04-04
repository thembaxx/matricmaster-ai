'use client';

import { FireIcon, TargetIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { DifficultyLevel } from '@/services/adaptive-difficulty';
import {
	DIFFICULTY_ORDER,
	getDifficultyBgColor,
	getDifficultyColor,
	getDifficultyIndex,
	getDifficultyLabel,
} from '@/services/adaptive-difficulty';
import { useAdaptiveDifficulty } from '@/stores/useAdaptiveDifficultyStore';

interface DifficultyIndicatorProps {
	showOverride?: boolean;
	compact?: boolean;
	className?: string;
}

export function DifficultyIndicator({
	showOverride = true,
	compact = false,
	className = '',
}: DifficultyIndicatorProps) {
	const { currentDifficulty, getStats, setDifficulty, consecutiveCorrect, consecutiveIncorrect } =
		useAdaptiveDifficulty();

	const [isOverrideOpen, setIsOverrideOpen] = useState(false);
	const [selectedOverride, setSelectedOverride] = useState<DifficultyLevel>(currentDifficulty);

	const stats = getStats();
	const difficultyIndex = getDifficultyIndex(currentDifficulty);
	const progressToNext = Math.min(100, (difficultyIndex / (DIFFICULTY_ORDER.length - 1)) * 100);

	const handleOverrideConfirm = () => {
		setDifficulty(selectedOverride);
		setIsOverrideOpen(false);
	};

	if (compact) {
		return (
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<div
							className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getDifficultyBgColor(currentDifficulty)} ${className}`}
						>
							<Badge
								variant="outline"
								className={`${getDifficultyColor(currentDifficulty)} border-0 bg-transparent text-xs`}
							>
								{getDifficultyLabel(currentDifficulty)}
							</Badge>
						</div>
					</TooltipTrigger>
					<TooltipContent>
						<div className="text-sm">
							<p className="font-medium">{getDifficultyLabel(currentDifficulty)}</p>
							<p className="text-muted-foreground">
								{stats.accuracy}% accuracy - {stats.totalAnswered} questions
							</p>
						</div>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		);
	}

	return (
		<Card className={`w-full ${className}`}>
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<HugeiconsIcon icon={TargetIcon} className="h-5 w-5 text-muted-foreground" />
						<CardTitle className="text-lg">Difficulty Level</CardTitle>
					</div>
					{showOverride && (
						<Button variant="outline" size="sm" onClick={() => setIsOverrideOpen(!isOverrideOpen)}>
							Override
						</Button>
					)}
				</div>
				<CardDescription>Your current difficulty based on performance</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div className={`text-2xl font-bold ${getDifficultyColor(currentDifficulty)}`}>
						{getDifficultyLabel(currentDifficulty)}
					</div>
					<div className="flex gap-2">
						{consecutiveCorrect > 0 && (
							<Badge variant="secondary" className="bg-green-500/20 text-green-600">
								<HugeiconsIcon icon={FireIcon} className="h-3 w-3 mr-1" />
								{consecutiveCorrect} streak
							</Badge>
						)}
						{consecutiveIncorrect > 2 && (
							<Badge variant="secondary" className="bg-orange-500/20 text-orange-600">
								<HugeiconsIcon icon={FireIcon} className="h-3 w-3 mr-1" />
								{consecutiveIncorrect} wrong
							</Badge>
						)}
					</div>
				</div>

				<div className="space-y-2">
					<div className="flex justify-between text-sm text-muted-foreground">
						<span>Beginner</span>
						<span>Expert</span>
					</div>
					<Progress value={progressToNext} className="h-2" />
					<div className="flex justify-between text-xs text-muted-foreground">
						{DIFFICULTY_ORDER.map((level) => (
							<span
								key={level}
								className={
									level === currentDifficulty ? `font-medium ${getDifficultyColor(level)}` : ''
								}
							>
								{level.charAt(0).toUpperCase()}
							</span>
						))}
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
					<div className="text-center">
						<div className="text-2xl font-bold">{stats.accuracy}%</div>
						<div className="text-xs text-muted-foreground">Accuracy</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold">{stats.totalAnswered}</div>
						<div className="text-xs text-muted-foreground">Answered</div>
					</div>
					<div className="text-center">
						<div className="text-2xl font-bold">
							{stats.streakType === 'correct' ? stats.streakCount : '-'}
						</div>
						<div className="text-xs text-muted-foreground">Best Streak</div>
					</div>
				</div>

				{isOverrideOpen && (
					<div className="border-t pt-4 mt-4">
						<label htmlFor="difficulty-override" className="text-sm font-medium mb-2 block">
							Manually set difficulty
						</label>
						<Select
							value={selectedOverride}
							onValueChange={(val) => setSelectedOverride(val as DifficultyLevel)}
						>
							<SelectTrigger id="difficulty-override">
								<SelectValue placeholder="Select difficulty" />
							</SelectTrigger>
							<SelectContent>
								{DIFFICULTY_ORDER.map((level) => (
									<SelectItem key={level} value={level}>
										{getDifficultyLabel(level)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Button onClick={handleOverrideConfirm} className="w-full mt-3">
							Apply
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
