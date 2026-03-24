'use client';

import {
	CalculatorIcon,
	ChampionIcon,
	Rocket01Icon,
	type SparklesIcon,
	Target01Icon,
} from '@hugeicons/core-free-icons';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import type { SessionUser } from '@/lib/auth';
import { completeOnboardingAction } from '@/lib/db/onboarding-actions';

type IconSvg = typeof SparklesIcon;

export interface OnboardingStep {
	id: number;
	title: string;
	description: string;
	image: string;
	color: string;
	icon: IconSvg;
}

const STEPS: OnboardingStep[] = [
	{
		id: 0,
		title: 'your study companion',
		description:
			'we help you pass your matric. practice past papers, get instant help, and track your progress.',
		image: '/onboarding/welcome.png',
		color: 'from-blue-500 to-indigo-600',
		icon: Rocket01Icon,
	},
	{
		id: 1,
		title: 'pick your subjects',
		description:
			"choose the subjects you're writing. we'll show you past papers and study materials for each one.",
		image: '/onboarding/focus.png',
		color: 'from-green-500 to-emerald-600',
		icon: Target01Icon,
	},
	{
		id: 2,
		title: 'master every topic',
		description:
			'practice with real nsc questions. get clear explanations so you actually understand.',
		image: '/onboarding/quiz.png',
		color: 'from-purple-500 to-pink-600',
		icon: CalculatorIcon,
	},
	{
		id: 3,
		title: 'level up your grade',
		description:
			'track your progress. earn xp, unlock achievements, and stay motivated until exam day.',
		image: '/onboarding/progress.png',
		color: 'from-amber-400 to-orange-500',
		icon: ChampionIcon,
	},
];

export function useOnboarding(user?: SessionUser | null) {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(0);
	const [direction, setDirection] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	const paginate = useCallback(
		(newDirection: number) => {
			if (currentStep + newDirection >= 0 && currentStep + newDirection < STEPS.length) {
				setDirection(newDirection);
				setCurrentStep((prev) => prev + newDirection);
			}
		},
		[currentStep]
	);

	const handleComplete = async () => {
		setIsLoading(true);
		try {
			const result = await completeOnboardingAction();
			if (result.success) {
				toast.success('onboarding complete!');
				router.push('/dashboard');
			} else {
				console.warn('Onboarding completion failed:', result.error);
				router.push('/dashboard');
			}
		} catch (error) {
			console.debug('An unexpected error occurred:', error);
			router.push('/dashboard');
		} finally {
			setIsLoading(false);
		}
	};

	const step = STEPS[currentStep];

	const getWelcomeTitle = () => {
		if (currentStep === 0 && user?.name) {
			return `welcome, ${user.name.split(' ')[0].toLowerCase()}!`;
		}
		return step.title;
	};

	const variants = {
		enter: (direction: number) => ({
			x: direction > 0 ? 300 : -300,
			opacity: 0,
			scale: 0.8,
			filter: 'blur(10px)',
		}),
		center: {
			zIndex: 1,
			x: 0,
			opacity: 1,
			scale: 1,
			filter: 'blur(0px)',
		},
		exit: (direction: number) => ({
			zIndex: 0,
			x: direction < 0 ? 300 : -300,
			opacity: 0,
			scale: 0.8,
			filter: 'blur(10px)',
		}),
	};

	return {
		currentStep,
		direction,
		isLoading,
		step,
		steps: STEPS,
		variants,
		paginate,
		handleComplete,
		getWelcomeTitle,
	};
}
