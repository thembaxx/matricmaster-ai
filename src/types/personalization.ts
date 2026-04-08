// ============================================================================
// PERSONALIZATION TYPES
// ============================================================================

export interface LearningPreferences {
	userId: string;
	preferredDifficulty: 'easy' | 'medium' | 'hard';
	learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
	preferredPace: 'slow' | 'moderate' | 'fast';
	sessionDuration: number; // minutes
	preferredSubjects: string[];
	contentTypes: Array<'text' | 'visual' | 'interactive' | 'examples' | 'audio'>;
	avoidedTopics?: string[];
	createdAt: Date;
	updatedAt: Date;
}

export interface AdaptiveLearningMetrics {
	id: string;
	userId: string;
	subjectId?: number;
	topic?: string;
	difficulty: 'easy' | 'medium' | 'hard';
	performanceScore: number; // 0-100
	timeSpent: number; // seconds
	correctAnswers: number;
	totalQuestions: number;
	knowledgeGaps: string[]; // identified gaps
	recommendedActions: RecommendationAction[];
	createdAt: Date;
}

export interface RecommendationAction {
	type:
		| 'review_topic'
		| 'practice_more'
		| 'change_difficulty'
		| 'try_different_style'
		| 'take_break';
	priority: 'low' | 'medium' | 'high';
	target: string; // topic, subject, or general
	reason: string;
}

export interface PersonalizedStudyPlan {
	id: string;
	userId: string;
	planName: string;
	description?: string;
	targetDate?: Date;
	subjects: StudyPlanSubject[];
	weeklySchedule: WeeklySchedule;
	currentPhase: string;
	progressPercentage: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface StudyPlanSubject {
	subjectId: number;
	subjectName: string;
	topics: StudyPlanTopic[];
	allocatedHours: number;
	priority: 'low' | 'medium' | 'high';
}

export interface StudyPlanTopic {
	topic: string;
	difficulty: 'easy' | 'medium' | 'hard';
	estimatedHours: number;
	isCompleted: boolean;
	deadline?: Date;
	resources: string[]; // recommended resources
}

export interface WeeklySchedule {
	monday?: DailySchedule;
	tuesday?: DailySchedule;
	wednesday?: DailySchedule;
	thursday?: DailySchedule;
	friday?: DailySchedule;
	saturday?: DailySchedule;
	sunday?: DailySchedule;
}

export interface DailySchedule {
	sessions: StudySession[];
	totalHours: number;
	breakReminders: boolean;
}

export interface StudySession {
	subject: string;
	topic: string;
	duration: number; // minutes
	startTime: string; // HH:MM format
	type: 'quiz' | 'flashcards' | 'reading' | 'practice' | 'review';
}

// ============================================================================
// ADAPTIVE LEARNING ALGORITHM TYPES
// ============================================================================

export interface MasteryCalculation {
	topic: string;
	currentMastery: number; // 0-100
	confidence: number; // 0-100, based on sample size
	trend: 'improving' | 'stable' | 'declining';
	nextReviewDate: Date;
	strengthIndicators: string[];
	weaknessIndicators: string[];
}

export interface DifficultyRecommendation {
	currentDifficulty: 'easy' | 'medium' | 'hard';
	recommendedDifficulty: 'easy' | 'medium' | 'hard';
	reason: string;
	confidence: number; // 0-100
	alternativeOptions: DifficultyRecommendation[];
}

export interface KnowledgeGap {
	topic: string;
	subject: string;
	severity: 'low' | 'medium' | 'high';
	estimatedTimeToFix: number; // minutes
	prerequisites: string[];
	recommendedResources: string[];
	blockingProgress: boolean;
}

export interface LearningVelocity {
	questionsPerMinute: number;
	accuracyTrend: 'improving' | 'stable' | 'declining';
	consistencyScore: number; // 0-100
	riskOfBurnout: 'low' | 'medium' | 'high';
	recommendedAdjustments: string[];
}

export interface PersonalizedRecommendation {
	id: string;
	userId: string;
	type: 'content' | 'study_plan' | 'break' | 'difficulty_adjustment' | 'learning_style';
	priority: 'low' | 'medium' | 'high';
	title: string;
	description: string;
	actionUrl?: string;
	expiresAt?: Date;
	isDismissed: boolean;
	createdAt: Date;
}

// ============================================================================
// ONBOARDING TYPES
// ============================================================================

export interface LearningStyleAssessment {
	questionId: string;
	question: string;
	options: Array<{
		text: string;
		style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
		score: number;
	}>;
}

export interface OnboardingFlow {
	currentStep: number;
	totalSteps: number;
	steps: OnboardingStep[];
	userResponses: Record<string, any>;
	isComplete: boolean;
}

export interface OnboardingStep {
	id: string;
	title: string;
	description: string;
	type: 'assessment' | 'preferences' | 'confirmation';
	component: string; // component name to render
	required: boolean;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface LearningAnalytics {
	userId: string;
	period: {
		start: Date;
		end: Date;
	};
	overview: {
		totalStudyTime: number;
		totalQuestionsAnswered: number;
		averageAccuracy: number;
		studyStreak: number;
	};
	subjectBreakdown: SubjectAnalytics[];
	learningPatterns: LearningPattern[];
	recommendations: PersonalizedRecommendation[];
}

export interface SubjectAnalytics {
	subjectId: number;
	subjectName: string;
	studyTime: number;
	questionsAnswered: number;
	accuracy: number;
	masteryLevel: number;
	trend: 'improving' | 'stable' | 'declining';
	topics: TopicAnalytics[];
}

export interface TopicAnalytics {
	topic: string;
	accuracy: number;
	attempts: number;
	timeSpent: number;
	masteryLevel: number;
	lastPracticed: Date;
}

export interface LearningPattern {
	pattern: string;
	description: string;
	impact: 'positive' | 'neutral' | 'negative';
	suggestions: string[];
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Pace = 'slow' | 'moderate' | 'fast';
export type ContentType = 'text' | 'visual' | 'interactive' | 'examples' | 'audio';

export interface PersonalizationConfig {
	enabledFeatures: {
		adaptiveDifficulty: boolean;
		personalizedPlans: boolean;
		learningAnalytics: boolean;
		aiRecommendations: boolean;
	};
	algorithmWeights: {
		performanceWeight: number;
		velocityWeight: number;
		consistencyWeight: number;
		preferenceWeight: number;
	};
	updateFrequency: {
		masteryRecalculation: number; // hours
		recommendationsRefresh: number; // hours
		analyticsUpdate: number; // hours
	};
}
