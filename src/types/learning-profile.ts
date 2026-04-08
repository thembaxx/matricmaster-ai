export interface UserLearningProfile {
	userId: string;
	createdAt: Date;
	updatedAt: Date;

	// Learning preferences
	preferredDifficulty: 'easy' | 'medium' | 'hard';
	learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
	preferredPace: 'slow' | 'moderate' | 'fast';
	sessionDuration: number; // minutes
	preferredSubjects: string[];
	contentTypes: Array<'text' | 'visual' | 'interactive' | 'examples' | 'audio'>;
	avoidedTopics?: string[]; // topics user finds difficult

	// Performance tracking
	subjectMastery: Record<
		string,
		{
			overallScore: number;
			topicScores: Record<string, number>;
			attempts: number;
			lastAttempted: Date;
		}
	>;

	// Learning history
	interactionHistory: Array<{
		subject: string;
		topic: string;
		action: 'explanation' | 'quiz' | 'flashcard' | 'solution' | 'feedback';
		timestamp: Date;
		performance?: number; // 0-100
		duration?: number; // minutes
	}>;

	// Adaptive metrics
	strengthAreas: string[]; // topics where user performs well
	weakAreas: string[]; // topics where user struggles
	improvementRate: Record<string, number>; // rate of improvement per subject
	responseToDifficulty: {
		easy: number; // success rate
		medium: number;
		hard: number;
	};

	// Personalization insights
	learningVelocity: number; // questions per minute
	consistencyScore: number; // 0-100, based on regular study patterns
	riskOfBurnout: 'low' | 'medium' | 'high';
	lastPersonalizationUpdate: Date;
}

export interface LearningSession {
	userId: string;
	startTime: Date;
	endTime?: Date;
	subject: string;
	topics: string[];
	performance: number;
	interactions: number;
	duration: number;
	achievements: string[];
}
