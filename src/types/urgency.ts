export interface UrgencyScore {
	topic: string;
	subject: string;
	examUrgency: number;
	weaknessUrgency: number;
	markWeightUrgency: number;
	combinedScore: number;
	priority: 'critical' | 'high' | 'medium' | 'low';
	recommendedDays: number;
	reason: string;
}

export interface UrgencySummary {
	totalTopics: number;
	criticalTopics: UrgencyScore[];
	highTopics: UrgencyScore[];
	mediumTopics: UrgencyScore[];
	lowTopics: UrgencyScore[];
	examDaysRemaining: number;
	urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}
