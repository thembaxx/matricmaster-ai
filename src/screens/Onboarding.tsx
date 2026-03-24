'use client';

import { AnimatePresence, m } from 'framer-motion';
import {
	FloatingShapes,
	OnboardingControls,
	OnboardingProgress,
	OnboardingStepContent,
	useOnboarding,
} from '@/components/Onboarding';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import type { SessionUser } from '@/lib/auth';

interface OnboardingScreenProps {
	user?: SessionUser | null;
}

export default function OnboardingScreen({ user }: OnboardingScreenProps) {
	const {
		currentStep,
		direction,
		isLoading,
		step,
		steps,
		variants,
		paginate,
		handleComplete,
		getWelcomeTitle,
	} = useOnboarding(user);

	return (
		<div className="fixed inset-0 h-screen bg-background flex flex-col overflow-hidden select-none">
			<BackgroundMesh />
			<FloatingShapes />

			<OnboardingProgress
				currentStep={currentStep}
				totalSteps={steps.length}
				onSkip={handleComplete}
			/>

			<div className="flex-1 relative flex items-center justify-center p-6 grow">
				<AnimatePresence initial={false} custom={direction} mode="wait">
					<m.div
						key={currentStep}
						custom={direction}
						variants={variants}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{
							x: { type: 'spring', stiffness: 300, damping: 30 },
							opacity: { duration: 0.2 },
							scale: { duration: 0.4 },
							filter: { duration: 0.4 },
						}}
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						onDragEnd={(_, info) => {
							if (info.offset.x > 100) paginate(-1);
							else if (info.offset.x < -100) paginate(1);
						}}
					>
						<OnboardingStepContent
							step={step}
							currentStep={currentStep}
							title={getWelcomeTitle()}
						/>
					</m.div>
				</AnimatePresence>
			</div>

			<OnboardingControls
				currentStep={currentStep}
				totalSteps={steps.length}
				isLoading={isLoading}
				onPrevious={() => paginate(-1)}
				onNext={() => paginate(1)}
				onComplete={handleComplete}
			/>
		</div>
	);
}
