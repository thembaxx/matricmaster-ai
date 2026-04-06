export interface UserLearningProfile {
	userId: string;
	createdAt: Date;
	updatedAt: Date;

	// Learning preferences
	preferredDifficulty: 'easy' | 'medium' | 'hard';
	learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
	sessionDuration: number; // minutes
	preferredSubjects: string[];

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

	// Content preferences
	preferredContentTypes: Array<'text' | 'visual' | 'interactive' | 'examples'>;
	avoidedTopics?: string[]; // topics user finds difficult
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
