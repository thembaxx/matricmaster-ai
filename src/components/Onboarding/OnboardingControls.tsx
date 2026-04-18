'use client';

import { ArrowLeft01Icon, ArrowRight01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { motion as m } from 'motion/react';
import { Button } from '@/components/ui/button';

interface OnboardingControlsProps {
	currentStep: number;
	totalSteps: number;
	isLoading: boolean;
	onPrevious: () => void;
	onNext: () => void;
	onComplete: () => void;
}

export function OnboardingControls({
	currentStep,
	totalSteps,
	isLoading,
	onPrevious,
	onNext,
	onComplete,
}: OnboardingControlsProps) {
	const isLastStep = currentStep === totalSteps - 1;

	return (
		<div className="relative z-20 px-6 pb-0 w-full max-w-lg mx-auto flex flex-col gap-4">
			<div className="flex items-center justify-between gap-4">
				<Button
					variant="outline"
					size="icon"
					className="w-14 h-14 rounded-2xl border-2 shrink-0"
					disabled={currentStep === 0}
					onClick={onPrevious}
				>
					<HugeiconsIcon icon={ArrowLeft01Icon} className="w-6 h-6" />
				</Button>

				{isLastStep ? (
					<Button
						className="flex-1 h-14 rounded-2xl font-bold text-lg bg-primary text-primary-foreground shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
						onClick={onComplete}
						disabled={isLoading}
					>
						{isLoading ? (
							<m.div
								animate={{ rotate: 360 }}
								transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
							>
								<HugeiconsIcon icon={SparklesIcon} className="w-6 h-6" />
							</m.div>
						) : (
							"let's go!"
						)}
					</Button>
				) : (
					<Button
						className="flex-1 h-14 rounded-2xl font-bold text-lg bg-foreground text-background shadow-xl transition-all active:scale-[0.98]"
						onClick={onNext}
					>
						next
						<HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 w-5 h-5" />
					</Button>
				)}
			</div>

			<StepIndicators currentStep={currentStep} totalSteps={totalSteps} />
		</div>
	);
}

function StepIndicators({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
	return (
		<div className="flex justify-center gap-2 -mb-1">
			{Array.from({ length: totalSteps }, (_, i) => (
				<m.div
					key={`onboarding-indicator-${i}`}
					animate={{
						width: i === currentStep ? 24 : 8,
						backgroundColor: i === currentStep ? 'var(--primary)' : 'var(--muted)',
					}}
					className="h-2 rounded-full transition-all duration-300"
				/>
			))}
		</div>
	);
}
