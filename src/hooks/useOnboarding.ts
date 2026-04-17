import { useCallback, useState } from 'react';
import type {
	LearningPreferences,
	LearningStyleAssessment,
	OnboardingFlow,
	OnboardingStep,
} from '../types/personalization';

// ============================================================================
// ONBOARDING HOOK
// ============================================================================

export function useOnboarding() {
	const [currentStep, setCurrentStep] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [userResponses, setUserResponses] = useState<Record<string, any>>({});
	const [isLoading, setIsLoading] = useState(false);

	// Define onboarding steps
	const steps: OnboardingStep[] = [
		{
			id: 'welcome',
			title: 'Welcome to MatricMaster',
			description: "Let's personalize your learning experience",
			type: 'assessment',
			component: 'WelcomeScreen',
			required: true,
		},
		{
			id: 'learning_style',
			title: 'Discover Your Learning Style',
			description: 'Help us understand how you learn best',
			type: 'assessment',
			component: 'LearningStyleQuiz',
			required: true,
		},
		{
			id: 'difficulty_preference',
			title: 'Choose Your Starting Difficulty',
			description: "We'll adjust this based on your performance",
			type: 'preferences',
			component: 'DifficultySetup',
			required: true,
		},
		{
			id: 'subject_interests',
			title: 'Your Subject Interests',
			description: 'Which subjects are you focusing on?',
			type: 'preferences',
			component: 'SubjectPreferences',
			required: true,
		},
		{
			id: 'study_preferences',
			title: 'Study Preferences',
			description: 'Set your preferred study habits',
			type: 'preferences',
			component: 'StudyPreferences',
			required: true,
		},
		{
			id: 'confirmation',
			title: 'Ready to Start Learning!',
			description: 'Review your preferences and begin your journey',
			type: 'confirmation',
			component: 'ConfirmationScreen',
			required: true,
		},
	];

	const flow: OnboardingFlow = {
		currentStep,
		totalSteps: steps.length,
		steps,
		userResponses,
		isComplete,
	};

	// Navigation functions
	const nextStep = useCallback(() => {
		if (currentStep < steps.length - 1) {
			setCurrentStep((prev) => prev + 1);
		} else {
			setIsComplete(true);
		}
	}, [currentStep, steps.length]);

	const prevStep = useCallback(() => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	}, [currentStep]);

	const goToStep = useCallback(
		(stepIndex: number) => {
			if (stepIndex >= 0 && stepIndex < steps.length) {
				setCurrentStep(stepIndex);
			}
		},
		[steps.length]
	);

	// Response management
	const updateResponse = useCallback((stepId: string, response: any) => {
		setUserResponses((prev) => ({
			...prev,
			[stepId]: response,
		}));
	}, []);

	const getResponse = useCallback(
		(stepId: string) => {
			return userResponses[stepId];
		},
		[userResponses]
	);

	// Completion handling
	const completeOnboarding = useCallback(
		async (userId: string) => {
			setIsLoading(true);
			try {
				// Convert responses to learning preferences
				const preferences = convertResponsesToPreferences(userResponses);

				// Save preferences (this would call an API in real implementation)
				await saveLearningPreferences(userId, preferences);

				setIsComplete(true);
				return { success: true };
			} catch (error) {
				console.error('Failed to complete onboarding:', error);
				return { success: false, error: 'Failed to save preferences' };
			} finally {
				setIsLoading(false);
			}
		},
		[userResponses]
	);

	// Skip onboarding (for existing users or testing)
	const skipOnboarding = useCallback(() => {
		setIsComplete(true);
	}, []);

	// Reset onboarding (for testing or re-onboarding)
	const resetOnboarding = useCallback(() => {
		setCurrentStep(0);
		setIsComplete(false);
		setUserResponses({});
	}, []);

	// Progress calculation
	const progress = ((currentStep + (isComplete ? 1 : 0)) / steps.length) * 100;

	return {
		flow,
		currentStepData: steps[currentStep],
		progress,
		isLoading,
		isComplete,

		// Navigation
		nextStep,
		prevStep,
		goToStep,

		// Responses
		updateResponse,
		getResponse,

		// Actions
		completeOnboarding,
		skipOnboarding,
		resetOnboarding,
	};
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert onboarding responses to learning preferences
 */
function convertResponsesToPreferences(
	responses: Record<string, any>
): Omit<LearningPreferences, 'userId' | 'createdAt' | 'updatedAt'> {
	const learningStyle = responses.learning_style || 'visual';
	const difficulty = responses.difficulty_preference || 'medium';
	const preferredSubjects = responses.subject_interests || [];
	const sessionDuration = responses.session_duration || 30;
	const contentTypes = responses.content_types || ['text', 'visual'];
	const preferredPace = responses.preferred_pace || 'moderate';
	const avoidTopics = responses.avoid_topics || [];

	return {
		preferredDifficulty: difficulty,
		learningStyle,
		preferredPace,
		sessionDuration,
		preferredSubjects,
		contentTypes,
		avoidedTopics: avoidTopics,
	};
}

/**
 * Save learning preferences (placeholder for API call)
 */
async function saveLearningPreferences(
	userId: string,
	preferences: Omit<LearningPreferences, 'userId' | 'createdAt' | 'updatedAt'>
): Promise<void> {
	// In a real implementation, this would make an API call
	console.log('Saving preferences for user', userId, preferences);

	// Simulate API delay
	await new Promise((resolve) => setTimeout(resolve, 1000));
}

// ============================================================================
// LEARNING STYLE ASSESSMENT DATA
// ============================================================================

export const learningStyleQuestions: LearningStyleAssessment[] = [
	{
		questionId: 'q1',
		question: 'When learning something new, I prefer to:',
		options: [
			{ text: 'See diagrams, charts, and visual aids', style: 'visual', score: 3 },
			{ text: 'Listen to explanations and discussions', style: 'auditory', score: 3 },
			{ text: 'Try it hands-on and practice', style: 'kinesthetic', score: 3 },
			{ text: 'Read instructions and take notes', style: 'reading', score: 3 },
		],
	},
	{
		questionId: 'q2',
		question: 'I remember information best when I:',
		options: [
			{ text: 'See it written down or in pictures', style: 'visual', score: 3 },
			{ text: 'Hear it explained or discuss it', style: 'auditory', score: 3 },
			{ text: 'Do it or move around while learning', style: 'kinesthetic', score: 3 },
			{ text: 'Write it down and review my notes', style: 'reading', score: 3 },
		],
	},
	{
		questionId: 'q3',
		question: 'When solving a problem, I prefer to:',
		options: [
			{ text: 'Draw diagrams or visualize the solution', style: 'visual', score: 3 },
			{ text: 'Talk through the steps out loud', style: 'auditory', score: 3 },
			{ text: 'Work with physical objects or examples', style: 'kinesthetic', score: 3 },
			{ text: 'Write down the steps systematically', style: 'reading', score: 3 },
		],
	},
	{
		questionId: 'q4',
		question: 'I find it easiest to concentrate when:',
		options: [
			{ text: 'There are no distractions and I can see clearly', style: 'visual', score: 2 },
			{ text: 'I can listen to background music or sounds', style: 'auditory', score: 2 },
			{ text: 'I can move around or fidget', style: 'kinesthetic', score: 2 },
			{ text: 'I have written instructions to follow', style: 'reading', score: 2 },
		],
	},
	{
		questionId: 'q5',
		question: 'When studying for a test, I:',
		options: [
			{ text: 'Make flashcards and color-coded notes', style: 'visual', score: 2 },
			{ text: 'Read my notes out loud or discuss with others', style: 'auditory', score: 2 },
			{ text: 'Practice problems hands-on', style: 'kinesthetic', score: 2 },
			{ text: 'Re-read textbooks and my notes', style: 'reading', score: 2 },
		],
	},
];

/**
 * Calculate learning style from assessment responses
 */
export function calculateLearningStyle(
	responses: Record<string, string>
): 'visual' | 'auditory' | 'kinesthetic' | 'reading' {
	const scores = {
		visual: 0,
		auditory: 0,
		kinesthetic: 0,
		reading: 0,
	};

	// Calculate scores based on responses
	Object.entries(responses).forEach(([questionId, selectedStyle]) => {
		const question = learningStyleQuestions.find((q) => q.questionId === questionId);
		if (question) {
			const selectedOption = question.options.find((opt) => opt.style === selectedStyle);
			if (selectedOption) {
				scores[selectedStyle as keyof typeof scores] += selectedOption.score;
			}
		}
	});

	// Find the highest scoring style
	let maxScore = 0;
	let dominantStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading' = 'visual';

	Object.entries(scores).forEach(([style, score]) => {
		if (score > maxScore) {
			maxScore = score;
			dominantStyle = style as 'visual' | 'auditory' | 'kinesthetic' | 'reading';
		}
	});

	return dominantStyle;
}
