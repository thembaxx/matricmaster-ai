'use client';

import { AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AccountScreen, PaywallScreen } from '@/components/Onboarding/Conversion';
import { DemoQuizScreen, ValueDeliveryScreen } from '@/components/Onboarding/Demo';
import { OnboardingLayout } from '@/components/Onboarding/OnboardingLayout';
import {
	GoalScreen,
	PainAmpScreen,
	PainPointsScreen,
	PermissionScreen,
	PreferenceScreen,
	ProcessingScreen,
	SocialProofScreen,
	SolutionScreen,
	WelcomeScreen,
} from '@/components/Onboarding/Screens';

type OnboardingState = {
	step: number;
	goal: string | null;
	painPoints: string[];
	subjects: string[];
	demoCorrectCount: number;
};

export default function OnboardingPage() {
	const router = useRouter();
	const [state, setState] = useState<OnboardingState>({
		step: 1,
		goal: null,
		painPoints: [],
		subjects: [],
		demoCorrectCount: 0,
	});

	const setStep = (step: number) => setState((prev) => ({ ...prev, step }));
	const setGoal = (goal: string) => setState((prev) => ({ ...prev, goal }));
	const decrementStep = () => setState((prev) => ({ ...prev, step: Math.max(1, prev.step - 1) }));
	const togglePainPoint = (id: string) => {
		setState((prev) => ({
			...prev,
			painPoints: prev.painPoints.includes(id)
				? prev.painPoints.filter((p) => p !== id)
				: [...prev.painPoints, id],
		}));
	};
	const toggleSubject = (id: string) => {
		setState((prev) => ({
			...prev,
			subjects: prev.subjects.includes(id)
				? prev.subjects.filter((s) => s !== id)
				: [...prev.subjects, id],
		}));
	};
	const setDemoResult = (count: number) =>
		setState((prev) => ({ ...prev, demoCorrectCount: count }));

	const progress = (state.step / 13) * 100;

	const handleOnboardingComplete = () => {
		// In a real app, we would save the state to DB here
		router.push('/dashboard');
	};

	return (
		<OnboardingLayout progress={progress} onBack={decrementStep} showBack={state.step > 1}>
			<AnimatePresence mode="wait" initial={false}>
				{state.step === 1 && <WelcomeScreen key="welcome" onContinue={() => setStep(2)} />}
				{state.step === 2 && (
					<GoalScreen
						key="goal"
						selectedGoal={state.goal}
						onSelect={setGoal}
						onContinue={() => setStep(3)}
					/>
				)}
				{state.step === 3 && (
					<PainPointsScreen
						key="pains"
						selectedPains={state.painPoints}
						onToggle={togglePainPoint}
						onContinue={() => setStep(4)}
					/>
				)}
				{state.step === 4 && <SocialProofScreen key="social" onContinue={() => setStep(5)} />}
				{state.step === 5 && <PainAmpScreen key="amp" onContinue={() => setStep(6)} />}
				{state.step === 6 && <SolutionScreen key="solution" onContinue={() => setStep(7)} />}
				{state.step === 7 && (
					<PreferenceScreen
						key="prefs"
						selectedSubjects={state.subjects}
						onToggle={toggleSubject}
						onContinue={() => setStep(8)}
					/>
				)}
				{state.step === 8 && <PermissionScreen key="perms" onContinue={() => setStep(9)} />}
				{state.step === 9 && <ProcessingScreen key="processing" onContinue={() => setStep(10)} />}
				{state.step === 10 && (
					<DemoQuizScreen
						key="demo"
						selectedSubject={state.subjects[0] || 'default'}
						results={[]}
						onComplete={(count) => {
							setDemoResult(count);
							setStep(11);
						}}
					/>
				)}
				{state.step === 11 && (
					<ValueDeliveryScreen
						key="value"
						subject={state.subjects[0] || 'default'}
						correctCount={state.demoCorrectCount}
						onContinue={() => setStep(12)}
					/>
				)}
				{state.step === 12 && <AccountScreen key="account" onContinue={() => setStep(13)} />}
				{state.step === 13 && <PaywallScreen key="paywall" onComplete={handleOnboardingComplete} />}
			</AnimatePresence>
		</OnboardingLayout>
	);
}
