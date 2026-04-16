import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { LearningStyleQuiz } from './LearningStyleQuiz';
import { PreferenceSetup } from './PreferenceSetup';

// ============================================================================
// PERSONALIZATION ONBOARDING SCREEN
// ============================================================================

interface PersonalizationOnboardingProps {
	userId: string;
	onComplete: () => void;
	onSkip?: () => void;
}

export function PersonalizationOnboarding({
	userId,
	onComplete,
	onSkip,
}: PersonalizationOnboardingProps) {
	const {
		flow,
		currentStepData,
		progress,
		isLoading,
		isComplete,
		nextStep,
		prevStep,
		updateResponse,
		getResponse,
		completeOnboarding,
	} = useOnboarding();

	const handleNext = async () => {
		if (flow.currentStep === flow.totalSteps - 1) {
			// Last step - complete onboarding
			const result = await completeOnboarding(userId);
			if (result.success) {
				onComplete();
			}
		} else {
			nextStep();
		}
	};

	const handleBack = () => {
		prevStep();
	};

	const handleSkip = () => {
		if (onSkip) {
			onSkip();
		}
	};

	if (isComplete) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
				<Card className="w-full max-w-md border-primary/10 shadow-soft-lg">
					<CardContent className="pt-8 pb-8 text-center">
						<div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
							<CheckCircle className="w-8 h-8 text-success" />
						</div>
						<h2 className="text-2xl font-bold text-foreground mb-2">Welcome to MatricMaster!</h2>
						<p className="text-muted-foreground mb-6">
							Your personalized learning experience is ready. Let's start your journey!
						</p>
						<Button onClick={onComplete} className="w-full">
							Start Learning
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
			<div className="w-full max-w-2xl">
				{/* Header with progress */}
				<div className="mb-8">
					<div className="flex justify-between items-center mb-4">
						<h1 className="text-2xl font-bold text-foreground">Personalize Your Experience</h1>
						{onSkip && (
							<Button variant="ghost" onClick={handleSkip} className="text-muted-foreground">
								Skip for now
							</Button>
						)}
					</div>
					<div className="space-y-2">
						<div className="flex justify-between text-sm text-muted-foreground">
							<span>
								Step {flow.currentStep + 1} of {flow.totalSteps}
							</span>
							<span>{Math.round(progress)}% complete</span>
						</div>
						<Progress value={progress} className="w-full" />
					</div>
				</div>

				{/* Main content */}
				<Card className="mb-6">
					<CardHeader>
						<CardTitle>{currentStepData.title}</CardTitle>
						<CardDescription>{currentStepData.description}</CardDescription>
					</CardHeader>
					<CardContent>
						<StepContent
							step={currentStepData}
							responses={flow.userResponses}
							onUpdateResponse={updateResponse}
							getResponse={getResponse}
						/>
					</CardContent>
				</Card>

				{/* Navigation */}
				<div className="flex justify-between">
					<Button
						variant="outline"
						onClick={handleBack}
						disabled={flow.currentStep === 0}
						className="flex items-center gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Back
					</Button>

					<Button onClick={handleNext} disabled={isLoading} className="flex items-center gap-2">
						{isLoading ? (
							'Processing...'
						) : flow.currentStep === flow.totalSteps - 1 ? (
							'Complete Setup'
						) : (
							<>
								Next
								<ArrowRight className="w-4 h-4" />
							</>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}

// ============================================================================
// STEP CONTENT RENDERER
// ============================================================================

interface StepContentProps {
	step: any;
	responses: Record<string, any>;
	onUpdateResponse: (stepId: string, response: any) => void;
	getResponse: (stepId: string) => any;
}

function StepContent({ step, responses, onUpdateResponse, getResponse }: StepContentProps) {
	switch (step.component) {
		case 'WelcomeScreen':
			return <WelcomeScreen />;
		case 'LearningStyleQuiz':
			return <LearningStyleQuiz responses={responses} onUpdateResponse={onUpdateResponse} />;
		case 'DifficultySetup':
			return (
				<PreferenceSetup
					type="difficulty"
					responses={responses}
					onUpdateResponse={onUpdateResponse}
					getResponse={getResponse}
				/>
			);
		case 'SubjectPreferences':
			return (
				<PreferenceSetup
					type="subjects"
					responses={responses}
					onUpdateResponse={onUpdateResponse}
					getResponse={getResponse}
				/>
			);
		case 'StudyPreferences':
			return (
				<PreferenceSetup
					type="study"
					responses={responses}
					onUpdateResponse={onUpdateResponse}
					getResponse={getResponse}
				/>
			);
		case 'ConfirmationScreen':
			return <ConfirmationScreen responses={responses} getResponse={getResponse} />;
		default:
			return <div>Unknown step component: {step.component}</div>;
	}
}

// ============================================================================
// WELCOME SCREEN
// ============================================================================

function WelcomeScreen() {
	return (
		<div className="text-center space-y-6">
			<div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
				<span className="text-3xl">🎓</span>
			</div>
			<div>
				<h3 className="text-xl font-semibold text-foreground mb-2">Let's Make Learning Personal</h3>
				<p className="text-muted-foreground">
					We'll ask a few questions to customize your learning experience. This will help us
					recommend the best content and adapt to your pace.
				</p>
			</div>
			<div className="bg-primary/5 border border-primary/10 p-4 rounded-lg">
				<p className="text-sm text-foreground">
					<strong>What you'll get:</strong> Personalized difficulty adjustment, customized study
					plans, and content that matches your learning style.
				</p>
			</div>
		</div>
	);
}

// ============================================================================
// CONFIRMATION SCREEN
// ============================================================================

interface ConfirmationScreenProps {
	responses: Record<string, any>;
	getResponse: (stepId: string) => any;
}

function ConfirmationScreen({ getResponse }: ConfirmationScreenProps) {
	const learningStyle = getResponse('learning_style') || 'Not set';
	const difficulty = getResponse('difficulty_preference') || 'Not set';
	const subjects = getResponse('subject_interests') || [];
	const sessionDuration = getResponse('session_duration') || 30;

	return (
		<div className="space-y-6">
			<div className="text-center">
				<h3 className="text-xl font-semibold text-foreground mb-2">Review Your Preferences</h3>
				<p className="text-muted-foreground">
					We'll use these settings to personalize your learning experience. You can change them
					anytime in your profile settings.
				</p>
			</div>

			<div className="space-y-4">
				<div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
					<span className="font-medium">Learning Style:</span>
					<span className="capitalize">{learningStyle}</span>
				</div>

				<div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
					<span className="font-medium">Starting Difficulty:</span>
					<span className="capitalize">{difficulty}</span>
				</div>

				<div className="flex justify-between items-start p-3 bg-muted/50 rounded-lg">
					<span className="font-medium">Preferred Subjects:</span>
					<div className="text-right">
						{subjects.length > 0 ? (
							<div className="flex flex-wrap gap-1 justify-end">
								{subjects.slice(0, 3).map((subject: string) => (
									<span
										key={subject}
										className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium"
									>
										{subject}
									</span>
								))}
								{subjects.length > 3 && (
									<span className="text-muted-foreground text-xs">+{subjects.length - 3} more</span>
								)}
							</div>
						) : (
							<span className="text-muted-foreground">None selected</span>
						)}
					</div>
				</div>

				<div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
					<span className="font-medium">Session Duration:</span>
					<span>{sessionDuration} minutes</span>
				</div>
			</div>

			<div className="bg-success/5 border border-success/10 p-4 rounded-lg">
				<p className="text-sm text-foreground">
					<strong>Ready to learn!</strong> We'll adapt these settings based on your performance and
					continue to personalize your experience.
				</p>
			</div>
		</div>
	);
}
