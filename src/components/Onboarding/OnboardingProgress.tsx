'use client';

import { SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface OnboardingProgressProps {
	currentStep: number;
	totalSteps: number;
	onSkip: () => void;
}

export function OnboardingProgress({ currentStep, totalSteps, onSkip }: OnboardingProgressProps) {
	return (
		<div className="relative z-20 px-6 pt-12 pb-6 w-full max-w-lg mx-auto">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
						<HugeiconsIcon icon={SparklesIcon} className="w-4 h-4 text-primary" />
					</div>
					<span className="text-sm font-medium text-muted-foreground">
						step {currentStep + 1} of {totalSteps}
					</span>
				</div>
				<Button
					variant="ghost"
					size="sm"
					className="text-xs font-medium text-muted-foreground"
					onClick={onSkip}
				>
					skip
				</Button>
			</div>
			<Progress value={((currentStep + 1) / totalSteps) * 100} className="h-2 rounded-full" />
		</div>
	);
}
