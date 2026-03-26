'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OnboardingStep {
	id: string;
	title: string;
	completed: boolean;
	completedAt?: number;
}

interface OnboardingState {
	isOnboardingComplete: boolean;
	currentStep: number;
	steps: OnboardingStep[];
	startedAt: number | null;
	completedAt: number | null;
	hasSeenWelcomeBack: boolean;
	lastVisitAt: number | null;

	// Actions
	completeStep: (stepId: string) => void;
	completeOnboarding: () => void;
	resetOnboarding: () => void;
	markWelcomeBackSeen: () => void;
	updateLastVisit: () => void;
	getProgress: () => number;
}

const DEFAULT_STEPS: OnboardingStep[] = [
	{ id: 'welcome', title: 'Welcome to MatricMaster', completed: false },
	{ id: 'profile-setup', title: 'Set up your profile', completed: false },
	{ id: 'subject-selection', title: 'Select your subjects', completed: false },
	{ id: 'study-goal', title: 'Set your study goal', completed: false },
	{ id: 'first-quiz', title: 'Complete your first quiz', completed: false },
	{ id: 'ai-tutor-intro', title: 'Try the AI tutor', completed: false },
];

export const useOnboardingStore = create<OnboardingState>()(
	persist(
		(set, get) => ({
			isOnboardingComplete: false,
			currentStep: 0,
			steps: DEFAULT_STEPS,
			startedAt: null,
			completedAt: null,
			hasSeenWelcomeBack: false,
			lastVisitAt: null,

			completeStep: (stepId: string) => {
				set((state) => ({
					steps: state.steps.map((step) =>
						step.id === stepId ? { ...step, completed: true, completedAt: Date.now() } : step
					),
					currentStep: Math.min(state.currentStep + 1, state.steps.length - 1),
					startedAt: state.startedAt || Date.now(),
				}));
			},

			completeOnboarding: () => {
				set({
					isOnboardingComplete: true,
					completedAt: Date.now(),
					hasSeenWelcomeBack: true,
					lastVisitAt: Date.now(),
				});
			},

			resetOnboarding: () => {
				set({
					isOnboardingComplete: false,
					currentStep: 0,
					steps: DEFAULT_STEPS,
					startedAt: null,
					completedAt: null,
					hasSeenWelcomeBack: false,
				});
			},

			markWelcomeBackSeen: () => {
				set({ hasSeenWelcomeBack: true, lastVisitAt: Date.now() });
			},

			updateLastVisit: () => {
				set({ lastVisitAt: Date.now() });
			},

			getProgress: () => {
				const { steps } = get();
				const completed = steps.filter((s) => s.completed).length;
				return Math.round((completed / steps.length) * 100);
			},
		}),
		{
			name: 'matricmaster-onboarding',
			partialize: (state) => ({
				isOnboardingComplete: state.isOnboardingComplete,
				currentStep: state.currentStep,
				steps: state.steps,
				startedAt: state.startedAt,
				completedAt: state.completedAt,
				hasSeenWelcomeBack: state.hasSeenWelcomeBack,
				lastVisitAt: state.lastVisitAt,
			}),
		}
	)
);

/**
 * Hook for checking if welcome back should be shown
 */
export function useWelcomeBack() {
	const {
		isOnboardingComplete,
		hasSeenWelcomeBack,
		lastVisitAt,
		markWelcomeBackSeen,
		updateLastVisit,
	} = useOnboardingStore();

	const shouldShowWelcomeBack = () => {
		if (!isOnboardingComplete) return false;
		if (hasSeenWelcomeBack) return false;

		// Check if user has been away for more than 7 days
		if (lastVisitAt) {
			const daysSinceLastVisit = (Date.now() - lastVisitAt) / (1000 * 60 * 60 * 24);
			return daysSinceLastVisit >= 7;
		}

		return false;
	};

	return {
		shouldShowWelcomeBack: shouldShowWelcomeBack(),
		markWelcomeBackSeen,
		updateLastVisit,
	};
}
